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
function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [/youtu\.be\/([^?&]+)/,/youtube\.com\/watch\?v=([^&]+)/,/youtube\.com\/embed\/([^?&]+)/];
  for (const p of patterns) { const m=url.match(p); if(m) return m[1]; }
  return null;
}

// ── KI API Call ───────────────────────────────────────────────────────────────
async function callKI(messages, system) {
  const res = await fetch("/api/chat", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ system, messages })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data.error));
  return data.content?.[0]?.text || "";
}

// ── PDF Generators ────────────────────────────────────────────────────────────
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

function exportPruefungPDF(title, questions, answers, submitted, showAnswers) {
  const score = submitted ? questions.filter((q,i) => q.type==="mc" ? answers[i]===q.correct : answers[i]?.trim().length>0).length : 0;
  const mcQ = questions.filter(q=>q.type==="mc");
  const mcScore = submitted ? mcQ.filter((q,i)=>{ const idx=questions.indexOf(q); return answers[idx]===q.correct; }).length : 0;
  const date=new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"long",year:"numeric"});
  const percent=mcQ.length>0?Math.round((mcScore/mcQ.length)*100):0;
  const qHtml=questions.map((q,i)=>{
    const isMC=q.type==="mc";
    const isCorrect=submitted&&isMC&&answers[i]===q.correct;
    const isWrong=submitted&&isMC&&answers[i]!==undefined&&!isCorrect;
    return `<div style="margin-bottom:18px;padding:12px 16px;border:1px solid ${submitted?(isCorrect?"#22c55e":isWrong?"#ef4444":"#ccc"):"#ccc"};border-radius:8px;background:${submitted?(isCorrect?"#f0fff4":isWrong?"#fff5f5":"#fff"):"#fff"}">
      <div style="font-weight:bold;margin-bottom:8px">${submitted?`${isCorrect?"✅":"❌"} `:""}${i+1}. [${isMC?"Multiple Choice":"Freitext"}] ${q.question}</div>
      ${isMA?`<div style="padding:8px;border:1px solid #ddd;border-radius:4px;min-height:40px;color:#666;font-size:10pt">${answers[i]||"(nicht beantwortet)"}</div>`:""}
      ${isMA?"":`<div>${q.options.map((o,j)=>`<div style="padding:4px 8px;margin:2px 0;border-radius:4px;background:${showAnswers&&j===q.correct?"#d1fae5":submitted&&j===answers[i]&&j!==q.correct?"#fee2e2":"#f9f9f9"}">${String.fromCharCode(65+j)}) ${o}${showAnswers&&j===q.correct?" ✓":""}</div>`).join("")}</div>`}
      ${showAnswers&&q.explanation?`<div style="margin-top:6px;padding:6px 10px;background:#eff6ff;border-radius:4px;font-size:9pt;color:#1e40af">💡 ${q.explanation}</div>`:""}
    </div>`.replace("isMA?",`q.type==="text"?`).replace("isMA?",`q.type==="text"?`);
  }).join("");
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Prüfung: ${title}</title>
<style>@page{margin:2cm}*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:11pt;color:#1a1a1a;background:#fff}
.header{background:#1F4E79;color:#fff;padding:16px 20px;border-radius:8px;margin-bottom:16px}
.score{text-align:center;padding:12px;border-radius:8px;margin-bottom:16px;background:${percent>=80?"#d1fae5":percent>=50?"#fef9c3":"#fee2e2"};color:${percent>=80?"#166534":percent>=50?"#854d0e":"#991b1b"};font-size:1.2rem;font-weight:bold}
</style></head><body>
<div class="header"><div style="font-size:8pt;letter-spacing:2px;color:#90cdf4;margin-bottom:4px">FISI PRÜFUNG · IHK HEILBRONN</div>
<div style="font-size:16pt;font-weight:bold">${title}</div>
<div style="font-size:9pt;color:#bfdbfe">${date} · ${questions.length} Fragen</div></div>
${submitted?`<div class="score">MC-Ergebnis: ${mcScore}/${mcQ.length} · ${percent}% · ${percent>=80?"Bestanden ✓":percent>=50?"Knapp ⚠️":"Nicht bestanden ✗"}</div>`:""}
${qHtml}
<div style="margin-top:20px;padding-top:10px;border-top:1px solid #ddd;font-size:8pt;color:#888">FISI Lernportal · IHK Heilbronn · Prüfung Mai 2026</div>
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
    pruefung:  <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    zap:       <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  };
  return icons[name]||null;
};

