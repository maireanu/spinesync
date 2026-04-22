import { useMemo, useState } from "react";
import { T, DAYS, LBL } from "../constants.js";
import { computeStreak, todayISO, localDateISO } from "../helpers.js";
import { useWorkout } from "../context.jsx";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─── Achievements definition ──────────────────────────────────────────────────
function computeAchievements(workoutLog, streak) {
  const total = (workoutLog || []).length;
  const achievements = [
    { id: "first",    icon: "🌱", label: "First Workout",    desc: "Complete your first session",   unlocked: total >= 1 },
    { id: "week",     icon: "🗓️", label: "Week Warrior",     desc: "Complete 7 sessions",           unlocked: total >= 7 },
    { id: "month",    icon: "📅", label: "Monthly Champ",    desc: "Complete 30 sessions",          unlocked: total >= 30 },
    { id: "streak3",  icon: "🔥", label: "3-Day Streak",     desc: "3 days in a row",               unlocked: streak >= 3 },
    { id: "streak7",  icon: "⚡", label: "7-Day Streak",     desc: "7 days in a row",               unlocked: streak >= 7 },
    { id: "streak14", icon: "💪", label: "Fortnight Fire",   desc: "14 days in a row",              unlocked: streak >= 14 },
    { id: "streak30", icon: "🏆", label: "Monthly Master",   desc: "30 days in a row",              unlocked: streak >= 30 },
    { id: "half100",  icon: "🎯", label: "Halfway to 100",   desc: "Complete 50 sessions",          unlocked: total >= 50 },
    { id: "cent",     icon: "💯", label: "Centurion",        desc: "Complete 100 sessions",         unlocked: total >= 100 },
  ];
  return achievements;
}

