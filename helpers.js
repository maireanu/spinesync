import { DAYS, FULL_DAYS } from "./constants.js";

export function getExerciseById(exercises, id) {
  for (const cat of Object.values(exercises)) {
    const found = cat.find(e => e.id === id);
    if (found) return found;
  }
  return null;
}

export function uid() { return Math.random().toString(36).slice(2,8); }

export function todayKey() {
  const d = new Date().getDay();
  return DAYS[d === 0 ? 6 : d - 1];
}

export function todayISO() {
  // Always use local date (not UTC) to avoid midnight timezone drift
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Return a local-time ISO date string offset by `offset` days from today (+future, -past) */
export function localDateISO(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parseSets(duration) {
  const m = duration.match(/^(\d+)\s*[×x]/);
  return m ? parseInt(m[1]) : 1;
}

export function buildSessionPattern(schedule) {
  return DAYS
    .filter(day => (schedule[day] || []).length > 0)
    .map(day => ({ dayKey: day, dayLabel: FULL_DAYS[DAYS.indexOf(day)], groups: schedule[day] }));
}

export function computeStreak(workoutLog) {
  let s = 0;
  for (let i = 0; i < 30; i++) {
    const iso = localDateISO(-i); // -i means i days ago
    if ((workoutLog || []).find(l => l.date === iso)) s++;
    else if (i > 0) break;
  }
  return s;
}
