import { useState } from "react";
import { LBL } from "../constants.js";

export default function ImportExportView({ exercises, setExercises, schedule, setSchedule, workoutLog, setWorkoutLog }) {
  const [importText,setImportText] = useState("");
  const [status,setStatus] = useState("");

  const handleExport = () => {
    const data={ exercises, schedule, workoutLog, version:"3.0", exported:new Date().toISOString() };
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="pt-exercises.json"; a.click();
    URL.revokeObjectURL(url);
    setStatus("✅ Downloaded!");
  };

  const handleImport = () => {
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

  const TA={ width:"100%",background:"#1a1d2e",border:"1px solid #1e2140",borderRadius:9,padding:12,color:"#d1fae5",fontSize:12,fontFamily:"monospace",resize:"vertical",outline:"none",boxSizing:"border-box",lineHeight:1.6 };

  return (
    <div>
      <h2 style={{ margin:"0 0 6px",fontSize:24,color:"#dfe1f9",fontWeight:900,letterSpacing:"-0.5px" }}>Import / Export</h2>
      <p style={{ color:"#5a5f7a",fontSize:14,marginBottom:22,lineHeight:1.6 }}>Human-readable JSON. Edit in any text editor, store on Google Drive, share with your therapist.</p>

      <div style={{ background:"#26293b",border:"1px solid #1e2140",borderRadius:14,padding:18,marginBottom:12 }}>
        <h3 style={{ margin:"0 0 8px",color:"#44e2cd",fontSize:15,fontWeight:800 }}>📤 Export</h3>
        <p style={{ color:"#9399b8",fontSize:13,margin:"0 0 14px",lineHeight:1.6 }}>Your full exercise library, schedule, and workout history.</p>
        <button onClick={handleExport} style={{ background:"#44e2cd",border:"none",borderRadius:9,color:"#071a0f",padding:"10px 20px",cursor:"pointer",fontWeight:800,fontSize:14 }}>Download pt-exercises.json</button>
      </div>

      <div style={{ background:"#26293b",border:"1px solid #1e2140",borderRadius:14,padding:18,marginBottom:12 }}>
        <h3 style={{ margin:"0 0 8px",color:"#5b9cf6",fontSize:15,fontWeight:800 }}>📥 Import</h3>
        <textarea style={{ ...TA,height:120 }} value={importText} onChange={e=>setImportText(e.target.value)} placeholder="Paste JSON here..." />
        <button onClick={handleImport} style={{ background:"#5b9cf6",border:"none",borderRadius:9,color:"#fff",padding:"9px 20px",cursor:"pointer",fontWeight:800,fontSize:14,marginTop:8 }}>Import</button>
      </div>

      {status&&<div style={{ background:status.startsWith("✅")?"#0c1a10":"#1a0c0c",border:`1px solid ${status.startsWith("✅")?"#44e2cd":"#f87171"}`,borderRadius:9,padding:"10px 14px",fontSize:14,color:status.startsWith("✅")?"#44e2cd":"#f87171",marginBottom:12,whiteSpace:"pre-wrap" }}>{status}</div>}

      <div style={{ background:"#26293b",border:"1px solid #1e2140",borderRadius:14,padding:18 }}>
        <div style={LBL}>Format Reference (v3)</div>
        <pre style={{ ...TA,height:180,overflow:"auto",margin:0,color:"#5a9a72" }}>{`{
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
