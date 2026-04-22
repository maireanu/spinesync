export const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
export const FULL_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// ─── THEME ────────────────────────────────────────────────────────────────────
// Structural colors use CSS custom properties so dark mode works via a single
// style prop on the root element. Accent colors stay as hex because they are
// often concatenated with an 8-bit opacity suffix (e.g. T.blue + "14").
export const T = {
  // Backgrounds
  bg:           "var(--c-bg)",
  card:         "var(--c-card)",
  cardHover:    "var(--c-card-hover)",
  surface:      "var(--c-surface)",
  surfaceAlt:   "var(--c-surface-alt)",

  // Borders
  border:       "var(--c-border)",
  borderLight:  "var(--c-border-light)",

  // Text
  text:         "var(--c-text)",
  textSec:      "var(--c-text-sec)",
  textMuted:    "var(--c-text-muted)",

  // Accents (fixed hex — used with opacity suffixes like T.blue+"14")
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
  shadow:       "var(--c-shadow)",
  shadowMd:     "var(--c-shadow-md)",
  shadowLg:     "var(--c-shadow-lg)",

  // Header / Nav
  headerBg:     "var(--c-header-bg)",
  navBg:        "var(--c-nav-bg)",
  modalOverlay: "var(--c-modal-overlay)",
};

// Light theme CSS custom property values
export const LIGHT_VARS = {
  "--c-bg":           "#f0f2f7",
  "--c-card":         "#ffffff",
  "--c-card-hover":   "#f8f9fc",
  "--c-surface":      "#f5f7fa",
  "--c-surface-alt":  "#eef0f6",
  "--c-border":       "#e2e5ef",
  "--c-border-light": "#eef0f6",
  "--c-text":         "#1e2340",
  "--c-text-sec":     "#5f6681",
  "--c-text-muted":   "#9ca3af",
  "--c-shadow":       "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  "--c-shadow-md":    "0 4px 12px rgba(0,0,0,0.07)",
  "--c-shadow-lg":    "0 8px 30px rgba(0,0,0,0.1)",
  "--c-header-bg":    "rgba(255,255,255,0.82)",
  "--c-nav-bg":       "rgba(255,255,255,0.92)",
  "--c-modal-overlay":"rgba(15,20,40,0.35)",
};

// Dark theme CSS custom property values
export const DARK_VARS = {
  "--c-bg":           "#0f1117",
  "--c-card":         "#181b24",
  "--c-card-hover":   "#1e2130",
  "--c-surface":      "#1c1f2d",
  "--c-surface-alt":  "#21253a",
  "--c-border":       "#2a2f47",
  "--c-border-light": "#252840",
  "--c-text":         "#e8eaf6",
  "--c-text-sec":     "#9ba3c4",
  "--c-text-muted":   "#626a8a",
  "--c-shadow":       "0 1px 3px rgba(0,0,0,0.30), 0 1px 2px rgba(0,0,0,0.20)",
  "--c-shadow-md":    "0 4px 12px rgba(0,0,0,0.40)",
  "--c-shadow-lg":    "0 8px 30px rgba(0,0,0,0.60)",
  "--c-header-bg":    "rgba(15,17,26,0.90)",
  "--c-nav-bg":       "rgba(15,17,26,0.96)",
  "--c-modal-overlay":"rgba(0,0,10,0.65)",
};

export const GROUP_COLORS = [T.blue, T.red, T.teal, T.purple, T.amber, T.pink, T.green];
export const CATEGORY_META = {
  physical_therapy: { label: "Kinetotherapy",  icon: "🩺", color: T.blue   },
  muscle:           { label: "Strength",        icon: "💪", color: T.red    },
  cardio:           { label: "Cardio / HIIT",   icon: "🏃", color: T.teal   },
  breathing:        { label: "Breathwork",      icon: "🫁", color: T.purple },
  mobility:         { label: "Mobility / Yoga", icon: "🧘", color: T.amber  },
};
export const WEIGHT_UNITS = ["kg","lbs","band","bodyweight"];
export const DIFF_COLOR = { Easy: T.green, Medium: T.amber, Hard: T.red };

export const INP = { width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10,transition:"border-color 0.2s" };
export const LBL = { fontSize:11,color:T.textMuted,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:700 };
