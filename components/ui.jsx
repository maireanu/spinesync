import { useState, useEffect } from "react";
import { CATEGORY_META, DIFF_COLOR, LBL } from "../constants.js";

// ─── LOGO ────────────────────────────────────────────────────────────────────
export function SpineSyncLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="spinesync-lg" x1="20" y1="5" x2="20" y2="41" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#44e2cd"/>
          <stop offset="55%" stopColor="#5b9cf6"/>
          <stop offset="100%" stopColor="#a589f8"/>
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
  return <span style={{ background:color+"1e", color, border:`1px solid ${color}40`, borderRadius:6, padding: small?"1px 6px":"2px 8px", fontSize:small?10:11, fontWeight:700, letterSpacing:"0.02em", whiteSpace:"nowrap" }}>{children}</span>;
}

export function WeightBadge({ weight, weightUnit }) {
  if (!weight && weightUnit !== "bodyweight" && weightUnit !== "band") return null;
  const label = weightUnit === "bodyweight" ? "Bodyweight"
              : weightUnit === "band" ? "Band"
              : `${weight} ${weightUnit}`;
  return <Badge color="#fbbf24">⚖ {label}</Badge>;
}

export function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(5,6,14,0.88)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0",backdropFilter:"blur(8px)" }} onClick={onClose}>
      <div style={{ background:"#26293b",border:"1px solid #313446",borderRadius:"20px 20px 0 0",maxWidth:wide?660:540,width:"100%",maxHeight:"92vh",overflowY:"auto",padding:"6px 0 0",boxShadow:"0 -20px 60px rgba(0,0,0,0.6)" }} onClick={e=>e.stopPropagation()}>
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

// ─── REST TIMER ───────────────────────────────────────────────────────────────
export function RestTimer({ onDismiss }) {
  const [secs, setSecs] = useState(60);
  const [running, setRunning] = useState(true);
  const [preset, setPreset] = useState(60);
  const ref = { current: null };

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
            target="_blank" rel="noopener noreferrer"
            style={{ display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:"#f87171",textDecoration:"none",background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.25)",borderRadius:20,padding:"3px 10px",transition:"background 0.2s" }}
            onMouseOver={e=>e.currentTarget.style.background="rgba(248,113,113,0.22)"}
            onMouseOut={e=>e.currentTarget.style.background="rgba(248,113,113,0.1)"}
          >▶ Watch on YouTube</a>
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
