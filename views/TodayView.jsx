import { useState, useEffect, useRef, useMemo } from "react";
import { T, CATEGORY_META } from "../constants.js";
import { todayISO, parseSets, buildSessionPattern } from "../helpers.js";
import { Badge, WeightBadge, RestTimer, ExerciseDetailModal } from "../components/ui.jsx";
import { GroupTimerBadge, GroupSessionTimer, TotalSessionTimer } from "../components/timers.jsx";

export default function TodayView({ schedule, exercises, workoutLog, setWorkoutLog }) {
  const tISO = todayISO();

  // O(1) exercise lookup
  const exMap = useMemo(() => {
    const m = new Map();
    for (const cat of Object.values(exercises)) for (const e of cat) m.set(e.id, e);
    return m;
  }, [exercises]);
  const exById = (id) => exMap.get(id) || null;

  // Build the ordered session pattern from the weekly schedule
  const sessionPattern = buildSessionPattern(schedule);
  const todayLog = (workoutLog || []).find(l => l.date === tISO);
  const completedCount = (workoutLog || []).filter(l => l.date !== tISO).length;
  const autoIndex = sessionPattern.length > 0 ? completedCount % sessionPattern.length : 0;

  // Manual session day override
  const [sessionOverride, setSessionOverride] = useState(() => {
    try { const s = localStorage.getItem("pt_session_override"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [showDayPicker, setShowDayPicker] = useState(false);
  const dayPickerRef = useRef(null);
  useEffect(() => {
    if (!showDayPicker) return;
    const handler = (e) => { if (dayPickerRef.current && !dayPickerRef.current.contains(e.target)) setShowDayPicker(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDayPicker]);
  useEffect(() => {
    try {
      if (sessionOverride !== null) localStorage.setItem("pt_session_override", JSON.stringify(sessionOverride));
      else localStorage.removeItem("pt_session_override");
    } catch {}
  }, [sessionOverride]);

  const activeIndex = sessionOverride !== null && sessionOverride >= 0 && sessionOverride < sessionPattern.length
    ? sessionOverride : autoIndex;

  const currentSession = sessionPattern.length > 0 ? sessionPattern[activeIndex] : null;
  const sessionNumber = activeIndex + 1;
  const groups = currentSession ? currentSession.groups : [];

  const [setsLog, setSetsLog] = useState(() => {
    try { const s = localStorage.getItem(`pt_sets_${tISO}`); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [detail, setDetail] = useState(null);
  const [collapsed, setCollapsed] = useState({});
  const [showTimer, setShowTimer] = useState(false);
  const [timers, setTimers] = useState(() => {
    try { const s = localStorage.getItem(`pt_timers_${tISO}`); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem(`pt_sets_${tISO}`, JSON.stringify(setsLog)); } catch {}
  }, [setsLog, tISO]);
  useEffect(() => {
    try { localStorage.setItem(`pt_timers_${tISO}`, JSON.stringify(timers)); } catch {}
  }, [timers, tISO]);

  const startSession = () => {
    const now = new Date().toISOString();
    const firstGroup = groups[0];
    setTimers(prev => {
      if (Object.values(prev.groups || {}).some(t => t.startedAt)) return prev;
      return { ...prev, groups: { ...(prev.groups || {}), ...(firstGroup ? { [firstGroup.id]: { startedAt: now, endedAt: null } } : {}) } };
    });
  };
  const startGroup = (gid) => {
    const now = new Date().toISOString();
    setTimers(prev => ({ ...prev, groups: { ...(prev.groups || {}), [gid]: { startedAt: now, endedAt: null } } }));
  };

  useEffect(() => {
    const now = new Date().toISOString();
    setTimers(prev => {
      const updatedGroups = { ...(prev.groups || {}) };
      let changed = false;
      groups.forEach((g, gIdx) => {
        if (!updatedGroups[g.id]?.startedAt) return;
        const groupAllDone = g.exercises.every((_, i) => {
          const ex = exById(g.exercises[i].exerciseId);
          return (setsLog[`${g.id}_${i}`] || 0) >= parseSets(ex?.duration || "1");
        });
        if (groupAllDone && !updatedGroups[g.id]?.endedAt) {
          updatedGroups[g.id] = { ...updatedGroups[g.id], endedAt: now };
          changed = true;
          const nextGroup = groups[gIdx + 1];
          if (nextGroup && !updatedGroups[nextGroup.id]?.startedAt) {
            updatedGroups[nextGroup.id] = { startedAt: now, endedAt: null };
            changed = true;
          }
        }
        if (!groupAllDone && updatedGroups[g.id]?.endedAt) {
          updatedGroups[g.id] = { ...updatedGroups[g.id], endedAt: null };
          changed = true;
        }
      });
      return changed ? { ...prev, groups: updatedGroups } : prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setsLog]);

  const totalSets = groups.reduce((s,g) => s + g.exercises.reduce((a,slot) => {
    const ex = exById(slot.exerciseId);
    return a + (ex ? parseSets(ex.duration) : 1);
  },0),0);
  const doneSets = Object.values(setsLog).reduce((s,v)=>s+v,0);
  const totalEx = groups.reduce((s,g)=>s+g.exercises.length,0);
  const doneEx = groups.reduce((s,g)=>s+g.exercises.filter((_,i)=>{
    const key=`${g.id}_${i}`;
    const ex=exById(g.exercises[i].exerciseId);
    return (setsLog[key]||0) >= (ex?parseSets(ex.duration):1);
  }).length,0);

  const isExDone = (gid, idx, ex) => (setsLog[`${gid}_${idx}`]||0) >= parseSets(ex?.duration||"1");
  const isGroupDone = (g) => g.exercises.every((_,i)=>{ const ex=exById(g.exercises[i].exerciseId); return isExDone(g.id,i,ex); });

  const addSet = (gid, idx, ex) => {
    const key=`${gid}_${idx}`;
    const total=parseSets(ex?.duration||"1");
    const cur=setsLog[key]||0;
    if(cur<total){
      setSetsLog(s=>({...s,[key]:cur+1}));
      if(cur+1<total) setShowTimer(true);
    }
  };
  const removeSet = (gid,idx) => {
    const key=`${gid}_${idx}`;
    setSetsLog(s=>({...s,[key]:Math.max(0,(s[key]||0)-1)}));
  };
  const resetExercise = (gid,idx) => {
    const key=`${gid}_${idx}`;
    setSetsLog(s=>({...s,[key]:0}));
  };

  const markDayDone = () => {
    const now = new Date().toISOString();
    setTimers(prev => {
      const updatedGroups = { ...(prev.groups || {}) };
      groups.forEach(g => {
        if (updatedGroups[g.id]?.startedAt && !updatedGroups[g.id]?.endedAt) {
          updatedGroups[g.id] = { ...updatedGroups[g.id], endedAt: now };
        }
      });
      return { ...prev, groups: updatedGroups };
    });
    const exerciseDetails = groups.flatMap(g =>
      g.exercises.map((slot, i) => {
        const ex = exById(slot.exerciseId);
        return { id:slot.exerciseId, name:ex?.name||slot.exerciseId, sets:setsLog[`${g.id}_${i}`]||0, weight:ex?.weight||"", weightUnit:ex?.weightUnit||"", group:g.name };
      })
    );
    const entry = {
      date:tISO, sessionNumber, sessionDay: currentSession?.dayLabel,
      completedAt:new Date().toISOString(), groupCount:groups.length,
      exerciseCount:totalEx, exercises:exerciseDetails
    };
    setWorkoutLog(prev => {
      const filtered = (prev||[]).filter(l => l.date !== tISO);
      return [...filtered, entry];
    });
  };
  const resetToday = () => {
    setSetsLog({});
    setTimers({});
    setWorkoutLog(prev => (prev||[]).filter(l => l.date !== tISO));
  };

  const pct = totalSets>0 ? (doneSets/totalSets)*100 : 0;
  const today = new Date();
  const log = todayLog;

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <div style={{ fontSize:11,color:T.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6,fontWeight:600 }}>
          {today.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
        </div>
        <h2 style={{ margin:"0 0 8px",fontSize:30,color:T.text,fontWeight:900,letterSpacing:"-0.04em" }}>Today's Workout</h2>
        {currentSession && (
          <div ref={dayPickerRef} style={{ position:"relative",display:"inline-block",marginBottom:8 }}>
            <button onClick={()=>setShowDayPicker(p=>!p)} style={{ display:"inline-flex",alignItems:"center",gap:6,background:T.blue+"14",outline:`1px solid ${T.blue}22`,borderRadius:999,padding:"4px 12px",border:"none",cursor:"pointer",transition:"background 0.15s" }}
              onMouseOver={e=>e.currentTarget.style.background=T.blue+"22"}
              onMouseOut={e=>e.currentTarget.style.background=T.blue+"14"}
            >
              <span style={{ fontSize:11,color:T.blue,fontWeight:700 }}>Session {sessionNumber}</span>
              <span style={{ fontSize:11,color:T.textMuted }}>·</span>
              <span style={{ fontSize:11,color:T.textMuted }}>{currentSession.dayLabel} routine</span>
              <span style={{ fontSize:10,color:T.blue,marginLeft:2 }}>▾</span>
            </button>
            {sessionOverride !== null && (
              <button onClick={()=>{setSessionOverride(null);setShowDayPicker(false);}} title="Reset to auto" style={{ background:T.red+"14",border:`1px solid ${T.red}22`,borderRadius:999,padding:"2px 8px",cursor:"pointer",fontSize:10,fontWeight:700,color:T.red,marginLeft:6,verticalAlign:"middle" }}>
                ↩ Auto
              </button>
            )}
            {showDayPicker && (
              <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,zIndex:200,background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"8px 6px",boxShadow:T.shadowLg,minWidth:200 }}>
                <div style={{ fontSize:10,color:T.textMuted,fontWeight:700,letterSpacing:"0.08em",padding:"4px 10px 8px",textTransform:"uppercase" }}>Select routine day</div>
                {sessionPattern.map((s,i)=>(
                  <button key={s.dayKey} onClick={()=>{setSessionOverride(i);setShowDayPicker(false);}} style={{ display:"flex",alignItems:"center",gap:10,width:"100%",background:activeIndex===i?T.blue+"14":"transparent",border:"none",borderRadius:10,padding:"9px 12px",cursor:"pointer",transition:"background 0.15s",textAlign:"left" }}
                    onMouseOver={e=>{if(activeIndex!==i)e.currentTarget.style.background=T.surface}}
                    onMouseOut={e=>{if(activeIndex!==i)e.currentTarget.style.background="transparent"}}
                  >
                    <div style={{ width:8,height:8,borderRadius:"50%",background:activeIndex===i?T.blue:T.border,flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13,fontWeight:700,color:activeIndex===i?T.blue:T.text }}>{s.dayLabel}</div>
                      <div style={{ fontSize:11,color:T.textMuted }}>{s.groups.length} group{s.groups.length!==1?"s":""} · {s.groups.reduce((a,g)=>a+g.exercises.length,0)} exercises</div>
                    </div>
                    {i===autoIndex && <span style={{ fontSize:9,color:T.accent,fontWeight:700,letterSpacing:"0.04em" }}>AUTO</span>}
                    {activeIndex===i && <span style={{ fontSize:13,color:T.blue }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {totalEx > 0 && (
          <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
            <span style={{ fontSize:13,color:T.textMuted }}>{doneEx}/{totalEx} exercises</span>
            <span style={{ color:T.border }}>·</span>
            <span style={{ fontSize:13,color:T.textMuted }}>{doneSets}/{totalSets} sets</span>
            <span style={{ color:T.border }}>·</span>
            <span style={{ fontSize:13,color:T.textMuted }}>{groups.length} group{groups.length!==1?"s":""}</span>
          </div>
        )}
      </div>

      {totalSets > 0 && (
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
            <span style={{ fontSize:13,color:T.textSec,fontWeight:500 }}>{doneEx}/{totalEx} exercises · {doneSets}/{totalSets} sets</span>
            <span style={{ fontSize:14,color:T.blue,fontWeight:800 }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ background:T.surfaceAlt,borderRadius:100,height:7,overflow:"hidden" }}>
            <div style={{ height:"100%",background:`linear-gradient(90deg,${T.blue},${T.purple},${T.accent})`,borderRadius:100,width:`${pct}%`,transition:"width 0.4s ease",boxShadow:`0 0 12px ${T.blue}44` }} />
          </div>
        </div>
      )}

      {groups.length > 0 && !log && (
        Object.values(timers.groups || {}).some(t => t.startedAt)
          ? <TotalSessionTimer groupTimers={timers.groups} />
          : <button onClick={startSession} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",background:T.accent+"0a",border:`1px solid ${T.accent}30`,borderRadius:14,padding:"14px 20px",cursor:"pointer",marginBottom:22,transition:"all 0.2s" }}
              onMouseOver={e=>e.currentTarget.style.background=T.accent+"14"}
              onMouseOut={e=>e.currentTarget.style.background=T.accent+"0a"}
            >
              <div style={{ width:34,height:34,borderRadius:"50%",background:T.accent+"18",border:`1.5px solid ${T.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:T.accent }}>▶</div>
              <div style={{ textAlign:"left" }}>
                <div style={{ color:T.accent,fontWeight:900,fontSize:15 }}>Start Workout</div>
                <div style={{ color:T.textMuted,fontSize:12,marginTop:1 }}>Tap to begin session timer</div>
              </div>
            </button>
      )}
      {log && <TotalSessionTimer groupTimers={timers.groups} />}

      {groups.length === 0 && (
        <div style={{ background:T.card,borderRadius:18,padding:40,textAlign:"center",border:`1px solid ${T.border}`,boxShadow:T.shadow }}>
          <div style={{ fontSize:48,marginBottom:12 }}>📋</div>
          <div style={{ color:T.textSec,fontWeight:800,fontSize:17 }}>No sessions scheduled</div>
          <div style={{ color:T.textMuted,fontSize:14,marginTop:6 }}>Add groups to your weekly schedule to get started.</div>
        </div>
      )}

      {groups.map((group) => {
        const allDone = isGroupDone(group);
        const isCollapsed = collapsed[group.id];
        return (
          <div key={group.id} style={{
            background: allDone ? `${group.color}08` : T.card,
            borderRadius:20, marginBottom:14, overflow:"hidden", transition:"all 0.3s",
            border: allDone ? `1px solid ${group.color}44` : `1px solid ${T.border}`,
            boxShadow: allDone ? `0 0 20px ${group.color}10` : T.shadow
          }}>
          <div style={{ background: allDone ? "transparent" : T.card, borderRadius:18, margin:4, overflow:"hidden" }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,padding:"16px 18px",cursor:"pointer",borderBottom: isCollapsed?"none":`1px solid ${T.border}` }} onClick={()=>setCollapsed(c=>({...c,[group.id]:!c[group.id]}))}>
              <div style={{ width:11,height:11,borderRadius:"50%",background:group.color,flexShrink:0,boxShadow:`0 0 8px ${group.color}55`,animation:"spinePulse 2.5s ease-in-out infinite" }} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800,color:T.text,fontSize:15,letterSpacing:"-0.01em" }}>{group.name}</div>
                <div style={{ fontSize:12,color:T.textMuted,marginTop:2 }}>
                  {group.exercises.filter((_,i)=>isExDone(group.id,i,exById(group.exercises[i].exerciseId))).length}/{group.exercises.length} exercises
                </div>
              </div>
              {timers.groups?.[group.id]?.startedAt
                ? <GroupTimerBadge startedAt={timers.groups[group.id].startedAt} endedAt={timers.groups[group.id].endedAt} />
                : !allDone && (
                  <button onClick={e=>{ e.stopPropagation(); startGroup(group.id); }}
                    style={{ background:T.accent+"14",border:`1px solid ${T.accent}30`,borderRadius:8,color:T.accent,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:800,flexShrink:0,display:"flex",alignItems:"center",gap:4 }}>
                    ▶ Start
                  </button>
                )
              }
              <div style={{ display:"flex",gap:4 }}>
                {group.exercises.map((_,i)=>{
                  const ex=exById(group.exercises[i].exerciseId);
                  const done=isExDone(group.id,i,ex);
                  return <div key={i} style={{ width:7,height:7,borderRadius:"50%",background:done?group.color:T.surfaceAlt,transition:"background 0.2s" }} />;
                })}
              </div>
              {allDone && <span style={{ fontSize:16 }}>✅</span>}
              <span style={{ color:T.textMuted,fontSize:18,lineHeight:1 }}>{isCollapsed?"›":"⌄"}</span>
            </div>

            {timers.groups?.[group.id]?.startedAt && !isCollapsed && (
              <GroupSessionTimer groupName={group.name} color={group.color} startedAt={timers.groups[group.id].startedAt} endedAt={timers.groups[group.id].endedAt} />
            )}

            {!isCollapsed && (
              <div style={{ padding:"4px 16px 16px" }}>
                {group.exercises.map((slot, idx) => {
                  const ex = exById(slot.exerciseId);
                  const meta = CATEGORY_META[slot.category];
                  if (!ex) return null;
                  const totalS = parseSets(ex.duration);
                  const doneS = setsLog[`${group.id}_${idx}`] || 0;
                  const isDone = doneS >= totalS;
                  return (
                    <div key={idx} style={{ padding:"14px 0",borderBottom: idx<group.exercises.length-1?`1px solid ${T.border}`:"none",opacity:isDone?0.5:1,transition:"opacity 0.3s" }}>
                      <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:5 }}>
                            <span style={{ fontSize:15 }}>{meta.icon}</span>
                            <span style={{ fontWeight:800,color:T.text,fontSize:14,textDecoration:isDone?"line-through":"none" }}>{ex.name}</span>
                            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise how to')}`} target="_blank" rel="noopener noreferrer"
                              style={{ display:"inline-flex",alignItems:"center",gap:3,fontSize:10,fontWeight:700,color:T.red,textDecoration:"none",background:T.red+"14",border:`1px solid ${T.red}22`,borderRadius:20,padding:"2px 8px",flexShrink:0 }}>
                              ▶ YT
                            </a>
                          </div>
                          <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:6 }}>
                            <Badge color={meta.color} small>{ex.duration}</Badge>
                            <WeightBadge weight={ex.weight} weightUnit={ex.weightUnit} />
                          </div>
                          <div style={{ fontSize:11,color:T.textMuted,marginBottom:8 }}>{ex.muscles.join(" · ")}</div>
                          <div style={{ background:T.surface,borderRadius:10,padding:"10px 12px",fontSize:12,color:T.textSec,lineHeight:1.7,borderLeft:`2px solid ${meta.color}55` }}>💡 {ex.tips}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:12,padding:"10px 12px",background:T.surface,borderRadius:12 }}>
                        <span style={{ fontSize:11,color:T.textMuted,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",flex:1 }}>
                          Sets: {doneS}/{totalS}
                        </span>
                        <div style={{ display:"flex",gap:6 }}>
                          {Array.from({length:totalS}).map((_,si)=>(
                            <div key={si} onClick={()=>{ if(si<doneS) removeSet(group.id,idx); else addSet(group.id,idx,ex); }}
                              style={{ width:32,height:32,borderRadius:"50%",background:si<doneS?group.color:T.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.2s",boxShadow:si<doneS?`0 0 8px ${group.color}44`:"none",fontSize:15,fontWeight:800,color:si<doneS?"#fff":T.textMuted }}>
                              {si < doneS ? "✓" : si + 1}
                            </div>
                          ))}
                        </div>
                        {isDone
                          ? <button onClick={()=>resetExercise(group.id,idx)} style={{ background:T.surface,border:`1px solid ${T.red}30`,borderRadius:9,color:T.red,padding:"6px 14px",cursor:"pointer",fontWeight:800,fontSize:13,transition:"all 0.2s" }}>↩ Undo</button>
                          : <button onClick={()=>addSet(group.id,idx,ex)} style={{ background:group.color,border:"none",borderRadius:9,color:"#fff",padding:"6px 14px",cursor:"pointer",fontWeight:800,fontSize:13,transition:"all 0.2s" }}>{`+Set ${doneS+1}`}</button>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>
        );
      })}

      {doneEx === totalEx && totalEx > 0 && !log && (
        <div style={{ background:T.accent+"0a",border:`1px solid ${T.accent}44`,borderRadius:18,padding:24,textAlign:"center",marginTop:8 }}>
          <div style={{ fontSize:40,marginBottom:10 }}>🎉</div>
          <div style={{ color:T.accent,fontWeight:900,fontSize:17,marginBottom:6 }}>All exercises done!</div>
          <button onClick={markDayDone} style={{ background:T.accent,border:"none",borderRadius:10,color:"#fff",padding:"10px 28px",cursor:"pointer",fontWeight:800,fontSize:14,marginTop:4 }}>Mark Day Complete ✓</button>
        </div>
      )}
      {log && (
        <div style={{ background:T.accent+"08",border:`1px solid ${T.accent}30`,borderRadius:14,padding:"12px 18px",display:"flex",alignItems:"center",gap:12,marginTop:8 }}>
          <span style={{ fontSize:20 }}>✅</span>
          <div style={{ flex:1 }}>
            <div style={{ color:T.accent,fontWeight:700,fontSize:14 }}>Day completed!</div>
            <div style={{ color:T.textMuted,fontSize:12,marginTop:1 }}>{log.exerciseCount} exercises · {log.groupCount} groups</div>
          </div>
          <button onClick={resetToday} title="Undo completion and reset set counters" style={{ background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.textMuted,cursor:"pointer",fontSize:11,padding:"4px 9px",fontWeight:600 }}>↩ Reset</button>
        </div>
      )}

      {showTimer && <RestTimer onDismiss={()=>setShowTimer(false)} />}
      <ExerciseDetailModal ex={detail?.ex} category={detail?.category} open={!!detail} onClose={()=>setDetail(null)} />
    </div>
  );
}
