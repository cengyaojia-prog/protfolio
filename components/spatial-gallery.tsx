"use client";

import {useEffect,useRef,useState,type CSSProperties,type PointerEvent} from "react";
import {Plus,RotateCcw,X} from "lucide-react";
import type {GalleryEntry} from "@/lib/cinema-data";

const positions=[
 {x:16,y:24,w:25,r:1.78,tilt:14,z:35},
 {x:92,y:38,w:15,r:.75,tilt:-19,z:15},
 {x:81,y:82,w:23,r:1.78,tilt:-12,z:55},
 {x:7,y:51,w:12,r:.79,tilt:17,z:-30},
 {x:69,y:12,w:11,r:.79,tilt:-9,z:-50},
 {x:40,y:14,w:12,r:1.45,tilt:5,z:-15},
 {x:43,y:85,w:14,r:1.65,tilt:3,z:-10},
 {x:77,y:34,w:17,r:1.48,tilt:-8,z:15},
 {x:24,y:60,w:13,r:1.66,tilt:8,z:-15},
 {x:11,y:86,w:22,r:1.78,tilt:16,z:40},
 {x:53,y:25,w:12,r:1.78,tilt:0,z:-65},
 {x:60,y:72,w:11,r:1.78,tilt:-4,z:-45},
 {x:90,y:7,w:19,r:1.78,tilt:-16,z:45},
 {x:30,y:4,w:17,r:1.33,tilt:10,z:0},
 {x:31,y:39,w:11,r:1.6,tilt:6,z:-40},
 {x:70,y:56,w:10,r:1.78,tilt:-7,z:-65},
 {x:55,y:97,w:19,r:1.78,tilt:1,z:15},
];
type CardMotion={x:number;y:number;z:number;angle:number;width:number;focus:number;opacity:number};
const mix=(a:number,b:number,n:number)=>a+(b-a)*n;
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));

