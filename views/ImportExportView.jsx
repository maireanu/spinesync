import { useState } from "react";
import { T, LBL } from "../constants.js";
import { useWorkout } from "../context.jsx";

export default function ImportExportView() {
  const { exercises, setExercises, schedule, setSchedule, workoutLog, setWorkoutLog } = useWorkout();
  const [importText,setImportText] = useState("");
  const [status,setStatus] = useState("");
  const [lastBackup, setLastBackup] = useState(() => { try { return localStorage.getItem("pt_last_backup"); } catch { return null; } });
  const daysSinceBackup = lastBackup ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000) : null;
  const showBackupWarning = daysSinceBackup === null || daysSinceBackup > 30;

  const handleExport = () => {
    const data={ exercises, schedule, workoutLog, version:"3.0", exported:new Date().toISOString() };
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="pt-exercises.json"; a.click();
    URL.revokeObjectURL(url);
    const now = new Date().toISOString();
    try { localStorage.setItem("pt_last_backup", now); } catch {}
    setLastBackup(now);
    setStatus("✅ Downloaded!");
  };

  const handleImport = () => {
    if (importText.length > 2 * 1024 * 1024) { setStatus("❌ File too large (max 2 MB)."); return; }
    try {
      const data=JSON.parse(importText);
      // Validate shape
      const errors = [];
      if (data.exercises && typeof data.exercises !== "object") errors.push("exercises must be an object");
      if (data.exercises) {
        for (const [cat, list] of Object.entries(data.exercises)) {
          if (!Array.isArray(list)) { errors.push(`exercises.${cat} must be an array`); continue; }
          for (const ex of list) {
            if (!ex.id || !ex.name) errors.push(`exercise in ${cat} missing id or name`);
          }
        }
      }
      if (data.schedule && typeof data.schedule !== "object") errors.push("schedule must be an object");
      if (data.schedule) {
        for (const [day, groups] of Object.entries(data.schedule)) {
          if (!Array.isArray(groups)) { errors.push(`schedule.${day} must be an array`); continue; }
          for (const g of groups) {
            if (!g.id || !g.name || !Array.isArray(g.exercises)) errors.push(`group in ${day} missing id, name, or exercises`);
          }
        }
      }
      if (data.workoutLog && !Array.isArray(data.workoutLog)) errors.push("workoutLog must be an array");
      if (errors.length > 0) { setStatus(`❌ Invalid data:\n${errors.slice(0,5).join("\n")}${errors.length>5?`\n...and ${errors.length-5} more`:""}`); return; }
      if (!data.exercises && !data.schedule && !data.workoutLog) { setStatus("❌ No exercises, schedule, or workoutLog found in JSON."); return; }
      if(data.exercises) setExercises(data.exercises);
      if(data.schedule) setSchedule(data.schedule);
      if(data.workoutLog) setWorkoutLog(data.workoutLog);
      setStatus("✅ Imported!"); setImportText("");
    } catch { setStatus("❌ Invalid JSON."); }
  };

  const TA={ width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,padding:12,color:T.text,fontSize:12,fontFamily:"monospace",resize:"vertical",outline:"none",boxSizing:"border-box",lineHeight:1.6 };

  return (
    <div>
      <h2 style={{ margin:"0 0 6px",fontSize:24,color:T.text,fontWeight:900,letterSpacing:"-0.5px" }}>Import / Export</h2>
      <p style={{ color:T.textMuted,fontSize:14,marginBottom:14,lineHeight:1.6 }}>Human-readable JSON. Edit in any text editor, store on Google Drive, share with your therapist.</p>

      {showBackupWarning && (
        <div style={{ background:T.amber+"14",border:`1px solid ${T.amber}44`,borderRadius:12,padding:"10px 14px",marginBottom:14,fontSize:13,color:T.amber,fontWeight:600 }}>
          ⚠️ {lastBackup ? `Last backup was ${daysSinceBackup} day${daysSinceBackup!==1?"s":""} ago.` : "No backup found."} Download a copy to keep your data safe.
        </div>
      )}
      {!showBackupWarning && lastBackup && (
        <div style={{ fontSize:12,color:T.textMuted,marginBottom:14 }}>
          ✅ Last backup: {new Date(lastBackup).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
        </div>
      )}

      <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:18,marginBottom:12,boxShadow:T.shadow }}>
        <h3 style={{ margin:"0 0 8px",color:T.accent,fontSize:15,fontWeight:800 }}>📤 Export</h3>
        <p style={{ color:T.textSec,fontSize:13,margin:"0 0 14px",lineHeight:1.6 }}>Your full exercise library, schedule, and workout history.</p>
        <button onClick={handleExport} style={{ background:T.accent,border:"none",borderRadius:9,color:"#fff",padding:"10px 20px",cursor:"pointer",fontWeight:800,fontSize:14 }}>Download pt-exercises.json</button>
      </div>

      <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:18,marginBottom:12,boxShadow:T.shadow }}>
        <h3 style={{ margin:"0 0 8px",color:T.blue,fontSize:15,fontWeight:800 }}>📥 Import</h3>
        <textarea style={{ ...TA,height:120 }} value={importText} onChange={e=>setImportText(e.target.value)} placeholder="Paste JSON here..." />
        <button onClick={handleImport} style={{ background:T.blue,border:"none",borderRadius:9,color:"#fff",padding:"9px 20px",cursor:"pointer",fontWeight:800,fontSize:14,marginTop:8 }}>Import</button>
      </div>

      {status&&<div style={{ background:status.startsWith("✅")?T.accent+"0a":T.red+"0a",border:`1px solid ${status.startsWith("✅")?T.accent:T.red}`,borderRadius:9,padding:"10px 14px",fontSize:14,color:status.startsWith("✅")?T.accent:T.red,marginBottom:12,whiteSpace:"pre-wrap" }}>{status}</div>}

      <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:18,boxShadow:T.shadow }}>
        <div style={LBL}>Format Reference (v3)</div>
        <pre style={{ ...TA,height:180,overflow:"auto",margin:0,color:T.accent }}>{`{
  "exercises": {
    "muscle": [{
      "id": "mu2",
      "name": "Dumbbell Curl",
      "weight": "8",
      "weightUnit": "kg",  // kg | lbs | band | bodyweight | ""
      "notes": "My personal cue...",
      ...
    }]
  },
  "schedule": {
    "Mon": [{
      "id": "g1", "name": "Strength",
      "color": "#f87171",
      "exercises": [...]
    }]
  }
}`}</pre>
      </div>
    </div>
  );
}
