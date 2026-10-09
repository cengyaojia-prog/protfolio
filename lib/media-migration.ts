const SOURCE = "https://yaojia-zeng-film-portfolio.grandbrook16.chatgpt.site";
type MigrationEnv = { DB: D1Database; BUCKET: R2Bucket; PORTFOLIO_MIGRATION_TOKEN?: string };
const KEY = /^media\/[0-9a-f-]{36}$/;
function reply(data: unknown, status = 200) { return Response.json(data, { status, headers: { "Cache-Control": "no-store" } }); }
async function authorized(request: Request, secret?: string) {
  if (!secret || secret.length < 24) return false;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (supplied.length > 512) return false;
  const hashes = await Promise.all([secret, supplied].map(s => crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))));
  const a = new Uint8Array(hashes[0]), b = new Uint8Array(hashes[1]);
  let difference = 0; for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}
async function mediaKeys(db: D1Database) {
  const rows = await db.prepare("SELECT data FROM portfolio_projects").all<{data:string}>();
  const files = new Map<string, string>();
  for (const row of rows.results) {
    const p = JSON.parse(row.data);
    for (const field of ["posterKey", "videoKey"]) if (typeof p[field] === "string" && KEY.test(p[field]))
      files.set(p[field], String(p.title ?? "Untitled") + (field === "posterKey" ? " — cover" : " — video"));
  }
  return files;
}
async function register(env: MigrationEnv, key: string, size: number, contentType: string) {
  await env.DB.prepare("INSERT INTO portfolio_uploads (id,owner_id,object_key,upload_id,content_type,total_size,filename,state,created_at) SELECT ?,?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM portfolio_uploads WHERE object_key=? AND state='complete')")
    .bind(crypto.randomUUID(), "media-migration", key, "migrated", contentType, size, key.split("/")[1], "complete", new Date().toISOString(), key).run();
}
export async function handleMediaMigration(request: Request, env: MigrationEnv, fetcher: typeof fetch = fetch) {
  if (!(await authorized(request, env.PORTFOLIO_MIGRATION_TOKEN))) return reply({error:"Migration is disabled or the temporary key is incorrect. Set PORTFOLIO_MIGRATION_TOKEN to a secret of at least 24 characters."}, 403);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({error:"Use the migration page on this website."}, 403);
  let stage = "读取作品记录";
  try {
    if (!env.DB || !env.BUCKET) return reply({error:"缺少 DB 或 BUCKET 绑定，请检查 Worker 的 Bindings。"}, 503);
    const files = await mediaKeys(env.DB);
    if (request.method === "GET") return reply({files:Array.from(files, ([key,label]) => ({key,label}))});
    if (request.method !== "POST") return reply({error:"Method not allowed"}, 405);
    if (Number(request.headers.get("content-length") ?? 0) > 2048) return reply({error:"Request too large"}, 413);
    const {key} = await request.json() as {key?:unknown};
    if (typeof key !== "string" || !files.has(key)) return reply({error:"This file is not referenced by the restored portfolio."}, 400);
    stage = "检查新存储桶";
    const existing = await env.BUCKET.head(key);
    if (existing) {
      stage = "登记已存在文件";
      await register(env, key, existing.size, existing.httpMetadata?.contentType ?? "application/octet-stream");
      return reply({ok:true,alreadyPresent:true,size:existing.size});
    }
    stage = "读取原站文件";
    const source = await fetcher(SOURCE + "/api/media/" + encodeURIComponent(key), {redirect:"manual",headers:{"Accept-Encoding":"identity"}});
    if (!source.ok || !source.body) { await source.body?.cancel(); return reply({error:"Original website returned HTTP " + source.status + ". The file has not been copied."}, 502); }
    const size = Number(source.headers.get("content-length"));
    const contentType = source.headers.get("content-type") ?? "";
    if (!Number.isSafeInteger(size) || size < 1 || size > 1073741824 || !/^(image|video)\//.test(contentType) || source.headers.get("content-encoding")) {
      await source.body.cancel(); return reply({error:"Original file size or format could not be verified."}, 502);
    }
    stage = "写入新存储桶";
    const body = source.body.pipeThrough(new FixedLengthStream(size));
    const saved = await env.BUCKET.put(key, body, {httpMetadata:{contentType},onlyIf:{etagDoesNotMatch:"*"}});
    const meta = saved ?? await env.BUCKET.head(key);
    if (!meta || meta.size !== size) return reply({error:"Copied file size does not match. No completed upload record was added."}, 502);
    stage = "登记复制完成的文件";
    await register(env, key, size, contentType);
    return reply({ok:true,size});
  } catch (error) {
    const reason = error instanceof Error ? error.message.replace(/https?:\/\/\S+/g, "[URL]").slice(0,220) : "Unknown runtime error";
    console.error("Media migration failed at:", stage, reason);
    return reply({error:stage + "失败：" + reason + "。已完成的文件会保留。"}, 502);
  }
}
