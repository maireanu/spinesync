import { useState } from "react";
import { T, CATEGORY_META, DIFF_COLOR, WEIGHT_UNITS, INP, LBL } from "../constants.js";
import { uid } from "../helpers.js";
import { Badge, WeightBadge, Modal, ExerciseDetailModal } from "../components/ui.jsx";
import { useWorkout } from "../context.jsx";

function ExerciseForm({ initial, onSave, onCancel }) {
  const [form,setForm] = useState(initial || { name:"",category:"physical_therapy",muscles:"",duration:"",difficulty:"Medium",weight:"",weightUnit:"bodyweight",notes:"",tips:"",image:"" });
  const [urlError, setUrlError] = useState("");
  const set = (k,v) => { setForm(f=>({...f,[k]:v})); if (k==="image") setUrlError(""); };
  const hasWeight = form.weightUnit !== "bodyweight" && form.weightUnit !== "band" && form.weightUnit !== "";

  const validateAndSave = () => {
    if (form.image && !form.image.startsWith("https://")) {
      setUrlError("Image URL must start with https://");
      return;
    }
    onSave({...form,muscles:typeof form.muscles==="string"?form.muscles.split(",").map(m=>m.trim()).filter(Boolean):form.muscles,id:form.id||(form.category.slice(0,2)+uid())});
  };

  return (
    <div>
      <label style={LBL}>Name</label>
      <input style={INP} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Dumbbell Curl" />

      <label style={LBL}>Category</label>
      <select style={INP} value={form.category} onChange={e=>set("category",e.target.value)}>
        {Object.entries(CATEGORY_META).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
      </select>

      <div style={{ display:"flex",gap:10 }}>
        <div style={{ flex:2 }}>
          <label style={LBL}>Duration / Sets</label>
          <input style={INP} value={form.duration} onChange={e=>set("duration",e.target.value)} placeholder="e.g. 3×12 reps" />
        </div>
        <div style={{ flex:1 }}>
          <label style={LBL}>Difficulty</label>
          <select style={INP} value={form.difficulty} onChange={e=>set("difficulty",e.target.value)}>
            {["Easy","Medium","Hard"].map(d=><option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Weight section */}
      <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:11,padding:14,marginBottom:12 }}>
        <div style={LBL}>⚖ Weight / Load</div>
        <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
          <select style={{ ...INP,marginBottom:0,flex:"1 1 110px" }} value={form.weightUnit} onChange={e=>set("weightUnit",e.target.value)}>
            {WEIGHT_UNITS.map(u=><option key={u} value={u}>{u}</option>)}
            <option value="">none</option>
          </select>
          {hasWeight && (
            <input style={{ ...INP,marginBottom:0,flex:"1 1 80px" }} type="number" min={0} step={0.5} value={form.weight} onChange={e=>set("weight",e.target.value)} placeholder="e.g. 10" />
          )}
          {hasWeight && <span style={{ color:T.textMuted,fontSize:13 }}>{form.weightUnit}</span>}
        </div>
        <div style={{ fontSize:11,color:T.textMuted,marginTop:6 }}>Used for tracking and display. Set to "bodyweight" or "band" if no specific weight.</div>
      </div>

      <label style={LBL}>Muscles (comma-separated)</label>
      <input style={INP} value={form.muscles} onChange={e=>set("muscles",e.target.value)} placeholder="e.g. Quadriceps, VMO" />

      <label style={LBL}>Tips / How To</label>
      <textarea style={{ ...INP,height:86,resize:"vertical" }} value={form.tips} onChange={e=>set("tips",e.target.value)} placeholder="Step-by-step instructions..." />

      <label style={LBL}>Personal Notes (optional)</label>
      <textarea style={{ ...INP,height:60,resize:"vertical" }} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Your own cues, modifications, progress notes..." />

      <label style={LBL}>Image / GIF URL (optional)</label>
      <input style={INP} value={form.image} onChange={e=>set("image",e.target.value)} placeholder="https://..." />
      {urlError && <div style={{ fontSize:12,color:"#ef4444",marginBottom:8,marginTop:-6 }}>{urlError}</div>}

      <div style={{ display:"flex",gap:10,marginTop:6 }}>
        <button onClick={validateAndSave} style={{ flex:1,background:T.blue,border:"none",borderRadius:10,color:"#fff",padding:11,cursor:"pointer",fontWeight:800,fontSize:14 }}>Save</button>
        <button onClick={onCancel} style={{ flex:1,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,color:T.textSec,padding:11,cursor:"pointer",fontSize:14 }}>Cancel</button>
      </div>
    </div>
  );
}

