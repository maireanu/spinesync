import { Component, useState, useEffect } from "react";
import { T, CATEGORY_META, DIFF_COLOR, LBL } from "../constants.js";

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("SpineSync error:", error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:32, fontFamily:"system-ui,sans-serif" }}>
          <div style={{ maxWidth:420, textAlign:"center" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>⚠️</div>
            <div style={{ fontSize:20, fontWeight:800, color:"#1e2340", marginBottom:8 }}>Something went wrong</div>
            <div style={{ fontSize:14, color:"#5f6681", marginBottom:24, lineHeight:1.6 }}>
              {this.state.error.message || "An unexpected error occurred."}
            </div>
            <button
              onClick={() => this.setState({ error: null })}
              style={{ background:"#0d9488", border:"none", borderRadius:10, color:"#fff", padding:"10px 28px", cursor:"pointer", fontWeight:800, fontSize:14 }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── LOGO ────────────────────────────────────────────────────────────────────
export function SpineSyncLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="spinesync-lg" x1="20" y1="5" x2="20" y2="41" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0d9488"/>
          <stop offset="55%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
      <path d="M 4.44 7.44 A 22 22 0 1 1 4.44 38.56"
            stroke="url(#spinesync-lg)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M 5.73 43.39 L 4.44 38.56 L 9.27 39.85"
            stroke="url(#spinesync-lg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="14" y="5"  width="12" height="4" rx="2" fill="url(#spinesync-lg)"/>
      <rect x="14" y="13" width="12" height="4" rx="2" fill="url(#spinesync-lg)"/>
      <rect x="14" y="21" width="12" height="4" rx="2" fill="url(#spinesync-lg)"/>
      <rect x="14" y="29" width="12" height="4" rx="2" fill="url(#spinesync-lg)"/>
      <rect x="14" y="37" width="12" height="4" rx="2" fill="url(#spinesync-lg)"/>
    </svg>
  );
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
export function Badge({ color, children, small }) {
  return <span style={{ background:color+"14", color, border:`1px solid ${color}30`, borderRadius:6, padding: small?"1px 7px":"2px 9px", fontSize:small?10:11, fontWeight:700, letterSpacing:"0.02em", whiteSpace:"nowrap" }}>{children}</span>;
}

export function WeightBadge({ weight, weightUnit }) {
  if (!weight && weightUnit !== "bodyweight" && weightUnit !== "band") return null;
  const label = weightUnit === "bodyweight" ? "Bodyweight"
              : weightUnit === "band" ? "Band"
              : `${weight} ${weightUnit}`;
  return <Badge color={T.amber}>⚖ {label}</Badge>;
}

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,background:T.modalOverlay,zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0",backdropFilter:"blur(6px)" }} onClick={onClose}>
      <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",maxWidth:wide?660:540,width:"100%",maxHeight:"92vh",overflowY:"auto",padding:"6px 0 0",boxShadow:T.shadowLg }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:36,height:4,background:T.border,borderRadius:2,margin:"10px auto 0" }} />
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 22px 14px" }}>
          <h3 style={{ margin:0,fontSize:17,color:T.text,fontWeight:800 }}>{title}</h3>
          <button onClick={onClose} style={{ background:T.surface,border:"none",color:T.textMuted,cursor:"pointer",fontSize:20,lineHeight:1,padding:"4px 8px",borderRadius:8 }}>×</button>
        </div>
        <div style={{ padding:"0 22px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── REST TIMER ───────────────────────────────────────────────────────────────
export function RestTimer({ onDismiss }) {
  const [secs, setSecs] = useState(60);
  const [running, setRunning] = useState(true);
  const [preset, setPreset] = useState(60);

  useEffect(() => {
    if (!running || secs <= 0) {
      if (secs <= 0) setRunning(false);
      return;
    }
    const id = setInterval(() => setSecs(s => {
      if (s <= 1) { setRunning(false); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running]);

  const reset = (s) => { setPreset(s); setSecs(s); setRunning(true); };
  const pct = secs / preset;
  const r = 36; const circ = 2 * Math.PI * r;

  return (
    <div style={{ position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",zIndex:400,background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:"16px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:10,boxShadow:T.shadowLg,minWidth:240 }}>
      <div style={{ fontSize:12,color:T.textMuted,fontWeight:700,letterSpacing:"0.1em" }}>REST TIMER</div>

      <svg width={90} height={90} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={45} cy={45} r={r} fill="none" stroke={T.surfaceAlt} strokeWidth={6} />
        <circle cx={45} cy={45} r={r} fill="none" stroke={secs===0?T.red:T.accent} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 0.9s linear" }} />
        <text x={45} y={45} textAnchor="middle" dominantBaseline="middle" fill={secs===0?T.red:T.text} fontSize={18} fontWeight={800} style={{ transform:"rotate(90deg)",transformOrigin:"45px 45px" }}>
          {secs === 0 ? "GO!" : `${secs}s`}
        </text>
      </svg>

      <div style={{ display:"flex",gap:6 }}>
        {[30,60,90].map(s => (
          <button key={s} onClick={() => reset(s)} style={{ background: preset===s?T.accent+"18":T.surface, border:`1px solid ${preset===s?T.accent:T.border}`, borderRadius:8, color: preset===s?T.accent:T.textSec, padding:"5px 12px", cursor:"pointer", fontSize:12, fontWeight:700 }}>{s}s</button>
        ))}
      </div>

      <button onClick={onDismiss} style={{ background:"none",border:"none",color:T.textMuted,cursor:"pointer",fontSize:12,padding:"2px 8px" }}>Dismiss</button>
    </div>
  );
}

// ─── MEDIA / EXERCISE DETAIL ──────────────────────────────────────────────────
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

export function MediaView({ url, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const type = mediaType(url);
  if (!type || error) return null;

  const wrap = {
    marginBottom: 16, borderRadius: 12, overflow: "hidden",
    background: T.surface, position: "relative", minHeight: 160, border: `1px solid ${T.border}`,
  };
  const skeleton = {
    position: "absolute", inset: 0,
    background: `linear-gradient(90deg,${T.surface} 25%,${T.surfaceAlt} 50%,${T.surface} 75%)`,
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
        <video src={url} controls loop muted playsInline
          style={{ width: "100%", maxHeight: 260, display: "block", objectFit: "contain" }}
          onCanPlay={() => setLoaded(true)} onError={() => setError(true)} />
      </div>
    );
  }

  return (
    <div style={wrap}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={skeleton} />
      <img src={url} alt={alt}
        style={{ width: "100%", maxHeight: 260, objectFit: "contain", display: loaded ? "block" : "none" }}
        onLoad={() => setLoaded(true)} onError={() => setError(true)} />
    </div>
  );
}

export function ExerciseDetailModal({ ex, category, open, onClose }) {
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
          <div style={{ color:T.amber,fontWeight:700,fontSize:14 }}>
            {ex.weightUnit==="bodyweight" ? "Bodyweight" : ex.weightUnit==="band" ? "Resistance Band" : `${ex.weight} ${ex.weightUnit}`}
          </div>
        </div>
      )}
      <div style={{ marginBottom:16 }}>
        <div style={LBL}>Muscles Used</div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{ex.muscles.map(m=><Badge key={m} color={T.textSec}>{m}</Badge>)}</div>
      </div>
      <div style={{ marginBottom: ex.notes ? 16 : 0 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
          <div style={LBL}>💡 How To</div>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise how to')}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:T.red,textDecoration:"none",background:T.red+"14",border:`1px solid ${T.red}30`,borderRadius:20,padding:"3px 10px",transition:"background 0.2s" }}
            onMouseOver={e=>e.currentTarget.style.background=T.red+"28"}
            onMouseOut={e=>e.currentTarget.style.background=T.red+"14"}
          >▶ Watch on YouTube</a>
        </div>
        <div style={{ background:T.surface,borderRadius:10,padding:"13px 15px",color:T.text,fontSize:14,lineHeight:1.75,borderLeft:`3px solid ${meta.color}` }}>{ex.tips}</div>
      </div>
      {ex.notes && (
        <div style={{ marginTop:16 }}>
          <div style={LBL}>📝 Personal Notes</div>
          <div style={{ background:T.surface,borderRadius:10,padding:"13px 15px",color:T.text,fontSize:13,lineHeight:1.7,borderLeft:`3px solid ${T.amber}` }}>{ex.notes}</div>
        </div>
      )}
    </Modal>
  );
}
