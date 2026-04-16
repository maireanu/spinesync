export const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
export const FULL_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// ─── THEME ────────────────────────────────────────────────────────────────────
export const T = {
  // Backgrounds
  bg:           "#f0f2f7",
  card:         "#ffffff",
  cardHover:    "#f8f9fc",
  surface:      "#f5f7fa",
  surfaceAlt:   "#eef0f6",

  // Borders
  border:       "#e2e5ef",
  borderLight:  "#eef0f6",

  // Text
  text:         "#1e2340",
  textSec:      "#5f6681",
  textMuted:    "#9ca3af",

  // Accents
  teal:         "#0d9488",
  blue:         "#3b82f6",
  red:          "#ef4444",
  amber:        "#f59e0b",
  purple:       "#8b5cf6",
  pink:         "#ec4899",
  green:        "#10b981",

  // Semantic
  accent:       "#0d9488",
  success:      "#10b981",
  danger:       "#ef4444",
  warning:      "#f59e0b",

  // Shadows
  shadow:       "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:     "0 4px 12px rgba(0,0,0,0.07)",
  shadowLg:     "0 8px 30px rgba(0,0,0,0.1)",

  // Header / Nav
  headerBg:     "rgba(255,255,255,0.82)",
  navBg:        "rgba(255,255,255,0.92)",
  modalOverlay: "rgba(15,20,40,0.35)",
};

export const GROUP_COLORS = [T.blue, T.red, T.teal, T.purple, T.amber, T.pink];
export const CATEGORY_META = {
  physical_therapy: { label: "Physical Therapy", icon: "🩺", color: T.blue },
  muscle:           { label: "Muscle",            icon: "💪", color: T.red },
  cardio:           { label: "Cardio",            icon: "🏃", color: T.teal },
  breathing:        { label: "Breathing",         icon: "🫁", color: T.purple },
};
export const WEIGHT_UNITS = ["kg","lbs","band","bodyweight"];
export const DIFF_COLOR = { Easy: T.green, Medium: T.amber, Hard: T.red };

export const INP = { width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10,transition:"border-color 0.2s" };
export const LBL = { fontSize:11,color:T.textMuted,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700 };
