import { useState, useMemo } from "react";
import { DAYS, FULL_DAYS, GROUP_COLORS, CATEGORY_META, INP, LBL } from "../constants.js";
import { uid, todayKey, todayISO } from "../helpers.js";
import { Modal } from "../components/ui.jsx";

function GroupEditor({ group, exercises, onSave, onCancel }) {
  const exMap = useMemo(() => {
    const m = new Map();
    for (const cat of Object.values(exercises)) for (const e of cat) m.set(e.id, e);
    return m;
  }, [exercises]);
  const exById = (id) => exMap.get(id) || null;
  const [name,setName] = useState(group?.name||"");
  const [color,setColor] = useState(group?.color||GROUP_COLORS[0]);
  const [slots,setSlots] = useState(group?.exercises?[...group.exercises]:[]);
  const [addCat,setAddCat] = useState("physical_therapy");
  const [addExId,setAddExId] = useState("");

  const catExercises = exercises[addCat]||[];

  const handleAdd = () => {
    const exId = addExId || catExercises[0]?.id;
    if(!exId) return;
    setSlots(s=>[...s,{category:addCat,exerciseId:exId}]);
  };
  const remove = idx => setSlots(s=>s.filter((_,i)=>i!==idx));
  const move = (idx,dir) => setSlots(s=>{ const a=[...s],to=idx+dir; if(to<0||to>=a.length)return a; [a[idx],a[to]]=[a[to],a[idx]]; return a; });

  return (
    <div>
      <label style={LBL}>Group Name</label>
      <input style={INP} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Morning PT" />

      <label style={LBL}>Color</label>
      <div style={{ display:"flex",gap:8,marginBottom:16 }}>
        {GROUP_COLORS.map(c=>(
          <button key={c} onClick={()=>setColor(c)} style={{ width:30,height:30,borderRadius:"50%",background:c,border:`3px solid ${color===c?"#fff":"transparent"}`,cursor:"pointer",boxShadow:color===c?`0 0 12px ${c}99`:"none",transition:"all 0.15s" }} />
        ))}
      </div>

      <label style={LBL}>Exercises ({slots.length})</label>
      <div style={{ background:"#1a1d2e",borderRadius:11,marginBottom:12,overflow:"hidden",border:"1px solid #1e2140" }}>
        {slots.length===0&&<div style={{ padding:14,fontSize:13,color:"#3a3d5a" }}>No exercises yet.</div>}
        {slots.map((slot,idx)=>{
          const ex=exById(slot.exerciseId);
          const meta=CATEGORY_META[slot.category];
          return (
            <div key={idx} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:idx<slots.length-1?"1px solid #2e3254":"none" }}>
              <span style={{ fontSize:16 }}>{meta.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:700,color:"#dfe1f9" }}>{ex?.name||slot.exerciseId}</div>
                <div style={{ fontSize:11,color:"#3a3d5a" }}>{meta.label}{ex?.weight?` · ${ex.weight}${ex.weightUnit}`:""}</div>
              </div>
              <button onClick={()=>move(idx,-1)} disabled={idx===0} style={{ background:"none",border:"none",color:"#4b5563",cursor:"pointer",fontSize:14 }}>↑</button>
              <button onClick={()=>move(idx,1)} disabled={idx===slots.length-1} style={{ background:"none",border:"none",color:"#4b5563",cursor:"pointer",fontSize:14 }}>↓</button>
              <button onClick={()=>remove(idx)} style={{ background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:19,lineHeight:1 }}>×</button>
            </div>
          );
        })}
      </div>

      <div style={{ background:"#1a1d2e",border:"1px dashed #313446",borderRadius:11,padding:14,marginBottom:18 }}>
        <div style={LBL}>Add Exercise</div>
        <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
          <select style={{ ...INP,marginBottom:0,flex:"1 1 110px" }} value={addCat} onChange={e=>{setAddCat(e.target.value);setAddExId("");}}>
            {Object.entries(CATEGORY_META).map(([k,v])=><option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
          <select style={{ ...INP,marginBottom:0,flex:"2 1 150px" }} value={addExId} onChange={e=>setAddExId(e.target.value)}>
            {catExercises.map(ex=><option key={ex.id} value={ex.id}>{ex.name}</option>)}
          </select>
          <button onClick={handleAdd} style={{ background:color,border:"none",borderRadius:9,color:"#fff",padding:"8px 14px",cursor:"pointer",fontWeight:800,fontSize:13,flexShrink:0 }}>+ Add</button>
        </div>
      </div>

      <div style={{ display:"flex",gap:10 }}>
        <button onClick={()=>onSave({...(group||{}),id:group?.id||uid(),name:name||"Unnamed Group",color,exercises:slots})} style={{ flex:1,background:color,border:"none",borderRadius:10,color:"#fff",padding:11,cursor:"pointer",fontWeight:800,fontSize:14 }}>Save Group</button>
        <button onClick={onCancel} style={{ flex:1,background:"#2e3254",border:"none",borderRadius:10,color:"#9399b8",padding:11,cursor:"pointer",fontSize:14 }}>Cancel</button>
      </div>
    </div>
  );
}

