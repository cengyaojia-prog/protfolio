"use client";
import {useEffect,useMemo,useRef,useState,type FormEvent,type CSSProperties} from "react";
import {Plus,Upload,Check,Pencil,X,Film} from "lucide-react";
import {Dialog,DialogContent,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@/components/ui/select";
import {Progress} from "@/components/ui/progress";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Toaster} from "@/components/ui/sonner";
import {toast} from "sonner";
import {SpatialGallery} from "@/components/spatial-gallery";
import {cinemaFilms,type CinemaFilm,type GalleryEntry} from "@/lib/cinema-data";
import {type Project,type Profile,defaultProfile,posterUrl,videoUrl} from "@/lib/portfolio-data";

type Props={page:"work"|"projects"|"about";initialProjects:Project[];initialProfile:Profile;isEditor:boolean;storageAvailable:boolean};
const pad=(i:number)=>String(i+1).padStart(3,"0");
const interestDescriptions=[
 "How do generative tools change the relationship between a filmmaker, a character and an image?",
 "What happens when a character recognises the frame of their own story?",
 "How do language, cultural difference and belonging shape the stories we tell?",
 "How can a non-human perspective make a player reconsider memory, identity and agency?"
];

export function Portfolio({page,initialProjects,initialProfile,isEditor,storageAvailable}:Props){
 const [projects,setProjects]=useState(initialProjects),[profile,setProfile]=useState(initialProfile);
 const [detail,setDetail]=useState<Project|null>(null),[cinema,setCinema]=useState<CinemaFilm|null>(null),[editing,setEditing]=useState<Project|null>(null);
 const [editorOpen,setEditorOpen]=useState(false),[bioOpen,setBioOpen]=useState(false),[moreInfo,setMoreInfo]=useState(false);
 const [indexHover,setIndexHover]=useState<GalleryEntry|null>(null);
 const entries=useMemo<GalleryEntry[]>(()=>[...projects.map(p=>({id:p.id,kind:"work" as const,title:p.title,originalTitle:p.originalTitle,year:p.year,image:posterUrl(p),concept:p.isConcept&&!p.posterKey,format:p.category,summary:p.summary,video:videoUrl(p)})),...cinemaFilms.map(f=>({id:f.id,kind:"cinema" as const,title:f.title,originalTitle:f.originalTitle,year:f.year,image:f.image,concept:false,format:"Film",summary:f.synopsis,video:""}))],[projects]);
 const update=(p:Project)=>{setProjects(prev=>prev.some(s=>s.id===p.id)?prev.map(s=>s.id===p.id?p:s):[...prev,p]);setEditing(null);setEditorOpen(false);if(detail?.id===p.id)setDetail(p);};
 const openEntry=(entry:GalleryEntry)=>{setMoreInfo(false);if(entry.kind==="work"){setCinema(null);setDetail(projects.find(p=>p.id===entry.id)??null);}else{setDetail(null);setCinema(cinemaFilms.find(f=>f.id===entry.id)??null);}};
 const closeDetail=()=>{setDetail(null);setCinema(null);setMoreInfo(false);};
 const edit=(p:Project|null)=>{setEditing(p);setEditorOpen(true);};
 useEffect(()=>{
  const ctx=(document as unknown as {modelContext?:{registerTool:(tool:unknown,opts:{signal:AbortSignal})=>unknown}}).modelContext;
  if(!ctx?.registerTool||!isEditor)return;
  const life=new AbortController();
  try{void Promise.resolve(ctx.registerTool({name:"start_portfolio_project_edit",title:"Edit a portfolio project",description:"Opens the owner's project editor without saving changes or uploading files.",inputSchema:{type:"object",properties:{projectId:{type:"string"}},required:["projectId"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async(input:unknown)=>{if(!input||typeof input!=="object"||typeof(input as {projectId?:unknown}).projectId!=="string")throw new Error("A projectId is required.");const id=(input as {projectId:string}).projectId,p=projects.find(p=>p.id===id);if(!p)throw new Error("Project not found.");setEditing(p);setEditorOpen(true);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return{projectId:id,editor:"open",saved:false};}},{signal:life.signal})).catch(()=>{});}catch{}
  return()=>life.abort();
 },[projects,isEditor]);
 useEffect(()=>{
  if(page!=="about"||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const observer=new IntersectionObserver(items=>{for(const item of items)if(item.isIntersecting){item.target.classList.add("is-revealed");observer.unobserve(item.target);}},{threshold:.1});
  const sections=Array.from(document.querySelectorAll(".about-section"));
  for(const section of sections){section.classList.add("will-reveal");observer.observe(section);}
  return()=>{observer.disconnect();for(const section of sections)section.classList.remove("will-reveal","is-revealed");};
 },[page]);
 return <div className={"portfolio "+page+"-page"}>
  <a href="#main" className="skip-link">Skip to content</a>
  <header className="site-header">
   <a href="/" className="wordmark" aria-label="Yaojia Zeng home"><span>YAOJIA ZENG</span><small>FILM · WRITING · RESEARCH</small></a>
   <nav aria-label="Main navigation">{[["/","Space","work"],["/projects","Index","projects"],["/about","About","about"]].map(([href,label,key],i)=><a href={href} key={key} className={page===key?"current":""} aria-current={page===key?"page":undefined}><span>{String(i+1).padStart(2,"0")}</span>{label}</a>)}</nav>
  </header>
  <main id="main">
   {page==="work"&&<SpatialGallery entries={entries} onSelect={openEntry}/>}
   {page==="projects"&&<section className="index-page-content" aria-labelledby="index-title">
    <a className="back-link" href="/">SPACE VIEW</a>
    <h1 id="index-title" className="sr-only">Work and cinema index</h1>
    {indexHover?.image&&<div className="index-hover-image" key={indexHover.id} aria-hidden="true"><img src={indexHover.image} alt=""/></div>}
    <div className="index-group"><h2>MY WORK <span>个人创作</span></h2><ol>{entries.filter(e=>e.kind==="work").map((e,i)=><li key={e.id}><button onClick={()=>openEntry(e)} onPointerEnter={()=>setIndexHover(e)} onPointerLeave={()=>setIndexHover(null)} onFocus={()=>setIndexHover(e)} onBlur={()=>setIndexHover(null)}><span className="index-number">{pad(i)}</span><span className="index-title">{e.title}</span><span className="index-meta">{e.format}</span></button></li>)}</ol></div>
    <div className="index-group cinema-index"><h2>CINEMA REFERENCES</h2><p className="index-group-note">Films I love. A collection of images, stories and sensibilities.</p><ol>{entries.filter(e=>e.kind==="cinema").map((e,i)=><li key={e.id}><button onClick={()=>openEntry(e)} onPointerEnter={()=>setIndexHover(e)} onPointerLeave={()=>setIndexHover(null)} onFocus={()=>setIndexHover(e)} onBlur={()=>setIndexHover(null)}><span className="index-number">{pad(i+projects.length)}</span><span className="index-title">{e.title}</span><span className="index-meta">{e.year}</span></button></li>)}</ol></div>
   </section>}
   {page==="about"&&<article className="about-content" aria-labelledby="about-title">
    <a className="back-link" href="/">SPACE VIEW</a>
    <div className="about-heading"><p className="eyebrow">03 / ABOUT ME</p><h1 id="about-title">Yaojia Zeng</h1><p className="about-name" lang="zh">曾遥佳</p><p className="about-descriptor">SCREENWRITER · FILMMAKER<br/>MOVING IMAGE & INTERACTIVE NARRATIVE</p></div>
    <section className="about-section"><h2>Introduction <span>个人介绍</span></h2><p className="bio-copy">{profile.bio}</p><div className="education-inline"><div><span>MASTER'S STUDIES</span><p>Chung-Ang University<br/>Film & Moving Image Media</p></div><div><span>UNDERGRADUATE STUDIES</span><p>Zhejiang University<br/>Broadcasting & Television</p></div></div></section>
    <section className="about-section"><h2>Creative approach <span>创作风格</span></h2><p>{profile.style}</p><div className="practice-words"><span>Nested narratives</span><span>Cultural encounters</span><span>Non-human perspectives</span></div></section>
    <section className="about-section"><h2>Research interests <span>研究方向</span></h2><ol className="research-list">{profile.interests.split("\n").filter(Boolean).map((t,i)=><li key={i}><span>{pad(i)}</span><div><h3>{t}</h3>{defaultProfile.interests.split("\n").includes(t)&&<p>{interestDescriptions[defaultProfile.interests.split("\n").indexOf(t)]}</p>}</div></li>)}</ol></section>
    <section className="about-section cinema-influences"><h2>Looking at cinema</h2><p>Romance, memory, shifting perspectives and the space between what is said and what remains unseen. These films form a viewing collection alongside my own practice.</p><div className="cinema-name-list">{cinemaFilms.map(f=><button key={f.id} onClick={()=>openEntry(entries.find(e=>e.id===f.id)!)}>{f.title}<span>{f.year}</span></button>)}</div><p className="reference-note">The cinema collection presents films by other filmmakers. The thematic keywords are introductory viewing notes.</p></section>
    <section className="about-section"><h2>Experience <span>实践经历</span></h2><p>Alongside independent film and screenwriting, my experience includes AI video production at Alibaba AutoNavi and programme development and artist coordination with Bilibili's variety entertainment team.</p><div className="experience-line"><span>Alibaba AutoNavi</span><span>Bilibili</span><span>Horgos Atomic Entertainment</span><span>Ant Group</span></div></section>
   </article>}
  </main>
  <footer className={"site-footer "+(page==="work"?"floating-footer":"")}>
   <div className="footer-navigation"><a href="/projects" className={page==="projects"?"current":""}><small>THE</small> WORK <sup>02</sup></a><span>AND</span><a href="/about" className={page==="about"?"current":""}>ABOUT <sup>03</sup></a><small>ME</small></div>
   <div className="footer-contact"><small>OR</small><a href={"mailto:"+profile.email}>CONTACT</a></div>
   {page!=="work"&&<div className="footer-meta"><span>© {new Date().getFullYear()} Yaojia Zeng</span><a href={"mailto:"+profile.email}>{profile.email}</a></div>}
  </footer>
  {isEditor?<div className="owner-tools"><button onClick={()=>edit(null)} title="添加剧本、视频或链接" className="add-work-button"><Plus size={16}/><span>添加作品</span></button><button onClick={()=>edit(projects[0]??null)} title="编辑已有作品"><Upload size={16}/><span>作品管理</span></button><button onClick={()=>setBioOpen(true)} title="编辑个人介绍"><Pencil size={15}/><span>个人介绍</span></button></div>:<a href="/signin-with-chatgpt?return_to=%2F" target="_top" className="owner-login">Owner sign-in</a>}
  {isEditor&&!storageAvailable&&<p className="storage-warning" role="status">作品保存暂时不可用，请稍后再试。</p>}
  <Dialog open={!!detail||!!cinema} onOpenChange={open=>{if(!open)closeDetail();}}><DialogContent className="project-dialog" aria-describedby="project-summary" style={{translate:"0px 0px",scale:"1","--tw-translate-x":"0px","--tw-translate-y":"0px"} as CSSProperties}>
   <button className="detail-back" onClick={closeDetail}><X size={16}/><span>BACK TO {page==="work"?"SPACE":page==="projects"?"INDEX":"ABOUT"}</span></button>
   {(detail||cinema)&&<>
    <div className="detail-heading"><span className="eyebrow">{detail?"MY WORK / "+detail.category:"CINEMA REFERENCE / "+cinema!.director} · {detail?.year??cinema!.year}</span><DialogTitle>{detail?.title??cinema!.title}</DialogTitle>{detail?.originalTitle&&<p lang="zh" className="detail-original">{detail.originalTitle}</p>}<DialogDescription id="project-summary">{detail?.summary??cinema!.synopsis}</DialogDescription><button className="more-info" onClick={()=>setMoreInfo(!moreInfo)} aria-expanded={moreInfo} aria-controls="detail-information"><Plus size={22} strokeWidth={1} className={moreInfo?"is-open":""}/><span>{moreInfo?"LESS INFO":"MORE INFO"}</span></button></div>
    <div className="detail-player">{detail&&videoUrl(detail)?<video src={videoUrl(detail)} poster={posterUrl(detail)||undefined} controls autoPlay playsInline preload="metadata" onError={()=>toast.error("This format could not play. Upload an H.264 MP4 for broad browser compatibility.")}/>:cinema||detail&&posterUrl(detail)?<img src={cinema?.image??posterUrl(detail!)} alt={cinema?cinema.alt:detail!.title+(detail!.isConcept?" concept artwork":" cover")}/>:<div className="letterpress-cover"><span>{detail!.originalTitle||detail!.title}</span><small>{detail!.category}</small></div>}</div>
    {detail&&!detail.videoKey&&<p className="detail-media-note">{detail.isConcept&&!detail.posterKey?"Concept artwork · ":""}{detail.category==="Screenplay"?"Screenplay":"Film / demo to be uploaded"}</p>}
    {detail?.externalUrl&&<a className="detail-primary-link text-link" href={detail.externalUrl} target="_blank" rel="noopener noreferrer">{detail.category==="Screenplay"?"Read screenplay / 查看剧本":detail.category==="Narrative game"?"Open demo / 打开游戏":"Open project / 查看作品"}</a>}
    {cinema&&<p className="cinema-synopsis" lang="en">{cinema.extendedSynopsis}</p>}
    <div id="detail-information" className="detail-information" hidden={!moreInfo}>{detail?<><div className="detail-facts"><div><span>CONTRIBUTION</span><p>{detail.role}</p></div><div><span>STATUS</span><p>{detail.status}{detail.duration&&" · "+detail.duration}</p></div></div><p>{detail.approach}</p>{detail.selection&&<p className="selection">{detail.selection}</p>}{detail.isConcept&&!detail.posterKey&&<p className="reference-note">AI-generated concept artwork.</p>}<div className="detail-links"><a href={"mailto:"+profile.email+"?subject="+encodeURIComponent("Enquiry: "+detail.title)} className="text-link">Enquire about this project</a></div></>:<><p className="eyebrow">VIEWING NOTES</p><div className="viewing-themes">{cinema!.themes.map(theme=><span key={theme}>{theme}</span>)}</div><p className="reference-note">{cinema!.credit}{cinema!.source&&<> · <a href={cinema!.source} target="_blank" rel="noopener noreferrer">Film information & image source</a></>}</p></>}</div>
    {detail&&isEditor&&<button className="detail-edit text-link" onClick={()=>{const p=detail;closeDetail();edit(p);}}><Pencil size={14}/>Edit project / upload video</button>}
   </>}
  </DialogContent></Dialog>
  <ProjectEditor open={editorOpen} setOpen={setEditorOpen} initial={editing} projects={projects} onSave={update} canSave={storageAvailable}/>
  <ProfileEditor open={bioOpen} setOpen={setBioOpen} initial={profile} onSave={setProfile} canSave={storageAvailable}/>
  <Toaster theme="dark" position="bottom-right"/>
 </div>;
}

const emptyProject:Project={id:"",title:"",originalTitle:"",category:"Short film",year:"2026",role:"",duration:"",status:"Completed",summary:"",approach:"",selection:"",videoKey:"",posterKey:"",externalUrl:"",conceptPoster:"",isConcept:false};
function newProjectId(){const bytes=crypto.getRandomValues(new Uint8Array(16));return "project-"+Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");}
async function jsonRequest<T>(url:string,options:RequestInit):Promise<T>{const r=await fetch(url,options);const data=await r.json() as T&{error?:string};if(!r.ok)throw new Error(data.error||"The request failed. Please try again.");return data;}
async function uploadFile(file:File,onProgress:(n:number)=>void,signal:AbortSignal){
 const type=file.type||(/\.mov$/i.test(file.name)?"video/quicktime":/\.mp4$/i.test(file.name)?"video/mp4":/\.webm$/i.test(file.name)?"video/webm":"");
 let id="";
 try{
  const start=await jsonRequest<{id:string;chunkSize:number}>("/api/uploads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({filename:file.name,type,size:file.size}),signal});id=start.id;
  const parts=[];let sent=0;
  for(let offset=0,number=1;offset<file.size;offset+=start.chunkSize,number++){
   const chunk=file.slice(offset,Math.min(offset+start.chunkSize,file.size));
   const part=await jsonRequest<{partNumber:number;etag:string}>("/api/uploads/"+id+"?part="+number,{method:"PUT",headers:{"Content-Type":"application/octet-stream"},body:chunk,signal});
   parts.push(part);sent+=chunk.size;onProgress(Math.round(sent/file.size*100));
  }
  const done=await jsonRequest<{key:string}>("/api/uploads/"+id,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({parts}),signal});return done.key;
 }catch(e){if(id)void fetch("/api/uploads/"+id,{method:"DELETE"}).catch(()=>{});throw e;}
}

function ProjectEditor({open,setOpen,initial,projects,onSave,canSave}:{open:boolean;setOpen:(o:boolean)=>void;initial:Project|null;projects:Project[];onSave:(p:Project)=>void;canSave:boolean}){
 const [draft,setDraft]=useState<Project>(initial??emptyProject),[video,setVideo]=useState<File|null>(null),[cover,setCover]=useState<File|null>(null),[busy,setBusy]=useState(false),[percent,setPercent]=useState(0),[stage,setStage]=useState(""),[error,setError]=useState("");
 const controller=useRef<AbortController|null>(null),videoInput=useRef<HTMLInputElement>(null),coverInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(open){setDraft(initial??{...emptyProject,id:newProjectId()});setVideo(null);setCover(null);setPercent(0);setStage("");setError("");if(videoInput.current)videoInput.current.value="";if(coverInput.current)coverInput.current.value="";}},[open,initial]);
 const field=(key:keyof Project,value:string)=>setDraft(p=>({...p,[key]:value}));
 const choose=(id:string)=>{const p=projects.find(p=>p.id===id);setDraft(p??{...emptyProject,id:newProjectId()});setVideo(null);setCover(null);setError("");if(videoInput.current)videoInput.current.value="";if(coverInput.current)coverInput.current.value="";};
 async function save(event:FormEvent){event.preventDefault();if(!draft.title.trim()){setError("请填写作品标题。");return;}if(!canSave)return;
  setBusy(true);setError("");const control=new AbortController();controller.current=control;
  const next={...draft,title:draft.title.trim()};
  try{
   if(video){setStage("正在上传视频");next.videoKey=await uploadFile(video,setPercent,control.signal);setDraft(p=>({...p,videoKey:next.videoKey}));setVideo(null);}
   if(cover){setStage("正在上传封面");setPercent(0);next.posterKey=await uploadFile(cover,setPercent,control.signal);setDraft(p=>({...p,posterKey:next.posterKey}));setCover(null);}
   setStage("正在保存作品信息");const saved=await jsonRequest<{project:Project}>("/api/portfolio",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"project",project:next}),signal:control.signal});onSave(saved.project);toast.success("作品已保存，首页与项目页已更新。");
  }catch(e){setError(e instanceof Error&&e.name==="AbortError"?"已取消上传。填写的内容仍然保留。":e instanceof Error?e.message:"保存失败，请稍后再试。");}finally{setBusy(false);setStage("");controller.current=null;}
 }
 return <Dialog open={open} onOpenChange={o=>{if(!busy)setOpen(o);}}><DialogContent className="editor-dialog"><DialogTitle>{projects.some(p=>p.id===draft.id)?"编辑作品 / Edit project":"添加作品 / Add a project"}</DialogTitle><DialogDescription>添加剧本、视频、游戏或作品链接。保存后会同步显示在「我的作品」与索引中。</DialogDescription><form onSubmit={save} className="editor-form">
  <Label htmlFor="project-select">选择作品 / Project</Label><Select value={draft.id&&projects.some(p=>p.id===draft.id)?draft.id:"new"} onValueChange={choose} disabled={busy}><SelectTrigger id="project-select" className="editor-select"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="new">＋ 新建作品 / New project</SelectItem>{projects.map(p=><SelectItem value={p.id} key={p.id}>{p.title}</SelectItem>)}</SelectContent></Select>
  <div className="form-grid"><div><Label htmlFor="project-title">英文标题 / Title *</Label><Input id="project-title" value={draft.title} onChange={e=>field("title",e.target.value)} maxLength={160} required disabled={busy}/></div><div><Label htmlFor="original-title">原文标题 / Original title</Label><Input id="original-title" value={draft.originalTitle} onChange={e=>field("originalTitle",e.target.value)} maxLength={160} disabled={busy}/></div></div>
  <div className="form-grid"><div><Label htmlFor="project-format">作品类型 / Format</Label><Select value={draft.category} onValueChange={v=>field("category",v)} disabled={busy}><SelectTrigger id="project-format" className="editor-select"><SelectValue/></SelectTrigger><SelectContent>{["Short film","AI film","Narrative game","Screenplay","Documentary"].map(t=><SelectItem value={t} key={t}>{{"Short film":"短片 / Short film","AI film":"AI 影片 / AI film","Narrative game":"叙事游戏 / Narrative game","Screenplay":"剧本 / Screenplay","Documentary":"纪录片 / Documentary"}[t]}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="project-year">年份 / Year</Label><Input id="project-year" value={draft.year} onChange={e=>field("year",e.target.value)} maxLength={60} disabled={busy}/></div></div>
  <p className="editor-help">剧本：选择「剧本」，填写简介并添加剧本链接。视频：上传影片文件，也可填写观看链接。链接作品不必上传视频。</p>
  <div className="form-grid"><div><Label htmlFor="project-role">个人职责 / Your contribution</Label><Input id="project-role" value={draft.role} onChange={e=>field("role",e.target.value)} maxLength={300} disabled={busy}/></div><div><Label htmlFor="project-duration">时长或形式 / Runtime</Label><Input id="project-duration" value={draft.duration} onChange={e=>field("duration",e.target.value)} maxLength={100} placeholder="8 min / Feature screenplay" disabled={busy}/></div></div>
  <Label htmlFor="project-status">制作状态 / Status</Label><Input id="project-status" value={draft.status} onChange={e=>field("status",e.target.value)} maxLength={80} placeholder="Completed / In post-production / In development" disabled={busy}/>
  <Label htmlFor="project-summary">作品简介 / Synopsis</Label><Textarea id="project-summary" value={draft.summary} onChange={e=>field("summary",e.target.value)} maxLength={2500} rows={3} disabled={busy}/>
  <Label htmlFor="project-approach">创作方法与研究问题 / Process & questions</Label><Textarea id="project-approach" value={draft.approach} onChange={e=>field("approach",e.target.value)} maxLength={5000} rows={3} disabled={busy}/>
  <Label htmlFor="project-selection">入选或获奖 / Selection</Label><Input id="project-selection" value={draft.selection} onChange={e=>field("selection",e.target.value)} maxLength={500} disabled={busy}/>
  <div className="upload-fields"><div><Label htmlFor="video-file"><Film size={16}/>视频 / Film file</Label><Input ref={videoInput} id="video-file" type="file" accept="video/mp4,video/webm,video/quicktime,.mov" onChange={e=>setVideo(e.target.files?.[0]??null)} disabled={busy}/><small>最大 1 GB。建议使用 H.264 MP4；MOV 的播放兼容性取决于编码。</small>{draft.videoKey&&<span className="uploaded-tag"><Check size={13}/>已有视频{video?" · 保存时替换":""}</span>}</div><div><Label htmlFor="cover-file">封面 / Cover image</Label><Input ref={coverInput} id="cover-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setCover(e.target.files?.[0]??null)} disabled={busy}/><small>JPG、PNG、WebP，最大 20 MB。建议横向 16:9。</small>{draft.posterKey&&<span className="uploaded-tag"><Check size={13}/>已有封面</span>}</div></div>
  <Label htmlFor="project-url">作品链接 / Film, screenplay or demo link</Label><Input id="project-url" type="url" value={draft.externalUrl} onChange={e=>field("externalUrl",e.target.value)} maxLength={2048} placeholder="https://…" disabled={busy}/><small>可填写剧本 PDF、公开视频、网盘或游戏 DEMO 的 HTTPS 链接，请先确认访客可以打开。</small>
  {busy&&<div className="upload-progress" aria-live="polite"><span>{stage} · {percent}%</span><Progress value={percent}/><Button type="button" variant="ghost" onClick={()=>controller.current?.abort()}><X size={14}/>取消上传</Button></div>}
  {error&&<p role="alert" className="form-error">{error}</p>}{!canSave&&<p role="alert" className="form-error">保存功能暂时不可用，请稍后再试。</p>}
  <div className="form-actions"><Button type="button" variant="outline" onClick={()=>setOpen(false)} disabled={busy}>关闭 / Close</Button><Button type="submit" disabled={busy||!canSave}>{busy?"正在保存…":"保存作品 / Save project"}</Button></div>
 </form></DialogContent></Dialog>;
}

function ProfileEditor({open,setOpen,initial,onSave,canSave}:{open:boolean;setOpen:(o:boolean)=>void;initial:Profile;onSave:(p:Profile)=>void;canSave:boolean}){
 const [draft,setDraft]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState("");
 useEffect(()=>{if(open){setDraft(initial);setError("");}},[open,initial]);
 async function save(e:FormEvent){e.preventDefault();setBusy(true);setError("");try{const r=await jsonRequest<{profile:Profile}>("/api/portfolio",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"profile",profile:draft})});onSave(r.profile);setOpen(false);toast.success("个人介绍已更新。");}catch(e){setError(e instanceof Error?e.message:"保存失败。");}finally{setBusy(false);}}
 return <Dialog open={open} onOpenChange={o=>{if(!busy)setOpen(o);}}><DialogContent className="editor-dialog"><DialogTitle>个人介绍 / About me</DialogTitle><DialogDescription>更新个人介绍、创作风格和研究兴趣。</DialogDescription><form className="editor-form" onSubmit={save}>
  <Label htmlFor="profile-bio">个人介绍 / Bio</Label><Textarea id="profile-bio" value={draft.bio} onChange={e=>setDraft({...draft,bio:e.target.value})} rows={6} maxLength={5000} disabled={busy}/>
  <Label htmlFor="profile-style">作品风格 / Creative approach</Label><Textarea id="profile-style" value={draft.style} onChange={e=>setDraft({...draft,style:e.target.value})} rows={6} maxLength={5000} disabled={busy}/>
  <Label htmlFor="profile-interests">研究兴趣 / Research interests</Label><Textarea id="profile-interests" value={draft.interests} onChange={e=>setDraft({...draft,interests:e.target.value})} rows={5} maxLength={3000} disabled={busy}/><small>每行填写一个方向 / One interest per line.</small>
  <Label htmlFor="profile-email">联系邮箱 / Contact email</Label><Input id="profile-email" type="email" value={draft.email} onChange={e=>setDraft({...draft,email:e.target.value})} maxLength={254} required disabled={busy}/>
  {error&&<p role="alert" className="form-error">{error}</p>}<div className="form-actions"><Button type="button" variant="outline" onClick={()=>setOpen(false)} disabled={busy}>关闭</Button><Button type="submit" disabled={busy||!canSave}>{busy?"正在保存…":"保存介绍 / Save"}</Button></div>
 </form></DialogContent></Dialog>;
}
