
import { useState, useEffect, useRef, useCallback } from "react";
import { EXERCISES as DEFAULT_EXERCISES, SCHEDULE as DEFAULT_SCHEDULE } from "./exercises-data.js";

// ─── LOGO ────────────────────────────────────────────────────────────────────
function SpineSyncLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="spinesync-lg" x1="20" y1="5" x2="20" y2="41" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#44e2cd"/>
          <stop offset="55%" stopColor="#5b9cf6"/>
          <stop offset="100%" stopColor="#a589f8"/>
        </linearGradient>
      </defs>
      {/* Sync arc · 270° CW sweep around the spine */}
      <path d="M 4.44 7.44 A 22 22 0 1 1 4.44 38.56"
            stroke="url(#spinesync-lg)" strokeWidth="3" strokeLinecap="round"/>
      {/* Arrowhead at arc end */}
      <path d="M 5.73 43.39 L 4.44 38.56 L 9.27 39.85"
            stroke="url(#spinesync-lg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {/* 5 vertebra discs */}
      <rect x="14" y="5"  width="12" height="4" rx="2" fill="url(#spinesync-lg)"/>
      <rect x="14" y="13" width="12" height="4" rx="2" fill="url(#spinesync-lg)"/>
      <rect x="14" y="21" width="12" height="4" rx="2" fill="url(#spinesync-lg)"/>
      <rect x="14" y="29" width="12" height="4" rx="2" fill="url(#spinesync-lg)"/>
      <rect x="14" y="37" width="12" height="4" rx="2" fill="url(#spinesync-lg)"/>
    </svg>
  );
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const FULL_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const GROUP_COLORS = ["#5b9cf6","#f87171","#44e2cd","#a589f8","#fbbf24","#f472b6"];
const CATEGORY_META = {
  physical_therapy: { label: "Physical Therapy", icon: "🩺", color: "#5b9cf6" },
  muscle:           { label: "Muscle",            icon: "💪", color: "#f87171" },
  cardio:           { label: "Cardio",            icon: "🏃", color: "#44e2cd" },
  breathing:        { label: "Breathing",         icon: "🫁", color: "#a589f8" },
};
const WEIGHT_UNITS = ["kg","lbs","band","bodyweight"];
const DIFF_COLOR = { Easy:"#44e2cd", Medium:"#fbbf24", Hard:"#f87171" };