export default function ExercisesView() {
  const { exercises, setExercises } = useWorkout();
  const [activeCategory,setActiveCategory] = useState("physical_therapy");
  const [showForm,setShowForm] = useState(false);
  const [editingEx,setEditingEx] = useState(null);
  const [detail,setDetail] = useState(null);
  const [search,setSearch] = useState("");

  const handleSave = (ex) => {
    setExercises(prev=>{
      const cat=ex.category, list=prev[cat]||[], idx=list.findIndex(e=>e.id===ex.id);
      return {...prev,[cat]:idx>=0?list.map(e=>e.id===ex.id?ex:e):[...list,ex]};
    });
    setShowForm(false); setEditingEx(null);
  };

  const del = (id,cat) => {
    const ex = (exercises[cat]||[]).find(e=>e.id===id);
    if (!window.confirm(`Delete exercise "${ex?.name || id}"?`)) return;
    setExercises(prev=>({...prev,[cat]:prev[cat].filter(e=>e.id!==id)}));
  };
  const edit = (ex,cat) => { setEditingEx({...ex,muscles:ex.muscles.join(", "),category:cat}); setShowForm(true); };

  const q = search.toLowerCase().trim();
  const catEx = (exercises[activeCategory]||[]).filter(ex =>
    !q || ex.name.toLowerCase().includes(q) || ex.muscles.some(m=>m.toLowerCase().includes(q)) || (ex.notes||'').toLowerCase().includes(q)
  );

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
        <h2 style={{ margin:0,fontSize:24,color:T.text,fontWeight:900,letterSpacing:"-0.5px" }}>Library</h2>
        <button onClick={()=>{setEditingEx(null);setShowForm(true);}} style={{ background:T.blue,border:"none",borderRadius:9,color:"#fff",padding:"8px 16px",cursor:"pointer",fontWeight:800,fontSize:13 }}>+ Add</button>
      </div>

      {/* Search */}
      <div style={{ position:"relative",marginBottom:16 }}>
        <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:T.textMuted,pointerEvents:"none" }}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, muscle, or notes…" style={{ ...INP,marginBottom:0,paddingLeft:34 }} />
        {search && <button onClick={()=>setSearch("")} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:16,lineHeight:1 }}>×</button>}
      </div>

      {/* Category tabs */}
      <div style={{ display:"flex",gap:6,marginBottom:20,flexWrap:"wrap" }}>
        {Object.entries(CATEGORY_META).map(([k,v])=>(
          <button key={k} onClick={()=>setActiveCategory(k)} style={{ background:activeCategory===k?v.color:T.card,border:`1px solid ${activeCategory===k?v.color:T.border}`,borderRadius:9,color:activeCategory===k?"#fff":T.textMuted,padding:"7px 13px",cursor:"pointer",fontWeight:700,fontSize:13,transition:"all 0.15s" }}>
            {v.icon} {v.label} <span style={{ opacity:0.6,fontWeight:400 }}>({(exercises[k]||[]).length})</span>
          </button>
        ))}
      </div>

      {catEx.length===0&&<div style={{ textAlign:"center",color:T.textMuted,padding:"40px 0" }}>No exercises yet.</div>}

      {catEx.map(ex=>{
        const meta=CATEGORY_META[activeCategory];
        return (
          <div key={ex.id} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10,borderLeft:`3px solid ${meta.color}`,cursor:"pointer",transition:"border-color 0.2s",boxShadow:T.shadow }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=meta.color}
            onMouseLeave={e=>e.currentTarget.style.borderLeftColor=meta.color}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10 }}>
              <div style={{ flex:1 }} onClick={()=>setDetail({ex,category:activeCategory})}>
                <div style={{ fontWeight:800,color:T.text,fontSize:15,marginBottom:6 }}>{ex.name}</div>
                <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:6 }}>
                  <Badge color={meta.color} small>{ex.duration}</Badge>
                  <Badge color={DIFF_COLOR[ex.difficulty]} small>{ex.difficulty}</Badge>
                  <WeightBadge weight={ex.weight} weightUnit={ex.weightUnit} />
                </div>
                <div style={{ fontSize:12,color:T.textMuted }}>{ex.muscles.join(" · ")}</div>
                {ex.notes&&<div style={{ fontSize:11,color:T.textMuted,marginTop:4,fontStyle:"italic" }}>📝 {ex.notes.slice(0,60)}{ex.notes.length>60?"…":""}</div>}
              </div>
              <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                <button onClick={e=>{e.stopPropagation();edit(ex,activeCategory);}} style={{ background:T.surface,border:"none",borderRadius:7,color:T.textSec,cursor:"pointer",padding:"5px 10px",fontSize:12 }}>✏️</button>
                <button onClick={e=>{e.stopPropagation();del(ex.id,activeCategory);}} style={{ background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:19,lineHeight:1 }}>×</button>
              </div>
            </div>
          </div>
        );
      })}

      <Modal open={showForm} onClose={()=>{setShowForm(false);setEditingEx(null);}} title={editingEx?"Edit Exercise":"New Exercise"}>
        <ExerciseForm initial={editingEx} onSave={handleSave} onCancel={()=>{setShowForm(false);setEditingEx(null);}} />
      </Modal>
      <ExerciseDetailModal ex={detail?.ex} category={detail?.category} open={!!detail} onClose={()=>setDetail(null)} />
    </div>
  );
}
