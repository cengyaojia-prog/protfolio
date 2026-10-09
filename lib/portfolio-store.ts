import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { defaultProjects,defaultProfile,type Project,type Profile } from "./portfolio-data";
export type Bindings={DB:D1Database;BUCKET:R2Bucket;PORTFOLIO_EDITOR_EMAIL?:string;PORTFOLIO_SITE_ORIGIN?:string};
export function bindings(){return env as unknown as Bindings;}
export function database(){const db=bindings().DB;if(!db)throw new Error("Portfolio database unavailable");return db;}
export async function projectList():Promise<Project[]>{
 const r=await database().prepare("SELECT id,data FROM portfolio_projects ORDER BY updated_at,id").all<{id:string;data:string}>();
 const overrides=new Map(r.results.map(r=>[r.id,JSON.parse(r.data) as Project]));
 const list=defaultProjects.map(p=>overrides.get(p.id)??p);
 for(const [id,p] of overrides)if(!defaultProjects.some(s=>s.id===id))list.push(p);
 return list;
}
export async function profileData():Promise<Profile>{
 const r=await database().prepare("SELECT data FROM portfolio_settings WHERE key=?").bind("profile").first<{data:string}>();
 return r?{...defaultProfile,...JSON.parse(r.data)}:defaultProfile;
}
export async function loadPortfolio(){
 const user=await getChatGPTUser(),email=bindings().PORTFOLIO_EDITOR_EMAIL;
 const isEditor=!!user&&!!email&&user.email.toLowerCase()===email.toLowerCase();
 try{const [initialProjects,initialProfile]=await Promise.all([projectList(),profileData()]);return {initialProjects,initialProfile,isEditor,storageAvailable:true};}
 catch(e){console.error("Portfolio load:",e);return {initialProjects:defaultProjects,initialProfile:defaultProfile,isEditor,storageAvailable:false};}
}
export class ApiError extends Error{constructor(message:string,public status=400){super(message);}}
export function requireEditor(request:Request){
 const email=request.headers.get("oai-authenticated-user-email"),id=request.headers.get("oai-authenticated-user-id"),allowed=bindings().PORTFOLIO_EDITOR_EMAIL;
 if(!email||!id||!allowed||email.toLowerCase()!==allowed.toLowerCase())throw new ApiError("Sign in with the portfolio owner's account to edit.",403);
 const origin=request.headers.get("origin"),siteOrigin=bindings().PORTFOLIO_SITE_ORIGIN??new URL(request.url).origin;if(origin&&origin!==siteOrigin)throw new ApiError("This request came from another site.",403);
 return id;
}
export function apiFailure(e:unknown){
 if(e instanceof ApiError)return Response.json({error:e.message},{status:e.status});
 if(e instanceof Error&&e.name==="ZodError")return Response.json({error:"Please check the fields and file information."},{status:400});
 console.error("Portfolio API:",e);return Response.json({error:"Saving is temporarily unavailable. Your inputs are preserved; please try again."},{status:503});
}
