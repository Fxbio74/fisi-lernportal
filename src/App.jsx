import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const BUCKET = "fisi-dateien";
const TABLE  = "zusammenfassungen";

const CATEGORIES = ["Netzwerke","IT-Sicherheit","Virtualisierung","Scripting","Datenbanken","Hardware","WiSo","Sonstiges"];
const CAT_COLORS = {
  "Netzwerke":       { bg:"#0a1f3d", badge:"#3b82f6" },
  "IT-Sicherheit":   { bg:"#1a0a2e", badge:"#a855f7" },
  "Virtualisierung": { bg:"#0a2e1a", badge:"#22c55e" },
  "Scripting":       { bg:"#2a2000", badge:"#eab308" },
  "Datenbanken":     { bg:"#0a1828", badge:"#38bdf8" },
  "Hardware":        { bg:"#2e0f0f", badge:"#ef4444" },
  "WiSo":            { bg:"#1e0a1e", badge:"#ec4899" },
  "Sonstiges":       { bg:"#111",    badge:"#888"    },
};
const FILE_ICONS = {
  "pdf":  { icon:"📄", color:"#ef4444", label:"PDF" },
  "docx": { icon:"📝", color:"#3b82f6", label:"Word" },
  "doc":  { icon:"📝", color:"#3b82f6", label:"Word" },
  "pptx": { icon:"📊", color:"#f97316", label:"PowerPoint" },
  "ppt":  { icon:"📊", color:"#f97316", label:"PowerPoint" },
  "xlsx": { icon:"📈", color:"#22c55e", label:"Excel" },
  "txt":  { icon:"📃", color:"#888",    label:"Text" },
  "png":  { icon:"🖼️", color:"#a855f7", label:"Bild" },
  "jpg":  { icon:"🖼️", color:"#a855f7", label:"Bild" },
  "jpeg": { icon:"🖼️", color:"#a855f7", label:"Bild" },
};
function getFileInfo(f){ const e=f.split(".").pop().toLowerCase(); return FILE_ICONS[e]||{icon:"📎",color:"#888",label:e.toUpperCase()}; }
function formatBytes(b){ if(!b)return""; if(b<1024)return b+" B"; if(b<1048576)return(b/1024).toFixed(1)+" KB"; return(b/1048576).toFixed(1)+" MB"; }

