import { z } from "zod";
import { bindings,database,requireEditor,apiFailure,ApiError } from "@/lib/portfolio-store";
export const dynamic="force-dynamic";
const types=["video/mp4","video/webm","video/quicktime","image/jpeg","image/png","image/webp"];
export async function POST(request:Request){try{
 const owner=requireEditor(request),f=z.object({filename:z.string().min(1).max(250),type:z.string(),size:z.number().int().positive().max(1024*1024*1024)}).parse(await request.json());
 if(!types.includes(f.type))throw new ApiError("Use MP4, WebM, MOV, JPG, PNG or WebP.");
 if(f.type.startsWith("image/")&&f.size>20*1024*1024)throw new ApiError("Covers must be smaller than 20 MB.");
 const id=crypto.randomUUID(),key="media/"+id,bucket=bindings().BUCKET;
 if(!bucket)throw new Error("Media storage unavailable");
 const upload=await bucket.createMultipartUpload(key,{httpMetadata:{contentType:f.type},customMetadata:{ownerId:owner}});
 try{await database().prepare("INSERT INTO portfolio_uploads (id,owner_id,object_key,upload_id,content_type,total_size,filename,state,created_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(id,owner,key,upload.uploadId,f.type,f.size,f.filename,"uploading",new Date().toISOString()).run();}catch(e){await upload.abort();throw e;}
 return Response.json({id,chunkSize:8*1024*1024});
}catch(e){return apiFailure(e);}}