export function SpatialGallery({entries,onSelect}:{entries:GalleryEntry[];onSelect:(entry:GalleryEntry)=>void}){
 const surface=useRef<HTMLElement>(null),nodes=useRef(new Map<string,HTMLButtonElement>()),motions=useRef(new Map<string,CardMotion>());
 const pan=useRef({x:0,y:0}),pointer=useRef({x:0,y:0}),velocity=useRef({x:0,y:0});
 const camera=useRef({x:0,y:0,yaw:0,pitch:0,focus:0});
 const focusId=useRef<string|null>(null),focusOrigin=useRef({x:0,y:0}),lastPointer=useRef({x:0,y:0});
 const dimensions=useRef({w:1360,h:900}),reduced=useRef(false);
 const drag=useRef<{id:number;x:number;y:number;lastX:number;lastY:number;startX:number;startY:number;moved:boolean;entryId:string|null}|null>(null);
 const suppressClick=useRef(false);
 const [dragging,setDragging]=useState(false),[focused,setFocused]=useState<GalleryEntry|null>(null);
 const [filter,setFilter]=useState<"all"|"work"|"cinema">("all");
 const visibleEntries=entries.filter(entry=>filter==="all"||entry.kind===filter);
 const limitY=Math.max(520,Math.ceil(entries.length/positions.length)*650);

 function focus(entry:GalleryEntry|null){
  if(entry?.id===focusId.current||!entry&&!focusId.current)return;
  focusId.current=entry?.id??null;setFocused(entry);
  focusOrigin.current={...lastPointer.current};velocity.current={x:0,y:0};
 }
 function open(entry:GalleryEntry){focus(null);onSelect(entry);}
 function reset(){focus(null);pan.current={x:0,y:0};pointer.current={x:0,y:0};velocity.current={x:0,y:0};}

 useEffect(()=>{
  const media=window.matchMedia("(prefers-reduced-motion: reduce)");
  const change=()=>{reduced.current=media.matches;};change();media.addEventListener("change",change);
  const measure=()=>{if(surface.current)dimensions.current={w:surface.current.clientWidth,h:surface.current.clientHeight};};
  measure();const observer=new ResizeObserver(measure);if(surface.current)observer.observe(surface.current);
  let frame=0,previous=performance.now();
  const animate=(now:number)=>{
   const dt=Math.min((now-previous)/16.667,3);previous=now;
   const ease=reduced.current?1:1-Math.pow(.89,dt),soft=reduced.current?1:1-Math.pow(.88,dt);
   const c=camera.current,m=pointer.current,d=dimensions.current;
   const worldW=Math.max(d.w,900),worldH=Math.max(d.h,760);
   if(!drag.current&&!focusId.current){pan.current.x=clamp(pan.current.x+velocity.current.x*dt,-720,720);pan.current.y=clamp(pan.current.y+velocity.current.y*dt,-limitY,limitY);velocity.current.x*=Math.pow(.90,dt);velocity.current.y*=Math.pow(.90,dt);}
   const aimed=!!focusId.current;
   c.focus=mix(c.focus,aimed?1:0,soft);
   const tx=pan.current.x+(reduced.current?0:m.x*Math.min(d.w*.16,210));
   const ty=pan.current.y+(reduced.current?0:m.y*Math.min(d.h*.13,135));
   c.x=mix(c.x,tx,ease);c.y=mix(c.y,ty,ease);
   c.yaw=mix(c.yaw,reduced.current?0:m.x*15-pan.current.x/worldW*9,ease);
   c.pitch=mix(c.pitch,reduced.current?0:-m.y*8,ease);
   const yaw=c.yaw*(1-c.focus)*Math.PI/180,pitch=c.pitch*(1-c.focus)*Math.PI/180;
   entries.forEach((entry,index)=>{
    const node=nodes.current.get(entry.id);if(!node)return;
    const slot=positions[index%positions.length],row=Math.floor(index/positions.length);
    const baseWidth=worldW*slot.w/100;
    let state=motions.current.get(entry.id);
    if(!state){state={x:(slot.x-50)*worldW/100,y:(slot.y-50+row*105)*worldH/100,z:slot.z*3,angle:slot.tilt,width:baseWidth,focus:0,opacity:.78};motions.current.set(entry.id,state);}
    state.focus=mix(state.focus,focusId.current===entry.id?1:0,soft);
    const f=state.focus,push=1+c.focus*.085;
    const bx=(slot.x-50)*worldW/100*push,by=(slot.y-50+row*105)*worldH/100*push;
    const bz=slot.z*3-c.focus*190;
    const rx=bx*Math.cos(yaw)+bz*Math.sin(yaw),rz=bz*Math.cos(yaw)-bx*Math.sin(yaw);
    const ry=by*Math.cos(pitch)-rz*Math.sin(pitch),depth=rz*Math.cos(pitch)+by*Math.sin(pitch);
    const mobile=d.w<=700;
    const targetWidth=Math.min(mobile?d.w*.8:d.w*.36,mobile?420:520,d.h*(mobile?.34:.48)*slot.r);
    const dockX=mobile?0:d.w*.205,dockY=mobile?-d.h*.15:0;
    const targetX=mix(rx+c.x*(1-c.focus),dockX,f),targetY=mix(ry+c.y*(1-c.focus),dockY,f);
    const targetZ=mix(depth,mobile?0:38,f),targetAngle=mix(slot.tilt+c.yaw*(1-c.focus),mobile?0:-4,f);
    state.x=mix(state.x,targetX,ease);state.y=mix(state.y,targetY,ease);state.z=mix(state.z,targetZ,ease);
    state.angle=mix(state.angle,targetAngle,ease);state.width=mix(state.width,mix(baseWidth,targetWidth,f),ease);
    state.opacity=mix(state.opacity,mix(.78*(1-c.focus*.92),1,f),ease);
    node.style.transform="translate3d(calc(-50% + "+state.x.toFixed(2)+"px),calc(-50% + "+state.y.toFixed(2)+"px),"+state.z.toFixed(2)+"px) rotateY("+state.angle.toFixed(2)+"deg)";
    node.style.left="50%";node.style.top="50%";node.style.width=state.width.toFixed(2)+"px";node.style.zIndex=String(Math.round(f*90)+1);
    node.style.setProperty("--card-opacity",String(state.opacity));
   });
   frame=requestAnimationFrame(animate);
  };
  frame=requestAnimationFrame(animate);
  const wheel=(event:WheelEvent)=>{
   if(event.ctrlKey||event.metaKey)return;event.preventDefault();focus(null);
   pan.current.x=clamp(pan.current.x-event.deltaX*.75,-720,720);
   pan.current.y=clamp(pan.current.y-event.deltaY*.65,-limitY,limitY);
   velocity.current={x:-event.deltaX*.09,y:-event.deltaY*.08};
  };
  const element=surface.current;element?.addEventListener("wheel",wheel,{passive:false});
  return()=>{cancelAnimationFrame(frame);observer.disconnect();media.removeEventListener("change",change);element?.removeEventListener("wheel",wheel);};
 },[entries,limitY]);

 function down(event:PointerEvent<HTMLElement>){
  if(event.button!==0||event.target instanceof Element&&event.target.closest(".space-controls,.space-centre,.space-reset,.focus-copy,.focus-dismiss"))return;
  const entryId=event.target instanceof Element?event.target.closest(".space-card")?.getAttribute("data-entry-id")??null:null;
  drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,startX:pan.current.x,startY:pan.current.y,moved:false,entryId};
  velocity.current={x:0,y:0};suppressClick.current=false;
 }
 function move(event:PointerEvent<HTMLElement>){
  const box=event.currentTarget.getBoundingClientRect();lastPointer.current={x:event.clientX,y:event.clientY};
  if(event.pointerType==="mouse")pointer.current={x:(event.clientX-box.left)/box.width-.5,y:(event.clientY-box.top)/box.height-.5};
  const g=drag.current;
  if(g&&g.id===event.pointerId){
   const dx=event.clientX-g.x,dy=event.clientY-g.y;
   if(!g.moved&&Math.hypot(dx,dy)>8){g.moved=true;suppressClick.current=true;setDragging(true);focus(null);event.currentTarget.setPointerCapture(event.pointerId);}
   if(g.moved){pan.current={x:clamp(g.startX+dx,-720,720),y:clamp(g.startY+dy,-limitY,limitY)};velocity.current={x:(event.clientX-g.lastX)*.55,y:(event.clientY-g.lastY)*.55};g.lastX=event.clientX;g.lastY=event.clientY;}
   return;
  }
  if(focusId.current&&event.pointerType==="mouse"){
   const travelled=Math.hypot(event.clientX-focusOrigin.current.x,event.clientY-focusOrigin.current.y);
   const nx=(event.clientX-box.left)/box.width,ny=(event.clientY-box.top)/box.height;
   const insideFocus=nx>.16&&nx<.94&&ny>.23&&ny<.79;
   if(travelled>75&&!insideFocus&&!(event.target instanceof Element&&event.target.closest(".space-card,.focus-copy")))focus(null);
  }
 }
 function up(event:PointerEvent<HTMLElement>){
  const gesture=drag.current;if(gesture?.id!==event.pointerId)return;
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  drag.current=null;setDragging(false);
  if(!gesture.moved&&gesture.entryId&&event.type!=="pointercancel"){
   const entry=entries.find(entry=>entry.id===gesture.entryId);
   if(entry){suppressClick.current=true;open(entry);}
  }
 }

 return <section ref={surface} className={"space-surface"+(dragging?" is-dragging":"")+(focused?" has-focus":"")} aria-label="Film and creative work space" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={()=>{pointer.current={x:0,y:0};if(!drag.current)focus(null);}} onKeyDown={event=>{
  if(event.key==="Escape"&&focusId.current){event.preventDefault();focus(null);return;}
  if(event.target!==event.currentTarget)return;
  const directions:Record<string,[number,number]>={ArrowLeft:[100,0],ArrowRight:[-100,0],ArrowUp:[0,100],ArrowDown:[0,-100]};
  const direction=directions[event.key];if(direction){event.preventDefault();focus(null);pan.current.x=clamp(pan.current.x+direction[0],-720,720);pan.current.y=clamp(pan.current.y+direction[1],-limitY,limitY);}
 }} tabIndex={0}>
  <h1 className="sr-only">Yaojia Zeng — films, writing and cinema references</h1>
  <div className="space-world" data-testid="space-world">
   {visibleEntries.map((entry,index)=>{
    const slot=positions[entries.indexOf(entry)%positions.length],row=Math.floor(entries.indexOf(entry)/positions.length);
    const style={left:slot.x+"%",top:slot.y+row*105+"%",width:slot.w+"%",aspectRatio:slot.r,"--arrival":Math.min(index,12)*45+"ms"} as CSSProperties;
    return <button key={entry.id} ref={node=>{if(node)nodes.current.set(entry.id,node);else nodes.current.delete(entry.id);}} className={"space-card"+(focused?.id===entry.id?" is-focused":"")+(entry.image?" has-image":" has-type")} style={style} data-entry-id={entry.id} aria-label={entry.title+" · "+(entry.kind==="work"?"My work":"Cinema reference")} onClick={event=>{if(suppressClick.current&&event.detail>0){event.preventDefault();suppressClick.current=false;return;}open(entry);}} onPointerEnter={event=>{if(event.pointerType!=="mouse"||drag.current)return;if(focusId.current&&focusId.current!==entry.id&&Math.hypot(event.clientX-focusOrigin.current.x,event.clientY-focusOrigin.current.y)<90)return;lastPointer.current={x:event.clientX,y:event.clientY};focus(entry);}} onFocus={event=>{if(event.currentTarget.matches(":focus-visible"))focus(entry);}}>
     <span className="cover-motion">{entry.image?<img src={entry.image} alt={entry.concept?entry.title+" — concept artwork":entry.title+" film still"} draggable={false} loading={index<9?"eager":"lazy"}/>:<span className="letterpress-cover"><span lang="zh">{entry.originalTitle||entry.title}</span><small>{entry.title}<br/>{entry.format}</small></span>}
      {focused?.id===entry.id&&entry.video&&<video src={entry.video} poster={entry.image||undefined} autoPlay muted loop playsInline preload="metadata" onError={event=>{event.currentTarget.hidden=true;}} aria-label={entry.title+" muted preview"}/>}
     </span>
     <span className="space-caption"><span>{entry.kind==="work"?entry.originalTitle||entry.title:entry.title}</span><small>{entry.kind==="work"?"MY WORK":"CINEMA REFERENCE"} / {entry.year}</small></span>
     <span className="cover-plus" aria-hidden="true"><Plus size={23} strokeWidth={1}/><small>LEARN MORE</small></span>
    </button>;
   })}
  </div>
  {focused&&<div className="focus-copy" key={focused.id} aria-live="polite"><p className="eyebrow">{focused.kind==="work"?"MY WORK / 个人创作":"CINEMA REFERENCE"} · {focused.year}</p><h2>{focused.title}</h2>{focused.kind==="work"&&<p className="focus-original" lang="zh">{focused.originalTitle}</p>}<p className="focus-summary">{focused.summary}</p><button className="text-link" onClick={()=>open(focused)}>{focused.kind==="work"?"View project / 查看简介":"View film"}</button></div>}
  {focused&&<button className="focus-dismiss" aria-label="Return to the scattered film space" onClick={()=>focus(null)}><X size={14}/><span>BACK TO SPACE</span></button>}
  <a className="space-centre" href="/projects" tabIndex={focused?-1:0}><Plus size={24} strokeWidth={1}/><span>INDEX VIEW</span><small>作品与观影索引</small></a>
  <div className="space-controls" aria-label="Gallery selection">{([["all","All"],["work","My work"],["cinema","Cinema"]] as const).map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>{setFilter(value);reset();}}>{label}</button>)}</div>
  <button className="space-reset" onClick={reset} aria-label="Recentre the film space"><RotateCcw size={16}/></button>
  <p className="space-instruction">{focused?"Click the image to discover":"Drag to explore · Hover to focus"}</p>
 </section>;
}
