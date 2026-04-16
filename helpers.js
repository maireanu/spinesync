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

export function todayISO() { return new Date().toISOString().slice(0,10); }

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
    const iso = new Date(Date.now() - i * 86400000).toISOString().slice(0,10);
    if ((workoutLog || []).find(l => l.date === iso)) s++;
    else if (i > 0) break;
  }
  return s;
}
