import { useState, useEffect } from "react";
import { EXERCISES as DEFAULT_EXERCISES, SCHEDULE as DEFAULT_SCHEDULE } from "./exercises-data.js";
import { T } from "./constants.js";
import { computeStreak } from "./helpers.js";
import { SpineSyncLogo } from "./components/ui.jsx";
import TodayView from "./views/TodayView.jsx";
import ScheduleView from "./views/ScheduleView.jsx";
import ExercisesView from "./views/ExercisesView.jsx";
import HistoryView from "./views/HistoryView.jsx";
import ImportExportView from "./views/ImportExportView.jsx";

export default function App() {
  const [view,setView] = useState("today");

  const load = (key,def) => { try { const s=localStorage.getItem(key); return s?JSON.parse(s):def; } catch { return def; } };

  const [exercises,setExercises] = useState(()=>load("pt_ex_v3",DEFAULT_EXERCISES));
  const [schedule,setSchedule]   = useState(()=>load("pt_sch_v3",DEFAULT_SCHEDULE));
  const [workoutLog,setWorkoutLog]= useState(()=>load("pt_log_v3",[]));

  useEffect(()=>{ try{localStorage.setItem("pt_ex_v3",JSON.stringify(exercises));}catch{} },[exercises]);
  useEffect(()=>{ try{localStorage.setItem("pt_sch_v3",JSON.stringify(schedule));}catch{} },[schedule]);
  useEffect(()=>{ try{localStorage.setItem("pt_log_v3",JSON.stringify(workoutLog));}catch{} },[workoutLog]);

  const streak = computeStreak(workoutLog);

  const nav = [
    { key:"today",  label:"Today",    icon:"🏠" },
    { key:"schedule",label:"Schedule",icon:"📅" },
    { key:"exercises",label:"Library",icon:"📚" },
    { key:"history",label:"History",  icon:"🔥" },
    { key:"data",   label:"Data",     icon:"💾" },
  ];

  return (
    <div style={{ minHeight:"100vh",background:T.bg,fontFamily:"'Manrope',system-ui,sans-serif",color:T.text }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px;}
        select,textarea,input{font-family:inherit;}
        select option{background:${T.card};}
        button:disabled{opacity:0.3;cursor:default!important;}
        input:focus,textarea:focus,select:focus{border-color:${T.accent}!important;box-shadow:0 0 0 3px rgba(13,148,136,0.1)!important;}
        @keyframes spinePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.15)}}
      `}</style>

      {/* Header */}
      <div style={{ padding:"12px 18px",background:T.headerBg,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 0 "+T.border }}>
        <div style={{ maxWidth:660,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <SpineSyncLogo size={28} />
            <div>
              <div style={{ fontWeight:900,fontSize:16,color:T.text,lineHeight:1,letterSpacing:"-0.02em" }}>SpineSync</div>
              <div style={{ fontSize:10,color:T.textMuted,marginTop:2,letterSpacing:"0.08em" }}>PHYSICAL THERAPY & EXERCISE</div>
            </div>
          </div>
          {streak>0&&(
            <div style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:999,padding:"5px 13px" }}>
              <span style={{ fontSize:13 }}>🔥</span>
              <span style={{ color:T.amber,fontWeight:800,fontSize:13 }}>{streak} day streak</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:660,margin:"0 auto",padding:"20px 16px 100px" }}>
        {view==="today"    && <TodayView    schedule={schedule} exercises={exercises} workoutLog={workoutLog} setWorkoutLog={setWorkoutLog} />}
        {view==="schedule" && <ScheduleView schedule={schedule} setSchedule={setSchedule} exercises={exercises} workoutLog={workoutLog} />}
        {view==="exercises"&& <ExercisesView exercises={exercises} setExercises={setExercises} />}
        {view==="history"  && <HistoryView  workoutLog={workoutLog} setWorkoutLog={setWorkoutLog} />}
        {view==="data"     && <ImportExportView exercises={exercises} setExercises={setExercises} schedule={schedule} setSchedule={setSchedule} workoutLog={workoutLog} setWorkoutLog={setWorkoutLog} />}
      </div>

      {/* Bottom Nav */}
      <div style={{ position:"fixed",bottom:0,left:0,right:0,display:"flex",justifyContent:"center",zIndex:50,padding:"0 16px 12px",pointerEvents:"none" }}>
        <div style={{ display:"flex",alignItems:"center",background:T.navBg,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRadius:16,padding:"4px",gap:2,boxShadow:T.shadowLg,border:`1px solid ${T.border}`,pointerEvents:"all",width:"100%",maxWidth:420 }}>
          {nav.map(item=>(
            <button key={item.key} onClick={()=>setView(item.key)} style={{
              flex:1,background:view===item.key?T.accent:"transparent",
              border:"none",cursor:"pointer",borderRadius:12,padding:"8px 4px",
              display:"flex",flexDirection:"column",alignItems:"center",gap:2,
              transition:"all 0.2s ease"
            }}>
              <span style={{ fontSize:16,lineHeight:1,opacity:view===item.key?1:0.5,filter:view===item.key?"brightness(0) invert(1)":"none" }}>{item.icon}</span>
              <span style={{ fontSize:10,fontWeight:700,color:view===item.key?"#fff":T.textMuted,letterSpacing:"0.02em" }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
