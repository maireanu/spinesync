import { useState, useEffect } from "react";
import { EXERCISES as DEFAULT_EXERCISES, SCHEDULE as DEFAULT_SCHEDULE } from "./exercises-data.js";
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
    <div style={{ minHeight:"100vh",background:"#1a1d2e",fontFamily:"'Manrope',system-ui,sans-serif",color:"#dfe1f9" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:0px;}
        select,textarea,input{font-family:inherit;}
        select option{background:#26293b;}
        button:disabled{opacity:0.25;cursor:default!important;}
        input:focus,textarea:focus,select:focus{border-color:#5b9cf6!important;}
        @keyframes spinePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.15)}}
      `}</style>

      {/* Header */}
      <div style={{ padding:"14px 18px 12px",background:"rgba(11,13,30,0.6)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:50,boxShadow:"0px 24px 48px rgba(0,0,0,0.4)",outline:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth:660,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <SpineSyncLogo size={30} />
            <div>
              <div style={{ fontWeight:900,fontSize:17,color:"#dfe1f9",lineHeight:1,letterSpacing:"-0.02em" }}>SpineSync</div>
              <div style={{ fontSize:10,color:"#414752",marginTop:2,letterSpacing:"0.08em" }}>PHYSICAL THERAPY & EXERCISE</div>
            </div>
          </div>
          {streak>0&&(
            <div style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(186,127,246,0.1)",outline:"1px solid rgba(186,127,246,0.2)",borderRadius:999,padding:"5px 13px" }}>
              <span style={{ fontSize:13 }}>🔥</span>
              <span style={{ color:"#ba7ff6",fontWeight:800,fontSize:13 }}>{streak} day streak</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:660,margin:"0 auto",padding:"24px 16px 112px" }}>
        {view==="today"    && <TodayView    schedule={schedule} exercises={exercises} workoutLog={workoutLog} setWorkoutLog={setWorkoutLog} />}
        {view==="schedule" && <ScheduleView schedule={schedule} setSchedule={setSchedule} exercises={exercises} workoutLog={workoutLog} />}
        {view==="exercises"&& <ExercisesView exercises={exercises} setExercises={setExercises} />}
        {view==="history"  && <HistoryView  workoutLog={workoutLog} setWorkoutLog={setWorkoutLog} />}
        {view==="data"     && <ImportExportView exercises={exercises} setExercises={setExercises} schedule={schedule} setSchedule={setSchedule} workoutLog={workoutLog} setWorkoutLog={setWorkoutLog} />}
      </div>

      {/* Bottom Nav */}
      <div style={{ position:"fixed",bottom:20,left:0,right:0,display:"flex",justifyContent:"center",zIndex:50,pointerEvents:"none" }}>
        <div style={{ display:"flex",alignItems:"center",background:"rgba(31,34,53,0.9)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",borderRadius:999,padding:"6px 8px",gap:4,boxShadow:"0px 24px 48px rgba(0,0,0,0.5)",outline:"1px solid rgba(255,255,255,0.09)",pointerEvents:"all" }}>
          {nav.map(item=>(
            <button key={item.key} onClick={()=>setView(item.key)} style={{ background:view===item.key?"#5b9cf6":"transparent",border:"none",cursor:"pointer",borderRadius:999,height:44,minWidth:44,padding:view===item.key?"0 16px 0 12px":"0",display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:view===item.key?"0 0 20px rgba(91,156,246,0.45)":"none",flexShrink:0 }}>
              <span style={{ fontSize:18,lineHeight:1,filter:view===item.key?"brightness(0) invert(1)":"none",opacity:view===item.key?1:0.4,flexShrink:0 }}>{item.icon}</span>
              {view===item.key && <span style={{ fontSize:12,fontWeight:800,letterSpacing:"0.03em",color:"#0f1223",whiteSpace:"nowrap" }}>{item.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
