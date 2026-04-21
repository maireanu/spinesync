import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import { House, CalendarTags, LibraryBig, Flame, Database } from "lucide-react";
import { T } from "./constants.js";
import { computeStreak } from "./helpers.js";
import { SpineSyncLogo } from "./components/ui.jsx";
import { WorkoutProvider, useWorkout } from "./context.jsx";
import TodayView from "./views/TodayView.jsx";
import ScheduleView from "./views/ScheduleView.jsx";
import ExercisesView from "./views/ExercisesView.jsx";
import HistoryView from "./views/HistoryView.jsx";
import ImportExportView from "./views/ImportExportView.jsx";

const NAV = [
  { path: "/",         label: "Today",    icon: <House size={20} /> },
  { path: "/schedule", label: "Schedule", icon: <CalendarTags size={20} /> },
  { path: "/library",  label: "Library",  icon: <LibraryBig size={20} /> },
  { path: "/history",  label: "History",  icon: <Flame size={20} /> },
  { path: "/data",     label: "Data",     icon: <Database size={20} /> },
];

function AppContent() {
  const { workoutLog } = useWorkout();
  const location = useLocation();
  const streak = computeStreak(workoutLog);
  const activeNav = NAV.find(n => n.path !== "/" ? location.pathname.startsWith(n.path) : location.pathname === "/") || NAV[0];

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
        @media(min-width:768px){
          .app-layout{display:flex;flex-direction:row;align-items:flex-start;}
          .side-nav{position:sticky;top:0;height:100vh;width:200px;flex-shrink:0;display:flex;flex-direction:column;padding:20px 12px;background:${T.card};border-right:1px solid ${T.border};gap:4px;overflow-y:auto;}
          .bottom-nav{display:none!important;}
          .main-content{flex:1;min-width:0;max-width:660px;padding:20px 24px 40px;}
        }
        @media(max-width:767px){
          .side-nav{display:none!important;}
          .main-content{padding:20px 16px 100px;}
        }
      `}</style>

      {/* Header */}
      <div style={{ padding:"12px 18px",background:T.headerBg,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 0 "+T.border }}>
        <div style={{ maxWidth:900,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <SpineSyncLogo size={28} />
            <div>
              <div style={{ fontWeight:900,fontSize:16,color:T.text,lineHeight:1,letterSpacing:"-0.02em" }}>SpineSync</div>
              <div style={{ fontSize:10,color:T.textMuted,marginTop:2,letterSpacing:"0.08em" }}>PHYSICAL THERAPY & EXERCISE</div>
            </div>
          </div>
          {streak > 0 && (
            <div style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:999,padding:"5px 13px" }} role="status" aria-label={`${streak} day streak`}>
              <Flame size={14} color={T.amber} style={{ marginBottom: 1 }} aria-hidden="true" />
              <span style={{ color:T.amber,fontWeight:800,fontSize:13 }}>{streak} day streak</span>
            </div>
          )}
        </div>
      </div>

      <div className="app-layout" style={{ maxWidth:900,margin:"0 auto" }}>
        {/* Sidebar nav (desktop) */}
        <nav className="side-nav" aria-label="Main navigation">
          {NAV.map(item => {
            const isActive = item.path !== "/" ? location.pathname.startsWith(item.path) : location.pathname === "/";
            return (
              <NavLink key={item.path} to={item.path} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:12,textDecoration:"none",background:isActive?T.accent+"14":"transparent",color:isActive?T.accent:T.textSec,fontWeight:700,fontSize:14,transition:"all 0.15s" }}
                aria-current={isActive?"page":undefined}>
                <span aria-hidden="true" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="main-content" id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<TodayView />} />
            <Route path="/schedule" element={<ScheduleView />} />
            <Route path="/library" element={<ExercisesView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/data" element={<ImportExportView />} />
            <Route path="*" element={<TodayView />} />
          </Routes>
        </main>
      </div>

      {/* Bottom Nav (mobile) */}
      <div className="bottom-nav" style={{ position:"fixed",bottom:0,left:0,right:0,display:"flex",justifyContent:"center",zIndex:50,padding:"0 16px 12px",pointerEvents:"none" }}>
        <nav style={{ display:"flex",alignItems:"center",background:T.navBg,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRadius:16,padding:"4px",gap:2,boxShadow:T.shadowLg,border:`1px solid ${T.border}`,pointerEvents:"all",width:"100%",maxWidth:420 }} aria-label="Main navigation">
          {NAV.map(item => {
            const isActive = item.path !== "/" ? location.pathname.startsWith(item.path) : location.pathname === "/";
            return (
              <NavLink key={item.path} to={item.path} style={{ flex:1,background:isActive?T.accent:"transparent",borderRadius:12,padding:"8px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all 0.2s ease",textDecoration:"none",color:isActive?"#fff":T.textMuted }}
                aria-label={item.label} aria-current={isActive?"page":undefined}>
                <span style={{ display:"flex",alignItems:"center",justifyContent:"center" }} aria-hidden="true">{item.icon}</span>
                <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.02em" }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WorkoutProvider>
      <AppContent />
    </WorkoutProvider>
  );
}
