"use client";
import { useState } from "react";
export default function MigrationPage() {
  const [secret,setSecret] = useState(""), [busy,setBusy] = useState(false), [logs,setLogs] = useState<string[]>([]);
  async function start() {
    setBusy(true); setLogs([]);
    const headers = {"Authorization":"Bearer " + secret,"Content-Type":"application/json"};
    const log = (text:string) => setLogs(old=>[...old,text]);
    try {
      const list = await fetch("/api/migrate-media",{headers,cache:"no-store"});
      const data = await list.json() as {error?:string;files?:{key:string;label:string}[]}; if(!list.ok || !Array.isArray(data.files)) throw new Error(data.error ?? "Cannot load files.");
      log("Found " + data.files.length + " referenced media files.");
      for (const file of data.files) {
        log("Copying: " + file.label);
        const res = await fetch("/api/migrate-media",{method:"POST",headers,body:JSON.stringify({key:file.key})});
        const result = await res.json() as {error?:string;alreadyPresent?:boolean;size:number}; if(!res.ok) throw new Error(file.label + ": " + result.error);
        log((result.alreadyPresent ? "Already copied: " : "Copied: ") + file.label + " (" + (result.size/1048576).toFixed(1) + " MB)");
      }
      log("Finished. Open the portfolio and check covers and video playback. Then delete PORTFOLIO_MIGRATION_TOKEN from Cloudflare settings.");
    } catch(e) {log(e instanceof Error ? e.message : "Copy failed. You can retry; existing files will be preserved.");}
    finally {setBusy(false);}
  }
  return <main style={{maxWidth:760,margin:"60px auto",padding:24,color:"white",background:"#111",minHeight:"70vh"}}>
    <h1 style={{fontSize:28}}>Restore portfolio media / 恢复作品媒体</h1>
    <p style={{margin:"20px 0"}}>从原网站复制作品正在使用的封面和视频。请保持此页面打开。重复执行会跳过已复制文件。</p>
    <p>请先在 Cloudflare 的 Secrets 中设置 PORTFOLIO_MIGRATION_TOKEN，然后在下方输入相同的临时密钥。</p>
    <input type="password" autoComplete="off" aria-label="Temporary migration key" placeholder="临时密钥（至少 24 个字符）" value={secret} disabled={busy} onChange={e=>setSecret(e.target.value)} style={{display:"block",width:"100%",padding:12,margin:"20px 0",color:"white",border:"1px solid #666",background:"#222"}}/>
    <button disabled={busy||secret.length<24} onClick={start} style={{padding:"12px 20px",background:"#eee",color:"#111",opacity:busy||secret.length<24?.5:1}}>{busy?"正在复制，请勿关闭页面…":"开始迁移 / Start copying"}</button>
    <pre aria-live="polite" style={{whiteSpace:"pre-wrap",marginTop:24,fontSize:14,lineHeight:1.8}}>{logs.join("\n")}</pre>
    <p style={{marginTop:24}}><a href="/projects">查看作品 / View portfolio</a></p>
  </main>;
}
