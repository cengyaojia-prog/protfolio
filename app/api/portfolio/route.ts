import { z } from "zod";
import { database,projectList,profileData,requireEditor,apiFailure,ApiError } from "@/lib/portfolio-store";
import { defaultProjects } from "@/lib/portfolio-data";
export const dynamic="force-dynamic";
const text=(max=1000)=>z.string().max(max);
const schema=z.object({id:z.string().regex(/^[a-z0-9-]{1,80}$/),title:text(160).min(1),originalTitle:text(160),category:z.enum(["Short film","AI film","Narrative game","Screenplay","Documentary"]),year:text(60),role:text(300),duration:text(100),status:text(80),summary:text(2500),approach:text(5000),selection:text(500),videoKey:text(160),posterKey:text(160),externalUrl:text(2048),conceptPoster:text(160),isConcept:z.boolean()});
const profile=z.object({bio:text(5000),style:text(5000),interests:text(3000),email:z.string().email().max(254)});
export async function GET(){try{return Response.json({projects:await projectList(),profile:await profileData()},{headers:{"Cache-Control":"no-store"}});}catch(e){return apiFailure(e);}}
export async function PUT(request:Request){try{
 const owner=requireEditor(request),input=z.object({kind:z.enum(["project","profile"]),project:schema.optional(),profile:profile.optional()}).parse(await request.json());
 if(input.kind==="profile"){const p=profile.parse(input.profile);await database().prepare("INSERT INTO portfolio_settings (key,data) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data").bind("profile",JSON.stringify(p)).run();return Response.json({profile:p});}
 const p=schema.parse(input.project);
 if(p.externalUrl){let u:URL;try{u=new URL(p.externalUrl);}catch{throw new ApiError("Enter a complete https:// link.");}if(u.protocol!=="https:")throw new ApiError("External links must use https://.");}
 p.conceptPoster=defaultProjects.find(s=>s.id===p.id)?.conceptPoster??"";p.isConcept=!!p.conceptPoster&&!p.posterKey;
 for(const key of [p.videoKey,p.posterKey].filter(Boolean)){
  const m=await database().prepare("SELECT content_type FROM portfolio_uploads WHERE object_key=? AND owner_id=? AND state=?").bind(key,owner,"complete").first<{content_type:string}>();
  if(!m)throw new ApiError("This upload is not ready or does not belong to you.");
  if(key===p.videoKey&&!m.content_type.startsWith("video/"))throw new ApiError("Select a video file for the film.");
  if(key===p.posterKey&&!m.content_type.startsWith("image/"))throw new ApiError("Select an image file for the cover.");
 }
 await database().prepare("INSERT INTO portfolio_projects (id,data,updated_at) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at").bind(p.id,JSON.stringify(p),new Date().toISOString()).run();return Response.json({project:p});
}catch(e){return apiFailure(e);}}
