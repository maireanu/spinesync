import { createContext, useContext, useState, useEffect } from "react";
import { get, set, del } from "idb-keyval";
import { EXERCISES, SCHEDULE } from "./exercises-data.js";

const WorkoutContext = createContext(null);

function useIdbStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    get(key).then((stored) => {
      if (stored !== undefined) {
        setValue(stored);
      }
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, [key]);

  const updateValue = (newValue) => {
    const val = typeof newValue === "function" ? newValue(value) : newValue;
    setValue(val);
    set(key, val).catch(console.error);
  };

  return [value, updateValue, isLoaded];
}

export function WorkoutProvider({ children }) {
  const [exercises, setExercises, exercisesLoaded] = useIdbStorage("pt_exercises", EXERCISES);
  const [schedule, setSchedule, scheduleLoaded] = useIdbStorage("pt_schedule", SCHEDULE);
  const [workoutLog, setWorkoutLog, logLoaded] = useIdbStorage("pt_workout_log", []);

  // Show a blank or loading screen until initial data drops in from IDB
  const isReady = exercisesLoaded && scheduleLoaded && logLoaded;

  // Purge old localstorage state (Migrating from localStorage to IDB optionally, but just clearing old for now)
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

  if (!isReady) return null;

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
