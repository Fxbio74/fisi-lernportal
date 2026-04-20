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

const Icon = ({ name, size=18 }) => {
  const p = { fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    upload:   <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    search:   <svg width={size} height={size} viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    trash:    <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    book:     <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    close:    <svg width={size} height={size} viewBox="0 0 24 24" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus:     <svg width={size} height={size} viewBox="0 0 24 24" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    star:     <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    check:    <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    eye:      <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    refresh:  <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  };
  return icons[name] || null;
};

function SetupBanner() {
  return (
    <div style={{ minHeight:"100vh", background:"#070707", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div style={{ maxWidth:"580px", width:"100%", background:"#0d0d0d", border:"1px solid #2a2a2a", borderRadius:"16px", padding:"2.5rem" }}>
        <div style={{ fontSize:"2.5rem", textAlign:"center", marginBottom:"1rem" }}>⚙️</div>
        <div style={{ fontFamily:"'Courier New',monospace", fontSize:"1.3rem", fontWeight:"bold", color:"#fff", textAlign:"center", marginBottom:"0.5rem" }}>Supabase Setup nötig</div>
        <div style={{ fontSize:"0.85rem", color:"#666", textAlign:"center", marginBottom:"2rem" }}>Trage deine Supabase-Schluessel in Vercel ein</div>
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {[
            "1. supabase.com → New Project anlegen",
            "2. Project Settings → API → URL + anon key kopieren",
            "3. Vercel → dein Projekt → Settings → Environment Variables",
            "4. VITE_SUPABASE_URL = deine Project URL",
            "5. VITE_SUPABASE_ANON_KEY = dein anon/public key",
            "6. Vercel → Redeploy → fertig!",
          ].map((t,i) => (
            <div key={i} style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
              <div style={{ width:"28px", height:"28px", background:"#2E75B6", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"0.8rem", fontWeight:"bold", color:"#fff" }}>{i+1}</div>
              <div style={{ fontSize:"0.85rem", color:"#aaa" }}>{t}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:"2rem", background:"#0a1a0a", border:"1px solid #1a3a1a", borderRadius:"8px", padding:"1rem", fontSize:"0.78rem", color:"#4a8a5a" }}>
          💡 Vollstaendige Anleitung: Schau in die Word-Datei "FISI_Supabase_Anleitung.docx"
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose, onRefresh }) {
  const [tab, setTab] = useState("text");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Netzwerke");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const inp = { width:"100%", background:"#0f0f0f", border:"1px solid #222", borderRadius:"8px", padding:"0.7rem 1rem", color:"#ddd", fontSize:"0.88rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit" };
  const lbl = { fontSize:"0.62rem", letterSpacing:"0.18em", color:"#555", display:"block", marginBottom:"0.4rem", fontWeight:"600" };

  const handleSave = async () => {
    if (!title.trim()) return setError("Bitte Titel eingeben!");
    if (tab==="text" && !content.trim()) return setError("Bitte Inhalt eingeben!");
    if (tab==="file" && !file) return setError("Bitte Datei auswaehlen!");
    setError(""); setUploading(true);
    try {
      let file_path=null, file_name=null, file_size=null, file_type=null;
      if (tab==="file" && file) {
        const path = `${Date.now()}_${file.name.replace(/\s+/g,"_")}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
        if (upErr) throw upErr;
        file_path=path; file_name=file.name; file_size=file.size; file_type=file.name.split(".").pop().toLowerCase();
      }
      const { error: dbErr } = await supabase.from(TABLE).insert({
        title:title.trim(), category,
        content: tab==="text"?content.trim():null,
        tags: tags.split(",").map(t=>t.trim()).filter(Boolean),
        author: author.trim()||"Anonym",
        file_path, file_name, file_size, file_type,
        type: tab, starred: false,
      });
      if (dbErr) throw dbErr;
      setDone(true);
      setTimeout(() => { onRefresh(); onClose(); }, 1000);
    } catch(e) { setError("Fehler: "+e.message); }
    setUploading(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", backdropFilter:"blur(10px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#0a0a0a", border:"1px solid #1e1e1e", borderRadius:"16px", width:"100%", maxWidth:"700px", maxHeight:"93vh", overflow:"auto" }}>
        <div style={{ padding:"1.25rem 1.75rem", borderBottom:"1px solid #141414", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"#0a0a0a", zIndex:10 }}>
          <div style={{ fontSize:"1.1rem", fontWeight:"bold", fontFamily:"'Courier New',monospace" }}>Neuer Eintrag</div>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #1e1e1e", borderRadius:"7px", padding:"0.4rem", cursor:"pointer", color:"#555" }}><Icon name="close" size={17}/></button>
        </div>
        <div style={{ padding:"1.5rem 1.75rem", display:"flex", flexDirection:"column", gap:"1.1rem" }}>
          <div style={{ display:"flex", background:"#0f0f0f", borderRadius:"10px", padding:"4px", border:"1px solid #1a1a1a" }}>
            {[["text","📝 Textzusammenfassung"],["file","📎 Datei hochladen"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"0.5rem", borderRadius:"7px", border:"none", background:tab===id?"#fff":"transparent", color:tab===id?"#000":"#666", fontSize:"0.83rem", fontWeight:tab===id?"bold":"normal", cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}>{label}</button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 140px", gap:"1rem" }}>
            <div><label style={lbl}>TITEL *</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="z.B. VLANs Zusammenfassung" style={inp}/></div>
            <div><label style={lbl}>DEIN NAME</label><input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Fabio" style={inp}/></div>
          </div>
          <div>
            <label style={lbl}>KATEGORIE</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
              {CATEGORIES.map(cat => { const a=category===cat; const c=CAT_COLORS[cat]; return (
                <button key={cat} onClick={()=>setCategory(cat)} style={{ padding:"0.35rem 0.8rem", borderRadius:"20px", fontSize:"0.78rem", border:a?`1px solid ${c.badge}`:"1px solid #1e1e1e", background:a?`${c.badge}18`:"transparent", color:a?c.badge:"#555", cursor:"pointer", fontFamily:"inherit" }}>{cat}</button>
              );})}
            </div>
          </div>
          {tab==="text" && (
            <div><label style={lbl}>INHALT *</label>
              <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder={"Zusammenfassung eingeben...\nTipp: Direkt aus dem Chat kopieren!"} rows={10} style={{ ...inp, fontFamily:"'Courier New',monospace", lineHeight:"1.7", resize:"vertical", color:"#bbb" }}/>
            </div>
          )}
          {tab==="file" && (
            <div>
              <label style={lbl}>DATEI *</label>
              <div onClick={()=>fileRef.current.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)setFile(f);}}
                style={{ border:"2px dashed #2a2a2a", borderRadius:"12px", padding:"2.5rem", textAlign:"center", cursor:"pointer", background:"#0a0a0a" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#444"} onMouseLeave={e=>e.currentTarget.style.borderColor="#2a2a2a"}>
                {file ? (
                  <div>
                    <div style={{ fontSize:"2.5rem", marginBottom:"0.5rem" }}>{getFileInfo(file.name).icon}</div>
                    <div style={{ color:"#fff", fontSize:"0.9rem", fontWeight:"bold" }}>{file.name}</div>
                    <div style={{ color:"#555", fontSize:"0.75rem", marginTop:"0.25rem" }}>{formatBytes(file.size)}</div>
                    <button onClick={e=>{e.stopPropagation();setFile(null);}} style={{ marginTop:"0.75rem", background:"none", border:"1px solid #333", borderRadius:"6px", padding:"0.3rem 0.8rem", color:"#888", fontSize:"0.75rem", cursor:"pointer" }}>Andere Datei</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize:"2.5rem", marginBottom:"0.5rem" }}>📁</div>
                    <div style={{ color:"#666", fontSize:"0.88rem" }}>Datei hierher ziehen oder klicken</div>
                    <div style={{ color:"#444", fontSize:"0.75rem", marginTop:"0.4rem" }}>PDF, Word, PowerPoint, Excel, Bilder...</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" style={{ display:"none" }} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg" onChange={e=>setFile(e.target.files[0])}/>
            </div>
          )}
          <div><label style={lbl}>TAGS (kommagetrennt)</label><input value={tags} onChange={e=>setTags(e.target.value)} placeholder="VLAN, Prüfung..." style={inp}/></div>
          {error && <div style={{ background:"#1a0a0a", border:"1px solid #7b2d2d", borderRadius:"8px", padding:"0.75rem 1rem", color:"#e57373", fontSize:"0.82rem" }}>{error}</div>}
          <button onClick={handleSave} disabled={uploading||done} style={{ padding:"0.9rem", borderRadius:"10px", background:done?"#0a1a0a":(!title.trim()||uploading?"#141414":"#fff"), border:done?"1px solid #22c55e":"none", color:done?"#22c55e":(!title.trim()||uploading?"#333":"#000"), fontSize:"0.85rem", fontWeight:"bold", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
            {done?<><Icon name="check" size={15}/>GESPEICHERT!</>:uploading?(tab==="file"?"WIRD HOCHGELADEN...":"WIRD GESPEICHERT..."):<><Icon name="upload" size={15}/>{tab==="file"?"DATEI HOCHLADEN":"SPEICHERN"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ item, onClose, onDelete, onStar }) {
  const [downloading, setDownloading] = useState(false);
  const col = CAT_COLORS[item.category]||CAT_COLORS["Sonstiges"];
  const fileInfo = item.file_name ? getFileInfo(item.file_name) : null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage.from(BUCKET).download(item.file_path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a"); a.href=url; a.download=item.file_name; a.click(); URL.revokeObjectURL(url);
    } catch(e) { alert("Fehler: "+e.message); }
    setDownloading(false);
  };

  const handleView = async () => {
    const { data } = await supabase.storage.from(BUCKET).getPublicUrl(item.file_path);
    window.open(data.publicUrl, "_blank");
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.93)", backdropFilter:"blur(12px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#080808", border:`1px solid ${col.badge}30`, borderRadius:"16px", width:"100%", maxWidth:"780px", maxHeight:"93vh", overflow:"auto" }}>
        <div style={{ padding:"1.25rem 1.75rem", borderBottom:`1px solid ${col.badge}18`, background:`linear-gradient(135deg,${col.bg}bb,#080808)`, position:"sticky", top:0, zIndex:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem" }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:"0.5rem", marginBottom:"0.4rem", flexWrap:"wrap" }}>
                <span style={{ fontSize:"0.58rem", letterSpacing:"0.2em", color:col.badge, background:`${col.badge}12`, padding:"0.18rem 0.5rem", borderRadius:"4px", border:`1px solid ${col.badge}25`, fontWeight:"bold" }}>{item.category.toUpperCase()}</span>
                {fileInfo&&<span style={{ fontSize:"0.58rem", letterSpacing:"0.15em", color:fileInfo.color, background:`${fileInfo.color}12`, padding:"0.18rem 0.5rem", borderRadius:"4px", border:`1px solid ${fileInfo.color}25`, fontWeight:"bold" }}>{fileInfo.icon} {fileInfo.label}</span>}
              </div>
              <div style={{ fontSize:"1.2rem", fontWeight:"bold", color:"#eee", fontFamily:"'Courier New',monospace", lineHeight:1.3 }}>{item.title}</div>
              <div style={{ fontSize:"0.7rem", color:"#444", marginTop:"0.3rem" }}>von {item.author} · {new Date(item.created_at).toLocaleDateString("de-DE",{day:"2-digit",month:"long",year:"numeric"})}{item.file_size?` · ${formatBytes(item.file_size)}`:""}</div>
            </div>
            <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap", justifyContent:"flex-end" }}>
              {item.type==="file"&&<>
                <button onClick={handleView} style={{ background:"none", border:"1px solid #1a3a1a", borderRadius:"7px", padding:"0.4rem 0.7rem", cursor:"pointer", color:"#22c55e", fontSize:"0.75rem", display:"flex", alignItems:"center", gap:"0.3rem", fontFamily:"inherit" }}><Icon name="eye" size={13}/>Ansehen</button>
                <button onClick={handleDownload} disabled={downloading} style={{ background:"none", border:"1px solid #1a2a3a", borderRadius:"7px", padding:"0.4rem 0.7rem", cursor:"pointer", color:"#3b82f6", fontSize:"0.75rem", display:"flex", alignItems:"center", gap:"0.3rem", fontFamily:"inherit" }}><Icon name="download" size={13}/>{downloading?"...":"Download"}</button>
              </>}
              <button onClick={()=>onStar(item.id,!item.starred)} style={{ background:"none", border:"1px solid #1a1a1a", borderRadius:"7px", padding:"0.4rem", cursor:"pointer", color:item.starred?"#f5c518":"#444" }}><Icon name="star" size={14}/></button>
              <button onClick={()=>{onDelete(item.id,item.file_path);onClose();}} style={{ background:"none", border:"1px solid #1a1a1a", borderRadius:"7px", padding:"0.4rem", cursor:"pointer", color:"#444" }} onMouseEnter={e=>e.currentTarget.style.color="#ef4444"} onMouseLeave={e=>e.currentTarget.style.color="#444"}><Icon name="trash" size={14}/></button>
              <button onClick={onClose} style={{ background:"none", border:"1px solid #1a1a1a", borderRadius:"7px", padding:"0.4rem", cursor:"pointer", color:"#444" }} onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="#444"}><Icon name="close" size={14}/></button>
            </div>
          </div>
          {item.tags?.length>0&&<div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem", marginTop:"0.65rem" }}>{item.tags.map(t=><span key={t} style={{ fontSize:"0.65rem", color:"#666", background:"#0f0f0f", padding:"0.12rem 0.4rem", borderRadius:"4px", border:"1px solid #1a1a1a" }}>#{t}</span>)}</div>}
        </div>
        <div style={{ padding:"1.75rem" }}>
          {item.type==="text" ? (
            <div style={{ fontFamily:"'Courier New',monospace", fontSize:"0.87rem", color:"#b0b0b0", lineHeight:"1.9", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{item.content}</div>
          ) : (
            <div style={{ textAlign:"center", padding:"3rem 1rem" }}>
              <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>{fileInfo?.icon||"📎"}</div>
              <div style={{ fontSize:"1rem", color:"#aaa", fontWeight:"bold", marginBottom:"0.5rem" }}>{item.file_name}</div>
              <div style={{ fontSize:"0.8rem", color:"#555", marginBottom:"2rem" }}>{formatBytes(item.file_size)}</div>
              <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={handleView} style={{ display:"flex", alignItems:"center", gap:"0.5rem", background:"#0a1a0a", border:"1px solid #22c55e", borderRadius:"10px", padding:"0.75rem 1.5rem", color:"#22c55e", fontSize:"0.85rem", cursor:"pointer", fontFamily:"inherit" }}><Icon name="eye" size={16}/>Im Browser oeffnen</button>
                <button onClick={handleDownload} disabled={downloading} style={{ display:"flex", alignItems:"center", gap:"0.5rem", background:"#0a1228", border:"1px solid #3b82f6", borderRadius:"10px", padding:"0.75rem 1.5rem", color:"#3b82f6", fontSize:"0.85rem", cursor:"pointer", fontFamily:"inherit" }}><Icon name="download" size={16}/>{downloading?"Wird geladen...":"Herunterladen"}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Alle");
  const [filterType, setFilterType] = useState("Alle");
  const [filterStarred, setFilterStarred] = useState(false);
  const [toast, setToast] = useState(null);

  if (!supabase) return <SetupBanner />;

  const showToast = (msg,type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const loadItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(TABLE).select("*").order("created_at",{ascending:false});
    if (!error) setItems(data||[]);
    else showToast("Fehler: "+error.message,"err");
    setLoading(false);
  };

  useEffect(()=>{ loadItems(); },[]);

  const handleDelete = async (id,filePath) => {
    if (filePath) await supabase.storage.from(BUCKET).remove([filePath]);
    await supabase.from(TABLE).delete().eq("id",id);
    setItems(p=>p.filter(i=>i.id!==id));
    showToast("Geloescht.","err");
  };
  const handleStar = async (id,starred) => {
    await supabase.from(TABLE).update({starred}).eq("id",id);
    setItems(p=>p.map(i=>i.id===id?{...i,starred}:i));
  };

  const filtered = items.filter(i=>{
    const q=search.toLowerCase();
    return (!q||[i.title,i.content||"",...(i.tags||[]),i.author].some(x=>x?.toLowerCase().includes(q)))
      &&(filterCat==="Alle"||i.category===filterCat)
      &&(filterType==="Alle"||i.type===filterType)
      &&(!filterStarred||i.starred);
  });

  const counts = CATEGORIES.reduce((a,c)=>{a[c]=items.filter(i=>i.category===c).length;return a;},{});
  const textCount=items.filter(i=>i.type==="text").length;
  const fileCount=items.filter(i=>i.type==="file").length;

  return (
    <div style={{ minHeight:"100vh", background:"#070707", color:"#fff", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0c0c0c}::-webkit-scrollbar-thumb{background:#252525;border-radius:3px}.card{transition:transform .18s,box-shadow .18s;cursor:pointer}.card:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.5)}.sbtn{transition:all .15s}.sbtn:hover{color:#ccc!important;background:#111!important}body{margin:0;padding:0;background:#070707}`}</style>
      {toast&&<div style={{ position:"fixed",top:"1.25rem",right:"1.25rem",zIndex:200,background:toast.type==="err"?"#120808":"#081408",border:`1px solid ${toast.type==="err"?"#7b2d2d":"#2d7b4a"}`,borderRadius:"10px",padding:"0.65rem 1.1rem",color:toast.type==="err"?"#e57373":"#66bb6a",fontSize:"0.8rem",animation:"slideDown .25s ease",display:"flex",alignItems:"center",gap:"0.5rem" }}><Icon name={toast.type==="err"?"trash":"check"} size={12}/>{toast.msg}</div>}
      <div style={{ borderBottom:"1px solid #111",background:"#090909",padding:"1rem 1.75rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap",position:"sticky",top:0,zIndex:50 }}>
        <div style={{ display:"flex",alignItems:"center",gap:"0.9rem" }}>
          <div style={{ width:"36px",height:"36px",background:"#fff",borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon name="book" size={19}/></div>
          <div>
            <div style={{ fontFamily:"'Courier New',monospace",fontSize:"1.05rem",fontWeight:"bold" }}>FISI Lernportal</div>
            <div style={{ fontSize:"0.6rem",color:"#444",letterSpacing:"0.1em" }}>IHK HEILBRONN · {items.length} EINTRAEGE · {textCount} TEXTE · {fileCount} DATEIEN</div>
          </div>
        </div>
        <div style={{ display:"flex",gap:"0.5rem" }}>
          <button onClick={loadItems} style={{ background:"none",border:"1px solid #1e1e1e",borderRadius:"8px",padding:"0.5rem 0.8rem",color:"#555",cursor:"pointer",fontSize:"0.78rem",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"0.4rem" }}><Icon name="refresh" size={13}/>Sync</button>
          <button onClick={()=>setShowUpload(true)} style={{ display:"flex",alignItems:"center",gap:"0.45rem",background:"#fff",color:"#000",border:"none",borderRadius:"8px",padding:"0.55rem 1.1rem",fontSize:"0.82rem",fontWeight:"bold",cursor:"pointer",fontFamily:"inherit" }}><Icon name="plus" size={14}/>HINZUFUEGEN</button>
        </div>
      </div>
      <div style={{ display:"flex",minHeight:"calc(100vh - 64px)" }}>
        <div style={{ width:"200px",flexShrink:0,borderRight:"1px solid #0f0f0f",padding:"1.1rem 0.65rem",display:"flex",flexDirection:"column",gap:"2px" }}>
          <div style={{ fontSize:"0.58rem",color:"#3a3a3a",letterSpacing:"0.18em",marginBottom:"0.45rem",padding:"0 0.5rem" }}>TYP</div>
          {[["Alle","Alle",items.length],["text","📝 Texte",textCount],["file","📎 Dateien",fileCount]].map(([val,label,count])=>(
            <button key={val} onClick={()=>setFilterType(val)} className="sbtn" style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0.65rem",borderRadius:"6px",border:"none",background:filterType===val?"#1a1a1a":"transparent",color:filterType===val?"#fff":"#4a4a4a",cursor:"pointer",fontSize:"0.8rem",fontFamily:"inherit",textAlign:"left" }}>
              <span>{label}</span>{count>0&&<span style={{ fontSize:"0.62rem",background:"#0f0f0f",padding:"0.08rem 0.35rem",borderRadius:"4px",color:"#444" }}>{count}</span>}
            </button>
          ))}
          <div style={{ height:"1px",background:"#0f0f0f",margin:"0.5rem 0" }}/>
          <div style={{ fontSize:"0.58rem",color:"#3a3a3a",letterSpacing:"0.18em",marginBottom:"0.45rem",padding:"0 0.5rem" }}>KATEGORIEN</div>
          {["Alle",...CATEGORIES].map(cat=>{
            const count=cat==="Alle"?items.length:(counts[cat]||0);
            const active=filterCat===cat; const col=CAT_COLORS[cat];
            return <button key={cat} onClick={()=>setFilterCat(cat)} className="sbtn" style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0.65rem",borderRadius:"6px",border:"none",background:active?(cat==="Alle"?"#1a1a1a":`${col?.badge}15`):"transparent",color:active?(cat==="Alle"?"#fff":col?.badge):"#4a4a4a",cursor:"pointer",fontSize:"0.8rem",fontFamily:"inherit",textAlign:"left",borderLeft:active&&cat!=="Alle"?`2px solid ${col?.badge}`:"2px solid transparent" }}>
              <span>{cat}</span>{count>0&&<span style={{ fontSize:"0.62rem",background:"#0f0f0f",padding:"0.08rem 0.35rem",borderRadius:"4px",color:"#444" }}>{count}</span>}
            </button>;
          })}
          <div style={{ height:"1px",background:"#0f0f0f",margin:"0.5rem 0" }}/>
          <button onClick={()=>setFilterStarred(!filterStarred)} className="sbtn" style={{ display:"flex",alignItems:"center",gap:"0.45rem",padding:"0.4rem 0.65rem",borderRadius:"6px",border:"none",background:filterStarred?"#1a150a":"transparent",color:filterStarred?"#f5c518":"#4a4a4a",cursor:"pointer",fontSize:"0.8rem",fontFamily:"inherit",borderLeft:filterStarred?"2px solid #f5c518":"2px solid transparent" }}>
            <Icon name="star" size={12}/><span>Favoriten</span>
          </button>
          <div style={{ marginTop:"auto",padding:"0.75rem 0.5rem",borderTop:"1px solid #0f0f0f" }}>
            {[["Gesamt",items.length],["Texte",textCount],["Dateien",fileCount],["Favoriten",items.filter(i=>i.starred).length]].map(([l,v])=>(
              <div key={l} style={{ display:"flex",justifyContent:"space-between",marginBottom:"0.28rem" }}>
                <span style={{ fontSize:"0.7rem",color:"#3a3a3a" }}>{l}</span>
                <span style={{ fontSize:"0.7rem",color:"#666",fontFamily:"'Courier New',monospace" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex:1,padding:"1.25rem 1.75rem",overflow:"auto",minWidth:0 }}>
          <div style={{ position:"relative",marginBottom:"1.1rem" }}>
            <div style={{ position:"absolute",left:"0.85rem",top:"50%",transform:"translateY(-50%)",color:"#333",pointerEvents:"none" }}><Icon name="search" size={14}/></div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Suchen nach Titel, Inhalt, Tags..." style={{ width:"100%",background:"#0d0d0d",border:"1px solid #181818",borderRadius:"9px",padding:"0.7rem 1rem 0.7rem 2.4rem",color:"#bbb",fontSize:"0.86rem",outline:"none",fontFamily:"inherit" }}/>
          </div>
          {loading&&<div style={{ textAlign:"center",padding:"5rem",color:"#2a2a2a",fontSize:"0.75rem",letterSpacing:"0.2em",animation:"pulse 1.5s infinite" }}>WIRD GELADEN...</div>}
          {!loading&&filtered.length===0&&(
            <div style={{ textAlign:"center",padding:"5rem 2rem" }}>
              <div style={{ fontSize:"3rem",marginBottom:"1rem" }}>📚</div>
              <div style={{ fontSize:"0.95rem",color:"#3a3a3a" }}>{search||filterCat!=="Alle"||filterType!=="Alle"||filterStarred?"Keine Treffer":"Noch keine Eintraege"}</div>
              {!search&&filterCat==="Alle"&&filterType==="Alle"&&!filterStarred&&(
                <button onClick={()=>setShowUpload(true)} style={{ marginTop:"1.25rem",padding:"0.65rem 1.4rem",background:"#fff",color:"#000",border:"none",borderRadius:"9px",cursor:"pointer",fontSize:"0.82rem",fontWeight:"bold",fontFamily:"inherit" }}>Ersten Eintrag hinzufuegen</button>
              )}
            </div>
          )}
          {!loading&&filtered.length>0&&(
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))",gap:"0.9rem" }}>
              {filtered.map(item=>{
                const col=CAT_COLORS[item.category]||CAT_COLORS["Sonstiges"];
                const fi=item.file_name?getFileInfo(item.file_name):null;
                const preview=item.type==="text"?(item.content||"").slice(0,130)+"…":item.file_name;
                return (
                  <div key={item.id} className="card" onClick={()=>setSelected(item)} style={{ background:`linear-gradient(150deg,${col.bg}cc,#0a0a0a)`,border:`1px solid ${col.badge}18`,borderRadius:"12px",padding:"1.1rem",position:"relative",overflow:"hidden" }}>
                    <div style={{ position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,${col.badge},transparent 70%)` }}/>
                    {item.starred&&<div style={{ position:"absolute",top:"0.7rem",right:"0.7rem",color:"#f5c518" }}><Icon name="star" size={12}/></div>}
                    <div style={{ display:"flex",gap:"0.4rem",marginBottom:"0.5rem",flexWrap:"wrap" }}>
                      <span style={{ fontSize:"0.56rem",letterSpacing:"0.18em",color:col.badge,background:`${col.badge}10`,padding:"0.16rem 0.45rem",borderRadius:"4px",border:`1px solid ${col.badge}22`,fontWeight:"bold" }}>{item.category.toUpperCase()}</span>
                      {fi&&<span style={{ fontSize:"0.56rem",letterSpacing:"0.1em",color:fi.color,background:`${fi.color}10`,padding:"0.16rem 0.45rem",borderRadius:"4px",border:`1px solid ${fi.color}22`,fontWeight:"bold" }}>{fi.icon} {fi.label}</span>}
                      {item.type==="text"&&<span style={{ fontSize:"0.56rem",color:"#888",background:"#88888810",padding:"0.16rem 0.45rem",borderRadius:"4px",border:"1px solid #88888822",fontWeight:"bold" }}>📝 TEXT</span>}
                    </div>
                    <div style={{ fontFamily:"'Courier New',monospace",fontSize:"0.9rem",fontWeight:"bold",color:"#e0e0e0",marginBottom:"0.4rem",lineHeight:1.35 }}>{item.title}</div>
                    <div style={{ fontSize:"0.74rem",color:"#4a4a4a",lineHeight:"1.6",fontFamily:"'Courier New',monospace" }}>{preview}</div>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.85rem",paddingTop:"0.65rem",borderTop:`1px solid ${col.badge}10` }}>
                      <div style={{ display:"flex",gap:"0.28rem",flexWrap:"wrap" }}>{(item.tags||[]).slice(0,2).map(t=><span key={t} style={{ fontSize:"0.6rem",color:"#444",background:"#0a0a0a",padding:"0.1rem 0.35rem",borderRadius:"3px",border:"1px solid #141414" }}>#{t}</span>)}</div>
                      <span style={{ fontSize:"0.6rem",color:"#2a2a2a",whiteSpace:"nowrap" }}>{item.author}{item.file_size?` · ${formatBytes(item.file_size)}`:""}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {showUpload&&<UploadModal onClose={()=>setShowUpload(false)} onRefresh={loadItems}/>}
      {selected&&<DetailModal item={selected} onClose={()=>setSelected(null)} onDelete={handleDelete} onStar={(id,s)=>{handleStar(id,s);setSelected(p=>p?{...p,starred:s}:null);}}/>}
    </div>
  );
}