// ── YouTube ID extrahieren ────────────────────────────────────────────────────
function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ── PDF Generator ─────────────────────────────────────────────────────────────
function generatePDF(item) {
  const date=new Date(item.created_at).toLocaleDateString("de-DE",{day:"2-digit",month:"long",year:"numeric"});
  const content=(item.content||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const html=`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"/><title>${item.title}</title>
<style>@page{margin:2cm}*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:11pt;color:#1a1a1a}
.header{background:#1F4E79;color:#fff;padding:20px 24px;border-radius:8px;margin-bottom:20px}
.header .cat{font-size:8pt;letter-spacing:2px;color:#90cdf4;margin-bottom:6px;font-weight:bold}
.header h1{font-size:18pt;font-weight:bold;margin-bottom:6px}.header .meta{font-size:9pt;color:#bfdbfe}
.tags{margin:12px 0;display:flex;flex-wrap:wrap;gap:6px}.tag{background:#EEF4FF;color:#1F4E79;padding:3px 8px;border-radius:4px;font-size:9pt;border:1px solid #BFDBFE}
.content{background:#f8f9fa;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;border-left:4px solid #2E75B6}
.content pre{font-family:"Courier New",monospace;font-size:10pt;white-space:pre-wrap;word-break:break-word;line-height:1.8}
.footer{margin-top:20px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:8pt;color:#888;display:flex;justify-content:space-between}
</style></head><body>
<div class="header"><div class="cat">${item.category.toUpperCase()} · FISI IHK HEILBRONN</div>
<h1>${item.title}</h1><div class="meta">von ${item.author} · ${date}</div></div>
${(item.tags||[]).length?`<div class="tags">${(item.tags||[]).map(t=>`<span class="tag">#${t}</span>`).join("")}</div>`:""}
<div class="content"><pre>${content}</pre></div>
<div class="footer"><span>FISI Lernportal · IHK Heilbronn · Prüfung Mai 2026</span><span>${date}</span></div>
</body></html>`;
  const win=window.open(URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"})),"_blank");
  if(win) win.onload=()=>setTimeout(()=>win.print(),500);
}

function generateDOCX(item) {
  const date=new Date(item.created_at).toLocaleDateString("de-DE",{day:"2-digit",month:"long",year:"numeric"});
  const tags=(item.tags||[]).map(t=>"#"+t).join("  ");
  const lines=(item.content||"").split("\n").map(l=>{const e=l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");return `<w:p><w:r><w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${e}</w:t></w:r></w:p>`;}).join("\n");
  const docxml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
<w:p><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="36"/><w:color w:val="1F4E79"/></w:rPr><w:t>${item.title.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</w:t></w:r></w:p>
<w:p><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="20"/><w:color w:val="888888"/></w:rPr><w:t xml:space="preserve">${item.category} · von ${item.author} · ${date}</w:t></w:r></w:p>
${tags?`<w:p><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="20"/><w:color w:val="2E75B6"/></w:rPr><w:t xml:space="preserve">${tags.replace(/&/g,"&amp;")}</w:t></w:r></w:p>`:""}
<w:p><w:r><w:t></w:t></w:r></w:p>${lines}
<w:p><w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="16"/><w:color w:val="AAAAAA"/></w:rPr><w:t>FISI Lernportal · IHK Heilbronn · Pruefung Mai 2026</w:t></w:r></w:p>
<w:sectPr><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;
  const ct=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
  const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  const doZip=()=>{const zip=new window.JSZip();zip.file("[Content_Types].xml",ct);zip.file("_rels/.rels",rels);zip.file("word/document.xml",docxml);zip.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}).then(blob=>{const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=item.title.replace(/[^a-zA-Z0-9äöüÄÖÜß\s]/g,"").replace(/\s+/g,"_").substring(0,50)+".docx";a.click();});};
  if(!window.JSZip){const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";s.onload=doZip;document.head.appendChild(s);}else doZip();
}

// ── Prüfungs-PDF ──────────────────────────────────────────────────────────────
function generatePruefungPDF(item, questions, answers, submitted) {
  const score = submitted ? questions.filter((q,i) => answers[i] === q.correct).length : 0;
  const percent = submitted ? Math.round((score/questions.length)*100) : 0;
  const date = new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"long",year:"numeric"});
  const qHtml = questions.map((q,i) => {
    const isCorrect = answers[i] === q.correct;
    const color = !submitted ? "#1a1a1a" : isCorrect ? "#0a2e1a" : "#2e0a0a";
    const border = !submitted ? "#ddd" : isCorrect ? "#22c55e" : "#ef4444";
    return `<div style="margin-bottom:20px;padding:14px;background:${color};border:1px solid ${border};border-radius:8px">
      <div style="font-weight:bold;margin-bottom:8px;color:${submitted?(isCorrect?"#22c55e":"#ef4444"):"#1a1a1a"}">${i+1}. ${q.question.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
      ${q.options.map((o,j)=>`<div style="padding:4px 8px;margin:3px 0;border-radius:4px;font-size:10pt;background:${submitted&&j===q.correct?"#1a3a1a":submitted&&j===answers[i]&&!isCorrect?"#3a1a1a":"#f8f9fa"}">${String.fromCharCode(65+j)}) ${o.replace(/&/g,"&amp;")}</div>`).join("")}
      ${submitted&&!isCorrect&&q.explanation?`<div style="margin-top:8px;padding:8px;background:#1a2a3a;border-radius:4px;font-size:9pt;color:#93c5fd">💡 ${q.explanation.replace(/&/g,"&amp;")}</div>`:""}
    </div>`;
  }).join("");
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Prüfung: ${item.title}</title>
<style>@page{margin:2cm}*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:11pt;color:#1a1a1a}
.header{background:#1F4E79;color:#fff;padding:16px 20px;border-radius:8px;margin-bottom:16px}
.score{text-align:center;padding:16px;border-radius:8px;margin-bottom:16px;background:${percent>=80?"#0a2e1a":percent>=50?"#2e2a00":"#2e0a0a"};color:${percent>=80?"#22c55e":percent>=50?"#eab308":"#ef4444"};font-size:1.5rem;font-weight:bold}
</style></head><body>
<div class="header"><div style="font-size:8pt;letter-spacing:2px;color:#90cdf4;margin-bottom:4px">${item.category.toUpperCase()} · FISI PRÜFUNG</div>
<div style="font-size:16pt;font-weight:bold">${item.title}</div>
<div style="font-size:9pt;color:#bfdbfe">${date}</div></div>
${submitted?`<div class="score">${score}/${questions.length} Punkte · ${percent}% · ${percent>=80?"Bestanden ✓":percent>=50?"Knapp ":"Nicht bestanden ✗"}</div>`:""}
${qHtml}
<div style="margin-top:20px;padding-top:12px;border-top:1px solid #ddd;font-size:8pt;color:#888">FISI Lernportal · IHK Heilbronn · Prüfung Mai 2026</div>
</body></html>`;
  const win=window.open(URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"})),"_blank");
  if(win) win.onload=()=>setTimeout(()=>win.print(),500);
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, size=18 }) => {
  const p={fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"};
  const icons={
    upload:    <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    search:    <svg width={size} height={size} viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    trash:     <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    book:      <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    close:     <svg width={size} height={size} viewBox="0 0 24 24" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus:      <svg width={size} height={size} viewBox="0 0 24 24" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    star:      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    check:     <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
    download:  <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    eye:       <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    refresh:   <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
    pdf:       <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    word:      <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2l2 5 2-5h2"/></svg>,
    chevron:   <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="6 9 12 15 18 9"/></svg>,
    sideOpen:  <svg width={size} height={size} viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><polyline points="14 8 11 12 14 16"/></svg>,
    sideClose: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><polyline points="11 8 14 12 11 16"/></svg>,
    send:      <svg width={size} height={size} viewBox="0 0 24 24" {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    bot:       <svg width={size} height={size} viewBox="0 0 24 24" {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="11"/></svg>,
    quiz:      <svg width={size} height={size} viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    lightbulb: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg>,
    youtube:   <svg width={size} height={size} viewBox="0 0 24 24" fill="#ef4444" stroke="none"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>,
    pruefung:  <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  };
  return icons[name]||null;
};

// ── KI API Call ───────────────────────────────────────────────────────────────
async function callKI(messages, system) {
  const res = await fetch("/api/chat", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ system, messages })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data.error));
  return data.content?.[0]?.text || "";
}

// ── KI Chat Modal ─────────────────────────────────────────────────────────────
function KIChatModal({ item, onClose }) {
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [mode,setMode]=useState(null);
  const bottomRef=useRef();
  const col=CAT_COLORS[item.category]||CAT_COLORS["Sonstiges"];
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const systemPrompt=`Du bist ein FISI-Pruefungscoach fuer IHK Heilbronn Pruefung Mai 2026. Thema: "${item.title}" (${item.category}). Inhalt: ${item.content||"(Datei)"}. Erklaere auf Deutsch, klar, mit Praxisbeispielen. Merksaetze willkommen. Sei motivierend.`;

  const sendMessage=async(userMsg)=>{
    if(!userMsg.trim()||loading) return;
    const newMessages=[...messages,{role:"user",content:userMsg}];
    setMessages(newMessages); setInput(""); setLoading(true);
    try {
      const reply = await callKI(newMessages, systemPrompt);
      setMessages(prev=>[...prev,{role:"assistant",content:reply}]);
    } catch(e) {
      setMessages(prev=>[...prev,{role:"assistant",content:"❌ Fehler: "+e.message}]);
    }
    setLoading(false);
  };

  const startMode=(m)=>{
    setMode(m); setMessages([]);
    const prompts={
      erklaeren:`Erklaere mir "${item.title}" ausfuehrlich mit Beispielen und Merksatz. Was ist pruefungsrelevant?`,
      abfragen:`Stelle mir eine IHK-Pruefungsfrage zu "${item.title}". Warte auf meine Antwort.`,
      tipps:`Top-5 Pruefungstipps und haeufige Fallen bei "${item.title}".`,
    };
    const firstMessages=[{role:"user",content:prompts[m]}];
    setMessages(firstMessages); setLoading(true);
    callKI(firstMessages,systemPrompt).then(reply=>{
      setMessages([{role:"user",content:prompts[m]},{role:"assistant",content:reply}]);
      setLoading(false);
    }).catch(e=>{
      setMessages([{role:"user",content:prompts[m]},{role:"assistant",content:"❌ Fehler: "+e.message}]);
      setLoading(false);
    });
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",backdropFilter:"blur(12px)",zIndex:110,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"#080808",border:`1px solid ${col.badge}40`,borderRadius:"16px",width:"100%",maxWidth:"720px",height:"85vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"1rem 1.5rem",borderBottom:`1px solid ${col.badge}20`,background:`linear-gradient(135deg,${col.bg}cc,#080808)`,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
              <div style={{width:"32px",height:"32px",background:`${col.badge}20`,border:`1px solid ${col.badge}40`,borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",color:col.badge}}><Icon name="bot" size={16}/></div>
              <div>
                <div style={{fontSize:"0.7rem",color:col.badge,fontWeight:"bold",letterSpacing:"0.1em"}}>KI LERNASSISTENT</div>
                <div style={{fontSize:"0.85rem",color:"#ccc",fontFamily:"'Courier New',monospace",fontWeight:"bold"}}>{item.title}</div>
              </div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"1px solid #1e1e1e",borderRadius:"7px",padding:"0.4rem",cursor:"pointer",color:"#555"}} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#555"}><Icon name="close" size={16}/></button>
          </div>
          {!mode&&(
            <div style={{marginTop:"1rem"}}>
              <div style={{fontSize:"0.7rem",color:"#555",marginBottom:"0.6rem"}}>Was möchtest du tun?</div>
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                {[{id:"erklaeren",icon:"lightbulb",label:"Thema erklären",color:"#eab308",desc:"Erklärung mit Beispielen"},{id:"abfragen",icon:"quiz",label:"Mich abfragen",color:"#a855f7",desc:"Prüfungsfragen stellen"},{id:"tipps",icon:"star",label:"Prüfungstipps",color:"#22c55e",desc:"Häufige Fallen"}].map(btn=>(
                  <button key={btn.id} onClick={()=>startMode(btn.id)} style={{flex:"1",minWidth:"130px",padding:"0.75rem 1rem",background:`${btn.color}10`,border:`1px solid ${btn.color}30`,borderRadius:"10px",cursor:"pointer",color:btn.color,fontFamily:"inherit",textAlign:"left"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.4rem",fontWeight:"bold",fontSize:"0.82rem",marginBottom:"0.2rem"}}><Icon name={btn.icon} size={13}/>{btn.label}</div>
                    <div style={{fontSize:"0.7rem",color:"#666"}}>{btn.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {mode&&(
            <div style={{marginTop:"0.6rem",display:"flex",gap:"0.4rem",flexWrap:"wrap"}}>
              {[{id:"erklaeren",icon:"lightbulb",label:"Erklären",color:"#eab308"},{id:"abfragen",icon:"quiz",label:"Abfragen",color:"#a855f7"},{id:"tipps",icon:"star",label:"Tipps",color:"#22c55e"}].map(btn=>(
                <button key={btn.id} onClick={()=>startMode(btn.id)} style={{padding:"0.3rem 0.7rem",borderRadius:"20px",fontSize:"0.72rem",border:`1px solid ${mode===btn.id?btn.color:"#2a2a2a"}`,background:mode===btn.id?`${btn.color}18`:"transparent",color:mode===btn.id?btn.color:"#555",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"0.3rem"}}>
                  <Icon name={btn.icon} size={11}/>{btn.label}
                </button>
              ))}
              <button onClick={()=>{setMessages([]);setMode(null);}} style={{padding:"0.3rem 0.7rem",borderRadius:"20px",fontSize:"0.72rem",border:"1px solid #2a2a2a",background:"transparent",color:"#555",cursor:"pointer",fontFamily:"inherit"}}>← Neu</button>
            </div>
          )}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"1.25rem 1.5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
          {messages.length===0&&!loading&&<div style={{textAlign:"center",padding:"3rem",color:"#333"}}><div style={{fontSize:"2.5rem",marginBottom:"0.5rem"}}>🤖</div><div style={{fontSize:"0.85rem"}}>Wähle einen Modus!</div></div>}
          {messages.filter(m=>m.role==="assistant").length===0&&messages.length>0&&!loading&&null}
          {messages.map((msg,i)=>(
            msg.role==="user"?null:
            <div key={i} style={{display:"flex",gap:"0.6rem"}}>
              <div style={{width:"26px",height:"26px",background:`${col.badge}20`,border:`1px solid ${col.badge}30`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:col.badge,flexShrink:0,marginTop:"2px"}}><Icon name="bot" size={13}/></div>
              <div style={{maxWidth:"90%",padding:"0.75rem 1rem",background:"#111",border:"1px solid #1e1e1e",borderRadius:"14px 14px 14px 4px",fontSize:"0.85rem",color:"#ccc",lineHeight:"1.7",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{msg.content}</div>
            </div>
          ))}
          {loading&&<div style={{display:"flex",gap:"0.6rem"}}><div style={{width:"26px",height:"26px",background:`${col.badge}20`,border:`1px solid ${col.badge}30`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:col.badge,flexShrink:0}}><Icon name="bot" size={13}/></div><div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:"14px 14px 14px 4px",padding:"0.75rem 1rem",display:"flex",gap:"4px",alignItems:"center"}}>{[0,1,2].map(n=><div key={n} style={{width:"6px",height:"6px",borderRadius:"50%",background:col.badge,animation:`bounce 1.2s infinite ${n*0.2}s`}}/>)}</div></div>}
          <div ref={bottomRef}/>
        </div>
        {mode&&<div style={{padding:"1rem 1.5rem",borderTop:"1px solid #111",flexShrink:0,background:"#090909"}}>
          <div style={{display:"flex",gap:"0.5rem"}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage(input);}}} placeholder="Deine Antwort oder Frage..." disabled={loading} style={{flex:1,background:"#0f0f0f",border:"1px solid #222",borderRadius:"10px",padding:"0.7rem 1rem",color:"#ddd",fontSize:"0.88rem",outline:"none",fontFamily:"inherit"}}/>
            <button onClick={()=>sendMessage(input)} disabled={loading||!input.trim()} style={{background:input.trim()&&!loading?col.badge:"#1a1a1a",border:"none",borderRadius:"10px",padding:"0.7rem 1rem",cursor:input.trim()&&!loading?"pointer":"not-allowed",color:input.trim()&&!loading?"#fff":"#444",display:"flex",alignItems:"center",gap:"0.4rem",fontSize:"0.82rem",fontFamily:"inherit"}}><Icon name="send" size={15}/>Senden</button>
          </div>
          <div style={{fontSize:"0.65rem",color:"#333",marginTop:"0.4rem"}}>Enter zum Senden</div>
        </div>}
      </div>
    </div>
  );
}

// ── Prüfungs Modal ────────────────────────────────────────────────────────────
function PruefungModal({ item, onClose }) {
  const [step,setStep]=useState("config"); // config | loading | pruefung | ergebnis
  const [anzahl,setAnzahl]=useState(5);
  const [schwierigkeit,setSchwierigkeit]=useState("Mittel");
  const [questions,setQuestions]=useState([]);
  const [answers,setAnswers]=useState({});
  const [submitted,setSubmitted]=useState(false);
  const col=CAT_COLORS[item.category]||CAT_COLORS["Sonstiges"];

  const generatePruefung=async()=>{
    setStep("loading");
    const systemPrompt=`Du bist ein IHK-Pruefungsersteller fuer Fachinformatiker Systemintegration. Erstelle Multiple-Choice Fragen auf Deutsch. Antworte NUR mit validem JSON, kein Text davor oder danach.`;
    const userMsg=`Erstelle ${anzahl} Multiple-Choice Pruefungsfragen zum Thema "${item.title}" (${item.category}), Schwierigkeit: ${schwierigkeit}.
Inhalt: ${(item.content||"").substring(0,2000)}

Antworte NUR mit diesem JSON-Format (kein Markdown, kein Text):
[{"question":"Frage?","options":["A","B","C","D"],"correct":0,"explanation":"Erklaerung warum A richtig ist"}]

correct ist der Index (0-3) der richtigen Antwort.`;
    try {
      const reply = await callKI([{role:"user",content:userMsg}],systemPrompt);
      const clean = reply.replace(/```json/g,"").replace(/```/g,"").trim();
      const parsed = JSON.parse(clean);
      setQuestions(parsed);
      setAnswers({});
      setSubmitted(false);
      setStep("pruefung");
    } catch(e) {
      alert("Fehler beim Generieren: "+e.message);
      setStep("config");
    }
  };

  const score=questions.filter((q,i)=>answers[i]===q.correct).length;
  const percent=questions.length>0?Math.round((score/questions.length)*100):0;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",backdropFilter:"blur(12px)",zIndex:110,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"#080808",border:`1px solid ${col.badge}40`,borderRadius:"16px",width:"100%",maxWidth:"760px",maxHeight:"92vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"1rem 1.5rem",borderBottom:`1px solid ${col.badge}20`,background:`linear-gradient(135deg,${col.bg}cc,#080808)`,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:"0.7rem",color:col.badge,fontWeight:"bold",letterSpacing:"0.1em"}}>📝 PRÜFUNG ERSTELLEN</div>
            <div style={{fontSize:"0.9rem",color:"#ccc",fontFamily:"'Courier New',monospace",fontWeight:"bold"}}>{item.title}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"1px solid #1e1e1e",borderRadius:"7px",padding:"0.4rem",cursor:"pointer",color:"#555"}} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#555"}><Icon name="close" size={16}/></button>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"1.5rem"}}>

          {/* Konfiguration */}
          {step==="config"&&(
            <div style={{display:"flex",flexDirection:"column",gap:"1.5rem"}}>
              <div>
                <div style={{fontSize:"0.7rem",color:"#555",letterSpacing:"0.15em",marginBottom:"0.6rem"}}>ANZAHL FRAGEN</div>
                <div style={{display:"flex",gap:"0.5rem"}}>
                  {[5,10,15].map(n=>(
                    <button key={n} onClick={()=>setAnzahl(n)} style={{flex:1,padding:"0.75rem",borderRadius:"10px",border:anzahl===n?`1px solid ${col.badge}`:"1px solid #2a2a2a",background:anzahl===n?`${col.badge}18`:"transparent",color:anzahl===n?col.badge:"#666",cursor:"pointer",fontFamily:"inherit",fontSize:"1rem",fontWeight:"bold"}}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:"0.7rem",color:"#555",letterSpacing:"0.15em",marginBottom:"0.6rem"}}>SCHWIERIGKEIT</div>
                <div style={{display:"flex",gap:"0.5rem"}}>
                  {[{l:"Leicht",c:"#22c55e"},{l:"Mittel",c:"#eab308"},{l:"Schwer",c:"#ef4444"}].map(s=>(
                    <button key={s.l} onClick={()=>setSchwierigkeit(s.l)} style={{flex:1,padding:"0.75rem",borderRadius:"10px",border:schwierigkeit===s.l?`1px solid ${s.c}`:"1px solid #2a2a2a",background:schwierigkeit===s.l?`${s.c}18`:"transparent",color:schwierigkeit===s.l?s.c:"#666",cursor:"pointer",fontFamily:"inherit",fontWeight:"bold"}}>{s.l}</button>
                  ))}
                </div>
              </div>
              <button onClick={generatePruefung} style={{padding:"1rem",borderRadius:"12px",background:col.badge,border:"none",color:"#fff",fontSize:"1rem",fontWeight:"bold",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"}}>
                <Icon name="pruefung" size={18}/>Prüfung generieren ({anzahl} Fragen · {schwierigkeit})
              </button>
            </div>
          )}

          {/* Loading */}
          {step==="loading"&&(
            <div style={{textAlign:"center",padding:"4rem"}}>
              <div style={{fontSize:"3rem",marginBottom:"1rem"}}>⚙️</div>
              <div style={{color:"#888",fontSize:"0.9rem"}}>KI generiert {anzahl} Fragen...</div>
              <div style={{display:"flex",gap:"6px",justifyContent:"center",marginTop:"1rem"}}>
                {[0,1,2].map(n=><div key={n} style={{width:"8px",height:"8px",borderRadius:"50%",background:col.badge,animation:`bounce 1.2s infinite ${n*0.2}s`}}/>)}
              </div>
            </div>
          )}

          {/* Prüfung */}
          {step==="pruefung"&&(
            <div>
              {!submitted&&<div style={{background:"#0a1a2e",border:"1px solid #1a3a5a",borderRadius:"10px",padding:"0.75rem 1rem",marginBottom:"1.5rem",fontSize:"0.82rem",color:"#60a5fa"}}>
                📋 {questions.length} Fragen · {anzahl} Minuten empfohlen · Alle beantworten dann abgeben
              </div>}
              {submitted&&(
                <div style={{textAlign:"center",padding:"1.5rem",borderRadius:"12px",marginBottom:"1.5rem",background:percent>=80?"#0a2e1a":percent>=50?"#2e2a00":"#2e0a0a",border:`1px solid ${percent>=80?"#22c55e":percent>=50?"#eab308":"#ef4444"}`}}>
                  <div style={{fontSize:"2.5rem",fontWeight:"bold",color:percent>=80?"#22c55e":percent>=50?"#eab308":"#ef4444"}}>{score}/{questions.length}</div>
                  <div style={{fontSize:"1.2rem",color:percent>=80?"#22c55e":percent>=50?"#eab308":"#ef4444",fontWeight:"bold"}}>{percent}% · {percent>=80?"Bestanden ✓":percent>=50?"Knapp ⚠️":"Nicht bestanden ✗"}</div>
                  <div style={{display:"flex",gap:"0.75rem",justifyContent:"center",marginTop:"1rem",flexWrap:"wrap"}}>
                    <button onClick={()=>{setStep("config");setQuestions([]);setAnswers({});setSubmitted(false);}} style={{padding:"0.5rem 1rem",borderRadius:"8px",background:"#fff",color:"#000",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:"bold",fontSize:"0.85rem"}}>🔄 Neue Prüfung</button>
                    <button onClick={()=>generatePruefungPDF(item,questions,answers,submitted)} style={{padding:"0.5rem 1rem",borderRadius:"8px",background:"none",border:"1px solid #ef4444",color:"#ef4444",cursor:"pointer",fontFamily:"inherit",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"0.4rem"}}><Icon name="pdf" size={14}/>Als PDF</button>
                  </div>
                </div>
              )}
              {questions.map((q,i)=>{
                const isAnswered=answers[i]!==undefined;
                const isCorrect=submitted&&answers[i]===q.correct;
                const isWrong=submitted&&isAnswered&&!isCorrect;
                return(
                  <div key={i} style={{marginBottom:"1.25rem",padding:"1rem 1.25rem",background:submitted?(isCorrect?"#0a2e1a":isWrong?"#2e0a0a":"#111"):"#111",border:`1px solid ${submitted?(isCorrect?"#22c55e":isWrong?"#ef4444":"#1e1e1e"):"#1e1e1e"}`,borderRadius:"12px"}}>
                    <div style={{fontSize:"0.88rem",fontWeight:"bold",color:submitted?(isCorrect?"#22c55e":isWrong?"#ef4444":"#ccc"):"#ccc",marginBottom:"0.75rem",lineHeight:1.4}}>
                      {submitted&&<span style={{marginRight:"0.4rem"}}>{isCorrect?"✅":"❌"}</span>}{i+1}. {q.question}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                      {q.options.map((opt,j)=>{
                        const isSelected=answers[i]===j;
                        const isRight=submitted&&j===q.correct;
                        const isSelectedWrong=submitted&&isSelected&&j!==q.correct;
                        return(
                          <button key={j} onClick={()=>!submitted&&setAnswers(a=>({...a,[i]:j}))} style={{padding:"0.6rem 0.9rem",borderRadius:"8px",border:`1px solid ${isRight?"#22c55e":isSelectedWrong?"#ef4444":isSelected?"#3b82f6":"#2a2a2a"}`,background:isRight?"#0a2e1a":isSelectedWrong?"#2e0a0a":isSelected?"#0a1a2e":"#0a0a0a",color:isRight?"#22c55e":isSelectedWrong?"#ef4444":isSelected?"#60a5fa":"#888",cursor:submitted?"default":"pointer",textAlign:"left",fontFamily:"inherit",fontSize:"0.82rem",transition:"all 0.15s"}}>
                            <strong>{String.fromCharCode(65+j)})</strong> {opt}
                          </button>
                        );
                      })}
                    </div>
                    {submitted&&isWrong&&q.explanation&&<div style={{marginTop:"0.75rem",padding:"0.6rem 0.9rem",background:"#0a1228",border:"1px solid #1a3a5a",borderRadius:"8px",fontSize:"0.78rem",color:"#93c5fd"}}>💡 {q.explanation}</div>}
                  </div>
                );
              })}
              {!submitted&&questions.length>0&&(
                <button onClick={()=>setSubmitted(true)} disabled={Object.keys(answers).length<questions.length} style={{width:"100%",padding:"1rem",borderRadius:"12px",background:Object.keys(answers).length>=questions.length?"#22c55e":"#1a1a1a",border:"none",color:Object.keys(answers).length>=questions.length?"#000":"#555",fontSize:"1rem",fontWeight:"bold",cursor:Object.keys(answers).length>=questions.length?"pointer":"not-allowed",fontFamily:"inherit",marginTop:"0.5rem"}}>
                  {Object.keys(answers).length<questions.length?`Noch ${questions.length-Object.keys(answers).length} Fragen offen`:"Prüfung abgeben ✓"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── YouTube Modal ─────────────────────────────────────────────────────────────
function YouTubeModal({ item, onClose, onSave }) {
  const [url,setUrl]=useState("");
  const [title,setTitle]=useState("");
  const [videos,setVideos]=useState(item.youtube_links||[]);
  const [saved,setSaved]=useState(false);
  const col=CAT_COLORS[item.category]||CAT_COLORS["Sonstiges"];

  const addVideo=()=>{
    const id=getYouTubeId(url);
    if(!id){ alert("Ungültige YouTube-URL!"); return; }
    const newVideos=[...videos,{url,title:title||"Video",id}];
    setVideos(newVideos);
    setUrl(""); setTitle("");
  };
  const removeVideo=(i)=>setVideos(v=>v.filter((_,j)=>j!==i));

  const handleSave=async()=>{
    await supabase.from(TABLE).update({youtube_links:videos}).eq("id",item.id);
    onSave({...item,youtube_links:videos});
    setSaved(true);
    setTimeout(()=>{ setSaved(false); onClose(); },800);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",backdropFilter:"blur(12px)",zIndex:110,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"#080808",border:`1px solid ${col.badge}30`,borderRadius:"16px",width:"100%",maxWidth:"700px",maxHeight:"92vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"1rem 1.5rem",borderBottom:`1px solid ${col.badge}18`,background:`linear-gradient(135deg,${col.bg}cc,#080808)`,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:"0.7rem",color:"#ef4444",fontWeight:"bold",letterSpacing:"0.1em"}}>🎬 YOUTUBE VIDEOS</div>
            <div style={{fontSize:"0.9rem",color:"#ccc",fontFamily:"'Courier New',monospace",fontWeight:"bold"}}>{item.title}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"1px solid #1e1e1e",borderRadius:"7px",padding:"0.4rem",cursor:"pointer",color:"#555"}} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#555"}><Icon name="close" size={16}/></button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"1.5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
          {/* URL hinzufügen */}
          <div style={{background:"#0f0f0f",border:"1px solid #1e1e1e",borderRadius:"12px",padding:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
            <div style={{fontSize:"0.7rem",color:"#555",letterSpacing:"0.15em"}}>VIDEO HINZUFÜGEN</div>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="YouTube URL (z.B. https://youtu.be/xyz)" style={{width:"100%",background:"#161616",border:"1px solid #2a2a2a",borderRadius:"8px",padding:"0.65rem 1rem",color:"#ddd",fontSize:"0.88rem",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titel (optional, z.B. 'OSI-Modell einfach erklärt')" style={{width:"100%",background:"#161616",border:"1px solid #2a2a2a",borderRadius:"8px",padding:"0.65rem 1rem",color:"#ddd",fontSize:"0.88rem",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            <button onClick={addVideo} disabled={!url.trim()} style={{padding:"0.65rem",borderRadius:"8px",background:url.trim()?"#ef4444":"#1a1a1a",border:"none",color:url.trim()?"#fff":"#555",cursor:url.trim()?"pointer":"not-allowed",fontFamily:"inherit",fontWeight:"bold",fontSize:"0.85rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.4rem"}}>
              <Icon name="youtube" size={15}/>Video hinzufügen
            </button>
          </div>

          {/* Videos Liste */}
          {videos.length===0&&<div style={{textAlign:"center",padding:"2rem",color:"#333",fontSize:"0.85rem"}}>🎬 Noch keine Videos verlinkt</div>}
          {videos.map((v,i)=>(
            <div key={i} style={{background:"#0f0f0f",border:"1px solid #1e1e1e",borderRadius:"12px",overflow:"hidden"}}>
              <div style={{position:"relative",paddingBottom:"56.25%",background:"#000"}}>
                <iframe src={`https://www.youtube.com/embed/${v.id}`} style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
              </div>
              <div style={{padding:"0.75rem 1rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:"0.85rem",color:"#ccc",fontWeight:"bold"}}>{v.title}</div>
                <button onClick={()=>removeVideo(i)} style={{background:"none",border:"1px solid #2a2a2a",borderRadius:"6px",padding:"0.3rem 0.6rem",cursor:"pointer",color:"#666",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem"}} onMouseEnter={e=>e.currentTarget.style.color="#ef4444"} onMouseLeave={e=>e.currentTarget.style.color="#666"}><Icon name="trash" size={12}/>Entfernen</button>
              </div>
            </div>
          ))}

          <button onClick={handleSave} style={{padding:"0.9rem",borderRadius:"10px",background:saved?"#0a1a0a":"#fff",border:saved?"1px solid #22c55e":"none",color:saved?"#22c55e":"#000",fontSize:"0.88rem",fontWeight:"bold",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"}}>
            {saved?<><Icon name="check" size={15}/>GESPEICHERT!</>:<><Icon name="check" size={15}/>Videos speichern</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Setup Banner ──────────────────────────────────────────────────────────────
function SetupBanner() {
  return(
    <div style={{minHeight:"100vh",background:"#070707",display:"flex",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <div style={{maxWidth:"580px",width:"100%",background:"#0d0d0d",border:"1px solid #2a2a2a",borderRadius:"16px",padding:"2.5rem"}}>
        <div style={{fontSize:"2.5rem",textAlign:"center",marginBottom:"1rem"}}>⚙️</div>
        <div style={{fontFamily:"'Courier New',monospace",fontSize:"1.3rem",fontWeight:"bold",color:"#fff",textAlign:"center",marginBottom:"2rem"}}>Supabase Setup nötig</div>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {["1. supabase.com → New Project","2. Project Settings → API → URL + anon key","3. Vercel → Settings → Environment Variables","4. VITE_SUPABASE_URL = deine URL","5. VITE_SUPABASE_ANON_KEY = dein Key","6. Vercel Redeploy"].map((t,i)=>(
            <div key={i} style={{display:"flex",gap:"1rem",alignItems:"center"}}>
              <div style={{width:"28px",height:"28px",background:"#2E75B6",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"0.8rem",fontWeight:"bold",color:"#fff"}}>{i+1}</div>
              <div style={{fontSize:"0.85rem",color:"#aaa"}}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onRefresh }) {
  const [tab,setTab]=useState("text");
  const [title,setTitle]=useState("");
  const [category,setCategory]=useState("Netzwerke");
  const [content,setContent]=useState("");
  const [tags,setTags]=useState("");
  const [author,setAuthor]=useState("");
  const [file,setFile]=useState(null);
  const [uploading,setUploading]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");
  const fileRef=useRef();
  const inp={width:"100%",background:"#0f0f0f",border:"1px solid #222",borderRadius:"8px",padding:"0.7rem 1rem",color:"#ddd",fontSize:"0.88rem",outline:"none",boxSizing:"border-box",fontFamily:"inherit"};
  const lbl={fontSize:"0.62rem",letterSpacing:"0.18em",color:"#555",display:"block",marginBottom:"0.4rem",fontWeight:"600"};
  const handleSave=async()=>{
    if(!title.trim())return setError("Bitte Titel eingeben!");
    if(tab==="text"&&!content.trim())return setError("Bitte Inhalt eingeben!");
    if(tab==="file"&&!file)return setError("Bitte Datei auswaehlen!");
    setError("");setUploading(true);
    try{
      let fp=null,fn=null,fs=null,ft=null;
      if(tab==="file"&&file){const path=`${Date.now()}_${file.name.replace(/\s+/g,"_")}`;const{error:e}=await supabase.storage.from(BUCKET).upload(path,file);if(e)throw e;fp=path;fn=file.name;fs=file.size;ft=file.name.split(".").pop().toLowerCase();}
      const{error:e}=await supabase.from(TABLE).insert({title:title.trim(),category,content:tab==="text"?content.trim():null,tags:tags.split(",").map(t=>t.trim()).filter(Boolean),author:author.trim()||"Anonym",file_path:fp,file_name:fn,file_size:fs,file_type:ft,type:tab,starred:false,youtube_links:[]});
      if(e)throw e;
      setDone(true);setTimeout(()=>{onRefresh();onClose();},1000);
    }catch(e){setError("Fehler: "+e.message);}
    setUploading(false);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",backdropFilter:"blur(10px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"#0a0a0a",border:"1px solid #1e1e1e",borderRadius:"16px",width:"100%",maxWidth:"700px",maxHeight:"93vh",overflow:"auto"}}>
        <div style={{padding:"1.25rem 1.75rem",borderBottom:"1px solid #141414",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"#0a0a0a",zIndex:10}}>
          <div style={{fontSize:"1.1rem",fontWeight:"bold",fontFamily:"'Courier New',monospace"}}>Neuer Eintrag</div>
          <button onClick={onClose} style={{background:"none",border:"1px solid #1e1e1e",borderRadius:"7px",padding:"0.4rem",cursor:"pointer",color:"#555"}}><Icon name="close" size={17}/></button>
        </div>
        <div style={{padding:"1.5rem 1.75rem",display:"flex",flexDirection:"column",gap:"1.1rem"}}>
          <div style={{display:"flex",background:"#0f0f0f",borderRadius:"10px",padding:"4px",border:"1px solid #1a1a1a"}}>
            {[["text","📝 Text"],["file","📎 Datei"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"0.5rem",borderRadius:"7px",border:"none",background:tab===id?"#fff":"transparent",color:tab===id?"#000":"#666",fontSize:"0.83rem",fontWeight:tab===id?"bold":"normal",cursor:"pointer",fontFamily:"inherit"}}>{label}</button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 140px",gap:"1rem"}}>
            <div><label style={lbl}>TITEL *</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="z.B. VLANs Zusammenfassung" style={inp}/></div>
            <div><label style={lbl}>NAME</label><input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Fabio" style={inp}/></div>
          </div>
          <div><label style={lbl}>KATEGORIE</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {CATEGORIES.map(cat=>{const a=category===cat;const c=CAT_COLORS[cat];return(<button key={cat} onClick={()=>setCategory(cat)} style={{padding:"0.35rem 0.8rem",borderRadius:"20px",fontSize:"0.78rem",border:a?`1px solid ${c.badge}`:"1px solid #1e1e1e",background:a?`${c.badge}18`:"transparent",color:a?c.badge:"#555",cursor:"pointer",fontFamily:"inherit"}}>{cat}</button>);})}
            </div>
          </div>
          {tab==="text"&&<div><label style={lbl}>INHALT *</label><textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Zusammenfassung..." rows={10} style={{...inp,fontFamily:"'Courier New',monospace",lineHeight:"1.7",resize:"vertical",color:"#bbb"}}/></div>}
          {tab==="file"&&(
            <div><label style={lbl}>DATEI *</label>
              <div onClick={()=>fileRef.current.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)setFile(f);}}
                style={{border:"2px dashed #2a2a2a",borderRadius:"12px",padding:"2.5rem",textAlign:"center",cursor:"pointer",background:"#0a0a0a"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#444"} onMouseLeave={e=>e.currentTarget.style.borderColor="#2a2a2a"}>
                {file?<div><div style={{fontSize:"2.5rem"}}>{getFileInfo(file.name).icon}</div><div style={{color:"#fff",fontSize:"0.9rem",fontWeight:"bold",marginTop:"0.5rem"}}>{file.name}</div></div>
                :<div><div style={{fontSize:"2.5rem"}}>📁</div><div style={{color:"#666",fontSize:"0.88rem",marginTop:"0.5rem"}}>Datei hierher ziehen oder klicken</div></div>}
              </div>
              <input ref={fileRef} type="file" style={{display:"none"}} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg" onChange={e=>setFile(e.target.files[0])}/>
            </div>
          )}
          <div><label style={lbl}>TAGS</label><input value={tags} onChange={e=>setTags(e.target.value)} placeholder="OSI, Netzwerk, Prüfung..." style={inp}/></div>
          {error&&<div style={{background:"#1a0a0a",border:"1px solid #7b2d2d",borderRadius:"8px",padding:"0.75rem 1rem",color:"#e57373",fontSize:"0.82rem"}}>{error}</div>}
          <button onClick={handleSave} disabled={uploading||done} style={{padding:"0.9rem",borderRadius:"10px",background:done?"#0a1a0a":(!title.trim()||uploading?"#141414":"#fff"),border:done?"1px solid #22c55e":"none",color:done?"#22c55e":(!title.trim()||uploading?"#333":"#000"),fontSize:"0.85rem",fontWeight:"bold",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"}}>
            {done?<><Icon name="check" size={15}/>GESPEICHERT!</>:uploading?"WIRD GESPEICHERT...":<><Icon name="upload" size={15}/>SPEICHERN</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ item, onClose, onDelete, onStar, onKI, onPruefung, onYouTube }) {
  const [downloading,setDownloading]=useState(false);
  const col=CAT_COLORS[item.category]||CAT_COLORS["Sonstiges"];
  const fi=item.file_name?getFileInfo(item.file_name):null;
  const handleDownloadFile=async()=>{setDownloading(true);try{const{data,error}=await supabase.storage.from(BUCKET).download(item.file_path);if(error)throw error;const a=document.createElement("a");a.href=URL.createObjectURL(data);a.download=item.file_name;a.click();}catch(e){alert("Fehler: "+e.message);}setDownloading(false);};
  const handleViewFile=async()=>{const{data}=await supabase.storage.from(BUCKET).getPublicUrl(item.file_path);window.open(data.publicUrl,"_blank");};
  const videos=item.youtube_links||[];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",backdropFilter:"blur(12px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"#080808",border:`1px solid ${col.badge}30`,borderRadius:"16px",width:"100%",maxWidth:"820px",maxHeight:"93vh",overflow:"auto"}}>
        <div style={{padding:"1.25rem 1.75rem",borderBottom:`1px solid ${col.badge}18`,background:`linear-gradient(135deg,${col.bg}bb,#080808)`,position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"1rem"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.4rem",flexWrap:"wrap"}}>
                <span style={{fontSize:"0.58rem",letterSpacing:"0.2em",color:col.badge,background:`${col.badge}12`,padding:"0.18rem 0.5rem",borderRadius:"4px",border:`1px solid ${col.badge}25`,fontWeight:"bold"}}>{item.category.toUpperCase()}</span>
                {fi&&<span style={{fontSize:"0.58rem",color:fi.color,background:`${fi.color}12`,padding:"0.18rem 0.5rem",borderRadius:"4px",border:`1px solid ${fi.color}25`,fontWeight:"bold"}}>{fi.icon} {fi.label}</span>}
                {videos.length>0&&<span style={{fontSize:"0.58rem",color:"#ef4444",background:"#ef444412",padding:"0.18rem 0.5rem",borderRadius:"4px",border:"1px solid #ef444425",fontWeight:"bold"}}>🎬 {videos.length} Video{videos.length>1?"s":""}</span>}
              </div>
              <div style={{fontSize:"1.2rem",fontWeight:"bold",color:"#eee",fontFamily:"'Courier New',monospace",lineHeight:1.3}}>{item.title}</div>
              <div style={{fontSize:"0.7rem",color:"#444",marginTop:"0.3rem"}}>von {item.author} · {new Date(item.created_at).toLocaleDateString("de-DE",{day:"2-digit",month:"long",year:"numeric"})}</div>
            </div>
            <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap",justifyContent:"flex-end"}}>
              <button onClick={onKI} style={{background:`${col.badge}15`,border:`1px solid ${col.badge}40`,borderRadius:"7px",padding:"0.4rem 0.7rem",cursor:"pointer",color:col.badge,fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem",fontFamily:"inherit",fontWeight:"bold"}}><Icon name="bot" size={13}/>KI Hilfe</button>
              {item.type==="text"&&<button onClick={onPruefung} style={{background:"#2a200015",border:"1px solid #eab30840",borderRadius:"7px",padding:"0.4rem 0.7rem",cursor:"pointer",color:"#eab308",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem",fontFamily:"inherit",fontWeight:"bold"}}><Icon name="pruefung" size={13}/>Prüfung</button>}
              <button onClick={onYouTube} style={{background:"#ef444415",border:"1px solid #ef444440",borderRadius:"7px",padding:"0.4rem 0.7rem",cursor:"pointer",color:"#ef4444",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem",fontFamily:"inherit",fontWeight:"bold"}}><Icon name="youtube" size={13}/>Videos</button>
              {item.type==="text"&&<>
                <button onClick={()=>generatePDF(item)} style={{background:"none",border:"1px solid #3a1a1a",borderRadius:"7px",padding:"0.4rem 0.7rem",cursor:"pointer",color:"#ef4444",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem",fontFamily:"inherit"}}><Icon name="pdf" size={13}/>PDF</button>
                <button onClick={()=>generateDOCX(item)} style={{background:"none",border:"1px solid #1a2a3a",borderRadius:"7px",padding:"0.4rem 0.7rem",cursor:"pointer",color:"#3b82f6",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem",fontFamily:"inherit"}}><Icon name="word" size={13}/>Word</button>
              </>}
              {item.type==="file"&&<>
                <button onClick={handleViewFile} style={{background:"none",border:"1px solid #1a3a1a",borderRadius:"7px",padding:"0.4rem 0.7rem",cursor:"pointer",color:"#22c55e",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem",fontFamily:"inherit"}}><Icon name="eye" size={13}/>Ansehen</button>
                <button onClick={handleDownloadFile} disabled={downloading} style={{background:"none",border:"1px solid #1a2a3a",borderRadius:"7px",padding:"0.4rem 0.7rem",cursor:"pointer",color:"#3b82f6",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem",fontFamily:"inherit"}}><Icon name="download" size={13}/>{downloading?"...":"Download"}</button>
              </>}
              <button onClick={()=>onStar(item.id,!item.starred)} style={{background:"none",border:"1px solid #1a1a1a",borderRadius:"7px",padding:"0.4rem",cursor:"pointer",color:item.starred?"#f5c518":"#444"}}><Icon name="star" size={14}/></button>
              <button onClick={()=>{onDelete(item.id,item.file_path);onClose();}} style={{background:"none",border:"1px solid #1a1a1a",borderRadius:"7px",padding:"0.4rem",cursor:"pointer",color:"#444"}} onMouseEnter={e=>e.currentTarget.style.color="#ef4444"} onMouseLeave={e=>e.currentTarget.style.color="#444"}><Icon name="trash" size={14}/></button>
              <button onClick={onClose} style={{background:"none",border:"1px solid #1a1a1a",borderRadius:"7px",padding:"0.4rem",cursor:"pointer",color:"#444"}} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#444"}><Icon name="close" size={14}/></button>
            </div>
          </div>
          {item.tags?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem",marginTop:"0.65rem"}}>{item.tags.map(t=><span key={t} style={{fontSize:"0.65rem",color:"#666",background:"#0f0f0f",padding:"0.12rem 0.4rem",borderRadius:"4px",border:"1px solid #1a1a1a"}}>#{t}</span>)}</div>}
        </div>
        <div style={{padding:"1.75rem"}}>
          {item.type==="text"&&<div style={{fontFamily:"'Courier New',monospace",fontSize:"0.87rem",color:"#b0b0b0",lineHeight:"1.9",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{item.content}</div>}
          {item.type==="file"&&<div style={{textAlign:"center",padding:"2rem"}}>
            <div style={{fontSize:"4rem",marginBottom:"1rem"}}>{fi?.icon||"📎"}</div>
            <div style={{fontSize:"1rem",color:"#aaa",fontWeight:"bold",marginBottom:"0.5rem"}}>{item.file_name}</div>
            <div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap",marginTop:"1.5rem"}}>
              <button onClick={handleViewFile} style={{display:"flex",alignItems:"center",gap:"0.5rem",background:"#0a1a0a",border:"1px solid #22c55e",borderRadius:"10px",padding:"0.75rem 1.5rem",color:"#22c55e",fontSize:"0.85rem",cursor:"pointer",fontFamily:"inherit"}}><Icon name="eye" size={16}/>Im Browser öffnen</button>
              <button onClick={handleDownloadFile} disabled={downloading} style={{display:"flex",alignItems:"center",gap:"0.5rem",background:"#0a1228",border:"1px solid #3b82f6",borderRadius:"10px",padding:"0.75rem 1.5rem",color:"#3b82f6",fontSize:"0.85rem",cursor:"pointer",fontFamily:"inherit"}}><Icon name="download" size={16}/>{downloading?"Lädt...":"Herunterladen"}</button>
            </div>
          </div>}
          {/* YouTube Videos */}
          {videos.length>0&&<div style={{marginTop:"1.5rem"}}>
            <div style={{fontSize:"0.7rem",color:"#555",letterSpacing:"0.15em",marginBottom:"0.75rem"}}>🎬 YOUTUBE VIDEOS</div>
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
              {videos.map((v,i)=>(
                <div key={i} style={{borderRadius:"10px",overflow:"hidden",border:"1px solid #1e1e1e"}}>
                  <div style={{position:"relative",paddingBottom:"56.25%",background:"#000"}}>
                    <iframe src={`https://www.youtube.com/embed/${v.id}`} style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
                  </div>
                  <div style={{padding:"0.5rem 0.75rem",background:"#0f0f0f",fontSize:"0.8rem",color:"#888"}}>{v.title}</div>
                </div>
              ))}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar Section ───────────────────────────────────────────────────────────
function SideSection({ title, children, defaultOpen=true }) {
  const [open,setOpen]=useState(defaultOpen);
  return(
    <div style={{marginBottom:"4px"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.35rem 0.5rem",background:"none",border:"none",cursor:"pointer",color:"#3a3a3a",fontSize:"0.58rem",letterSpacing:"0.18em",fontFamily:"inherit"}} onMouseEnter={e=>e.currentTarget.style.color="#666"} onMouseLeave={e=>e.currentTarget.style.color="#3a3a3a"}>
        <span>{title}</span>
        <div style={{transform:open?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.2s"}}><Icon name="chevron" size={12}/></div>
      </button>
      <div style={{overflow:"hidden",maxHeight:open?"1000px":"0px",transition:"max-height 0.3s ease",display:"flex",flexDirection:"column",gap:"2px"}}>{children}</div>
    </div>
  );
}

// ── Hauptapp ──────────────────────────────────────────────────────────────────
export default function App() {
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showUpload,setShowUpload]=useState(false);
  const [selected,setSelected]=useState(null);
  const [kiItem,setKiItem]=useState(null);
  const [pruefungItem,setPruefungItem]=useState(null);
  const [youtubeItem,setYoutubeItem]=useState(null);
  const [search,setSearch]=useState("");
  const [filterCat,setFilterCat]=useState("Alle");
  const [filterType,setFilterType]=useState("Alle");
  const [filterStarred,setFilterStarred]=useState(false);
  const [toast,setToast]=useState(null);
  const [sideOpen,setSideOpen]=useState(true);

  if(!supabase) return <SetupBanner/>;

  const showToast=(msg,type="ok")=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);};
  const loadItems=async()=>{
    setLoading(true);
    const{data,error}=await supabase.from(TABLE).select("*").order("created_at",{ascending:false});
    if(!error)setItems(data||[]);
    else showToast("Fehler: "+error.message,"err");
    setLoading(false);
  };
  useEffect(()=>{loadItems();},[]);
  const handleDelete=async(id,fp)=>{if(fp)await supabase.storage.from(BUCKET).remove([fp]);await supabase.from(TABLE).delete().eq("id",id);setItems(p=>p.filter(i=>i.id!==id));showToast("Gelöscht.","err");};
  const handleStar=async(id,starred)=>{await supabase.from(TABLE).update({starred}).eq("id",id);setItems(p=>p.map(i=>i.id===id?{...i,starred}:i));};
  const handleYouTubeSave=(updatedItem)=>{setItems(p=>p.map(i=>i.id===updatedItem.id?updatedItem:i));if(selected?.id===updatedItem.id)setSelected(updatedItem);};

  const filtered=items.filter(i=>{
    const q=search.toLowerCase();
    return(!q||[i.title,i.content||"",...(i.tags||[]),i.author].some(x=>x?.toLowerCase().includes(q)))
      &&(filterCat==="Alle"||i.category===filterCat)
      &&(filterType==="Alle"||i.type===filterType)
      &&(!filterStarred||i.starred);
  });

  const counts=CATEGORIES.reduce((a,c)=>{a[c]=items.filter(i=>i.category===c).length;return a;},{});
  const textCount=items.filter(i=>i.type==="text").length;
  const fileCount=items.filter(i=>i.type==="file").length;

  const SideBtn=({label,active,onClick,badge,color})=>(
    <button onClick={onClick} className="sbtn" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0.65rem",borderRadius:"6px",border:"none",background:active?(color?`${color}15`:"#1a1a1a"):"transparent",color:active?(color||"#fff"):"#4a4a4a",cursor:"pointer",fontSize:"0.8rem",fontFamily:"inherit",textAlign:"left",borderLeft:active&&color?`2px solid ${color}`:"2px solid transparent"}}>
      <span>{label}</span>
      {badge>0&&<span style={{fontSize:"0.62rem",background:"#0f0f0f",padding:"0.08rem 0.35rem",borderRadius:"4px",color:"#444"}}>{badge}</span>}
    </button>
  );

  return(
    <div style={{minHeight:"100vh",background:"#070707",color:"#fff",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0c0c0c}::-webkit-scrollbar-thumb{background:#252525;border-radius:3px}
        .card{transition:transform .18s,box-shadow .18s;cursor:pointer}.card:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.5)}
        .sbtn{transition:all .15s}.sbtn:hover{color:#ccc!important;background:#111!important}
        .sidebar{transition:width 0.3s ease,opacity 0.3s ease}
        body{margin:0;padding:0;background:#070707}
      `}</style>

      {toast&&<div style={{position:"fixed",top:"1.25rem",right:"1.25rem",zIndex:200,background:toast.type==="err"?"#120808":"#081408",border:`1px solid ${toast.type==="err"?"#7b2d2d":"#2d7b4a"}`,borderRadius:"10px",padding:"0.65rem 1.1rem",color:toast.type==="err"?"#e57373":"#66bb6a",fontSize:"0.8rem",animation:"slideDown .25s ease",display:"flex",alignItems:"center",gap:"0.5rem"}}><Icon name={toast.type==="err"?"trash":"check"} size={12}/>{toast.msg}</div>}

      {/* Header */}
      <div style={{borderBottom:"1px solid #111",background:"#090909",padding:"1rem 1.75rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.9rem"}}>
          <button onClick={()=>setSideOpen(o=>!o)} title={sideOpen?"Sidebar einklappen":"Sidebar ausklappen"} style={{background:"none",border:"1px solid #1e1e1e",borderRadius:"8px",padding:"0.45rem",cursor:"pointer",color:"#555",flexShrink:0,display:"flex",alignItems:"center",transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#555"}>
            <Icon name={sideOpen?"sideOpen":"sideClose"} size={17}/>
          </button>
          <div style={{width:"36px",height:"36px",background:"#fff",borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="book" size={19}/></div>
          <div>
            <div style={{fontFamily:"'Courier New',monospace",fontSize:"1.05rem",fontWeight:"bold"}}>FISI Lernportal</div>
            <div style={{fontSize:"0.6rem",color:"#444",letterSpacing:"0.1em"}}>IHK HEILBRONN · {items.length} EINTRÄGE · {textCount} TEXTE · {fileCount} DATEIEN</div>
          </div>
        </div>
        <div style={{display:"flex",gap:"0.5rem"}}>
          <button onClick={loadItems} style={{background:"none",border:"1px solid #1e1e1e",borderRadius:"8px",padding:"0.5rem 0.8rem",color:"#555",cursor:"pointer",fontSize:"0.78rem",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"0.4rem"}}><Icon name="refresh" size={13}/>Sync</button>
          <button onClick={()=>setShowUpload(true)} style={{display:"flex",alignItems:"center",gap:"0.45rem",background:"#fff",color:"#000",border:"none",borderRadius:"8px",padding:"0.55rem 1.1rem",fontSize:"0.82rem",fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"}}><Icon name="plus" size={14}/>HINZUFÜGEN</button>
        </div>
      </div>

      <div style={{display:"flex",minHeight:"calc(100vh - 64px)"}}>
        {/* Sidebar */}
        <div className="sidebar" style={{width:sideOpen?"210px":"0px",opacity:sideOpen?1:0,overflow:"hidden",flexShrink:0,borderRight:sideOpen?"1px solid #0f0f0f":"none",background:"#090909"}}>
          <div style={{width:"210px",padding:"1rem 0.65rem",display:"flex",flexDirection:"column",gap:"2px",overflowY:"auto",height:"100%"}}>
            <SideSection title="TYP">
              <SideBtn label="Alle" active={filterType==="Alle"} onClick={()=>setFilterType("Alle")} badge={items.length}/>
              <SideBtn label="📝 Texte" active={filterType==="text"} onClick={()=>setFilterType("text")} badge={textCount}/>
              <SideBtn label="📎 Dateien" active={filterType==="file"} onClick={()=>setFilterType("file")} badge={fileCount}/>
            </SideSection>
            <div style={{height:"1px",background:"#0f0f0f",margin:"0.35rem 0"}}/>
            <SideSection title="KATEGORIEN">
              <SideBtn label="Alle" active={filterCat==="Alle"} onClick={()=>setFilterCat("Alle")} badge={items.length}/>
              {CATEGORIES.map(cat=>{const col=CAT_COLORS[cat];return <SideBtn key={cat} label={cat} active={filterCat===cat} onClick={()=>setFilterCat(cat)} badge={counts[cat]||0} color={col.badge}/>;} )}
            </SideSection>
            <div style={{height:"1px",background:"#0f0f0f",margin:"0.35rem 0"}}/>
            <SideSection title="WEITERE">
              <button onClick={()=>setFilterStarred(!filterStarred)} className="sbtn" style={{display:"flex",alignItems:"center",gap:"0.45rem",padding:"0.4rem 0.65rem",borderRadius:"6px",border:"none",background:filterStarred?"#1a150a":"transparent",color:filterStarred?"#f5c518":"#4a4a4a",cursor:"pointer",fontSize:"0.8rem",fontFamily:"inherit",borderLeft:filterStarred?"2px solid #f5c518":"2px solid transparent"}}>
                <Icon name="star" size={12}/><span>Favoriten</span>
                {items.filter(i=>i.starred).length>0&&<span style={{fontSize:"0.62rem",background:"#0f0f0f",padding:"0.08rem 0.35rem",borderRadius:"4px",color:"#444",marginLeft:"auto"}}>{items.filter(i=>i.starred).length}</span>}
              </button>
            </SideSection>
            <div style={{marginTop:"auto",padding:"0.75rem 0.5rem",borderTop:"1px solid #0f0f0f"}}>
              <div style={{fontSize:"0.58rem",color:"#2a2a2a",letterSpacing:"0.15em",marginBottom:"0.5rem"}}>STATISTIK</div>
              {[["Gesamt",items.length],["Texte",textCount],["Dateien",fileCount],["Favoriten",items.filter(i=>i.starred).length]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:"0.28rem"}}>
                  <span style={{fontSize:"0.7rem",color:"#3a3a3a"}}>{l}</span>
                  <span style={{fontSize:"0.7rem",color:"#666",fontFamily:"'Courier New',monospace"}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{flex:1,padding:"1.25rem 1.75rem",overflow:"auto",minWidth:0}}>
          <div style={{position:"relative",marginBottom:"1.1rem"}}>
            <div style={{position:"absolute",left:"0.85rem",top:"50%",transform:"translateY(-50%)",color:"#333",pointerEvents:"none"}}><Icon name="search" size={14}/></div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Suchen nach Titel, Inhalt, Tags..." style={{width:"100%",background:"#0d0d0d",border:"1px solid #181818",borderRadius:"9px",padding:"0.7rem 1rem 0.7rem 2.4rem",color:"#bbb",fontSize:"0.86rem",outline:"none",fontFamily:"inherit"}}/>
            {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:"0.7rem",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#444",cursor:"pointer"}}><Icon name="close" size={12}/></button>}
          </div>

          {(filterCat!=="Alle"||filterType!=="Alle"||filterStarred||search)&&(
            <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap",marginBottom:"0.9rem",alignItems:"center"}}>
              <span style={{fontSize:"0.65rem",color:"#555"}}>Filter:</span>
              {filterCat!=="Alle"&&<span style={{fontSize:"0.7rem",background:`${CAT_COLORS[filterCat]?.badge}15`,color:CAT_COLORS[filterCat]?.badge,padding:"0.2rem 0.6rem",borderRadius:"20px",border:`1px solid ${CAT_COLORS[filterCat]?.badge}30`,cursor:"pointer"}} onClick={()=>setFilterCat("Alle")}>{filterCat} ×</span>}
              {filterType!=="Alle"&&<span style={{fontSize:"0.7rem",background:"#1a1a1a",color:"#888",padding:"0.2rem 0.6rem",borderRadius:"20px",border:"1px solid #2a2a2a",cursor:"pointer"}} onClick={()=>setFilterType("Alle")}>{filterType==="text"?"📝 Texte":"📎 Dateien"} ×</span>}
              {filterStarred&&<span style={{fontSize:"0.7rem",background:"#1a150a",color:"#f5c518",padding:"0.2rem 0.6rem",borderRadius:"20px",border:"1px solid #f5c51830",cursor:"pointer"}} onClick={()=>setFilterStarred(false)}>⭐ Favoriten ×</span>}
              {search&&<span style={{fontSize:"0.7rem",background:"#1a1a1a",color:"#888",padding:"0.2rem 0.6rem",borderRadius:"20px",border:"1px solid #2a2a2a",cursor:"pointer"}} onClick={()=>setSearch("")}>"{search}" ×</span>}
              <button onClick={()=>{setFilterCat("Alle");setFilterType("Alle");setFilterStarred(false);setSearch("");}} style={{fontSize:"0.65rem",color:"#555",background:"none",border:"none",cursor:"pointer",marginLeft:"0.25rem"}}>Alle zurücksetzen</button>
            </div>
          )}

          {loading&&<div style={{textAlign:"center",padding:"5rem",color:"#2a2a2a",fontSize:"0.75rem",letterSpacing:"0.2em",animation:"pulse 1.5s infinite"}}>WIRD GELADEN...</div>}

          {!loading&&filtered.length===0&&(
            <div style={{textAlign:"center",padding:"5rem 2rem"}}>
              <div style={{fontSize:"3rem",marginBottom:"1rem"}}>📚</div>
              <div style={{fontSize:"0.95rem",color:"#3a3a3a"}}>{search||filterCat!=="Alle"||filterType!=="Alle"||filterStarred?"Keine Treffer":"Noch keine Einträge"}</div>
              {!search&&filterCat==="Alle"&&filterType==="Alle"&&!filterStarred&&(
                <button onClick={()=>setShowUpload(true)} style={{marginTop:"1.25rem",padding:"0.65rem 1.4rem",background:"#fff",color:"#000",border:"none",borderRadius:"9px",cursor:"pointer",fontSize:"0.82rem",fontWeight:"bold",fontFamily:"inherit"}}>Ersten Eintrag hinzufügen</button>
              )}
            </div>
          )}

          {!loading&&filtered.length>0&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))",gap:"0.9rem"}}>
              {filtered.map(item=>{
                const col=CAT_COLORS[item.category]||CAT_COLORS["Sonstiges"];
                const fi=item.file_name?getFileInfo(item.file_name):null;
                const preview=item.type==="text"?(item.content||"").slice(0,120)+"…":item.file_name;
                const videos=item.youtube_links||[];
                return(
                  <div key={item.id} className="card" style={{background:`linear-gradient(150deg,${col.bg}cc,#0a0a0a)`,border:`1px solid ${col.badge}18`,borderRadius:"12px",padding:"1.1rem",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,${col.badge},transparent 70%)`}}/>
                    {item.starred&&<div style={{position:"absolute",top:"0.7rem",right:"0.7rem",color:"#f5c518"}}><Icon name="star" size={12}/></div>}
                    <div style={{display:"flex",gap:"0.4rem",marginBottom:"0.5rem",flexWrap:"wrap"}}>
                      <span style={{fontSize:"0.56rem",letterSpacing:"0.18em",color:col.badge,background:`${col.badge}10`,padding:"0.16rem 0.45rem",borderRadius:"4px",border:`1px solid ${col.badge}22`,fontWeight:"bold"}}>{item.category.toUpperCase()}</span>
                      {fi&&<span style={{fontSize:"0.56rem",color:fi.color,background:`${fi.color}10`,padding:"0.16rem 0.45rem",borderRadius:"4px",border:`1px solid ${fi.color}22`,fontWeight:"bold"}}>{fi.icon} {fi.label}</span>}
                      {videos.length>0&&<span style={{fontSize:"0.56rem",color:"#ef4444",background:"#ef444410",padding:"0.16rem 0.45rem",borderRadius:"4px",border:"1px solid #ef444422",fontWeight:"bold"}}>🎬 {videos.length}</span>}
                    </div>
                    <div onClick={()=>setSelected(item)} style={{fontFamily:"'Courier New',monospace",fontSize:"0.9rem",fontWeight:"bold",color:"#e0e0e0",marginBottom:"0.4rem",lineHeight:1.35}}>{item.title}</div>
                    <div onClick={()=>setSelected(item)} style={{fontSize:"0.74rem",color:"#4a4a4a",lineHeight:"1.6",fontFamily:"'Courier New',monospace"}}>{preview}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.85rem",paddingTop:"0.65rem",borderTop:`1px solid ${col.badge}10`}}>
                      <div style={{display:"flex",gap:"0.25rem",flexWrap:"wrap"}}>
                        <button onClick={e=>{e.stopPropagation();setKiItem(item);}} style={{background:`${col.badge}12`,border:`1px solid ${col.badge}30`,borderRadius:"5px",padding:"0.2rem 0.4rem",cursor:"pointer",color:col.badge,fontSize:"0.62rem",display:"flex",alignItems:"center",gap:"0.2rem",fontWeight:"bold"}}>🤖</button>
                        {item.type==="text"&&<button onClick={e=>{e.stopPropagation();setPruefungItem(item);}} style={{background:"#eab30812",border:"1px solid #eab30830",borderRadius:"5px",padding:"0.2rem 0.4rem",cursor:"pointer",color:"#eab308",fontSize:"0.62rem"}}>📝</button>}
                        <button onClick={e=>{e.stopPropagation();setYoutubeItem(item);}} style={{background:"#ef444412",border:"1px solid #ef444430",borderRadius:"5px",padding:"0.2rem 0.4rem",cursor:"pointer",color:"#ef4444",fontSize:"0.62rem"}}>🎬</button>
                        {item.type==="text"&&<>
                          <button onClick={e=>{e.stopPropagation();generatePDF(item);}} style={{background:"none",border:"1px solid #3a1a1a",borderRadius:"5px",padding:"0.2rem 0.4rem",cursor:"pointer",color:"#ef4444",fontSize:"0.62rem"}}><Icon name="pdf" size={10}/></button>
                          <button onClick={e=>{e.stopPropagation();generateDOCX(item);}} style={{background:"none",border:"1px solid #1a2a3a",borderRadius:"5px",padding:"0.2rem 0.4rem",cursor:"pointer",color:"#3b82f6",fontSize:"0.62rem"}}><Icon name="word" size={10}/></button>
                        </>}
                      </div>
                      <span onClick={()=>setSelected(item)} style={{fontSize:"0.6rem",color:"#2a2a2a"}}>{item.author}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showUpload&&<UploadModal onClose={()=>setShowUpload(false)} onRefresh={loadItems}/>}
      {selected&&<DetailModal item={selected} onClose={()=>setSelected(null)} onDelete={handleDelete} onStar={(id,s)=>{handleStar(id,s);setSelected(p=>p?{...p,starred:s}:null);}} onKI={()=>{setKiItem(selected);setSelected(null);}} onPruefung={()=>{setPruefungItem(selected);setSelected(null);}} onYouTube={()=>{setYoutubeItem(selected);setSelected(null);}}/>}
      {kiItem&&<KIChatModal item={kiItem} onClose={()=>setKiItem(null)}/>}
      {pruefungItem&&<PruefungModal item={pruefungItem} onClose={()=>setPruefungItem(null)}/>}
      {youtubeItem&&<YouTubeModal item={youtubeItem} onClose={()=>setYoutubeItem(null)} onSave={handleYouTubeSave}/>}
    </div>
  );
}
