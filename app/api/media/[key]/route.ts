import { bindings,database,apiFailure } from "@/lib/portfolio-store";
export const dynamic="force-dynamic";
type Ctx={params:Promise<{key:string}>};
export async function GET(request:Request,ctx:Ctx){return media(request,ctx,false);}
export async function HEAD(request:Request,ctx:Ctx){return media(request,ctx,true);}
async function media(request:Request,ctx:Ctx,head:boolean){try{
 const {key}=await ctx.params;if(!/^media\/[0-9a-f-]{36}$/.test(key))return new Response("Not found",{status:404});
 const allowed=await database().prepare("SELECT id FROM portfolio_uploads WHERE object_key=? AND state=?").bind(key,"complete").first();if(!allowed)return new Response("Not found",{status:404});
 const bucket=bindings().BUCKET,meta=await bucket.head(key);if(!meta)return new Response("Not found",{status:404});
 const headers=new Headers({"Accept-Ranges":"bytes","Cache-Control":"public, max-age=3600","ETag":meta.httpEtag,"X-Content-Type-Options":"nosniff"});meta.writeHttpMetadata(headers);headers.set("Content-Length",String(meta.size));
 const range=request.headers.get("range");let offset=0,length=meta.size,status=200;
 if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2]))return new Response(null,{status:416,headers:{"Content-Range":"bytes */"+meta.size}});
  if(!m[1]){const suffix=Number(m[2]);offset=Math.max(0,meta.size-suffix);length=meta.size-offset;if(suffix<1)offset=meta.size;}
  else{offset=Number(m[1]);const end=m[2]?Math.min(Number(m[2]),meta.size-1):meta.size-1;length=end-offset+1;}
  if(offset>=meta.size||length<=0)return new Response(null,{status:416,headers:{"Content-Range":"bytes */"+meta.size}});
  headers.set("Content-Range","bytes "+offset+"-"+(offset+length-1)+"/"+meta.size);headers.set("Content-Length",String(length));status=206;
 }
 if(head)return new Response(null,{status,headers});const obj=await bucket.get(key,range?{range:{offset,length}}:undefined);if(!obj)return new Response("Not found",{status:404});return new Response(obj.body,{status,headers});
}catch(e){return apiFailure(e);}}