export default function ScheduleView({ schedule, setSchedule, exercises, workoutLog }) {
  const exMap = useMemo(() => {
    const m = new Map();
    for (const cat of Object.values(exercises)) for (const e of cat) m.set(e.id, e);
    return m;
  }, [exercises]);
  const exById = (id) => exMap.get(id) || null;
  const tKey = todayKey();
  const [selectedDay,setSelectedDay] = useState(tKey);
  const [editGroup,setEditGroup] = useState(null);
  const [showEditor,setShowEditor] = useState(false);

  const groups = schedule[selectedDay]||[];

  const handleSave = (g) => {
    setSchedule(prev=>{
      const day=[...(prev[selectedDay]||[])];
      const idx=day.findIndex(x=>x.id===g.id);
      return {...prev,[selectedDay]:idx>=0?day.map(x=>x.id===g.id?g:x):[...day,g]};
    });
    setShowEditor(false);
  };
  const del = gid => {
    const group = (schedule[selectedDay]||[]).find(g=>g.id===gid);
    if (!window.confirm(`Delete group "${group?.name || 'this group'}"?`)) return;
    setSchedule(prev=>({...prev,[selectedDay]:(prev[selectedDay]||[]).filter(g=>g.id!==gid)}));
  };
  const move = (idx,dir) => setSchedule(prev=>{
    const day=[...(prev[selectedDay]||[])],to=idx+dir;
    if(to<0||to>=day.length)return prev;
    [day[idx],day[to]]=[day[to],day[idx]];
    return {...prev,[selectedDay]:day};
  });

  return (
    <div>
      <h2 style={{ margin:"0 0 20px",fontSize:24,color:"#dfe1f9",fontWeight:900,letterSpacing:"-0.5px" }}>Weekly Schedule</h2>

      {/* Day strip */}
      <div style={{ display:"flex",gap:5,marginBottom:24,overflowX:"auto",paddingBottom:4 }}>
        {DAYS.map(d=>{
          const isToday=d===tKey;
          const logEntry=(workoutLog||[]).find(l=>l.day===d&&l.date===todayISO());
          const gCount=(schedule[d]||[]).length;
          const exCount=(schedule[d]||[]).reduce((s,g)=>s+g.exercises.length,0);
          return (
            <button key={d} onClick={()=>setSelectedDay(d)} style={{
              flex:"1 0 46px",minWidth:46,
              background:selectedDay===d?"#5b9cf6":isToday?"#141830":"#26293b",
              border:`1px solid ${selectedDay===d?"#5b9cf6":isToday?"#5b9cf655":"#1e2140"}`,
              borderRadius:12,padding:"10px 4px",cursor:"pointer",
              color:selectedDay===d?"#fff":"#5a5f7a",transition:"all 0.15s",position:"relative"
            }}>
              {logEntry&&<div style={{ position:"absolute",top:4,right:4,width:6,height:6,borderRadius:"50%",background:"#44e2cd" }} />}
              <div style={{ fontSize:10,fontWeight:800,letterSpacing:"0.05em" }}>{d}</div>
              <div style={{ fontSize:14,margin:"4px 0 2px" }}>{gCount>0?"●".repeat(Math.min(gCount,3)):"○"}</div>
              <div style={{ fontSize:9,opacity:0.65 }}>{exCount}ex</div>
            </button>
          );
        })}
      </div>

      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <div>
          <div style={{ fontWeight:800,color:"#dfe1f9",fontSize:17 }}>{FULL_DAYS[DAYS.indexOf(selectedDay)]}</div>
          <div style={{ fontSize:12,color:"#3a3d5a",marginTop:2 }}>{groups.length} group{groups.length!==1?"s":""} · {groups.reduce((s,g)=>s+g.exercises.length,0)} exercises</div>
        </div>
        <button onClick={()=>{setEditGroup(null);setShowEditor(true);}} style={{ background:"#26293b",border:"1px solid #2a2d50",borderRadius:9,color:"#9399b8",padding:"8px 14px",cursor:"pointer",fontSize:13,fontWeight:700 }}>+ Group</button>
      </div>

      {groups.length===0&&<div style={{ textAlign:"center",color:"#3a3d5a",padding:"36px 0",fontSize:14,borderRadius:14,border:"1px dashed #1e2140" }}>Rest day 🛌<br/><span style={{ fontSize:12,opacity:0.7 }}>Tap "+ Group" to add exercises</span></div>}

      {groups.map((group,gIdx)=>(
        <div key={group.id} style={{ background:"#26293b",border:"1px solid #1e2140",borderRadius:16,marginBottom:10,borderLeft:`4px solid ${group.color}`,overflow:"hidden" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 15px" }}>
            <div style={{ width:10,height:10,borderRadius:"50%",background:group.color,flexShrink:0,boxShadow:`0 0 8px ${group.color}88` }} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800,color:"#dfe1f9",fontSize:14 }}>{group.name}</div>
              <div style={{ fontSize:11,color:"#3a3d5a" }}>{group.exercises.length} exercise{group.exercises.length!==1?"s":""}</div>
            </div>
            <button onClick={()=>move(gIdx,-1)} disabled={gIdx===0} style={{ background:"none",border:"none",color:"#3a3d5a",cursor:"pointer",fontSize:16 }}>↑</button>
            <button onClick={()=>move(gIdx,1)} disabled={gIdx===groups.length-1} style={{ background:"none",border:"none",color:"#3a3d5a",cursor:"pointer",fontSize:16 }}>↓</button>
            <button onClick={()=>{setEditGroup(group);setShowEditor(true);}} style={{ background:"#2e3254",border:"none",borderRadius:7,color:"#9399b8",cursor:"pointer",padding:"5px 10px",fontSize:12,fontWeight:600 }}>✏️ Edit</button>
            <button onClick={()=>del(group.id)} style={{ background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:20,lineHeight:1,padding:"0 2px" }}>×</button>
          </div>
          <div style={{ padding:"0 15px 12px",display:"flex",flexWrap:"wrap",gap:6 }}>
            {group.exercises.map((slot,i)=>{
              const ex=exById(slot.exerciseId);
              const meta=CATEGORY_META[slot.category];
              return (
                <div key={i} style={{ background:"#1a1d2e",border:`1px solid ${meta.color}33`,borderRadius:8,padding:"4px 10px",fontSize:12,color:"#c4c8e8",display:"flex",alignItems:"center",gap:5 }}>
                  {meta.icon} {ex?.name||"?"}{ex?.weight?<span style={{ color:"#fbbf2499",fontSize:10 }}> {ex.weight}{ex.weightUnit}</span>:null}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <Modal open={showEditor} onClose={()=>setShowEditor(false)} title={editGroup?`Edit: ${editGroup.name}`:"New Exercise Group"} wide>
        <GroupEditor group={editGroup} exercises={exercises} onSave={handleSave} onCancel={()=>setShowEditor(false)} />
      </Modal>
    </div>
  );
}