export default function HistoryView() {
  const { workoutLog, setWorkoutLog } = useWorkout();
  const logs = (workoutLog||[]).slice().reverse();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const deleteEntry = (date) => {
    setWorkoutLog(prev => (prev||[]).filter(l => l.date !== date));
    setConfirmDelete(null);
  };
  const streak = computeStreak(workoutLog);
  const achievements = useMemo(() => computeAchievements(workoutLog, streak), [workoutLog, streak]);

  const chartData = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const iso = localDateISO(-(13 - i));
    const date = new Date(iso + "T12:00:00");
    const log = (workoutLog || []).find(l => l.date === iso);
    return { label: date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2), day: date.getDate(), exercises: log?.exerciseCount || 0, done: !!log };
  }), [workoutLog]);

  return (
    <div>
      <h2 style={{ margin:"0 0 20px",fontSize:24,color:T.text,fontWeight:900,letterSpacing:"-0.5px" }}>History</h2>

      {/* Streak card */}
      <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:22,marginBottom:20,display:"flex",alignItems:"center",gap:18,boxShadow:T.shadow }}>
        <div style={{ fontSize:48 }} aria-hidden="true">🔥</div>
        <div>
          <div style={{ fontSize:36,fontWeight:900,color:T.amber,lineHeight:1 }}>{streak}</div>
          <div style={{ fontSize:14,color:T.textSec,marginTop:4 }}>day streak</div>
        </div>
        <div style={{ flex:1,textAlign:"right" }}>
          <div style={{ fontSize:13,color:T.textMuted }}>{logs.length} total sessions</div>
        </div>
      </div>

      {/* Achievements */}
      <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:18,marginBottom:20,boxShadow:T.shadow }}>
        <div style={LBL}>Achievements</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginTop:8 }}>
          {achievements.map(a => (
            <div key={a.id} title={a.desc} aria-label={`${a.label}: ${a.unlocked ? "unlocked" : "locked"}`} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"12px 8px",borderRadius:12,background:a.unlocked?T.accent+"0c":T.surface,border:`1px solid ${a.unlocked?T.accent+"33":T.border}`,opacity:a.unlocked?1:0.4,transition:"all 0.2s" }}>
              <span style={{ fontSize:28 }} aria-hidden="true">{a.icon}</span>
              <span style={{ fontSize:11,fontWeight:800,color:a.unlocked?T.accent:T.textMuted,textAlign:"center",lineHeight:1.3 }}>{a.label}</span>
              <span style={{ fontSize:10,color:T.textMuted,textAlign:"center",lineHeight:1.3 }}>{a.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity chart - last 14 days */}
      <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:18,marginBottom:20,boxShadow:T.shadow }}>
        <div style={LBL}>Last 14 Days — Exercises Completed</div>
        <ResponsiveContainer width="100%" height={90}>
          <BarChart data={chartData} barCategoryGap="20%" margin={{ top:6,right:4,left:-30,bottom:0 }}>
            <XAxis dataKey="label" tick={{ fontSize:9,fill:T.textMuted }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,padding:"6px 10px" }}
              formatter={(v) => [v, "exercises"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload ? `Day ${payload[0].payload.day}` : ""}
            />
            <Bar dataKey="exercises" radius={[3,3,0,0]}>
              {chartData.map((entry,i) => <Cell key={i} fill={entry.done ? T.accent : T.border} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Calendar grid - last 28 days */}
      <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:18,marginBottom:20,boxShadow:T.shadow }}>
        <div style={LBL}>Last 28 Days</div>
        {(() => {
          const startDate = new Date(localDateISO(-27) + "T12:00:00");
          const startCol = (startDate.getDay() + 6) % 7;
          return (
            <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginTop:8 }}>
              {DAYS.map(d=><div key={d} style={{ textAlign:"center",fontSize:9,color:T.textMuted,fontWeight:700,padding:"4px 0" }}>{d[0]}</div>)}
              {Array.from({length:startCol}).map((_,i)=><div key={`sp${i}`} />)}
              {Array.from({length:28}).map((_,i)=>{
                const iso=localDateISO(-(27-i));
                const date=new Date(iso+"T12:00:00");
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
              <div style={{ display:"flex",alignItems:"center",gap:7,flexWrap:"wrap" }}>
                <span style={{ fontWeight:700,color:T.text,fontSize:14 }}>
                  {log.sessionLabel || "Workout"}
                </span>
                {log.garminType && (
                  <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.05em",background:T.accent+"14",color:T.accent,border:`1px solid ${T.accent}30`,borderRadius:5,padding:"1px 7px" }}>
                    {log.garminType}
                  </span>
                )}
              </div>
              <div style={{ fontSize:12,color:T.textMuted,marginTop:2 }}>
                {log.exerciseCount||0} exercises
                {log.duration ? ` · ${log.duration} min` : ""}
              </div>
            </div>
            <div style={{ fontSize:12,color:T.textMuted,textAlign:"right",flexShrink:0 }}>
              {new Date(log.date + "T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}
            </div>
            {confirmDelete === log.date ? (
              <div style={{ display:"flex",gap:4,alignItems:"center",flexShrink:0 }}>
                <button onClick={()=>deleteEntry(log.date)} style={{ background:T.red,border:"none",borderRadius:6,color:"#fff",padding:"3px 9px",cursor:"pointer",fontSize:11,fontWeight:700 }}>Delete</button>
                <button onClick={()=>setConfirmDelete(null)} style={{ background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.textMuted,padding:"3px 9px",cursor:"pointer",fontSize:11 }}>Cancel</button>
              </div>
            ) : (
            <button onClick={()=>setConfirmDelete(log.date)} title="Delete entry" style={{ background:"none",border:"none",color:T.red+"66",cursor:"pointer",fontSize:16,lineHeight:1,padding:"2px 4px",flexShrink:0,transition:"color 0.15s" }}
              onMouseOver={e=>e.currentTarget.style.color=T.red}
              onMouseOut={e=>e.currentTarget.style.color=T.red+"66"}
            >×</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
