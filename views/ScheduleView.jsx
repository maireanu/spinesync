import { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { T, DAYS, FULL_DAYS, GROUP_COLORS, CATEGORY_META, INP, LBL } from "../constants.js";
import { uid, todayKey, todayISO, localDateISO, buildSessionPattern } from "../helpers.js";
import { useWorkout } from "../context.jsx";
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
  const [garminType,setGarminType] = useState(group?.garminType||"");
  const [slots,setSlots] = useState(group?.exercises?[...group.exercises]:[]);
  const GARMIN_TYPES = ["","Strength Training","Cardio","HIIT","Functional Fitness","Yoga","Breathing","Walk","Other"];
  const [addCat,setAddCat] = useState("physical_therapy");
  const [addExId,setAddExId] = useState("");

  const catExercises = exercises[addCat]||[];

  const handleAdd = () => {
    const exId = addExId || catExercises[0]?.id;
    if(!exId) return;
    setSlots(s=>[...s,{category:addCat,exerciseId:exId}]);
  };
  const remove = idx => setSlots(s=>s.filter((_,i)=>i!==idx));
  const onDragEndSlots = (result) => {
    if (!result.destination) return;
    const from = result.source.index, to = result.destination.index;
    if (from === to) return;
    setSlots(s => { const a=[...s]; const [item]=a.splice(from,1); a.splice(to,0,item); return a; });
  };

  return (
    <div>
      <label style={LBL}>Group Name</label>
      <input style={INP} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Morning PT" />

      <label style={LBL}>Garmin Activity Type</label>
      <select style={{ ...INP,marginBottom:12 }} value={garminType} onChange={e=>setGarminType(e.target.value)}>
        {GARMIN_TYPES.map(t=><option key={t} value={t}>{t||"— none —"}</option>)}
      </select>

      <label style={LBL}>Color</label>
      <div style={{ display:"flex",gap:8,marginBottom:16 }}>
        {GROUP_COLORS.map(c=>(
          <button key={c} onClick={()=>setColor(c)} style={{ width:30,height:30,borderRadius:"50%",background:c,border:`3px solid ${color===c?T.text:"transparent"}`,cursor:"pointer",boxShadow:color===c?`0 0 12px ${c}66`:"none",transition:"all 0.15s" }} />
        ))}
      </div>

      <label style={LBL}>Exercises ({slots.length})</label>
      <div style={{ background:T.surface,borderRadius:11,marginBottom:12,overflow:"hidden",border:`1px solid ${T.border}` }}>
        {slots.length===0&&<div style={{ padding:14,fontSize:13,color:T.textMuted }}>No exercises yet.</div>}
        <DragDropContext onDragEnd={onDragEndSlots}>
          <Droppable droppableId="editor-slots">
            {(prov) => (
              <div ref={prov.innerRef} {...prov.droppableProps}>
                {slots.map((slot,idx)=>{
                  const ex=exById(slot.exerciseId);
                  const meta=CATEGORY_META[slot.category];
                  return (
                    <Draggable key={`${slot.exerciseId}-${idx}`} draggableId={`slot-${idx}-${slot.exerciseId}`} index={idx}>
                      {(drag, snap) => (
                        <div ref={drag.innerRef} {...drag.draggableProps} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:idx<slots.length-1?`1px solid ${T.border}`:"none",background:snap.isDragging?T.surfaceAlt:"transparent",...drag.draggableProps.style }}>
                          <div {...drag.dragHandleProps} style={{ color:T.textMuted,cursor:"grab",fontSize:16,lineHeight:1,flexShrink:0 }}>⠿</div>
                          <span style={{ fontSize:16 }}>{meta.icon}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13,fontWeight:700,color:T.text }}>{ex?.name||slot.exerciseId}</div>
                            <div style={{ fontSize:11,color:T.textMuted }}>{meta.label}{ex?.weight?` · ${ex.weight}${ex.weightUnit}`:""}</div>
                          </div>
                          <button onClick={()=>remove(idx)} style={{ background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:19,lineHeight:1 }}>×</button>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {prov.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div style={{ background:T.surface,border:`1px dashed ${T.border}`,borderRadius:11,padding:14,marginBottom:18 }}>
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
        <button onClick={()=>onSave({...(group||{}),id:group?.id||uid(),name:name||"Unnamed Group",color,garminType,exercises:slots})} style={{ flex:1,background:color,border:"none",borderRadius:10,color:"#fff",padding:11,cursor:"pointer",fontWeight:800,fontSize:14 }}>Save Group</button>
        <button onClick={onCancel} style={{ flex:1,background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,color:T.textSec,padding:11,cursor:"pointer",fontSize:14 }}>Cancel</button>
      </div>
    </div>
  );
}

export default function ScheduleView() {
  const { schedule, setSchedule, exercises, workoutLog, sessionCycleStart, setSessionCycleStart } = useWorkout();
  const exMap = useMemo(() => {
    const m = new Map();
    for (const cat of Object.values(exercises)) for (const e of cat) m.set(e.id, e);
    return m;
  }, [exercises]);
  const exById = (id) => exMap.get(id) || null;
  const tKey = todayKey();
  const tISO = todayISO();
  const sessionPattern = useMemo(() => buildSessionPattern(schedule), [schedule]);

  const [viewMode, setViewMode] = useState("calendar");
  const [calendarIdx, setCalendarIdx] = useState(0);
  const [templateDay, setTemplateDay] = useState(tKey);
  const [editGroup,setEditGroup] = useState(null);
  const [showEditor,setShowEditor] = useState(false);

  // Project next 7 days to sessions based on completion count
  const projectedDays = useMemo(() => {
    const completed = (workoutLog || []).filter(l => l.date !== tISO).length;
    return Array.from({ length: 7 }, (_, i) => {
      const iso = localDateISO(i); // 0=today, 1=tomorrow, etc.
      const date = new Date(iso + "T12:00:00");
      const dayOfWeek = DAYS[(date.getDay() + 6) % 7];
      const sessionIdx = sessionPattern.length > 0 ? (completed + (sessionCycleStart || 0) + i) % sessionPattern.length : -1;
      const session = sessionIdx >= 0 ? sessionPattern[sessionIdx] : null;
      const logEntry = (workoutLog || []).find(l => l.date === iso);
      return { date, iso, dayOfWeek, sessionIdx, session, isToday: i === 0, done: !!logEntry };
    });
  }, [sessionPattern, workoutLog, tISO]);

  const selectedDay = viewMode === "calendar"
    ? (projectedDays[calendarIdx]?.session?.dayKey || null)
    : templateDay;
  const groups = selectedDay ? (schedule[selectedDay] || []) : [];
  const selectedProjected = viewMode === "calendar" ? projectedDays[calendarIdx] : null;

  const handleSave = (g) => {
    if (!selectedDay) return;
    setSchedule(prev=>{
      const day=[...(prev[selectedDay]||[])];
      const idx=day.findIndex(x=>x.id===g.id);
      return {...prev,[selectedDay]:idx>=0?day.map(x=>x.id===g.id?g:x):[...day,g]};
    });
    setShowEditor(false);
  };
  const del = gid => {
    if (!selectedDay) return;
    const group = (schedule[selectedDay]||[]).find(g=>g.id===gid);
    if (!window.confirm(`Delete group "${group?.name || 'this group'}"?`)) return;
    setSchedule(prev=>({...prev,[selectedDay]:(prev[selectedDay]||[]).filter(g=>g.id!==gid)}));
  };
  const onDragEndGroups = (result) => {
    if (!result.destination || !selectedDay) return;
    const from = result.source.index, to = result.destination.index;
    if (from === to) return;
    setSchedule(prev => {
      const day = [...(prev[selectedDay] || [])];
      const [item] = day.splice(from, 1);
      day.splice(to, 0, item);
      return { ...prev, [selectedDay]: day };
    });
  };

  return (
    <div>
      {/* Header with view toggle */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <h2 style={{ margin:0,fontSize:24,color:T.text,fontWeight:900,letterSpacing:"-0.5px" }}>Schedule</h2>
        <div style={{ display:"flex",background:T.surface,borderRadius:10,padding:3,gap:2,border:`1px solid ${T.border}` }}>
          <button onClick={()=>setViewMode("calendar")} style={{ background:viewMode==="calendar"?T.card:"transparent",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:700,color:viewMode==="calendar"?T.text:T.textMuted,boxShadow:viewMode==="calendar"?T.shadow:"none",transition:"all 0.15s" }}>
            📅 Calendar
          </button>
          <button onClick={()=>setViewMode("template")} style={{ background:viewMode==="template"?T.card:"transparent",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:700,color:viewMode==="template"?T.text:T.textMuted,boxShadow:viewMode==="template"?T.shadow:"none",transition:"all 0.15s" }}>
            ⚙️ Template
          </button>
        </div>
      </div>

      {/* Cycle start selector — only shown when 2+ sessions */}
      {sessionPattern.length > 1 && (
        <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"12px 14px",marginBottom:18,boxShadow:T.shadow }}>
          <div style={{ fontSize:11,color:T.textMuted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10 }}>Rotation cycle start</div>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {sessionPattern.map((s, i) => {
              const isActive = (sessionCycleStart || 0) === i;
              return (
                <button key={s.dayKey} onClick={() => setSessionCycleStart(i)} style={{
                  background: isActive ? T.accent : T.surface,
                  border: `1px solid ${isActive ? T.accent : T.border}`,
                  borderRadius: 999,
                  padding: "5px 13px",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  color: isActive ? "#fff" : T.textSec,
                  transition: "all 0.15s",
                  boxShadow: isActive ? `0 0 10px ${T.accent}44` : "none",
                }}>
                  S{i + 1} · {s.dayLabel}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize:11,color:T.textMuted,marginTop:8 }}>
            Next session after a new workout will follow from the selected start point.
          </div>
        </div>
      )}

      {viewMode === "calendar" ? (
        <>
          {/* Projected 7-day strip */}
          <div style={{ display:"flex",gap:5,marginBottom:24,overflowX:"auto",paddingBottom:4 }}>
            {projectedDays.map((pd, i) => {
              const isSelected = calendarIdx === i;
              return (
                <button key={i} onClick={()=>setCalendarIdx(i)} style={{
                  flex:"1 0 46px",minWidth:46,
                  background:isSelected?T.blue:pd.isToday?T.surface:T.card,
                  border:`1px solid ${isSelected?T.blue:pd.isToday?T.blue+"44":T.border}`,
                  borderRadius:12,padding:"10px 4px",cursor:"pointer",
                  color:isSelected?"#fff":T.textMuted,transition:"all 0.15s",position:"relative"
                }}>
                  {pd.done&&<div style={{ position:"absolute",top:4,right:4,width:6,height:6,borderRadius:"50%",background:T.accent }} />}
                  <div style={{ fontSize:10,fontWeight:800,letterSpacing:"0.05em" }}>{pd.dayOfWeek}</div>
                  <div style={{ fontSize:16,fontWeight:800,margin:"2px 0" }}>{pd.date.getDate()}</div>
                  {pd.session ? (
                    <div style={{ fontSize:8,opacity:0.75,fontWeight:600 }}>S{pd.sessionIdx+1}</div>
                  ) : (
                    <div style={{ fontSize:8,opacity:0.5 }}>—</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day info */}
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <div>
              {selectedProjected?.session ? (
                <>
                  <div style={{ fontWeight:800,color:T.text,fontSize:17 }}>
                    Session {selectedProjected.sessionIdx+1}
                    <span style={{ fontSize:13,color:T.textMuted,fontWeight:500,marginLeft:8 }}>{selectedProjected.session.dayLabel} routine</span>
                  </div>
                  <div style={{ fontSize:12,color:T.textMuted,marginTop:2 }}>
                    {selectedProjected.date.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}
                    {" · "}{groups.length} group{groups.length!==1?"s":""} · {groups.reduce((s,g)=>s+g.exercises.length,0)} exercises
                  </div>
                </>
              ) : (
                <div>
                  <div style={{ fontWeight:800,color:T.text,fontSize:17 }}>No sessions configured</div>
                  <div style={{ fontSize:12,color:T.textMuted,marginTop:2 }}>Switch to Template to add exercises</div>
                </div>
              )}
            </div>
            {selectedDay && (
              <button onClick={()=>{setEditGroup(null);setShowEditor(true);}} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:9,color:T.textSec,padding:"8px 14px",cursor:"pointer",fontSize:13,fontWeight:700 }}>+ Group</button>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Template mode: Mon–Sun strip */}
          <div style={{ display:"flex",gap:5,marginBottom:24,overflowX:"auto",paddingBottom:4 }}>
            {DAYS.map(d=>{
              const isToday=d===tKey;
              const gCount=(schedule[d]||[]).length;
              const exCount=(schedule[d]||[]).reduce((s,g)=>s+g.exercises.length,0);
              return (
                <button key={d} onClick={()=>setTemplateDay(d)} style={{
                  flex:"1 0 46px",minWidth:46,
                  background:templateDay===d?T.blue:isToday?T.surface:T.card,
                  border:`1px solid ${templateDay===d?T.blue:isToday?T.blue+"44":T.border}`,
                  borderRadius:12,padding:"10px 4px",cursor:"pointer",
                  color:templateDay===d?"#fff":T.textMuted,transition:"all 0.15s",position:"relative"
                }}>
                  <div style={{ fontSize:10,fontWeight:800,letterSpacing:"0.05em" }}>{d}</div>
                  <div style={{ fontSize:14,margin:"4px 0 2px" }}>{gCount>0?"●".repeat(Math.min(gCount,3)):"○"}</div>
                  <div style={{ fontSize:9,opacity:0.65 }}>{exCount}ex</div>
                </button>
              );
            })}
          </div>

          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <div>
              <div style={{ fontWeight:800,color:T.text,fontSize:17 }}>{FULL_DAYS[DAYS.indexOf(templateDay)]}</div>
              <div style={{ fontSize:12,color:T.textMuted,marginTop:2 }}>{groups.length} group{groups.length!==1?"s":""} · {groups.reduce((s,g)=>s+g.exercises.length,0)} exercises</div>
            </div>
            <button onClick={()=>{setEditGroup(null);setShowEditor(true);}} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:9,color:T.textSec,padding:"8px 14px",cursor:"pointer",fontSize:13,fontWeight:700 }}>+ Group</button>
          </div>
        </>
      )}

      {groups.length===0&&selectedDay&&<div style={{ textAlign:"center",color:T.textMuted,padding:"36px 0",fontSize:14,borderRadius:14,border:`1px dashed ${T.border}` }}>Rest day 🛌<br/><span style={{ fontSize:12,opacity:0.7 }}>Tap "+ Group" to add exercises</span></div>}
      {!selectedDay&&viewMode==="calendar"&&<div style={{ textAlign:"center",color:T.textMuted,padding:"36px 0",fontSize:14,borderRadius:14,border:`1px dashed ${T.border}` }}>No session templates yet<br/><span style={{ fontSize:12,opacity:0.7 }}>Switch to ⚙️ Template to create exercise groups</span></div>}

      <DragDropContext onDragEnd={onDragEndGroups}>
        <Droppable droppableId="schedule-groups">
          {(prov) => (
            <div ref={prov.innerRef} {...prov.droppableProps}>
              {groups.map((group,gIdx)=>(
                <Draggable key={group.id} draggableId={group.id} index={gIdx}>
                  {(drag, snap) => (
                    <div ref={drag.innerRef} {...drag.draggableProps} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,marginBottom:10,borderLeft:`4px solid ${group.color}`,overflow:"hidden",boxShadow:snap.isDragging?T.shadowMd:T.shadow,...drag.draggableProps.style }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 15px" }}>
                        <div {...drag.dragHandleProps} style={{ color:T.textMuted,cursor:"grab",fontSize:18,lineHeight:1,flexShrink:0,padding:"0 2px" }}>⠿</div>
                        <div style={{ width:10,height:10,borderRadius:"50%",background:group.color,flexShrink:0,boxShadow:`0 0 6px ${group.color}55` }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:800,color:T.text,fontSize:14 }}>{group.name}</div>
                          <div style={{ display:"flex",gap:6,marginTop:2,flexWrap:"wrap" }}>
                            {group.garminType&&<span style={{ fontSize:9,fontWeight:700,letterSpacing:"0.06em",background:group.color+"18",color:group.color,border:`1px solid ${group.color}30`,borderRadius:5,padding:"1px 7px" }}>{group.garminType}</span>}
                            <span style={{ fontSize:11,color:T.textMuted }}>{group.exercises.length} exercise{group.exercises.length!==1?"s":""}</span>
                          </div>
                        </div>
                        <button onClick={()=>{setEditGroup(group);setShowEditor(true);}} style={{ background:T.surface,border:"none",borderRadius:7,color:T.textSec,cursor:"pointer",padding:"5px 10px",fontSize:12,fontWeight:600 }}>✏️ Edit</button>
                        <button onClick={()=>del(group.id)} style={{ background:"none",border:"none",color:T.red,cursor:"pointer",fontSize:20,lineHeight:1,padding:"0 2px" }}>×</button>
                      </div>
                      <div style={{ padding:"0 15px 12px",display:"flex",flexWrap:"wrap",gap:6 }}>
                        {group.exercises.map((slot,i)=>{
                          const ex=exById(slot.exerciseId);
                          const meta=CATEGORY_META[slot.category];
                          return (
                            <div key={i} style={{ background:T.surface,border:`1px solid ${meta.color}22`,borderRadius:8,padding:"4px 10px",fontSize:12,color:T.textSec,display:"flex",alignItems:"center",gap:5 }}>
                              {meta.icon} {ex?.name||"?"}{ex?.weight?<span style={{ color:T.amber+"88",fontSize:10 }}> {ex.weight}{ex.weightUnit}</span>:null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {prov.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Modal open={showEditor} onClose={()=>setShowEditor(false)} title={editGroup?`Edit: ${editGroup.name}`:"New Exercise Group"} wide>
        <GroupEditor group={editGroup} exercises={exercises} onSave={handleSave} onCancel={()=>setShowEditor(false)} />
      </Modal>
    </div>
  );
}
