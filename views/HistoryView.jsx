import { T, DAYS, LBL } from "../constants.js";
import { computeStreak, todayISO } from "../helpers.js";

export default function HistoryView({ workoutLog, setWorkoutLog }) {
  const logs = (workoutLog||[]).slice().reverse();
  const deleteEntry = (date) => {
    if (!window.confirm(`Delete the session from ${date}?`)) return;
    setWorkoutLog(prev => (prev||[]).filter(l => l.date !== date));
  };
  const streak = computeStreak(workoutLog);

  return (
    <div>
      <h2 style={{ margin:"0 0 20px",fontSize:24,color:T.text,fontWeight:900,letterSpacing:"-0.5px" }}>History</h2>

      {/* Streak card */}
      <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:22,marginBottom:20,display:"flex",alignItems:"center",gap:18,boxShadow:T.shadow }}>
        <div style={{ fontSize:48 }}>🔥</div>
        <div>
          <div style={{ fontSize:36,fontWeight:900,color:T.amber,lineHeight:1 }}>{streak}</div>
          <div style={{ fontSize:14,color:T.textSec,marginTop:4 }}>day streak</div>
        </div>
        <div style={{ flex:1,textAlign:"right" }}>
          <div style={{ fontSize:13,color:T.textMuted }}>{logs.length} total sessions</div>
        </div>
      </div>

      {/* Calendar grid - last 28 days */}
      <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:18,marginBottom:20,boxShadow:T.shadow }}>
        <div style={LBL}>Last 28 Days</div>
        {(() => {
          const startDate = new Date(Date.now() - 27 * 86400000);
          const startCol = (startDate.getDay() + 6) % 7;
          return (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginTop:8 }}>
              {DAYS.map(d=><div key={d} style={{ textAlign:"center",fontSize:9,color:T.textMuted,fontWeight:700,padding:"4px 0" }}>{d[0]}</div>)}
              {Array.from({length:startCol}).map((_,i)=><div key={`sp${i}`} />)}
              {Array.from({length:28}).map((_,i)=>{
                const date=new Date(Date.now()-(27-i)*86400000);
                const iso=date.toISOString().slice(0,10);
                const done=(workoutLog||[]).find(l=>l.date===iso);
                const isToday=iso===todayISO();
                return (
                  <div key={i} title={iso} style={{ aspectRatio:"1",borderRadius:6,background:done?T.accent:isToday?T.surface:T.bg,border:`1px solid ${done?T.accent+"66":isToday?T.blue+"44":T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:done?"#fff":T.textMuted,fontWeight:700,transition:"all 0.2s" }}>
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Recent sessions */}
      {logs.length===0&&<div style={{ textAlign:"center",color:T.textMuted,padding:"36px 0" }}>No sessions yet. Complete a workout to track it!</div>}
      {logs.slice(0,15).map((log,i)=>(
        <div key={i} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 16px",marginBottom:8,boxShadow:T.shadow }}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:T.accent,flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700,color:T.text,fontSize:14 }}>{log.sessionNumber ? `Session ${log.sessionNumber}` : "Workout"}{log.sessionDay ? <span style={{ fontWeight:500,color:T.textMuted,fontSize:12,marginLeft:6 }}>{log.sessionDay} routine</span> : ""}</div>
              <div style={{ fontSize:12,color:T.textMuted,marginTop:1 }}>{log.exerciseCount} exercises · {log.groupCount} groups</div>
            </div>
            <div style={{ fontSize:12,color:T.textMuted,textAlign:"right" }}>
              {new Date(log.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
            </div>
            <button onClick={()=>deleteEntry(log.date)} title="Delete entry" style={{ background:"none",border:"none",color:T.red+"66",cursor:"pointer",fontSize:16,lineHeight:1,padding:"2px 4px",flexShrink:0,transition:"color 0.15s" }}
              onMouseOver={e=>e.currentTarget.style.color=T.red}
              onMouseOut={e=>e.currentTarget.style.color=T.red+"66"}
            >×</button>
          </div>
          {log.exercises && log.exercises.length > 0 && (
            <div style={{ marginTop:8,paddingLeft:22,display:"flex",flexWrap:"wrap",gap:4 }}>
              {log.exercises.slice(0,6).map((e,ei)=>(
                <span key={ei} style={{ fontSize:10,background:T.surface,border:`1px solid ${T.border}`,borderRadius:6,padding:"2px 7px",color:T.textMuted }}>
                  {e.name}{e.weight ? ` · ${e.weight}${e.weightUnit}` : ""}
                </span>
              ))}
              {log.exercises.length > 6 && <span style={{ fontSize:10,color:T.textMuted,alignSelf:"center" }}>+{log.exercises.length-6} more</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
