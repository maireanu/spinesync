import { createContext, useContext, useState, useEffect } from "react";
import { EXERCISES, SCHEDULE } from "./exercises-data.js";

const WorkoutContext = createContext(null);

function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

export function WorkoutProvider({ children }) {
  const [exercises, setExercises] = useLocalStorage("pt_exercises", EXERCISES);
  const [schedule, setSchedule] = useLocalStorage("pt_schedule", SCHEDULE);
  const [workoutLog, setWorkoutLog] = useLocalStorage("pt_workout_log", []);

  // Purge per-day localStorage keys (pt_sets_* and pt_timers_*) older than 7 days
  useEffect(() => {
    try {
      const cutoff = new Date(Date.now() - 7 * 86400000).toLocaleDateString("en-CA");
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (!k) continue;
        const m = k.match(/^pt_(sets|timers)_(\d{4}-\d{2}-\d{2})$/);
        if (m && m[2] < cutoff) localStorage.removeItem(k);
      }
    } catch {}
  }, []);

  return (
    <WorkoutContext.Provider value={{ exercises, setExercises, schedule, setSchedule, workoutLog, setWorkoutLog }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used within WorkoutProvider");
  return ctx;
}
