import { z } from "zod";
import { bindings,database,requireEditor,apiFailure,ApiError } from "@/lib/portfolio-store";
export const dynamic="force-dynamic";
type Ctx={params:Promise<{id:string}>};
type Upload={owner_id:string;object_key:string;upload_id:string;total_size:number;state:string};
async function get(request:Request,ctx:Ctx){const owner=requireEditor(request),{id}=await ctx.params;const row=await database().prepare("SELECT owner_id,object_key,upload_id,total_size,state FROM portfolio_uploads WHERE id=? AND owner_id=?").bind(id,owner).first<Upload>();if(!row)throw new ApiError("Upload not found.",404);return {id,row,upload:bindings().BUCKET.resumeMultipartUpload(row.object_key,row.upload_id)};}
export async function PUT(request:Request,ctx:Ctx){try{
 const {row,upload}=await get(request,ctx);if(row.state!=="uploading")throw new ApiError("This upload is already closed.");
 const n=Number(new URL(request.url).searchParams.get("part")),chunk=8*1024*1024,count=Math.ceil(row.total_size/chunk);
 if(!Number.isInteger(n)||n<1||n>count)throw new ApiError("Invalid video part.");
 const expected=n===count?row.total_size-(n-1)*chunk:chunk;
 const declared=request.headers.get("content-length");if(declared&&Number(declared)!==expected)throw new ApiError("The uploaded part has an unexpected size.");
 if(!request.body)throw new ApiError("The uploaded part is empty.");
 const reader=request.body.getReader(),data=new Uint8Array(expected);let received=0;
 while(true){const next=await reader.read();if(next.done)break;if(received+next.value.byteLength>expected){await reader.cancel();throw new ApiError("The uploaded part is too large.");}data.set(next.value,received);received+=next.value.byteLength;}
 if(received!==expected)throw new ApiError("The uploaded part has an unexpected size.");
 return Response.json(await upload.uploadPart(n,data));
}catch(e){return apiFailure(e);}}
export async function POST(request:Request,ctx:Ctx){try{
 const {id,row,upload}=await get(request,ctx);if(row.state==="complete")return Response.json({key:row.object_key});if(row.state!=="uploading")throw new ApiError("This upload was cancelled.");
 const {parts}=z.object({parts:z.array(z.object({partNumber:z.number().int().positive(),etag:z.string().min(1).max(2048)})).min(1).max(128)}).parse(await request.json());
 const count=Math.ceil(row.total_size/(8*1024*1024));if(parts.length!==count||parts.some((p,i)=>p.partNumber!==i+1))throw new ApiError("Some video parts are missing. Try uploading again.");
 const stored=await bindings().BUCKET.head(row.object_key);
 const object=stored??await upload.complete(parts);if(object.size!==row.total_size)throw new ApiError("The uploaded file is incomplete.");
 await database().prepare("UPDATE portfolio_uploads SET state=? WHERE id=?").bind("complete",id).run();return Response.json({key:row.object_key});
}catch(e){return apiFailure(e);}}
export async function DELETE(request:Request,ctx:Ctx){try{const {id,row,upload}=await get(request,ctx);if(row.state==="uploading"){await upload.abort();await database().prepare("UPDATE portfolio_uploads SET state=? WHERE id=?").bind("cancelled",id).run();}return Response.json({cancelled:true});}catch(e){return apiFailure(e);}}
