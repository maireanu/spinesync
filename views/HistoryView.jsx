import { DAYS, LBL } from "../constants.js";
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
      <h2 style={{ margin:"0 0 20px",fontSize:24,color:"#dfe1f9",fontWeight:900,letterSpacing:"-0.5px" }}>History</h2>

      {/* Streak card */}
      <div style={{ background:"linear-gradient(135deg,#1a1430,#0f1a30)",border:"1px solid #313446",borderRadius:18,padding:22,marginBottom:20,display:"flex",alignItems:"center",gap:18 }}>
        <div style={{ fontSize:48 }}>🔥</div>
        <div>
          <div style={{ fontSize:36,fontWeight:900,color:"#fbbf24",lineHeight:1 }}>{streak}</div>
          <div style={{ fontSize:14,color:"#9399b8",marginTop:4 }}>day streak</div>
        </div>
        <div style={{ flex:1,textAlign:"right" }}>
          <div style={{ fontSize:13,color:"#5a5f7a" }}>{logs.length} total sessions</div>
        </div>
      </div>

      {/* Calendar grid - last 28 days */}
      <div style={{ background:"#26293b",border:"1px solid #1e2140",borderRadius:16,padding:18,marginBottom:20 }}>
        <div style={LBL}>Last 28 Days</div>
        {(() => {
          const startDate = new Date(Date.now() - 27 * 86400000);
          const startCol = (startDate.getDay() + 6) % 7;
          return (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginTop:8 }}>
              {DAYS.map(d=><div key={d} style={{ textAlign:"center",fontSize:9,color:"#3a3d5a",fontWeight:700,padding:"4px 0" }}>{d[0]}</div>)}
              {Array.from({length:startCol}).map((_,i)=><div key={`sp${i}`} />)}
              {Array.from({length:28}).map((_,i)=>{
                const date=new Date(Date.now()-(27-i)*86400000);
                const iso=date.toISOString().slice(0,10);
                const done=(workoutLog||[]).find(l=>l.date===iso);
                const isToday=iso===todayISO();
                return (
                  <div key={i} title={iso} style={{ aspectRatio:"1",borderRadius:6,background:done?"#44e2cd":isToday?"#1c2040":"#1a1d2e",border:`1px solid ${done?"#44e2cd66":isToday?"#5b9cf666":"#2e3254"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:done?"#071a0f":"#3a3d5a",fontWeight:700,transition:"all 0.2s" }}>
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Recent sessions */}
      {logs.length===0&&<div style={{ textAlign:"center",color:"#3a3d5a",padding:"36px 0" }}>No sessions yet. Complete a workout to track it!</div>}
      {logs.slice(0,15).map((log,i)=>(
        <div key={i} style={{ background:"#26293b",border:"1px solid #1e2140",borderRadius:12,padding:"12px 16px",marginBottom:8 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:"#44e2cd",flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700,color:"#dfe1f9",fontSize:14 }}>{log.sessionDay || "Workout"}</div>
              <div style={{ fontSize:12,color:"#3a3d5a",marginTop:1 }}>{log.exerciseCount} exercises · {log.groupCount} groups</div>
            </div>
            <div style={{ fontSize:12,color:"#3a3d5a",textAlign:"right" }}>
              {new Date(log.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
            </div>
            <button onClick={()=>deleteEntry(log.date)} title="Delete entry" style={{ background:"none",border:"none",color:"#f8717166",cursor:"pointer",fontSize:16,lineHeight:1,padding:"2px 4px",flexShrink:0,transition:"color 0.15s" }}
              onMouseOver={e=>e.currentTarget.style.color="#f87171"}
              onMouseOut={e=>e.currentTarget.style.color="#f8717166"}
            >×</button>
          </div>
          {log.exercises && log.exercises.length > 0 && (
            <div style={{ marginTop:8,paddingLeft:22,display:"flex",flexWrap:"wrap",gap:4 }}>
              {log.exercises.slice(0,6).map((e,ei)=>(
                <span key={ei} style={{ fontSize:10,background:"#1a1d2e",border:"1px solid #1e2140",borderRadius:6,padding:"2px 7px",color:"#5a5f7a" }}>
                  {e.name}{e.weight ? ` · ${e.weight}${e.weightUnit}` : ""}
                </span>
              ))}
              {log.exercises.length > 6 && <span style={{ fontSize:10,color:"#3a3d5a",alignSelf:"center" }}>+{log.exercises.length-6} more</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