// ── KI Chat Modal ─────────────────────────────────────────────────────────────
function KIChatModal({ item, onClose }) {
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [mode,setMode]=useState(null);
  const bottomRef=useRef();
  const col=CAT_COLORS[item.category]||CAT_COLORS["Sonstiges"];
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);
  const systemPrompt=`Du bist ein FISI-Pruefungscoach fuer IHK Heilbronn Mai 2026. Thema: "${item.title}" (${item.category}). Inhalt: ${item.content||"(Datei)"}. Erklaere auf Deutsch, klar, mit Praxisbeispielen. Merksaetze willkommen. Sei motivierend.`;
  const sendMessage=async(userMsg)=>{
    if(!userMsg.trim()||loading) return;
    const newMessages=[...messages,{role:"user",content:userMsg}];
    setMessages(newMessages); setInput(""); setLoading(true);
    try { const reply=await callKI(newMessages,systemPrompt); setMessages(prev=>[...prev,{role:"assistant",content:reply}]); }
    catch(e) { setMessages(prev=>[...prev,{role:"assistant",content:"❌ Fehler: "+e.message}]); }
    setLoading(false);
  };
  const startMode=(m)=>{
    setMode(m); const prompts={erklaeren:`Erklaere mir "${item.title}" ausfuehrlich mit Beispielen und Merksatz.`,abfragen:`Stelle eine IHK-Pruefungsfrage zu "${item.title}". Warte auf Antwort.`,tipps:`Top-5 Pruefungstipps und haeufige Fallen bei "${item.title}".`};
    const first=[{role:"user",content:prompts[m]}]; setMessages(first); setLoading(true);
    callKI(first,systemPrompt).then(reply=>{ setMessages([...first,{role:"assistant",content:reply}]); setLoading(false); }).catch(e=>{ setMessages([...first,{role:"assistant",content:"❌ "+e.message}]); setLoading(false); });
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",backdropFilter:"blur(12px)",zIndex:110,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"#080808",border:`1px solid ${col.badge}40`,borderRadius:"16px",width:"100%",maxWidth:"720px",height:"85vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"1rem 1.5rem",borderBottom:`1px solid ${col.badge}20`,background:`linear-gradient(135deg,${col.bg}cc,#080808)`,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
              <div style={{width:"32px",height:"32px",background:`${col.badge}20`,border:`1px solid ${col.badge}40`,borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",color:col.badge}}><Icon name="bot" size={16}/></div>
              <div><div style={{fontSize:"0.7rem",color:col.badge,fontWeight:"bold",letterSpacing:"0.1em"}}>KI LERNASSISTENT</div><div style={{fontSize:"0.85rem",color:"#ccc",fontFamily:"'Courier New',monospace",fontWeight:"bold"}}>{item.title}</div></div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"1px solid #1e1e1e",borderRadius:"7px",padding:"0.4rem",cursor:"pointer",color:"#555"}} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#555"}><Icon name="close" size={16}/></button>
          </div>
          {!mode&&<div style={{marginTop:"1rem"}}><div style={{fontSize:"0.7rem",color:"#555",marginBottom:"0.6rem"}}>Was möchtest du tun?</div><div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
            {[{id:"erklaeren",icon:"lightbulb",label:"Thema erklären",color:"#eab308",desc:"Erklärung"},{id:"abfragen",icon:"quiz",label:"Abfragen",color:"#a855f7",desc:"Prüfungsfragen"},{id:"tipps",icon:"star",label:"Tipps",color:"#22c55e",desc:"Häufige Fallen"}].map(btn=>(
              <button key={btn.id} onClick={()=>startMode(btn.id)} style={{flex:"1",minWidth:"120px",padding:"0.65rem 0.75rem",background:`${btn.color}10`,border:`1px solid ${btn.color}30`,borderRadius:"10px",cursor:"pointer",color:btn.color,fontFamily:"inherit",textAlign:"left"}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.35rem",fontWeight:"bold",fontSize:"0.8rem",marginBottom:"0.15rem"}}><Icon name={btn.icon} size={13}/>{btn.label}</div>
                <div style={{fontSize:"0.68rem",color:"#666"}}>{btn.desc}</div>
              </button>
            ))}
          </div></div>}
          {mode&&<div style={{marginTop:"0.6rem",display:"flex",gap:"0.4rem",flexWrap:"wrap"}}>
            {[{id:"erklaeren",icon:"lightbulb",label:"Erklären",color:"#eab308"},{id:"abfragen",icon:"quiz",label:"Abfragen",color:"#a855f7"},{id:"tipps",icon:"star",label:"Tipps",color:"#22c55e"}].map(btn=>(
              <button key={btn.id} onClick={()=>startMode(btn.id)} style={{padding:"0.3rem 0.7rem",borderRadius:"20px",fontSize:"0.72rem",border:`1px solid ${mode===btn.id?btn.color:"#2a2a2a"}`,background:mode===btn.id?`${btn.color}18`:"transparent",color:mode===btn.id?btn.color:"#555",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"0.3rem"}}><Icon name={btn.icon} size={11}/>{btn.label}</button>
            ))}
            <button onClick={()=>{setMessages([]);setMode(null);}} style={{padding:"0.3rem 0.7rem",borderRadius:"20px",fontSize:"0.72rem",border:"1px solid #2a2a2a",background:"transparent",color:"#555",cursor:"pointer",fontFamily:"inherit"}}>← Neu</button>
          </div>}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"1.25rem 1.5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
          {messages.length===0&&!loading&&<div style={{textAlign:"center",padding:"3rem",color:"#333"}}><div style={{fontSize:"2.5rem",marginBottom:"0.5rem"}}>🤖</div><div style={{fontSize:"0.85rem"}}>Wähle einen Modus!</div></div>}
          {messages.filter(m=>m.role==="assistant").map((msg,i)=>(
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
        </div>}
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
  const addVideo=()=>{ const id=getYouTubeId(url); if(!id){alert("Ungültige YouTube-URL!");return;} setVideos(v=>[...v,{url,title:title||"Video",id}]); setUrl(""); setTitle(""); };
  const handleSave=async()=>{ await supabase.from(TABLE).update({youtube_links:videos}).eq("id",item.id); onSave({...item,youtube_links:videos}); setSaved(true); setTimeout(()=>{setSaved(false);onClose();},800); };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",backdropFilter:"blur(12px)",zIndex:110,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"#080808",border:`1px solid ${col.badge}30`,borderRadius:"16px",width:"100%",maxWidth:"700px",maxHeight:"92vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"1rem 1.5rem",borderBottom:`1px solid ${col.badge}18`,background:`linear-gradient(135deg,${col.bg}cc,#080808)`,flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:"0.7rem",color:"#ef4444",fontWeight:"bold",letterSpacing:"0.1em"}}>🎬 YOUTUBE VIDEOS</div><div style={{fontSize:"0.9rem",color:"#ccc",fontFamily:"'Courier New',monospace",fontWeight:"bold"}}>{item.title}</div></div>
          <button onClick={onClose} style={{background:"none",border:"1px solid #1e1e1e",borderRadius:"7px",padding:"0.4rem",cursor:"pointer",color:"#555"}} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#555"}><Icon name="close" size={16}/></button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"1.5rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
          <div style={{background:"#0f0f0f",border:"1px solid #1e1e1e",borderRadius:"12px",padding:"1rem",display:"flex",flexDirection:"column",gap:"0.75rem"}}>
            <div style={{fontSize:"0.7rem",color:"#555",letterSpacing:"0.15em"}}>VIDEO HINZUFÜGEN</div>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="YouTube URL (z.B. https://youtu.be/xyz)" style={{width:"100%",background:"#161616",border:"1px solid #2a2a2a",borderRadius:"8px",padding:"0.65rem 1rem",color:"#ddd",fontSize:"0.88rem",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titel (optional)" style={{width:"100%",background:"#161616",border:"1px solid #2a2a2a",borderRadius:"8px",padding:"0.65rem 1rem",color:"#ddd",fontSize:"0.88rem",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            <button onClick={addVideo} disabled={!url.trim()} style={{padding:"0.65rem",borderRadius:"8px",background:url.trim()?"#ef4444":"#1a1a1a",border:"none",color:url.trim()?"#fff":"#555",cursor:url.trim()?"pointer":"not-allowed",fontFamily:"inherit",fontWeight:"bold",fontSize:"0.85rem"}}>+ Video hinzufügen</button>
          </div>
          {videos.length===0&&<div style={{textAlign:"center",padding:"2rem",color:"#333",fontSize:"0.85rem"}}>🎬 Noch keine Videos</div>}
          {videos.map((v,i)=>(
            <div key={i} style={{background:"#0f0f0f",border:"1px solid #1e1e1e",borderRadius:"12px",overflow:"hidden"}}>
              <div style={{position:"relative",paddingBottom:"56.25%",background:"#000"}}><iframe src={`https://www.youtube.com/embed/${v.id}`} style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} allowFullScreen/></div>
              <div style={{padding:"0.75rem 1rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:"0.85rem",color:"#ccc"}}>{v.title}</div>
                <button onClick={()=>setVideos(vv=>vv.filter((_,j)=>j!==i))} style={{background:"none",border:"1px solid #2a2a2a",borderRadius:"6px",padding:"0.3rem 0.6rem",cursor:"pointer",color:"#666",fontSize:"0.75rem"}} onMouseEnter={e=>e.currentTarget.style.color="#ef4444"} onMouseLeave={e=>e.currentTarget.style.color="#666"}>Entfernen</button>
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

// ════════════════════════════════════════════════════════════════════════════
// ── PRÜFUNGS-GENERATOR (neuer Menüpunkt) ─────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function PruefungsGenerator({ items }) {
  const [step, setStep] = useState("config"); // config | generating | pruefung | ergebnis
  const [selCats, setSelCats] = useState([]);
  const [selThemen, setSelThemen] = useState([]);
  const [anzahl, setAnzahl] = useState(10);
  const [schwierigkeit, setSchwierigkeit] = useState("Mittel");
  const [mcAnteil, setMcAnteil] = useState(70); // % Multiple Choice
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [genProgress, setGenProgress] = useState("");
  const [showLoesung, setShowLoesung] = useState(false);

  const textItems = items.filter(i => i.type === "text" && i.content);
  const catCounts = CATEGORIES.reduce((a,c) => { a[c]=textItems.filter(i=>i.category===c).length; return a; }, {});

  // Alle Themen der ausgewählten Kategorien
  const themenInCats = selCats.length > 0
    ? textItems.filter(i => selCats.includes(i.category))
    : [];

  const toggleCat = (cat) => {
    setSelCats(p => p.includes(cat) ? p.filter(c=>c!==cat) : [...p,cat]);
    // Themen dieser Kategorie aus selThemen entfernen wenn Kategorie abgewählt
    if (selCats.includes(cat)) {
      setSelThemen(p => p.filter(id => {
        const item = textItems.find(i=>i.id===id);
        return item?.category !== cat;
      }));
    }
  };

  const toggleThema = (id) => setSelThemen(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);

  // Alle ausgewählten Items zusammenstellen
  const selectedItems = [
    ...themenInCats,
    ...textItems.filter(i => selThemen.includes(i.id) && !selCats.includes(i.category))
  ];

  const generatePruefung = async () => {
    if (selectedItems.length === 0) { alert("Bitte mindestens eine Kategorie oder ein Thema auswählen!"); return; }
    setStep("generating"); setGenProgress("KI analysiert ausgewählte Themen...");

    const mcCount = Math.round(anzahl * mcAnteil / 100);
    const textCount = anzahl - mcCount;

    const context = selectedItems.map(i => `### ${i.title} (${i.category})\n${(i.content||"").substring(0,800)}`).join("\n\n");

    const systemPrompt = `Du bist ein IHK-Pruefungsersteller fuer Fachinformatiker Systemintegration, IHK Heilbronn. Erstelle eine realistische Abschlusspruefung. Antworte NUR mit validem JSON-Array, kein Text davor oder danach, keine Markdown-Backticks.`;

    const userMsg = `Erstelle eine FISI IHK-Pruefung mit genau ${anzahl} Fragen (${mcCount} Multiple Choice + ${textCount} Freitext-Fragen).
Schwierigkeit: ${schwierigkeit}
Themen und Inhalte:
${context}

JSON-Format (NUR das Array, kein anderer Text):
[
  {
    "type": "mc",
    "question": "Frage?",
    "options": ["Option A","Option B","Option C","Option D"],
    "correct": 0,
    "explanation": "Begruendung",
    "thema": "Themenname"
  },
  {
    "type": "text",
    "question": "Freitext-Frage?",
    "musterpunkte": ["Punkt 1 der erwartet wird","Punkt 2"],
    "thema": "Themenname"
  }
]

Wichtig: Exakt ${mcCount} Objekte mit type="mc" und ${textCount} Objekte mit type="text". Fragen sollen typisch fuer IHK-Pruefungen sein.`;

    try {
      setGenProgress("KI generiert Prüfungsfragen...");
      const reply = await callKI([{role:"user",content:userMsg}], systemPrompt);
      const clean = reply.replace(/```json/g,"").replace(/```/g,"").trim();
      const parsed = JSON.parse(clean);
      setQuestions(parsed);
      setAnswers({});
      setSubmitted(false);
      setShowLoesung(false);
      setStep("pruefung");
    } catch(e) {
      alert("Fehler beim Generieren: "+e.message+"\n\nBitte nochmal versuchen.");
      setStep("config");
    }
  };

  const mcQuestions = questions.filter(q => q.type === "mc");
  const mcScore = submitted ? mcQuestions.filter(q => { const i=questions.indexOf(q); return answers[i]===q.correct; }).length : 0;
  const mcPercent = mcQuestions.length > 0 ? Math.round((mcScore/mcQuestions.length)*100) : 0;
  const allAnswered = questions.every((q,i) => q.type==="mc" ? answers[i]!==undefined : answers[i]?.trim()?.length>0);

  const pruefungTitle = `FISI Prüfung – ${selCats.length>0?selCats.join(", "):"Ausgewählte Themen"} (${schwierigkeit})`;

  return (
    <div style={{flex:1, overflowY:"auto", padding:"1.5rem 2rem", minWidth:0}}>

      {/* ── Konfiguration ── */}
      {step==="config" && (
        <div style={{maxWidth:"900px"}}>
          <div style={{marginBottom:"2rem"}}>
            <div style={{fontFamily:"'Courier New',monospace",fontSize:"1.4rem",fontWeight:"bold",color:"#fff",marginBottom:"0.3rem"}}>Prüfung erstellen</div>
            <div style={{fontSize:"0.82rem",color:"#555"}}>Wähle Kategorien und Themen aus – die KI generiert automatisch eine vollständige IHK-Prüfung</div>
          </div>

          {/* Schritt 1: Kategorien */}
          <div style={{marginBottom:"1.75rem"}}>
            <div style={{fontSize:"0.65rem",letterSpacing:"0.2em",color:"#555",marginBottom:"0.75rem",fontWeight:"bold"}}>SCHRITT 1 – KATEGORIEN AUSWÄHLEN</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"0.6rem"}}>
              {CATEGORIES.map(cat => {
                const col=CAT_COLORS[cat]; const count=catCounts[cat]||0; const active=selCats.includes(cat);
                return count>0 ? (
                  <button key={cat} onClick={()=>toggleCat(cat)} style={{padding:"0.75rem 1rem",borderRadius:"10px",border:active?`1px solid ${col.badge}`:"1px solid #1e1e1e",background:active?`${col.badge}18`:"#0f0f0f",color:active?col.badge:"#666",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.15s"}}>
                    <div style={{fontWeight:"bold",fontSize:"0.85rem",marginBottom:"0.2rem"}}>{cat}</div>
                    <div style={{fontSize:"0.7rem",color:active?col.badge+"aa":"#444"}}>{count} Thema{count!==1?"en":""}</div>
                  </button>
                ) : null;
              })}
            </div>
          </div>

          {/* Schritt 2: Einzelne Themen */}
          <div style={{marginBottom:"1.75rem"}}>
            <div style={{fontSize:"0.65rem",letterSpacing:"0.2em",color:"#555",marginBottom:"0.75rem",fontWeight:"bold"}}>SCHRITT 2 – EINZELNE THEMEN (OPTIONAL)</div>
            <div style={{fontSize:"0.78rem",color:"#444",marginBottom:"0.75rem"}}>Themen aus nicht ausgewählten Kategorien einzeln hinzufügen:</div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.3rem",maxHeight:"280px",overflowY:"auto",background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:"10px",padding:"0.75rem"}}>
              {textItems.filter(i=>!selCats.includes(i.category)).map(item=>{
                const col=CAT_COLORS[item.category]||CAT_COLORS["Sonstiges"]; const active=selThemen.includes(item.id);
                return(
                  <button key={item.id} onClick={()=>toggleThema(item.id)} style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"0.5rem 0.75rem",borderRadius:"8px",border:active?`1px solid ${col.badge}40`:"1px solid transparent",background:active?`${col.badge}10`:"transparent",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s"}} onMouseEnter={e=>!active&&(e.currentTarget.style.background="#111")} onMouseLeave={e=>!active&&(e.currentTarget.style.background="transparent")}>
                    <div style={{width:"10px",height:"10px",borderRadius:"50%",background:active?col.badge:"#2a2a2a",flexShrink:0,transition:"all 0.15s"}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"0.82rem",color:active?col.badge:"#888",fontWeight:active?"bold":"normal"}}>{item.title}</div>
                    </div>
                    <span style={{fontSize:"0.65rem",color:col.badge,background:`${col.badge}15`,padding:"0.1rem 0.4rem",borderRadius:"4px"}}>{item.category}</span>
                  </button>
                );
              })}
              {textItems.filter(i=>!selCats.includes(i.category)).length===0&&<div style={{textAlign:"center",padding:"1rem",color:"#333",fontSize:"0.8rem"}}>Alle Kategorien bereits ausgewählt</div>}
            </div>
          </div>

          {/* Ausgewählt Übersicht */}
          {selectedItems.length > 0 && (
            <div style={{background:"#0a1a0a",border:"1px solid #1a3a1a",borderRadius:"10px",padding:"1rem",marginBottom:"1.75rem"}}>
              <div style={{fontSize:"0.7rem",color:"#22c55e",letterSpacing:"0.15em",marginBottom:"0.5rem",fontWeight:"bold"}}>✓ AUSGEWÄHLT ({selectedItems.length} THEMEN)</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.35rem"}}>
                {selectedItems.map(i=><span key={i.id} style={{fontSize:"0.72rem",color:"#4ade80",background:"#0a2a0a",padding:"0.15rem 0.5rem",borderRadius:"4px",border:"1px solid #1a3a1a"}}>{i.title}</span>)}
              </div>
            </div>
          )}

          {/* Schritt 3: Einstellungen */}
          <div style={{marginBottom:"1.75rem"}}>
            <div style={{fontSize:"0.65rem",letterSpacing:"0.2em",color:"#555",marginBottom:"0.75rem",fontWeight:"bold"}}>SCHRITT 3 – PRÜFUNGSEINSTELLUNGEN</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1rem"}}>
              <div>
                <div style={{fontSize:"0.72rem",color:"#555",marginBottom:"0.5rem"}}>Anzahl Fragen</div>
                <div style={{display:"flex",gap:"0.4rem"}}>
                  {[5,10,15,20].map(n=>(
                    <button key={n} onClick={()=>setAnzahl(n)} style={{flex:1,padding:"0.6rem",borderRadius:"8px",border:anzahl===n?"1px solid #3b82f6":"1px solid #1e1e1e",background:anzahl===n?"#0a1a3a":"#0f0f0f",color:anzahl===n?"#60a5fa":"#666",cursor:"pointer",fontFamily:"inherit",fontWeight:"bold"}}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:"0.72rem",color:"#555",marginBottom:"0.5rem"}}>Schwierigkeit</div>
                <div style={{display:"flex",gap:"0.4rem"}}>
                  {[{l:"Leicht",c:"#22c55e"},{l:"Mittel",c:"#eab308"},{l:"Schwer",c:"#ef4444"}].map(s=>(
                    <button key={s.l} onClick={()=>setSchwierigkeit(s.l)} style={{flex:1,padding:"0.6rem",borderRadius:"8px",border:schwierigkeit===s.l?`1px solid ${s.c}`:"1px solid #1e1e1e",background:schwierigkeit===s.l?`${s.c}18`:"#0f0f0f",color:schwierigkeit===s.l?s.c:"#666",cursor:"pointer",fontFamily:"inherit",fontWeight:schwierigkeit===s.l?"bold":"normal",fontSize:"0.78rem"}}>{s.l}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{fontSize:"0.72rem",color:"#555",marginBottom:"0.5rem"}}>MC-Anteil: {mcAnteil}% ({Math.round(anzahl*mcAnteil/100)} MC + {anzahl-Math.round(anzahl*mcAnteil/100)} Freitext)</div>
                <input type="range" min="0" max="100" step="10" value={mcAnteil} onChange={e=>setMcAnteil(+e.target.value)} style={{width:"100%",accentColor:"#3b82f6",marginTop:"0.5rem"}}/>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button onClick={generatePruefung} disabled={selectedItems.length===0} style={{width:"100%",padding:"1.1rem",borderRadius:"12px",background:selectedItems.length>0?"#3b82f6":"#1a1a1a",border:"none",color:selectedItems.length>0?"#fff":"#444",fontSize:"1rem",fontWeight:"bold",cursor:selectedItems.length>0?"pointer":"not-allowed",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.6rem",transition:"all 0.2s"}}>
            <Icon name="zap" size={18}/>
            {selectedItems.length>0?`Prüfung generieren – ${anzahl} Fragen aus ${selectedItems.length} Themen`:"Bitte zuerst Themen auswählen"}
          </button>
        </div>
      )}

      {/* ── Generating ── */}
      {step==="generating" && (
        <div style={{textAlign:"center",padding:"5rem 2rem"}}>
          <div style={{fontSize:"3rem",marginBottom:"1.5rem"}}>⚙️</div>
          <div style={{fontFamily:"'Courier New',monospace",fontSize:"1.1rem",color:"#fff",marginBottom:"0.75rem"}}>{genProgress}</div>
          <div style={{fontSize:"0.82rem",color:"#555",marginBottom:"2rem"}}>Das kann 10-20 Sekunden dauern...</div>
          <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
            {[0,1,2,3,4].map(n=><div key={n} style={{width:"10px",height:"10px",borderRadius:"50%",background:"#3b82f6",animation:`bounce 1.2s infinite ${n*0.15}s`}}/>)}
          </div>
        </div>
      )}

      {/* ── Prüfung ablegen ── */}
      {(step==="pruefung"||step==="ergebnis") && (
        <div style={{maxWidth:"820px"}}>
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem",flexWrap:"wrap",gap:"0.75rem"}}>
            <div>
              <div style={{fontFamily:"'Courier New',monospace",fontSize:"1.1rem",fontWeight:"bold",color:"#fff"}}>{pruefungTitle}</div>
              <div style={{fontSize:"0.78rem",color:"#555",marginTop:"0.2rem"}}>{questions.length} Fragen · {mcQuestions.length} Multiple Choice · {questions.length-mcQuestions.length} Freitext</div>
            </div>
            <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
              {submitted&&<button onClick={()=>setShowLoesung(l=>!l)} style={{padding:"0.5rem 0.9rem",borderRadius:"8px",background:showLoesung?"#1a2a3a":"#0f0f0f",border:"1px solid #2a3a4a",color:"#60a5fa",cursor:"pointer",fontFamily:"inherit",fontSize:"0.8rem"}}>{showLoesung?"Lösung ausblenden":"Lösung anzeigen"}</button>}
              {submitted&&<button onClick={()=>exportPruefungPDF(pruefungTitle,questions,answers,submitted,showLoesung)} style={{padding:"0.5rem 0.9rem",borderRadius:"8px",background:"none",border:"1px solid #3a1a1a",color:"#ef4444",cursor:"pointer",fontFamily:"inherit",fontSize:"0.8rem",display:"flex",alignItems:"center",gap:"0.4rem"}}><Icon name="pdf" size={13}/>PDF Export</button>}
              <button onClick={()=>{setStep("config");setQuestions([]);setAnswers({});setSubmitted(false);}} style={{padding:"0.5rem 0.9rem",borderRadius:"8px",background:"#0f0f0f",border:"1px solid #2a2a2a",color:"#888",cursor:"pointer",fontFamily:"inherit",fontSize:"0.8rem"}}>← Neue Prüfung</button>
            </div>
          </div>

          {/* Ergebnis-Banner */}
          {submitted&&(
            <div style={{textAlign:"center",padding:"1.5rem",borderRadius:"12px",marginBottom:"1.5rem",background:mcPercent>=80?"#0a2e1a":mcPercent>=50?"#2e2a00":"#2e0a0a",border:`1px solid ${mcPercent>=80?"#22c55e":mcPercent>=50?"#eab308":"#ef4444"}`}}>
              <div style={{fontSize:"2.2rem",fontWeight:"bold",color:mcPercent>=80?"#22c55e":mcPercent>=50?"#eab308":"#ef4444"}}>{mcScore}/{mcQuestions.length} MC-Fragen</div>
              <div style={{fontSize:"1rem",color:mcPercent>=80?"#22c55e":mcPercent>=50?"#eab308":"#ef4444",marginTop:"0.3rem"}}>{mcPercent}% · {mcPercent>=80?"Bestanden ✓":mcPercent>=50?"Knapp ⚠️":"Nicht bestanden ✗"}</div>
              {questions.some(q=>q.type==="text")&&<div style={{fontSize:"0.8rem",color:"#888",marginTop:"0.5rem"}}>Freitext-Fragen: Vergleiche deine Antworten mit den Musterpunkten</div>}
            </div>
          )}

          {/* Fragen */}
          {questions.map((q,i)=>{
            const ismc=q.type==="mc";
            const isCorrect=submitted&&ismc&&answers[i]===q.correct;
            const isWrong=submitted&&ismc&&answers[i]!==undefined&&!isCorrect;
            return(
              <div key={i} style={{marginBottom:"1.25rem",padding:"1.25rem",background:submitted?(ismc?(isCorrect?"#0a2e1a":isWrong?"#2e0a0a":"#111"):"#0a1a2e"):"#111",border:`1px solid ${submitted?(ismc?(isCorrect?"#22c55e":isWrong?"#ef4444":"#2a2a2a"):"#1a3a5a"):"#1e1e1e"}`,borderRadius:"12px"}}>
                <div style={{display:"flex",gap:"0.5rem",alignItems:"flex-start",marginBottom:"0.75rem"}}>
                  <span style={{fontSize:"0.62rem",color:ismc?"#eab308":"#a855f7",background:ismc?"#eab30815":"#a855f715",padding:"0.15rem 0.4rem",borderRadius:"4px",border:`1px solid ${ismc?"#eab30825":"#a855f725"}`,flexShrink:0,marginTop:"2px"}}>{ismc?"MC":"Freitext"}</span>
                  {q.thema&&<span style={{fontSize:"0.62rem",color:"#555",background:"#0a0a0a",padding:"0.15rem 0.4rem",borderRadius:"4px",border:"1px solid #1a1a1a",flexShrink:0,marginTop:"2px"}}>{q.thema}</span>}
                  <div style={{fontSize:"0.88rem",fontWeight:"bold",color:submitted?(ismc?(isCorrect?"#22c55e":isWrong?"#ef4444":"#ccc"):"#93c5fd"):"#ccc",lineHeight:1.4}}>
                    {submitted&&ismc&&<span style={{marginRight:"0.4rem"}}>{isCorrect?"✅":"❌"}</span>}{i+1}. {q.question}
                  </div>
                </div>

                {/* Multiple Choice */}
                {ismc&&(
                  <div style={{display:"flex",flexDirection:"column",gap:"0.4rem"}}>
                    {q.options.map((opt,j)=>{
                      const isSel=answers[i]===j; const isRight=submitted&&j===q.correct; const isSelWrong=submitted&&isSel&&j!==q.correct;
                      return(
                        <button key={j} onClick={()=>!submitted&&setAnswers(a=>({...a,[i]:j}))} style={{padding:"0.6rem 0.9rem",borderRadius:"8px",border:`1px solid ${isRight?"#22c55e":isSelWrong?"#ef4444":isSel?"#3b82f6":"#2a2a2a"}`,background:isRight?"#0a2e1a":isSelWrong?"#2e0a0a":isSel?"#0a1a2e":"#0a0a0a",color:isRight?"#22c55e":isSelWrong?"#ef4444":isSel?"#60a5fa":"#888",cursor:submitted?"default":"pointer",textAlign:"left",fontFamily:"inherit",fontSize:"0.82rem",transition:"all 0.15s"}}>
                          <strong>{String.fromCharCode(65+j)})</strong> {opt}
                          {isRight&&submitted&&<span style={{float:"right",fontSize:"0.75rem"}}>✓ Richtig</span>}
                        </button>
                      );
                    })}
                    {submitted&&isWrong&&q.explanation&&<div style={{marginTop:"0.6rem",padding:"0.6rem 0.9rem",background:"#0a1228",border:"1px solid #1a3a5a",borderRadius:"8px",fontSize:"0.78rem",color:"#93c5fd"}}>💡 {q.explanation}</div>}
                    {submitted&&showLoesung&&isCorrect&&q.explanation&&<div style={{marginTop:"0.6rem",padding:"0.6rem 0.9rem",background:"#0a1a0a",border:"1px solid #1a3a1a",borderRadius:"8px",fontSize:"0.78rem",color:"#4ade80"}}>💡 {q.explanation}</div>}
                  </div>
                )}

                {/* Freitext */}
                {!ismc&&(
                  <div>
                    <textarea value={answers[i]||""} onChange={e=>!submitted&&setAnswers(a=>({...a,[i]:e.target.value}))} disabled={submitted} placeholder="Deine Antwort eingeben..." rows={4} style={{width:"100%",background:"#0a0a0a",border:"1px solid #2a2a2a",borderRadius:"8px",padding:"0.75rem 1rem",color:"#ccc",fontSize:"0.85rem",outline:"none",fontFamily:"'Courier New',monospace",lineHeight:"1.7",resize:"vertical",boxSizing:"border-box",opacity:submitted?0.8:1}}/>
                    {submitted&&q.musterpunkte&&(showLoesung||true)&&(
                      <div style={{marginTop:"0.6rem",padding:"0.75rem 1rem",background:"#0a1228",border:"1px solid #1a3a5a",borderRadius:"8px"}}>
                        <div style={{fontSize:"0.7rem",color:"#60a5fa",letterSpacing:"0.1em",marginBottom:"0.4rem",fontWeight:"bold"}}>MUSTERPUNKTE:</div>
                        {q.musterpunkte.map((p,j)=><div key={j} style={{fontSize:"0.8rem",color:"#93c5fd",display:"flex",gap:"0.4rem",marginBottom:"0.2rem"}}><span style={{color:"#3b82f6",flexShrink:0}}>•</span>{p}</div>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Abgeben */}
          {!submitted&&questions.length>0&&(
            <div style={{position:"sticky",bottom:0,background:"#070707",borderTop:"1px solid #111",padding:"1rem 0",marginTop:"0.5rem"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem"}}>
                <div style={{fontSize:"0.8rem",color:"#555"}}>
                  {Object.keys(answers).length}/{questions.length} beantwortet
                  {questions.filter((q,i)=>q.type==="mc"&&answers[i]===undefined).length>0&&` · ${questions.filter((q,i)=>q.type==="mc"&&answers[i]===undefined).length} MC offen`}
                </div>
                <button onClick={()=>setSubmitted(true)} disabled={!allAnswered} style={{padding:"0.85rem 2rem",borderRadius:"10px",background:allAnswered?"#22c55e":"#1a1a1a",border:"none",color:allAnswered?"#000":"#444",fontSize:"0.95rem",fontWeight:"bold",cursor:allAnswered?"pointer":"not-allowed",fontFamily:"inherit"}}>
                  {allAnswered?"Prüfung abgeben ✓":`Noch ${questions.length-Object.keys(answers).length} offen`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Setup Banner ──────────────────────────────────────────────────────────────

// ════════════════════════════════════════════════════════════════════════════
// ── ABFRAGE-MODUS ────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════
function AbfrageConfig({ items, onStart }) {
  const [selCats, setSelCats] = useState([]);
  const [anzahl, setAnzahl] = useState(10);
  const textItems = items.filter(i => i.type === "text" && i.content);
  const catCounts = CATEGORIES.reduce((a,c) => { a[c]=textItems.filter(i=>i.category===c).length; return a; }, {});
  const toggleCat = (cat) => setSelCats(p => p.includes(cat) ? p.filter(c=>c!==cat) : [...p,cat]);
  const total = selCats.length === 0
    ? textItems.length
    : textItems.filter(i => selCats.includes(i.category)).length;

  return (
    <div style={{flex:1, overflowY:"auto", padding:"1.5rem 2rem", minWidth:0}}>
      <div style={{maxWidth:"750px"}}>
        <div style={{marginBottom:"2rem"}}>
          <div style={{fontFamily:"'Courier New',monospace",fontSize:"1.4rem",fontWeight:"bold",color:"#fff",marginBottom:"0.3rem"}}>Abfrage-Modus</div>
          <div style={{fontSize:"0.82rem",color:"#555"}}>Die KI stellt dir Fragen aus deinen Zusammenfassungen – du antwortest frei und bekommst sofort Feedback</div>
        </div>

        {/* Kategorien */}
        <div style={{marginBottom:"1.75rem"}}>
          <div style={{fontSize:"0.65rem",letterSpacing:"0.2em",color:"#555",marginBottom:"0.75rem",fontWeight:"bold"}}>KATEGORIEN WÄHLEN</div>
          <div style={{marginBottom:"0.75rem"}}>
            <button onClick={()=>setSelCats([])} style={{padding:"0.5rem 1.1rem",borderRadius:"8px",border:selCats.length===0?"1px solid #3b82f6":"1px solid #1e1e1e",background:selCats.length===0?"#0a1a3a":"#0f0f0f",color:selCats.length===0?"#60a5fa":"#666",cursor:"pointer",fontFamily:"inherit",fontSize:"0.82rem",fontWeight:selCats.length===0?"bold":"normal",marginRight:"0.5rem"}}>
              ✦ Alle Kategorien ({textItems.length} Themen)
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:"0.55rem"}}>
            {CATEGORIES.map(cat => {
              const col=CAT_COLORS[cat]; const count=catCounts[cat]||0; const active=selCats.includes(cat);
              return count > 0 ? (
                <button key={cat} onClick={()=>toggleCat(cat)} style={{padding:"0.7rem 0.9rem",borderRadius:"10px",border:active?`1px solid ${col.badge}`:"1px solid #1e1e1e",background:active?`${col.badge}18`:"#0f0f0f",color:active?col.badge:"#666",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.15s"}}>
                  <div style={{fontWeight:"bold",fontSize:"0.83rem",marginBottom:"0.15rem"}}>{cat}</div>
                  <div style={{fontSize:"0.68rem",color:active?col.badge+"aa":"#3a3a3a"}}>{count} Thema{count!==1?"en":""}</div>
                </button>
              ) : null;
            })}
          </div>
        </div>

        {/* Anzahl */}
        <div style={{marginBottom:"2rem"}}>
          <div style={{fontSize:"0.65rem",letterSpacing:"0.2em",color:"#555",marginBottom:"0.75rem",fontWeight:"bold"}}>ANZAHL FRAGEN</div>
          <div style={{display:"flex",gap:"0.5rem"}}>
            {[5,10,15,20].map(n=>(
              <button key={n} onClick={()=>setAnzahl(n)} style={{flex:1,padding:"0.75rem",borderRadius:"10px",border:anzahl===n?"1px solid #3b82f6":"1px solid #1e1e1e",background:anzahl===n?"#0a1a3a":"#0f0f0f",color:anzahl===n?"#60a5fa":"#666",cursor:"pointer",fontFamily:"inherit",fontSize:"1rem",fontWeight:"bold"}}>{n}</button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div style={{background:"#0a1a2e",border:"1px solid #1a3a5a",borderRadius:"10px",padding:"1rem 1.25rem",marginBottom:"1.5rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
          <div style={{fontSize:"1.5rem",flexShrink:0}}>💡</div>
          <div>
            <div style={{fontSize:"0.82rem",color:"#60a5fa",fontWeight:"bold",marginBottom:"0.3rem"}}>So funktioniert der Abfrage-Modus</div>
            <div style={{fontSize:"0.78rem",color:"#555",lineHeight:"1.6"}}>
              Die KI stellt eine Frage zu einem zufälligen Thema. Du tippst deine Antwort ein.
              Klicke auf <strong style={{color:"#aaa"}}>"Antwort prüfen"</strong> – die KI bewertet sofort ob du richtig liegst.
              Bei Bedarf gibt es einen <strong style={{color:"#aaa"}}>"Hinweis"</strong> Button der dir auf die Sprünge hilft.
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={()=>onStart(selCats,anzahl)}
          disabled={total===0}
          style={{width:"100%",padding:"1.1rem",borderRadius:"12px",background:total>0?"#3b82f6":"#1a1a1a",border:"none",color:total>0?"#fff":"#444",fontSize:"1rem",fontWeight:"bold",cursor:total>0?"pointer":"not-allowed",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.6rem",transition:"all 0.2s"}}>
          🚀 Abfrage starten – {anzahl} Fragen aus {selCats.length===0?"allen":selCats.join(", ")} Themen
        </button>
      </div>
    </div>
  );
}

function AbfrageSession({ items, selCats, anzahl, onBack }) {
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // null | {correct, text, explanation}
  const [hint, setHint] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [questions, setQuestions] = useState([]); // [{question, thema, content}]
  const [generating, setGenerating] = useState(true);
  const [score, setScore] = useState({ correct:0, wrong:0 });
  const [done, setDone] = useState(false);
  const textareaRef = useRef();

  const textItems = items.filter(i => i.type==="text" && i.content);
  const pool = selCats.length===0 ? textItems : textItems.filter(i=>selCats.includes(i.category));

  // Generiere alle Fragen auf einmal beim Start
  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    setGenerating(true);
    // Wähle zufällige Items aus dem Pool
    const shuffled = [...pool].sort(()=>Math.random()-0.5);
    const selected = shuffled.slice(0, Math.min(anzahl, shuffled.length));

    const context = selected.map((item,i) =>
      `Frage ${i+1} zum Thema "${item.title}" (${item.category}):\nInhalt: ${(item.content||"").substring(0,600)}`
    ).join("\n\n---\n\n");

    const systemPrompt = `Du bist ein FISI IHK-Pruefungscoach. Erstelle Abfragefragen auf Deutsch. Antworte NUR mit einem JSON-Array, kein anderer Text.`;
    const userMsg = `Erstelle genau ${selected.length} Abfragefragen (eine pro Thema). Fragen sollen pruefungsrelevant und klar sein.

${context}

Antworte NUR mit diesem JSON (kein Markdown):
[{"question":"Die Frage?","thema":"Themenname","kategorie":"Kategorie","musterpunkte":["Erwarteter Punkt 1","Erwarteter Punkt 2","Erwarteter Punkt 3"]}]`;

    try {
      const reply = await callKI([{role:"user",content:userMsg}], systemPrompt);
      const clean = reply.replace(/```json/g,"").replace(/```/g,"").trim();
      const parsed = JSON.parse(clean);
      setQuestions(parsed);
    } catch(e) {
      // Fallback: einfache Fragen ohne KI
      const fallback = selected.map(item => ({
        question: `Erkläre das Konzept: ${item.title}`,
        thema: item.title,
        kategorie: item.category,
        musterpunkte: ["Korrekte Definition","Mindestens ein Beispiel","Praxisbezug"]
      }));
      setQuestions(fallback);
    }
    setGenerating(false);
  };

  const currentQ = questions[qIndex];
  const col = currentQ ? (CAT_COLORS[currentQ.kategorie]||CAT_COLORS["Sonstiges"]) : CAT_COLORS["Netzwerke"];

  const checkAnswer = async () => {
    if (!answer.trim() || loadingFeedback) return;
    setLoadingFeedback(true);
    setHint(null);

    const systemPrompt = `Du bist ein FISI IHK-Pruefungscoach. Bewerte Antworten auf Deutsch. Antworte NUR mit JSON.`;
    const userMsg = `Frage: ${currentQ.question}
Erwartete Punkte: ${currentQ.musterpunkte.join(", ")}
Antwort des Schuelers: ${answer}

Bewerte die Antwort. Antworte NUR mit diesem JSON (kein Markdown):
{"correct":true,"bewertung":"Richtig/Teilweise/Falsch","feedback":"Kurzes Feedback (2-3 Saetze)","was_gut":"Was war gut an der Antwort","verbesserung":"Was haette besser sein koennen oder fehlt"}`;

    try {
      const reply = await callKI([{role:"user",content:userMsg}], systemPrompt);
      const clean = reply.replace(/```json/g,"").replace(/```/g,"").trim();
      const parsed = JSON.parse(clean);
      setFeedback(parsed);
      setScore(s => ({
        correct: s.correct + (parsed.correct?1:0),
        wrong: s.wrong + (!parsed.correct?1:0)
      }));
    } catch(e) {
      setFeedback({correct:false, bewertung:"Fehler", feedback:"KI-Verbindung fehlgeschlagen: "+e.message, was_gut:"", verbesserung:""});
    }
    setLoadingFeedback(false);
  };

  const getHint = async () => {
    if (loadingHint || hint) return;
    setLoadingHint(true);
    const systemPrompt = `Du bist ein FISI-Lerncoach. Gib einen hilfreichen Hinweis auf Deutsch ohne die Antwort direkt zu verraten.`;
    try {
      const reply = await callKI([{role:"user",content:`Gib einen kurzen Hinweis (2-3 Saetze) zur Frage: "${currentQ.question}". Erwartete Punkte: ${currentQ.musterpunkte.join(", ")}. Verrate nicht die volle Antwort, sondern gib nur einen Denkanstoß!`}], systemPrompt);
      setHint(reply);
    } catch(e) {
      setHint("Hinweis: " + currentQ.musterpunkte[0]);
    }
    setLoadingHint(false);
  };

  const nextQuestion = () => {
    if (qIndex >= questions.length-1) { setDone(true); return; }
    setQIndex(i=>i+1);
    setAnswer("");
    setFeedback(null);
    setHint(null);
    setTimeout(()=>textareaRef.current?.focus(),100);
  };

  // Lade-Screen
  if (generating) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <div style={{fontSize:"3rem",marginBottom:"1.5rem"}}>🧠</div>
      <div style={{fontFamily:"'Courier New',monospace",fontSize:"1.1rem",color:"#fff",marginBottom:"0.75rem"}}>KI bereitet Abfrage vor...</div>
      <div style={{fontSize:"0.82rem",color:"#555",marginBottom:"2rem"}}>{anzahl} Fragen werden generiert</div>
      <div style={{display:"flex",gap:"8px"}}>{[0,1,2,3,4].map(n=><div key={n} style={{width:"10px",height:"10px",borderRadius:"50%",background:"#3b82f6",animation:`bounce 1.2s infinite ${n*0.15}s`}}/>)}</div>
    </div>
  );

  // Abgeschlossen
  if (done) {
    const total = score.correct + score.wrong;
    const pct = total>0 ? Math.round((score.correct/total)*100) : 0;
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
        <div style={{maxWidth:"500px",width:"100%",textAlign:"center"}}>
          <div style={{fontSize:"4rem",marginBottom:"1rem"}}>{pct>=80?"🏆":pct>=50?"💪":"📚"}</div>
          <div style={{fontFamily:"'Courier New',monospace",fontSize:"1.5rem",fontWeight:"bold",color:"#fff",marginBottom:"0.5rem"}}>Abfrage beendet!</div>
          <div style={{padding:"1.5rem",borderRadius:"12px",marginBottom:"1.5rem",background:pct>=80?"#0a2e1a":pct>=50?"#2e2a00":"#1a1a1a",border:`1px solid ${pct>=80?"#22c55e":pct>=50?"#eab308":"#2a2a2a"}`}}>
            <div style={{fontSize:"3rem",fontWeight:"bold",color:pct>=80?"#22c55e":pct>=50?"#eab308":"#888"}}>{score.correct}/{total}</div>
            <div style={{fontSize:"1.1rem",color:pct>=80?"#22c55e":pct>=50?"#eab308":"#888",marginTop:"0.3rem"}}>{pct}% richtig beantwortet</div>
          </div>
          <div style={{display:"flex",gap:"0.75rem",justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>{setQIndex(0);setAnswer("");setFeedback(null);setHint(null);setScore({correct:0,wrong:0});setDone(false);setGenerating(true);generateQuestions();}} style={{padding:"0.75rem 1.5rem",borderRadius:"10px",background:"#3b82f6",border:"none",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:"bold"}}>🔄 Neue Abfrage</button>
            <button onClick={onBack} style={{padding:"0.75rem 1.5rem",borderRadius:"10px",background:"#0f0f0f",border:"1px solid #2a2a2a",color:"#888",cursor:"pointer",fontFamily:"inherit"}}>← Zurück</button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div style={{flex:1,overflowY:"auto",padding:"1.5rem 2rem",minWidth:0}}>
      {/* Popup-Karte */}
      <div style={{maxWidth:"760px",margin:"0 auto"}}>

        {/* Fortschritt */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <button onClick={onBack} style={{background:"none",border:"1px solid #1e1e1e",borderRadius:"8px",padding:"0.4rem 0.8rem",cursor:"pointer",color:"#555",fontFamily:"inherit",fontSize:"0.78rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>← Beenden</button>
          <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
            <span style={{fontSize:"0.75rem",color:"#22c55e"}}>✓ {score.correct}</span>
            <div style={{background:"#111",borderRadius:"20px",height:"8px",width:"180px",overflow:"hidden"}}>
              <div style={{height:"100%",background:"#3b82f6",width:`${((qIndex+1)/questions.length)*100}%`,transition:"width 0.3s",borderRadius:"20px"}}/>
            </div>
            <span style={{fontSize:"0.75rem",color:"#ef4444"}}>✗ {score.wrong}</span>
          </div>
          <div style={{fontSize:"0.78rem",color:"#555"}}>{qIndex+1}/{questions.length}</div>
        </div>

        {/* Frage-Card */}
        <div style={{background:`linear-gradient(135deg,${col.bg}cc,#080808)`,border:`1px solid ${col.badge}40`,borderRadius:"16px",overflow:"hidden",boxShadow:`0 0 40px ${col.badge}10`}}>

          {/* Card Header */}
          <div style={{padding:"1.25rem 1.5rem",borderBottom:`1px solid ${col.badge}20`}}>
            <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.6rem"}}>
              <span style={{fontSize:"0.62rem",letterSpacing:"0.15em",color:col.badge,background:`${col.badge}15`,padding:"0.2rem 0.5rem",borderRadius:"4px",border:`1px solid ${col.badge}30`,fontWeight:"bold"}}>{currentQ.kategorie?.toUpperCase()}</span>
              <span style={{fontSize:"0.62rem",color:"#555",background:"#0a0a0a",padding:"0.2rem 0.5rem",borderRadius:"4px",border:"1px solid #1a1a1a"}}>{currentQ.thema}</span>
            </div>
            <div style={{fontSize:"1.05rem",fontWeight:"bold",color:"#eee",lineHeight:1.5}}>
              ❓ {currentQ.question}
            </div>
          </div>

          {/* Antwort-Bereich */}
          <div style={{padding:"1.25rem 1.5rem"}}>

            {/* Hinweis */}
            {hint && (
              <div style={{background:"#0a1a2e",border:"1px solid #1a3a5a",borderRadius:"10px",padding:"0.9rem 1.1rem",marginBottom:"1rem",display:"flex",gap:"0.75rem"}}>
                <div style={{flexShrink:0,fontSize:"1.2rem"}}>💡</div>
                <div style={{fontSize:"0.82rem",color:"#93c5fd",lineHeight:"1.65"}}>{hint}</div>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div style={{borderRadius:"12px",padding:"1rem 1.25rem",marginBottom:"1rem",background:feedback.correct?"#0a2e1a":"#1a0a0a",border:`1px solid ${feedback.correct?"#22c55e":"#ef4444"}`}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.6rem"}}>
                  <span style={{fontSize:"1.3rem"}}>{feedback.correct?"✅":"❌"}</span>
                  <span style={{fontSize:"0.88rem",fontWeight:"bold",color:feedback.correct?"#22c55e":"#ef4444"}}>{feedback.bewertung}</span>
                </div>
                <div style={{fontSize:"0.82rem",color:"#ccc",lineHeight:"1.65",marginBottom:"0.5rem"}}>{feedback.feedback}</div>
                {feedback.was_gut&&<div style={{fontSize:"0.78rem",color:"#4ade80",marginBottom:"0.25rem"}}>👍 {feedback.was_gut}</div>}
                {feedback.verbesserung&&<div style={{fontSize:"0.78rem",color:"#fca5a5"}}>📝 {feedback.verbesserung}</div>}
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={e=>setAnswer(e.target.value)}
              disabled={!!feedback}
              onKeyDown={e=>{ if(e.key==="Enter"&&e.ctrlKey&&!feedback) checkAnswer(); }}
              placeholder="Deine Antwort hier eingeben... (Strg+Enter zum Prüfen)"
              rows={5}
              style={{width:"100%",background:"#0a0a0a",border:`1px solid ${feedback?(feedback.correct?"#22c55e":"#ef4444"):"#2a2a2a"}`,borderRadius:"10px",padding:"0.9rem 1.1rem",color:"#ccc",fontSize:"0.88rem",outline:"none",fontFamily:"'Courier New',monospace",lineHeight:"1.7",resize:"vertical",boxSizing:"border-box",opacity:feedback?0.7:1,transition:"border-color 0.2s"}}
            />

            {/* Buttons */}
            <div style={{display:"flex",gap:"0.75rem",marginTop:"0.85rem",flexWrap:"wrap"}}>
              {!feedback ? (
                <>
                  <button
                    onClick={getHint}
                    disabled={loadingHint||!!hint}
                    style={{padding:"0.7rem 1.2rem",borderRadius:"10px",background:hint?"#1a1a1a":"#0a1a2e",border:`1px solid ${hint?"#2a2a2a":"#1a3a5a"}`,color:hint?"#444":"#60a5fa",cursor:hint||loadingHint?"not-allowed":"pointer",fontFamily:"inherit",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"0.4rem",transition:"all 0.2s"}}>
                    {loadingHint?<><span style={{animation:"pulse 1s infinite"}}>...</span> Hinweis lädt</>:<>💡 {hint?"Hinweis angezeigt":"Hinweis"}</>}
                  </button>
                  <button
                    onClick={checkAnswer}
                    disabled={!answer.trim()||loadingFeedback}
                    style={{flex:1,padding:"0.7rem 1.2rem",borderRadius:"10px",background:answer.trim()&&!loadingFeedback?"#3b82f6":"#1a1a1a",border:"none",color:answer.trim()&&!loadingFeedback?"#fff":"#444",cursor:answer.trim()&&!loadingFeedback?"pointer":"not-allowed",fontFamily:"inherit",fontSize:"0.88rem",fontWeight:"bold",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.4rem",transition:"all 0.2s"}}>
                    {loadingFeedback?<><div style={{display:"flex",gap:"3px"}}>{[0,1,2].map(n=><div key={n} style={{width:"5px",height:"5px",borderRadius:"50%",background:"#fff",animation:`bounce 1s infinite ${n*0.15}s`}}/>)}</div> KI bewertet...</>:"✓ Antwort prüfen"}
                  </button>
                </>
              ) : (
                <button
                  onClick={nextQuestion}
                  style={{flex:1,padding:"0.8rem 1.2rem",borderRadius:"10px",background:qIndex>=questions.length-1?"#22c55e":"#3b82f6",border:"none",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:"0.9rem",fontWeight:"bold",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem"}}>
                  {qIndex>=questions.length-1?"🏁 Abfrage abschließen":"Nächste Frage →"}
                </button>
              )}
            </div>

            {!feedback&&<div style={{fontSize:"0.65rem",color:"#333",marginTop:"0.4rem",textAlign:"right"}}>Strg+Enter zum Prüfen</div>}
          </div>
        </div>

        {/* Erwartete Punkte (nach Bewertung anzeigen) */}
        {feedback&&currentQ.musterpunkte&&(
          <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:"12px",padding:"1rem 1.25rem",marginTop:"1rem"}}>
            <div style={{fontSize:"0.65rem",letterSpacing:"0.15em",color:"#555",marginBottom:"0.6rem",fontWeight:"bold"}}>ERWARTETE PUNKTE</div>
            {currentQ.musterpunkte.map((p,i)=>(
              <div key={i} style={{fontSize:"0.8rem",color:"#666",display:"flex",gap:"0.5rem",marginBottom:"0.3rem"}}>
                <span style={{color:"#3b82f6",flexShrink:0}}>•</span>{p}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AbfrageModus({ items }) {
  const [started, setStarted] = useState(false);
  const [selCats, setSelCats] = useState([]);
  const [anzahl, setAnzahl] = useState(10);
  if (!started) return <AbfrageConfig items={items} onStart={(cats,n)=>{ setSelCats(cats); setAnzahl(n); setStarted(true); }}/>;
  return <AbfrageSession items={items} selCats={selCats} anzahl={anzahl} onBack={()=>setStarted(false)}/>;
}

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
function DetailModal({ item, onClose, onDelete, onStar, onKI, onYouTube }) {
  const [downloading,setDownloading]=useState(false);
  const [speaking,setSpeaking]=useState(false);
  const [activeVideo,setActiveVideo]=useState(null);
  const col=CAT_COLORS[item.category]||CAT_COLORS["Sonstiges"];
  const fi=item.file_name?getFileInfo(item.file_name):null;
  const handleDownloadFile=async()=>{setDownloading(true);try{const{data,error}=await supabase.storage.from(BUCKET).download(item.file_path);if(error)throw error;const a=document.createElement("a");a.href=URL.createObjectURL(data);a.download=item.file_name;a.click();}catch(e){alert("Fehler: "+e.message);}setDownloading(false);};
  const handleViewFile=async()=>{const{data}=await supabase.storage.from(BUCKET).getPublicUrl(item.file_path);window.open(data.publicUrl,"_blank");};
  const videos=item.youtube_links||[];

  // Text aufbereiten fuer natuerlicheres Vorlesen
  const prepareText=(raw)=>{
    let t=raw||"";
    t=t.replace(/\n\n+/g,". ");
    t=t.replace(/\n/g,", ");
    t=t.replace(/\s*\|\s*/g,". ");
    t=t.replace(/\s*\(\s*/g,", ").replace(/\s*\)\s*/g,", ");
    t=t.replace(/[.]{2,}/g,". ");
    t=t.replace(/\s{2,}/g," ");
    return t.trim();
  };

  const splitSentences=(text)=>{
    const parts=[];
    let buf="";
    for(let i=0;i<text.length;i++){
      buf+=text[i];
      const c=text[i];
      const next=text[i+1]||"";
      if((c==="."||c==="!"||c==="?")&&(next===" "||next==="\n"||next==="")){
        const s=buf.trim();
        if(s.length>3) parts.push(s);
        buf="";
      }
    }
    if(buf.trim().length>3) parts.push(buf.trim());
    return parts.length>0?parts:[text];
  };

  const speakChunks=(chunks,voice,idx=0)=>{
    if(idx>=chunks.length){setSpeaking(false);return;}
    const utt=new SpeechSynthesisUtterance(chunks[idx]);
    utt.lang="de-DE";
    utt.rate=0.88;
    utt.pitch=1.0;
    utt.volume=1.0;
    if(voice) utt.voice=voice;
    utt.onend=()=>setTimeout(()=>speakChunks(chunks,voice,idx+1),110);
    utt.onerror=(e)=>{
      if(e.error!=="interrupted") speakChunks(chunks,voice,idx+1);
      else setSpeaking(false);
    };
    window.speechSynthesis.speak(utt);
  };

  const handleSpeak=()=>{
    if(!window.speechSynthesis){alert("Dein Browser unterstuetzt kein Text-to-Speech!");return;}
    if(speaking){window.speechSynthesis.cancel();setSpeaking(false);return;}
    const rawText=item.title+". Kategorie: "+item.category+". "+(item.content||"").substring(0,4000);
    const prepared=prepareText(rawText);
    const chunks=splitSentences(prepared);
    const getBestVoice=()=>{
      const vv=window.speechSynthesis.getVoices();
      return vv.find(v=>v.lang==="de-DE"&&v.name.includes("Katja"))
        ||vv.find(v=>v.lang==="de-DE"&&v.name.includes("Conrad"))
        ||vv.find(v=>v.lang==="de-DE"&&v.name.includes("Microsoft"))
        ||vv.find(v=>v.lang==="de-DE"&&v.name.includes("Google"))
        ||vv.find(v=>v.lang==="de-DE")
        ||vv.find(v=>v.lang.startsWith("de"));
    };
    const start=()=>{window.speechSynthesis.cancel();setSpeaking(true);speakChunks(chunks,getBestVoice(),0);};
    if(window.speechSynthesis.getVoices().length>0) start();
    else{window.speechSynthesis.onvoiceschanged=()=>{window.speechSynthesis.onvoiceschanged=null;start();};}
  };

  useEffect(()=>{ return ()=>{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }; },[]);

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",backdropFilter:"blur(12px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{background:"#080808",border:`1px solid ${col.badge}30`,borderRadius:"16px",width:"100%",maxWidth:"820px",maxHeight:"93vh",overflow:"auto"}}>
        <div style={{padding:"1.25rem 1.75rem",borderBottom:`1px solid ${col.badge}18`,background:`linear-gradient(135deg,${col.bg}bb,#080808)`,position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"1rem"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.4rem",flexWrap:"wrap"}}>
                <span style={{fontSize:"0.58rem",letterSpacing:"0.2em",color:col.badge,background:`${col.badge}12`,padding:"0.18rem 0.5rem",borderRadius:"4px",border:`1px solid ${col.badge}25`,fontWeight:"bold"}}>{item.category.toUpperCase()}</span>
                {fi&&<span style={{fontSize:"0.58rem",color:fi.color,background:`${fi.color}12`,padding:"0.18rem 0.5rem",borderRadius:"4px",border:`1px solid ${fi.color}25`,fontWeight:"bold"}}>{fi.icon} {fi.label}</span>}
                {videos.length>0&&<span style={{fontSize:"0.58rem",color:"#ef4444",background:"#ef444412",padding:"0.18rem 0.5rem",borderRadius:"4px",border:"1px solid #ef444425",fontWeight:"bold"}}>🎬 {videos.length}</span>}
              </div>
              <div style={{fontSize:"1.2rem",fontWeight:"bold",color:"#eee",fontFamily:"'Courier New',monospace",lineHeight:1.3}}>{item.title}</div>
              <div style={{fontSize:"0.7rem",color:"#444",marginTop:"0.3rem"}}>von {item.author} · {new Date(item.created_at).toLocaleDateString("de-DE",{day:"2-digit",month:"long",year:"numeric"})}</div>
            </div>
            <div style={{display:"flex",gap:"0.4rem",flexWrap:"wrap",justifyContent:"flex-end"}}>
              <button onClick={onKI} style={{background:`${col.badge}15`,border:`1px solid ${col.badge}40`,borderRadius:"7px",padding:"0.4rem 0.7rem",cursor:"pointer",color:col.badge,fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem",fontFamily:"inherit",fontWeight:"bold"}}><Icon name="bot" size={13}/>KI Hilfe</button>
              <button onClick={onYouTube} style={{background:"#ef444415",border:"1px solid #ef444440",borderRadius:"7px",padding:"0.4rem 0.7rem",cursor:"pointer",color:"#ef4444",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem",fontFamily:"inherit",fontWeight:"bold"}}><Icon name="youtube" size={13}/>Videos</button>
              {item.type==="text"&&<button onClick={handleSpeak} title={speaking?"Vorlesen stoppen":"Vorlesen"} style={{background:speaking?"#1a0a2e":"none",border:`1px solid ${speaking?"#a855f7":"#2a2a2a"}`,borderRadius:"7px",padding:"0.4rem 0.7rem",cursor:"pointer",color:speaking?"#a855f7":"#666",fontSize:"0.75rem",display:"flex",alignItems:"center",gap:"0.3rem",fontFamily:"inherit",transition:"all 0.2s"}}>
                {speaking?"⏹ Stopp":"🔊 Vorlesen"}
              </button>}
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
          {videos.length>0&&<div style={{marginTop:"1.5rem"}}>
            <div style={{fontSize:"0.7rem",color:"#555",letterSpacing:"0.15em",marginBottom:"0.75rem"}}>🎬 YOUTUBE VIDEOS ({videos.length})</div>
            {/* Thumbnail-Liste – klicken zum Laden des Players */}
            <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
              {videos.map((v,i)=>(
                <div key={i} style={{borderRadius:"12px",overflow:"hidden",border:"1px solid #1e1e1e",background:"#0f0f0f"}}>
                  {activeVideo===i ? (
                    <div style={{position:"relative",paddingBottom:"56.25%",background:"#000"}}>
                      <iframe
                        src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`}
                        style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title={v.title}
                      />
                    </div>
                  ) : (
                    <div
                      onClick={()=>setActiveVideo(i)}
                      style={{position:"relative",paddingBottom:"56.25%",background:"#000",cursor:"pointer",overflow:"hidden"}}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`}
                        onError={e=>{e.target.src=`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`;}}
                        alt={v.title}
                        style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.85}}
                      />
                      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <div style={{width:"64px",height:"64px",background:"rgba(255,0,0,0.9)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(0,0,0,0.5)",transition:"transform 0.2s"}}
                          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
                          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21"/></svg>
                        </div>
                      </div>
                    </div>
                  )}
                  <div style={{padding:"0.6rem 0.9rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:"0.82rem",color:"#ccc",fontWeight:"bold"}}>{v.title}</div>
                    {activeVideo===i&&<button onClick={()=>setActiveVideo(null)} style={{background:"none",border:"1px solid #2a2a2a",borderRadius:"6px",padding:"0.2rem 0.6rem",cursor:"pointer",color:"#666",fontSize:"0.72rem"}}>Schließen</button>}
                  </div>
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
  const [page,setPage]=useState("lernportal"); // "lernportal" | "pruefung" | "abfrage"
  const [showUpload,setShowUpload]=useState(false);
  const [selected,setSelected]=useState(null);
  const [kiItem,setKiItem]=useState(null);
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
  const handleYouTubeSave=(u)=>{setItems(p=>p.map(i=>i.id===u.id?u:i));if(selected?.id===u.id)setSelected(u);};

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
    <div style={{minHeight:"100vh",background:"#070707",color:"#fff",fontFamily:"'Segoe UI',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0c0c0c}::-webkit-scrollbar-thumb{background:#252525;border-radius:3px}
        .card{transition:transform .18s,box-shadow .18s;cursor:pointer}.card:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.5)}
        .sbtn{transition:all .15s}.sbtn:hover{color:#ccc!important;background:#111!important}
        .sidebar{transition:width 0.3s ease,opacity 0.3s ease}
        .navbtn{transition:all 0.2s}
        body{margin:0;padding:0;background:#070707}
      `}</style>

      {toast&&<div style={{position:"fixed",top:"1.25rem",right:"1.25rem",zIndex:200,background:toast.type==="err"?"#120808":"#081408",border:`1px solid ${toast.type==="err"?"#7b2d2d":"#2d7b4a"}`,borderRadius:"10px",padding:"0.65rem 1.1rem",color:toast.type==="err"?"#e57373":"#66bb6a",fontSize:"0.8rem",animation:"slideDown .25s ease",display:"flex",alignItems:"center",gap:"0.5rem"}}><Icon name={toast.type==="err"?"trash":"check"} size={12}/>{toast.msg}</div>}

      {/* Header */}
      <div style={{borderBottom:"1px solid #111",background:"#090909",padding:"0.75rem 1.75rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.9rem"}}>
          {page==="lernportal"&&<button onClick={()=>setSideOpen(o=>!o)} style={{background:"none",border:"1px solid #1e1e1e",borderRadius:"8px",padding:"0.45rem",cursor:"pointer",color:"#555",flexShrink:0,display:"flex",alignItems:"center",transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#555"}><Icon name={sideOpen?"sideOpen":"sideClose"} size={17}/></button>}
          <div style={{width:"34px",height:"34px",background:"#fff",borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon name="book" size={18}/></div>
          <div>
            <div style={{fontFamily:"'Courier New',monospace",fontSize:"1rem",fontWeight:"bold"}}>FISI Lernportal</div>
            <div style={{fontSize:"0.58rem",color:"#444",letterSpacing:"0.1em"}}>IHK HEILBRONN · {items.length} EINTRÄGE</div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{display:"flex",gap:"0.4rem",alignItems:"center"}}>
          <button onClick={()=>setPage("lernportal")} className="navbtn" style={{padding:"0.5rem 1rem",borderRadius:"8px",border:"none",background:page==="lernportal"?"#fff":"transparent",color:page==="lernportal"?"#000":"#555",cursor:"pointer",fontFamily:"inherit",fontSize:"0.82rem",fontWeight:page==="lernportal"?"bold":"normal",display:"flex",alignItems:"center",gap:"0.4rem"}}>
            <Icon name="book" size={14}/>Lernportal
          </button>
          <button onClick={()=>setPage("pruefung")} className="navbtn" style={{padding:"0.5rem 1rem",borderRadius:"8px",border:"none",background:page==="pruefung"?"#eab308":"transparent",color:page==="pruefung"?"#000":"#555",cursor:"pointer",fontFamily:"inherit",fontSize:"0.82rem",fontWeight:page==="pruefung"?"bold":"normal",display:"flex",alignItems:"center",gap:"0.4rem"}}>
            <Icon name="pruefung" size={14}/>Prüfung erstellen
          </button>
          <button onClick={()=>setPage("abfrage")} className="navbtn" style={{padding:"0.5rem 1rem",borderRadius:"8px",border:"none",background:page==="abfrage"?"#a855f7":"transparent",color:page==="abfrage"?"#fff":"#555",cursor:"pointer",fontFamily:"inherit",fontSize:"0.82rem",fontWeight:page==="abfrage"?"bold":"normal",display:"flex",alignItems:"center",gap:"0.4rem"}}>
            <Icon name="quiz" size={14}/>Abfrage-Modus
          </button>
          <div style={{width:"1px",height:"20px",background:"#1e1e1e",margin:"0 0.2rem"}}/>
          <button onClick={loadItems} style={{background:"none",border:"1px solid #1e1e1e",borderRadius:"8px",padding:"0.45rem 0.8rem",color:"#555",cursor:"pointer",fontSize:"0.78rem",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"0.4rem"}}><Icon name="refresh" size={13}/>Sync</button>
          {page==="lernportal"&&<button onClick={()=>setShowUpload(true)} style={{display:"flex",alignItems:"center",gap:"0.45rem",background:"#fff",color:"#000",border:"none",borderRadius:"8px",padding:"0.5rem 1rem",fontSize:"0.82rem",fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"}}><Icon name="plus" size={14}/>Hinzufügen</button>}
        </div>
      </div>

      {/* Body */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* Sidebar – nur im Lernportal */}
        {page==="lernportal"&&(
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
                {/* Prüfung Button in Sidebar */}
                <button onClick={()=>setPage("pruefung")} className="sbtn" style={{display:"flex",alignItems:"center",gap:"0.45rem",padding:"0.4rem 0.65rem",borderRadius:"6px",border:"none",background:"transparent",color:"#4a4a4a",cursor:"pointer",fontSize:"0.8rem",fontFamily:"inherit"}}>
                  <Icon name="pruefung" size={12}/><span>Prüfung erstellen</span>
                </button>
                <button onClick={()=>setPage("abfrage")} className="sbtn" style={{display:"flex",alignItems:"center",gap:"0.45rem",padding:"0.4rem 0.65rem",borderRadius:"6px",border:"none",background:"transparent",color:"#4a4a4a",cursor:"pointer",fontSize:"0.8rem",fontFamily:"inherit"}}>
                  <Icon name="quiz" size={12}/><span>Abfrage-Modus</span>
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
        )}

        {/* Prüfungs-Generator Seite */}
        {page==="pruefung" && <PruefungsGenerator items={items}/>}
        {page==="abfrage" && <AbfrageModus items={items}/>}

        {/* Lernportal Seite */}
        {page==="lernportal" && (
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
                        {videos.length>0&&<span style={{fontSize:"0.56rem",color:"#ef4444",background:"#ef444410",padding:"0.16rem 0.45rem",borderRadius:"4px",border:"1px solid #ef444422",fontWeight:"bold"}}>🎬{videos.length}</span>}
                      </div>
                      <div onClick={()=>setSelected(item)} style={{fontFamily:"'Courier New',monospace",fontSize:"0.9rem",fontWeight:"bold",color:"#e0e0e0",marginBottom:"0.4rem",lineHeight:1.35}}>{item.title}</div>
                      <div onClick={()=>setSelected(item)} style={{fontSize:"0.74rem",color:"#4a4a4a",lineHeight:"1.6",fontFamily:"'Courier New',monospace"}}>{preview}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.85rem",paddingTop:"0.65rem",borderTop:`1px solid ${col.badge}10`}}>
                        <div style={{display:"flex",gap:"0.25rem",flexWrap:"wrap"}}>
                          <button onClick={e=>{e.stopPropagation();setKiItem(item);}} title="KI Hilfe" style={{background:`${col.badge}12`,border:`1px solid ${col.badge}30`,borderRadius:"5px",padding:"0.2rem 0.4rem",cursor:"pointer",color:col.badge,fontSize:"0.65rem",fontWeight:"bold"}}>🤖</button>
                          <button onClick={e=>{e.stopPropagation();setYoutubeItem(item);}} title="Videos" style={{background:"#ef444412",border:"1px solid #ef444430",borderRadius:"5px",padding:"0.2rem 0.4rem",cursor:"pointer",color:"#ef4444",fontSize:"0.65rem"}}>🎬</button>
                          {item.type==="text"&&<>
                            <button onClick={e=>{e.stopPropagation();generatePDF(item);}} style={{background:"none",border:"1px solid #3a1a1a",borderRadius:"5px",padding:"0.2rem 0.4rem",cursor:"pointer",color:"#ef4444",fontSize:"0.65rem"}}><Icon name="pdf" size={10}/></button>
                            <button onClick={e=>{e.stopPropagation();generateDOCX(item);}} style={{background:"none",border:"1px solid #1a2a3a",borderRadius:"5px",padding:"0.2rem 0.4rem",cursor:"pointer",color:"#3b82f6",fontSize:"0.65rem"}}><Icon name="word" size={10}/></button>
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
        )}
      </div>

      {showUpload&&<UploadModal onClose={()=>setShowUpload(false)} onRefresh={loadItems}/>}
      {selected&&<DetailModal item={selected} onClose={()=>setSelected(null)} onDelete={handleDelete} onStar={(id,s)=>{handleStar(id,s);setSelected(p=>p?{...p,starred:s}:null);}} onKI={()=>{setKiItem(selected);setSelected(null);}} onYouTube={()=>{setYoutubeItem(selected);setSelected(null);}}/>}
      {kiItem&&<KIChatModal item={kiItem} onClose={()=>setKiItem(null)}/>}
      {youtubeItem&&<YouTubeModal item={youtubeItem} onClose={()=>setYoutubeItem(null)} onSave={handleYouTubeSave}/>}
    </div>
  );
}