// ─── DEFAULT DATA — imported from exercises-data.js ─────────────────────────
// DEFAULT_EXERCISES and DEFAULT_SCHEDULE are imported at the top of this file.

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getExerciseById(exercises, id) {
  for (const cat of Object.values(exercises)) {
    const found = cat.find(e => e.id === id);
    if (found) return found;
  }
  return null;
}
function uid() { return Math.random().toString(36).slice(2,8); }
function todayKey() {
  const d = new Date().getDay();
  return DAYS[d === 0 ? 6 : d - 1];
}
function todayISO() { return new Date().toISOString().slice(0,10); }
function parseSets(duration) {
  const m = duration.match(/^(\d+)\s*[×x]/);
  return m ? parseInt(m[1]) : 1;
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Badge({ color, children, small }) {
  return <span style={{ background:color+"1e", color, border:`1px solid ${color}40`, borderRadius:6, padding: small?"1px 6px":"2px 8px", fontSize:small?10:11, fontWeight:700, letterSpacing:"0.02em", whiteSpace:"nowrap" }}>{children}</span>;
}

function WeightBadge({ weight, weightUnit }) {
  if (!weight && weightUnit !== "bodyweight" && weightUnit !== "band") return null;
  const label = weightUnit === "bodyweight" ? "Bodyweight"
              : weightUnit === "band" ? "Band"
              : `${weight} ${weightUnit}`;
  return <Badge color="#fbbf24">⚖ {label}</Badge>;
}

function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(5,6,14,0.88)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0",backdropFilter:"blur(8px)" }} onClick={onClose}>
      <div style={{ background:"#26293b",border:"1px solid #313446",borderRadius:"20px 20px 0 0",maxWidth:wide?660:540,width:"100%",maxHeight:"92vh",overflowY:"auto",padding:"6px 0 0",boxShadow:"0 -20px 60px rgba(0,0,0,0.6)" }} onClick={e=>e.stopPropagation()}>
        {/* drag handle */}
        <div style={{ width:36,height:4,background:"#313446",borderRadius:2,margin:"10px auto 0" }} />
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 22px 14px" }}>
          <h3 style={{ margin:0,fontSize:17,color:"#dfe1f9",fontWeight:800 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"#2e3254",border:"none",color:"#6b7280",cursor:"pointer",fontSize:22,lineHeight:1,padding:"4px 8px",borderRadius:8 }}>×</button>
        </div>
        <div style={{ padding:"0 22px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

const INP = { width:"100%",background:"#1a1d2e",border:"1px solid #313446",borderRadius:9,padding:"9px 13px",color:"#dfe1f9",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10,transition:"border-color 0.2s" };
const LBL = { fontSize:11,color:"#5a5f7a",marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700 };

// ─── REST TIMER ───────────────────────────────────────────────────────────────
function RestTimer({ onDismiss }) {
  const [secs, setSecs] = useState(60);
  const [running, setRunning] = useState(true);
  const [preset, setPreset] = useState(60);
  const ref = useRef(null);

  useEffect(() => {
    if (running && secs > 0) {
      ref.current = setInterval(() => setSecs(s => s - 1), 1000);
    } else if (secs === 0) {
      setRunning(false);
    }
    return () => clearInterval(ref.current);
  }, [running, secs]);

  const reset = (s) => { clearInterval(ref.current); setPreset(s); setSecs(s); setRunning(true); };
  const pct = secs / preset;
  const r = 36; const circ = 2 * Math.PI * r;

  return (
    <div style={{ position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",zIndex:400,background:"#26293b",border:"1px solid #313446",borderRadius:20,padding:"16px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:10,boxShadow:"0 8px 40px rgba(0,0,0,0.6)",minWidth:240 }}>
      <div style={{ fontSize:12,color:"#5a5f7a",fontWeight:700,letterSpacing:"0.1em" }}>REST TIMER</div>

      <svg width={90} height={90} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={45} cy={45} r={r} fill="none" stroke="#2e3254" strokeWidth={6} />
        <circle cx={45} cy={45} r={r} fill="none" stroke={secs===0?"#f87171":"#44e2cd"} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 0.9s linear" }} />
        <text x={45} y={45} textAnchor="middle" dominantBaseline="middle" fill={secs===0?"#f87171":"#dfe1f9"} fontSize={18} fontWeight={800} style={{ transform:"rotate(90deg)",transformOrigin:"45px 45px" }}>
          {secs === 0 ? "GO!" : `${secs}s`}
        </text>
      </svg>

      <div style={{ display:"flex",gap:6 }}>
        {[30,60,90].map(s => (
          <button key={s} onClick={() => reset(s)} style={{ background: preset===s?"#44e2cd33":"#2e3254", border:`1px solid ${preset===s?"#44e2cd":"#313446"}`, borderRadius:8, color: preset===s?"#44e2cd":"#9399b8", padding:"5px 12px", cursor:"pointer", fontSize:12, fontWeight:700 }}>{s}s</button>
        ))}
      </div>

      <button onClick={onDismiss} style={{ background:"none",border:"none",color:"#5a5f7a",cursor:"pointer",fontSize:12,padding:"2px 8px" }}>Dismiss</button>
    </div>
  );
}

// ─── EXERCISE DETAIL MODAL ────────────────────────────────────────────────────
function mediaType(url) {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/\.(mp4|webm)(\?|$)/i.test(url)) return "video";
  return "image";
}

function toYouTubeEmbed(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : url;
}

function MediaView({ url, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const type = mediaType(url);
  if (!type || error) return null;

  const wrap = {
    marginBottom: 16, borderRadius: 12, overflow: "hidden",
    background: "#1a1d2e", position: "relative", minHeight: 160,
  };
  const skeleton = {
    position: "absolute", inset: 0,
    background: "linear-gradient(90deg,#26293b 25%,#1a1e3a 50%,#26293b 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    display: loaded ? "none" : "block",
    borderRadius: 12,
  };

  if (type === "youtube") {
    return (
      <div style={wrap}>
        <iframe
          src={toYouTubeEmbed(url)}
          title={alt}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", height: 220, border: "none", display: "block" }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
    );
  }

  if (type === "video") {
    return (
      <div style={wrap}>
        <video
          src={url}
          controls
          loop
          muted
          playsInline
          style={{ width: "100%", maxHeight: 260, display: "block", objectFit: "contain" }}
          onCanPlay={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // image / gif
  return (
    <div style={wrap}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={skeleton} />
      <img
        src={url}
        alt={alt}
        style={{ width: "100%", maxHeight: 260, objectFit: "contain", display: loaded ? "block" : "none" }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

function ExerciseDetailModal({ ex, category, open, onClose }) {
  if (!ex || !category) return null;
  const meta = CATEGORY_META[category];
  return (
    <Modal open={open} onClose={onClose} title={ex.name}>
      <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:18 }}>
        <Badge color={meta.color}>{meta.icon} {meta.label}</Badge>
        <Badge color={DIFF_COLOR[ex.difficulty]}>{ex.difficulty}</Badge>
        <WeightBadge weight={ex.weight} weightUnit={ex.weightUnit} />
      </div>
      <MediaView url={ex.image} alt={ex.name} />
      <div style={{ marginBottom:16 }}>
        <div style={LBL}>Duration / Sets</div>
        <div style={{ color:meta.color,fontWeight:800,fontSize:16 }}>{ex.duration}</div>
      </div>
      {(ex.weight || ex.weightUnit === "bodyweight" || ex.weightUnit === "band") && (
        <div style={{ marginBottom:16 }}>
          <div style={LBL}>Load</div>
          <div style={{ color:"#fbbf24",fontWeight:700,fontSize:14 }}>
            {ex.weightUnit==="bodyweight" ? "Bodyweight" : ex.weightUnit==="band" ? "Resistance Band" : `${ex.weight} ${ex.weightUnit}`}
          </div>
        </div>
      )}
      <div style={{ marginBottom:16 }}>
        <div style={LBL}>Muscles Used</div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{ex.muscles.map(m=><Badge key={m} color="#9399b8">{m}</Badge>)}</div>
      </div>
      <div style={{ marginBottom: ex.notes ? 16 : 0 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
          <div style={LBL}>💡 How To</div>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise how to')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:"#f87171",textDecoration:"none",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:20,padding:"3px 10px",transition:"background 0.2s" }}
            onMouseOver={e=>e.currentTarget.style.background="rgba(248,113,113,0.22)"}
            onMouseOut={e=>e.currentTarget.style.background="rgba(248,113,113,0.1)"}
          >
            ▶ Watch on YouTube
          </a>
        </div>
        <div style={{ background:"#1a1d2e",borderRadius:10,padding:"13px 15px",color:"#c4c8e8",fontSize:14,lineHeight:1.75,borderLeft:`3px solid ${meta.color}` }}>{ex.tips}</div>
      </div>
      {ex.notes && (
        <div style={{ marginTop:16 }}>
          <div style={LBL}>📝 Personal Notes</div>
          <div style={{ background:"#1a1d2e",borderRadius:10,padding:"13px 15px",color:"#9399b8",fontSize:13,lineHeight:1.7,borderLeft:"3px solid #fbbf24" }}>{ex.notes}</div>
        </div>
      )}
    </Modal>
  );
}

// ─── SESSION QUEUE ────────────────────────────────────────────────────────────
// Builds the ordered, repeating list of workout sessions from the weekly pattern.
// Rest days (days with no groups) are skipped — they are natural recovery gaps in
// the cycle, not scheduled sessions.
function buildSessionPattern(schedule) {
  return DAYS
    .filter(day => (schedule[day] || []).length > 0)
    .map(day => ({ dayKey: day, dayLabel: FULL_DAYS[DAYS.indexOf(day)], groups: schedule[day] }));
}

// ─── WORKOUT TIMERS ───────────────────────────────────────────────────────────
function formatElapsed(ms) {
  if (ms < 0) ms = 0;
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function useElapsed(startedAt, endedAt) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!startedAt || endedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt, endedAt]);
  if (!startedAt) return null;
  return (endedAt ? new Date(endedAt).getTime() : now) - new Date(startedAt).getTime();
}

function GroupTimerBadge({ startedAt, endedAt }) {
  const elapsed = useElapsed(startedAt, endedAt);
  if (elapsed === null) return null;
  const running = !!startedAt && !endedAt;
  return (
    <span style={{ fontSize:11,fontVariantNumeric:"tabular-nums",fontWeight:700,color:running?"#44e2cd":"#fbbf2488",background:running?"rgba(68,226,205,0.08)":"rgba(251,191,36,0.06)",border:`1px solid ${running?"rgba(68,226,205,0.2)":"rgba(251,191,36,0.15)"}`,borderRadius:6,padding:"2px 8px",flexShrink:0 }}>
      ⏱ {formatElapsed(elapsed)}
    </span>
  );
}

function GroupSessionTimer({ groupName, color, startedAt, endedAt }) {
  const elapsed = useElapsed(startedAt, endedAt);
  if (elapsed === null) return null;
  const running = !!startedAt && !endedAt;
  return (
    <div style={{ display:"flex",alignItems:"center",gap:10,background:"#1a1d2e",border:`1px solid ${running?`${color}40`:"rgba(251,191,36,0.2)"}`,borderRadius:12,padding:"9px 14px",margin:"0 16px 8px" }}>
      <div style={{ width:7,height:7,borderRadius:"50%",background:running?color:"#fbbf24",flexShrink:0,...(running?{animation:"spinePulse 1.5s ease-in-out infinite"}:{}) }} />
      <span style={{ fontSize:11,color:"#5a5f7a",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" }}>Group Time</span>
      <span style={{ flex:1,textAlign:"right",fontVariantNumeric:"tabular-nums",fontSize:18,fontWeight:900,color:running?color:"#fbbf24",letterSpacing:"0.04em" }}>{formatElapsed(elapsed)}</span>
      {!running && <span style={{ fontSize:10,color:"#fbbf24",fontWeight:700 }}>DONE ✓</span>}
    </div>
  );
}

function TotalSessionTimer({ groupTimers }) {
  const [now, setNow] = useState(Date.now());
  const anyRunning = Object.values(groupTimers || {}).some(t => t.startedAt && !t.endedAt);
  useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [anyRunning]);

  const entries = Object.values(groupTimers || {}).filter(t => t.startedAt);
  if (entries.length === 0) return null;

  const totalMs = entries.reduce((sum, t) => {
    const end = t.endedAt ? new Date(t.endedAt).getTime() : now;
    return sum + Math.max(0, end - new Date(t.startedAt).getTime());
  }, 0);
  const allDone = entries.length > 0 && entries.every(t => t.endedAt);

  return (
    <div style={{ display:"flex",alignItems:"center",gap:10,background:"#1f2235",border:`1px solid ${allDone?"rgba(251,191,36,0.2)":"rgba(68,226,205,0.25)"}`,borderRadius:14,padding:"11px 16px",marginBottom:22 }}>
      <div style={{ width:8,height:8,borderRadius:"50%",background:allDone?"#fbbf24":"#44e2cd",flexShrink:0,...(!allDone?{animation:"spinePulse 1.5s ease-in-out infinite"}:{}) }} />
      <span style={{ fontSize:11,color:"#5a5f7a",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" }}>Total Session Time</span>
      <span style={{ flex:1,textAlign:"right",fontVariantNumeric:"tabular-nums",fontSize:22,fontWeight:900,color:allDone?"#fbbf24":"#44e2cd",letterSpacing:"0.04em" }}>{formatElapsed(totalMs)}</span>
      {allDone && <span style={{ fontSize:11,color:"#fbbf24",fontWeight:700 }}>DONE ✓</span>}
    </div>
  );
}

// ─── TODAY VIEW ───────────────────────────────────────────────────────────────
function TodayView({ schedule, exercises, workoutLog, setWorkoutLog }) {
  const tISO = todayISO();

  // Build the ordered session pattern from the weekly schedule
  const sessionPattern = buildSessionPattern(schedule);
  // Don't count today's completed session — keep showing today's routine until tomorrow
  const todayLog = (workoutLog || []).find(l => l.date === tISO);
  const completedCount = (workoutLog || []).filter(l => l.date !== tISO).length;

  // Current session = next uncompleted in the cycle (wraps after full cycle)
  const currentSession = sessionPattern.length > 0
    ? sessionPattern[completedCount % sessionPattern.length]
    : null;
  const sessionNumber = completedCount + 1;
  const groups = currentSession ? currentSession.groups : [];

  // setsLog persisted in localStorage keyed by date – survives navigation and refresh
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

  // Explicit start functions — timers never auto-start from set counts
  const startSession = () => {
    const now = new Date().toISOString();
    // Start the first group if none started yet
    const firstGroup = groups[0];
    setTimers(prev => {
      if (Object.values(prev.groups || {}).some(t => t.startedAt)) return prev;
      return { ...prev, groups: { ...(prev.groups || {}), ...(firstGroup ? { [firstGroup.id]: { startedAt: now, endedAt: null } } : {}) } };
    });
  };
  const startGroup = (gid) => {
    const now = new Date().toISOString();
    setTimers(prev => {
      const updatedGroups = { ...(prev.groups || {}), [gid]: { startedAt: now, endedAt: null } };
      return { ...prev, groups: updatedGroups };
    });
  };

  // Auto-stop a group when all its sets are done; auto-open the next group; re-open if undone
  useEffect(() => {
    const now = new Date().toISOString();
    setTimers(prev => {
      const updatedGroups = { ...(prev.groups || {}) };
      let changed = false;
      groups.forEach((g, gIdx) => {
        if (!updatedGroups[g.id]?.startedAt) return; // only track groups that were started
        const groupAllDone = g.exercises.every((_, i) => {
          const ex = getExerciseById(exercises, g.exercises[i].exerciseId);
          return (setsLog[`${g.id}_${i}`] || 0) >= parseSets(ex?.duration || "1");
        });
        if (groupAllDone && !updatedGroups[g.id]?.endedAt) {
          updatedGroups[g.id] = { ...updatedGroups[g.id], endedAt: now };
          changed = true;
          // Auto-start the next group if it hasn't been started yet
          const nextGroup = groups[gIdx + 1];
          if (nextGroup && !updatedGroups[nextGroup.id]?.startedAt) {
            updatedGroups[nextGroup.id] = { startedAt: now, endedAt: null };
            changed = true;
          }
        }
        // Re-open if user undoes a set that made the group complete
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
    const ex = getExerciseById(exercises, slot.exerciseId);
    return a + (ex ? parseSets(ex.duration) : 1);
  },0),0);

  const doneSets = Object.values(setsLog).reduce((s,v)=>s+v,0);
  const totalEx = groups.reduce((s,g)=>s+g.exercises.length,0);
  const doneEx = groups.reduce((s,g)=>s+g.exercises.filter((_,i)=>{
    const key=`${g.id}_${i}`;
    const ex=getExerciseById(exercises,g.exercises[i].exerciseId);
    return (setsLog[key]||0) >= (ex?parseSets(ex.duration):1);
  }).length,0);

  const isExDone = (gid, idx, ex) => (setsLog[`${gid}_${idx}`]||0) >= parseSets(ex?.duration||"1");
  const isGroupDone = (g) => g.exercises.every((_,i)=>{ const ex=getExerciseById(exercises,g.exercises[i].exerciseId); return isExDone(g.id,i,ex); });

  const addSet = (gid, idx, ex) => {
    const key=`${gid}_${idx}`;
    const total=parseSets(ex?.duration||"1");
    const cur=setsLog[key]||0;
    if(cur<total){
      const next=cur+1;
      setSetsLog(s=>({...s,[key]:next}));
      if(next<total) setShowTimer(true);
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

  // Mark session complete
  const markDayDone = () => {
    const now = new Date().toISOString();
    // End any running group timers
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
        const ex = getExerciseById(exercises, slot.exerciseId);
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
      {/* Header */}
      <div style={{ marginBottom:22 }}>
        <div style={{ fontSize:11,color:"#8b919d",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6,fontWeight:600 }}>
          {today.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
        </div>
        <h2 style={{ margin:"0 0 8px",fontSize:30,color:"#dfe1f9",fontWeight:900,letterSpacing:"-0.04em" }}>Today's Workout</h2>
        {currentSession && (
          <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:"rgba(91,156,246,0.1)",outline:"1px solid rgba(91,156,246,0.2)",borderRadius:999,padding:"4px 12px",marginBottom:8 }}>
            <span style={{ fontSize:11,color:"#5b9cf6",fontWeight:700 }}>Session {sessionNumber}</span>
            <span style={{ fontSize:11,color:"#5a5f7a" }}>·</span>
            <span style={{ fontSize:11,color:"#8b919d" }}>{currentSession.dayLabel} routine</span>
          </div>
        )}
        {totalEx > 0 && (
          <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap" }}>
            <span style={{ fontSize:13,color:"#5a5f7a" }}>{doneEx}/{totalEx} exercises</span>
            <span style={{ color:"#313446" }}>·</span>
            <span style={{ fontSize:13,color:"#5a5f7a" }}>{doneSets}/{totalSets} sets</span>
            <span style={{ color:"#313446" }}>·</span>
            <span style={{ fontSize:13,color:"#5a5f7a" }}>{groups.length} group{groups.length!==1?"s":""}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {totalSets > 0 && (
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
            <span style={{ fontSize:13,color:"#c1c7d4",fontWeight:500 }}>{doneEx}/{totalEx} exercises · {doneSets}/{totalSets} sets</span>
            <span style={{ fontSize:14,color:"#5b9cf6",fontWeight:800 }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ background:"#323346",borderRadius:100,height:7,overflow:"hidden" }}>
            <div style={{ height:"100%",background:"linear-gradient(90deg,#5b9cf6,#a589f8,#44e2cd)",borderRadius:100,width:`${pct}%`,transition:"width 0.4s ease",boxShadow:"0 0 12px rgba(79,156,249,0.35)" }} />
          </div>
        </div>
      )}

      {/* Session timer / Start Workout button */}
      {groups.length > 0 && !log && (
        Object.values(timers.groups || {}).some(t => t.startedAt)
          ? <TotalSessionTimer groupTimers={timers.groups} />
          : <button onClick={startSession} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,width:"100%",background:"linear-gradient(135deg,#1a2e1a,#1a1d2e)",border:"1px solid rgba(68,226,205,0.35)",borderRadius:14,padding:"14px 20px",cursor:"pointer",marginBottom:22,transition:"all 0.2s" }}
              onMouseOver={e=>e.currentTarget.style.background="linear-gradient(135deg,#1e3a1e,#1e2140)"}
              onMouseOut={e=>e.currentTarget.style.background="linear-gradient(135deg,#1a2e1a,#1a1d2e)"}
            >
              <div style={{ width:34,height:34,borderRadius:"50%",background:"#44e2cd22",border:"1.5px solid #44e2cd55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>▶</div>
              <div style={{ textAlign:"left" }}>
                <div style={{ color:"#44e2cd",fontWeight:900,fontSize:15 }}>Start Workout</div>
                <div style={{ color:"#3a5a40",fontSize:12,marginTop:1 }}>Tap to begin session timer</div>
              </div>
            </button>
      )}
      {log && <TotalSessionTimer groupTimers={timers.groups} />}

      {/* No session — schedule is empty */}
      {groups.length === 0 && (
        <div style={{ background:"#26293b",borderRadius:18,padding:40,textAlign:"center",outline:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize:48,marginBottom:12 }}>📋</div>
          <div style={{ color:"#9399b8",fontWeight:800,fontSize:17 }}>No sessions scheduled</div>
          <div style={{ color:"#3a3d5a",fontSize:14,marginTop:6 }}>Add groups to your weekly schedule to get started.</div>
        </div>
      )}

      {/* Groups */}
      {groups.map((group) => {
        const allDone = isGroupDone(group);
        const isCollapsed = collapsed[group.id];

        return (
          <div key={group.id} style={{
            background: allDone ? `${group.color}0d` : "#1f2235",
            borderRadius:20, marginBottom:14, overflow:"hidden", transition:"all 0.3s",
            outline: allDone ? `1px solid ${group.color}44` : "1px solid rgba(255,255,255,0.05)",
            boxShadow: allDone ? `0 0 28px ${group.color}18` : "0 4px 24px rgba(0,0,0,0.3)"
          }}>
          <div style={{ background: allDone ? "transparent" : "#26293b", borderRadius:18, margin:4, overflow:"hidden" }}>
            {/* Group header */}
            <div style={{ display:"flex",alignItems:"center",gap:12,padding:"16px 18px",cursor:"pointer",borderBottom: isCollapsed?"none":`1px solid rgba(255,255,255,0.05)` }} onClick={()=>setCollapsed(c=>({...c,[group.id]:!c[group.id]}))}>
              <div style={{ width:11,height:11,borderRadius:"50%",background:group.color,flexShrink:0,boxShadow:`0 0 10px ${group.color}`,animation:"spinePulse 2.5s ease-in-out infinite" }} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800,color:"#dfe1f9",fontSize:15,letterSpacing:"-0.01em" }}>{group.name}</div>
                <div style={{ fontSize:12,color:"#8b919d",marginTop:2 }}>
                  {group.exercises.filter((_,i)=>isExDone(group.id,i,getExerciseById(exercises,group.exercises[i].exerciseId))).length}/{group.exercises.length} exercises
                </div>
              </div>
              {/* group timer or start button */}
              {timers.groups?.[group.id]?.startedAt
                ? <GroupTimerBadge startedAt={timers.groups[group.id].startedAt} endedAt={timers.groups[group.id].endedAt} />
                : !allDone && (
                  <button onClick={e=>{ e.stopPropagation(); startGroup(group.id); }}
                    style={{ background:"rgba(68,226,205,0.1)",border:"1px solid rgba(68,226,205,0.3)",borderRadius:8,color:"#44e2cd",padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:800,flexShrink:0,display:"flex",alignItems:"center",gap:4 }}>
                    ▶ Start
                  </button>
                )
              }
              <div style={{ display:"flex",gap:4 }}>
                {group.exercises.map((_,i)=>{
                  const ex=getExerciseById(exercises,group.exercises[i].exerciseId);
                  const done=isExDone(group.id,i,ex);
                  return <div key={i} style={{ width:7,height:7,borderRadius:"50%",background:done?group.color:"#313446",transition:"background 0.2s" }} />;
                })}
              </div>
              {allDone && <span style={{ fontSize:16 }}>✅</span>}
              <span style={{ color:"#414752",fontSize:18,lineHeight:1 }}>{isCollapsed?"›":"⌄"}</span>
            </div>

            {/* Group session timer */}
            {timers.groups?.[group.id]?.startedAt && !isCollapsed && (
              <GroupSessionTimer groupName={group.name} color={group.color} startedAt={timers.groups[group.id].startedAt} endedAt={timers.groups[group.id].endedAt} />
            )}

            {/* Exercises */}
            {!isCollapsed && (
              <div style={{ padding:"4px 16px 16px" }}>
                {group.exercises.map((slot, idx) => {
                  const ex = getExerciseById(exercises, slot.exerciseId);
                  const meta = CATEGORY_META[slot.category];
                  if (!ex) return null;
                  const totalS = parseSets(ex.duration);
                  const doneS = setsLog[`${group.id}_${idx}`] || 0;
                  const isDone = doneS >= totalS;

                  return (
                    <div key={idx} style={{ padding:"14px 0",borderBottom: idx<group.exercises.length-1?"1px solid rgba(255,255,255,0.04)":"none",opacity:isDone?0.5:1,transition:"opacity 0.3s" }}>
                      {/* Top row */}
                      <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:5 }}>
                            <span style={{ fontSize:15 }}>{meta.icon}</span>
                            <span style={{ fontWeight:800,color:"#dfe1f9",fontSize:14,textDecoration:isDone?"line-through":"none" }}>{ex.name}</span>
                            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise how to')}`} target="_blank" rel="noopener noreferrer"
                              style={{ display:"inline-flex",alignItems:"center",gap:3,fontSize:10,fontWeight:700,color:"#f87171",textDecoration:"none",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:20,padding:"2px 8px",flexShrink:0 }}>
                              ▶ YT
                            </a>
                          </div>
                          <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:6 }}>
                            <Badge color={meta.color} small>{ex.duration}</Badge>
                            <WeightBadge weight={ex.weight} weightUnit={ex.weightUnit} />
                          </div>
                          <div style={{ fontSize:11,color:"#7a7f9a",marginBottom:8 }}>{ex.muscles.join(" · ")}</div>
                          <div style={{ background:"rgba(11,13,30,0.6)",borderRadius:10,padding:"10px 12px",fontSize:12,color:"#8b919d",lineHeight:1.7,borderLeft:`2px solid ${meta.color}55` }}>💡 {ex.tips}</div>
                        </div>
                      </div>

                      {/* Set tracker */}
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:12,padding:"10px 12px",background:"rgba(11,13,30,0.5)",borderRadius:12 }}>
                        <span style={{ fontSize:11,color:"#8b919d",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",flex:1 }}>
                          Sets: {doneS}/{totalS}
                        </span>
                        {/* set pips */}
                        <div style={{ display:"flex",gap:6 }}>
                          {Array.from({length:totalS}).map((_,si)=>(
                            <div key={si} onClick={()=>{ if(si<doneS) removeSet(group.id,idx); else addSet(group.id,idx,ex); }}
                              style={{ width:32,height:32,borderRadius:"50%",background:si<doneS?group.color:"#323346",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.2s",boxShadow:si<doneS?`0 0 10px ${group.color}55`:"none",fontSize:15,fontWeight:800,color:si<doneS?"#1a1d2e":"#414752" }}>
                              {si < doneS ? "✓" : si + 1}
                            </div>
                          ))}
                        </div>
                        {isDone
                          ? <button onClick={()=>resetExercise(group.id,idx)} style={{ background:"#2e3254",border:"1px solid #f8717144",borderRadius:9,color:"#f87171",padding:"6px 14px",cursor:"pointer",fontWeight:800,fontSize:13,transition:"all 0.2s" }}>↩ Undo</button>
                          : <button onClick={()=>addSet(group.id,idx,ex)} style={{ background:group.color,border:"none",borderRadius:9,color:"#fff",padding:"6px 14px",cursor:"pointer",fontWeight:800,fontSize:13,transition:"all 0.2s" }}>{`+Set ${doneS+1}`}</button>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>{/* end inner double-layer */}
          </div>
        );
      })}

      {/* Complete day button */}
      {doneEx === totalEx && totalEx > 0 && !log && (
        <div style={{ background:"linear-gradient(135deg,#0c2118,#172e22)",border:"1px solid #44e2cd66",borderRadius:18,padding:24,textAlign:"center",marginTop:8 }}>
          <div style={{ fontSize:40,marginBottom:10 }}>🎉</div>
          <div style={{ color:"#44e2cd",fontWeight:900,fontSize:17,marginBottom:6 }}>All exercises done!</div>
          <button onClick={markDayDone} style={{ background:"#44e2cd",border:"none",borderRadius:10,color:"#071a0f",padding:"10px 28px",cursor:"pointer",fontWeight:800,fontSize:14,marginTop:4 }}>Mark Day Complete ✓</button>
        </div>
      )}
      {log && (
        <div style={{ background:"#0c1a14",border:"1px solid #44e2cd44",borderRadius:14,padding:"12px 18px",display:"flex",alignItems:"center",gap:12,marginTop:8 }}>
          <span style={{ fontSize:20 }}>✅</span>
          <div style={{ flex:1 }}>
            <div style={{ color:"#44e2cd",fontWeight:700,fontSize:14 }}>Day completed!</div>
            <div style={{ color:"#3a5a40",fontSize:12,marginTop:1 }}>{log.exerciseCount} exercises · {log.groupCount} groups</div>
          </div>
          <button onClick={resetToday} title="Undo completion and reset set counters" style={{ background:"none",border:"1px solid #1e3020",borderRadius:8,color:"#3a5a40",cursor:"pointer",fontSize:11,padding:"4px 9px",fontWeight:600 }}>↩ Reset</button>
        </div>
      )}

      {showTimer && <RestTimer onDismiss={()=>setShowTimer(false)} />}
      <ExerciseDetailModal ex={detail?.ex} category={detail?.category} open={!!detail} onClose={()=>setDetail(null)} />
    </div>
  );
}

// ─── GROUP EDITOR ─────────────────────────────────────────────────────────────
function GroupEditor({ group, exercises, onSave, onCancel }) {
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
          const ex=getExerciseById(exercises,slot.exerciseId);
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

// ─── SCHEDULE VIEW ────────────────────────────────────────────────────────────
function ScheduleView({ schedule, setSchedule, exercises, workoutLog }) {
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
  const del = gid => setSchedule(prev=>({...prev,[selectedDay]:(prev[selectedDay]||[]).filter(g=>g.id!==gid)}));
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
              const ex=getExerciseById(exercises,slot.exerciseId);
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

// ─── EXERCISE FORM ────────────────────────────────────────────────────────────
function ExerciseForm({ initial, onSave, onCancel }) {
  const [form,setForm] = useState(initial || { name:"",category:"physical_therapy",muscles:"",duration:"",difficulty:"Medium",weight:"",weightUnit:"bodyweight",notes:"",tips:"",image:"" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const hasWeight = form.weightUnit !== "bodyweight" && form.weightUnit !== "band" && form.weightUnit !== "";

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
      <div style={{ background:"#1a1d2e",border:"1px solid #1e2140",borderRadius:11,padding:14,marginBottom:12 }}>
        <div style={LBL}>⚖ Weight / Load</div>
        <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
          <select style={{ ...INP,marginBottom:0,flex:"1 1 110px" }} value={form.weightUnit} onChange={e=>set("weightUnit",e.target.value)}>
            {WEIGHT_UNITS.map(u=><option key={u} value={u}>{u}</option>)}
            <option value="">none</option>
          </select>
          {hasWeight && (
            <input style={{ ...INP,marginBottom:0,flex:"1 1 80px" }} type="number" min={0} step={0.5} value={form.weight} onChange={e=>set("weight",e.target.value)} placeholder="e.g. 10" />
          )}
          {hasWeight && <span style={{ color:"#5a5f7a",fontSize:13 }}>{form.weightUnit}</span>}
        </div>
        <div style={{ fontSize:11,color:"#3a3d5a",marginTop:6 }}>Used for tracking and display. Set to "bodyweight" or "band" if no specific weight.</div>
      </div>

      <label style={LBL}>Muscles (comma-separated)</label>
      <input style={INP} value={form.muscles} onChange={e=>set("muscles",e.target.value)} placeholder="e.g. Quadriceps, VMO" />

      <label style={LBL}>Tips / How To</label>
      <textarea style={{ ...INP,height:86,resize:"vertical" }} value={form.tips} onChange={e=>set("tips",e.target.value)} placeholder="Step-by-step instructions..." />

      <label style={LBL}>Personal Notes (optional)</label>
      <textarea style={{ ...INP,height:60,resize:"vertical" }} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Your own cues, modifications, progress notes..." />

      <label style={LBL}>Image / GIF URL (optional)</label>
      <input style={INP} value={form.image} onChange={e=>set("image",e.target.value)} placeholder="https://..." />

      <div style={{ display:"flex",gap:10,marginTop:6 }}>
        <button onClick={()=>onSave({...form,muscles:typeof form.muscles==="string"?form.muscles.split(",").map(m=>m.trim()).filter(Boolean):form.muscles,id:form.id||(form.category.slice(0,2)+uid())})} style={{ flex:1,background:"#5b9cf6",border:"none",borderRadius:10,color:"#fff",padding:11,cursor:"pointer",fontWeight:800,fontSize:14 }}>Save</button>
        <button onClick={onCancel} style={{ flex:1,background:"#2e3254",border:"none",borderRadius:10,color:"#9399b8",padding:11,cursor:"pointer",fontSize:14 }}>Cancel</button>
      </div>
    </div>
  );
}

// ─── LIBRARY VIEW ─────────────────────────────────────────────────────────────
function ExercisesView({ exercises, setExercises }) {
  const [activeCategory,setActiveCategory] = useState("physical_therapy");
  const [showForm,setShowForm] = useState(false);
  const [editingEx,setEditingEx] = useState(null);
  const [detail,setDetail] = useState(null);

  const handleSave = (ex) => {
    setExercises(prev=>{
      const cat=ex.category, list=prev[cat]||[], idx=list.findIndex(e=>e.id===ex.id);
      return {...prev,[cat]:idx>=0?list.map(e=>e.id===ex.id?ex:e):[...list,ex]};
    });
    setShowForm(false); setEditingEx(null);
  };

  const del = (id,cat) => setExercises(prev=>({...prev,[cat]:prev[cat].filter(e=>e.id!==id)}));
  const edit = (ex,cat) => { setEditingEx({...ex,muscles:ex.muscles.join(", "),category:cat}); setShowForm(true); };

  const catEx = exercises[activeCategory]||[];

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ margin:0,fontSize:24,color:"#dfe1f9",fontWeight:900,letterSpacing:"-0.5px" }}>Library</h2>
        <button onClick={()=>{setEditingEx(null);setShowForm(true);}} style={{ background:"#5b9cf6",border:"none",borderRadius:9,color:"#fff",padding:"8px 16px",cursor:"pointer",fontWeight:800,fontSize:13 }}>+ Add</button>
      </div>

      {/* Category tabs */}
      <div style={{ display:"flex",gap:6,marginBottom:20,flexWrap:"wrap" }}>
        {Object.entries(CATEGORY_META).map(([k,v])=>(
          <button key={k} onClick={()=>setActiveCategory(k)} style={{ background:activeCategory===k?v.color:"#26293b",border:`1px solid ${activeCategory===k?v.color:"#1e2140"}`,borderRadius:9,color:activeCategory===k?"#fff":"#5a5f7a",padding:"7px 13px",cursor:"pointer",fontWeight:700,fontSize:13,transition:"all 0.15s" }}>
            {v.icon} {v.label} <span style={{ opacity:0.6,fontWeight:400 }}>({(exercises[k]||[]).length})</span>
          </button>
        ))}
      </div>

      {catEx.length===0&&<div style={{ textAlign:"center",color:"#3a3d5a",padding:"40px 0" }}>No exercises yet.</div>}

      {catEx.map(ex=>{
        const meta=CATEGORY_META[activeCategory];
        return (
          <div key={ex.id} style={{ background:"#26293b",border:"1px solid #1e2140",borderRadius:14,padding:"14px 16px",marginBottom:10,borderLeft:`3px solid ${meta.color}`,cursor:"pointer",transition:"border-color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=meta.color}
            onMouseLeave={e=>e.currentTarget.style.borderLeftColor=meta.color}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10 }}>
              <div style={{ flex:1 }} onClick={()=>setDetail({ex,category:activeCategory})}>
                <div style={{ fontWeight:800,color:"#dfe1f9",fontSize:15,marginBottom:6 }}>{ex.name}</div>
                <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:6 }}>
                  <Badge color={meta.color} small>{ex.duration}</Badge>
                  <Badge color={DIFF_COLOR[ex.difficulty]} small>{ex.difficulty}</Badge>
                  <WeightBadge weight={ex.weight} weightUnit={ex.weightUnit} />
                </div>
                <div style={{ fontSize:12,color:"#3a3d5a" }}>{ex.muscles.join(" · ")}</div>
                {ex.notes&&<div style={{ fontSize:11,color:"#5a5f7a",marginTop:4,fontStyle:"italic" }}>📝 {ex.notes.slice(0,60)}{ex.notes.length>60?"…":""}</div>}
              </div>
              <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                <button onClick={e=>{e.stopPropagation();edit(ex,activeCategory);}} style={{ background:"#2e3254",border:"none",borderRadius:7,color:"#9399b8",cursor:"pointer",padding:"5px 10px",fontSize:12 }}>✏️</button>
                <button onClick={e=>{e.stopPropagation();del(ex.id,activeCategory);}} style={{ background:"none",border:"none",color:"#f87171",cursor:"pointer",fontSize:19,lineHeight:1 }}>×</button>
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

// ─── STREAK / HISTORY VIEW ────────────────────────────────────────────────────
function HistoryView({ workoutLog }) {
  const logs = (workoutLog||[]).slice().reverse();
  const streak = (() => {
    if (!logs.length) return 0;
    let s=0, d=new Date();
    for (let i=0;i<30;i++) {
      const iso = new Date(d.getTime()-i*86400000).toISOString().slice(0,10);
      if (logs.find(l=>l.date===iso)) s++;
      else if (i>0) break;
    }
    return s;
  })();

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
        <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginTop:8 }}>
          {DAYS.map(d=><div key={d} style={{ textAlign:"center",fontSize:9,color:"#3a3d5a",fontWeight:700,padding:"4px 0" }}>{d[0]}</div>)}
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
      </div>

      {/* Recent sessions */}
      {logs.length===0&&<div style={{ textAlign:"center",color:"#3a3d5a",padding:"36px 0" }}>No sessions yet. Complete a workout to track it!</div>}
      {logs.slice(0,15).map((log,i)=>(
        <div key={i} style={{ background:"#26293b",border:"1px solid #1e2140",borderRadius:12,padding:"12px 16px",marginBottom:8 }}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:"#44e2cd",flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700,color:"#dfe1f9",fontSize:14 }}>{FULL_DAYS[DAYS.indexOf(log.day)]}</div>
              <div style={{ fontSize:12,color:"#3a3d5a",marginTop:1 }}>{log.exerciseCount} exercises · {log.groupCount} groups</div>
            </div>
            <div style={{ fontSize:12,color:"#3a3d5a",textAlign:"right" }}>
              {new Date(log.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
            </div>
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

// ─── IMPORT / EXPORT ──────────────────────────────────────────────────────────
function ImportExportView({ exercises, setExercises, schedule, setSchedule, workoutLog, setWorkoutLog }) {
  const [importText,setImportText] = useState("");
  const [status,setStatus] = useState("");

  const handleExport = () => {
    const data={ exercises, schedule, workoutLog, version:"3.0", exported:new Date().toISOString() };
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="pt-exercises.json"; a.click();
    URL.revokeObjectURL(url);
    setStatus("✅ Downloaded!");
  };

  const handleImport = () => {
    try {
      const data=JSON.parse(importText);
      if(data.exercises) setExercises(data.exercises);
      if(data.schedule) setSchedule(data.schedule);
      if(data.workoutLog) setWorkoutLog(data.workoutLog);
      setStatus("✅ Imported!"); setImportText("");
    } catch { setStatus("❌ Invalid JSON."); }
  };

  const TA={ width:"100%",background:"#1a1d2e",border:"1px solid #1e2140",borderRadius:9,padding:12,color:"#d1fae5",fontSize:12,fontFamily:"monospace",resize:"vertical",outline:"none",boxSizing:"border-box",lineHeight:1.6 };

  return (
    <div>
      <h2 style={{ margin:"0 0 6px",fontSize:24,color:"#dfe1f9",fontWeight:900,letterSpacing:"-0.5px" }}>Import / Export</h2>
      <p style={{ color:"#5a5f7a",fontSize:14,marginBottom:22,lineHeight:1.6 }}>Human-readable JSON. Edit in any text editor, store on Google Drive, share with your therapist.</p>

      <div style={{ background:"#26293b",border:"1px solid #1e2140",borderRadius:14,padding:18,marginBottom:12 }}>
        <h3 style={{ margin:"0 0 8px",color:"#44e2cd",fontSize:15,fontWeight:800 }}>📤 Export</h3>
        <p style={{ color:"#9399b8",fontSize:13,margin:"0 0 14px",lineHeight:1.6 }}>Your full exercise library, schedule, and workout history.</p>
        <button onClick={handleExport} style={{ background:"#44e2cd",border:"none",borderRadius:9,color:"#071a0f",padding:"10px 20px",cursor:"pointer",fontWeight:800,fontSize:14 }}>Download pt-exercises.json</button>
      </div>

      <div style={{ background:"#26293b",border:"1px solid #1e2140",borderRadius:14,padding:18,marginBottom:12 }}>
        <h3 style={{ margin:"0 0 8px",color:"#5b9cf6",fontSize:15,fontWeight:800 }}>📥 Import</h3>
        <textarea style={{ ...TA,height:120 }} value={importText} onChange={e=>setImportText(e.target.value)} placeholder="Paste JSON here..." />
        <button onClick={handleImport} style={{ background:"#5b9cf6",border:"none",borderRadius:9,color:"#fff",padding:"9px 20px",cursor:"pointer",fontWeight:800,fontSize:14,marginTop:8 }}>Import</button>
      </div>

      {status&&<div style={{ background:status.startsWith("✅")?"#0c1a10":"#1a0c0c",border:`1px solid ${status.startsWith("✅")?"#44e2cd":"#f87171"}`,borderRadius:9,padding:"10px 14px",fontSize:14,color:status.startsWith("✅")?"#44e2cd":"#f87171",marginBottom:12 }}>{status}</div>}

      <div style={{ background:"#26293b",border:"1px solid #1e2140",borderRadius:14,padding:18 }}>
        <div style={LBL}>Format Reference (v3)</div>
        <pre style={{ ...TA,height:180,overflow:"auto",margin:0,color:"#5a9a72" }}>{`{
  "exercises": {
    "muscle": [{
      "id": "mu2",
      "name": "Dumbbell Curl",
      "weight": "8",
      "weightUnit": "kg",  // kg | lbs | band | bodyweight | ""
      "notes": "My personal cue...",
      ...
    }]
  },
  "schedule": {
    "Mon": [{
      "id": "g1", "name": "Strength",
      "color": "#f87171",
      "exercises": [...]
    }]
  }
}`}</pre>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view,setView] = useState("today");

  const load = (key,def) => { try { const s=localStorage.getItem(key); return s?JSON.parse(s):def; } catch { return def; } };

  const [exercises,setExercises] = useState(()=>load("pt_ex_v3",DEFAULT_EXERCISES));
  const [schedule,setSchedule]   = useState(()=>load("pt_sch_v3",DEFAULT_SCHEDULE));
  const [workoutLog,setWorkoutLog]= useState(()=>load("pt_log_v3",[]));

  useEffect(()=>{ try{localStorage.setItem("pt_ex_v3",JSON.stringify(exercises));}catch{} },[exercises]);
  useEffect(()=>{ try{localStorage.setItem("pt_sch_v3",JSON.stringify(schedule));}catch{} },[schedule]);
  useEffect(()=>{ try{localStorage.setItem("pt_log_v3",JSON.stringify(workoutLog));}catch{} },[workoutLog]);

  const streak = (() => {
    let s=0;
    for(let i=0;i<30;i++){
      const iso=new Date(Date.now()-i*86400000).toISOString().slice(0,10);
      if(workoutLog.find(l=>l.date===iso)) s++;
      else if(i>0) break;
    }
    return s;
  })();

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
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap');
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
        {view==="history"  && <HistoryView  workoutLog={workoutLog} />}
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
