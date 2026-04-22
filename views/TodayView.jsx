import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { T, CATEGORY_META, DIFF_COLOR } from "../constants.js";
import { todayISO, localDateISO, buildSessionPattern, parseSets } from "../helpers.js";
import { useWorkout } from "../context.jsx";
import { Badge, WeightBadge, Modal, ExerciseDetailModal, RestTimer } from "../components/ui.jsx";
import { formatElapsed } from "../components/timers.jsx";

// ─── Workout Session Timer ────────────────────────────────────────────────────
function useWorkoutTimer(dateKey) {
  const storageKey = `pt_wt_${dateKey}`;
  const [timer, setTimerRaw] = useState(() => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : { startedAt: null, pausedAt: null, totalPausedMs: 0, endedAt: null };
    } catch { return { startedAt: null, pausedAt: null, totalPausedMs: 0, endedAt: null }; }
  });

  const setTimer = useCallback((updater) => {
    setTimerRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [storageKey]);

  // Auto-start: called when user first interacts with an exercise
  const autoStart = useCallback(() => {
    setTimer(t => {
      if (t.startedAt) return t; // already started
      return { ...t, startedAt: new Date().toISOString() };
    });
  }, [setTimer]);

  const pause = useCallback(() => {
    setTimer(t => {
      if (!t.startedAt || t.endedAt) return t;
      if (t.pausedAt) {
        // Resume
        const extra = Date.now() - new Date(t.pausedAt).getTime();
        return { ...t, pausedAt: null, totalPausedMs: t.totalPausedMs + extra };
      } else {
        // Pause
        return { ...t, pausedAt: new Date().toISOString() };
      }
    });
  }, [setTimer]);

  const finish = useCallback(() => {
    setTimer(t => {
      if (!t.startedAt || t.endedAt) return t;
      // If still paused, close the pause
      let extra = 0;
      if (t.pausedAt) extra = Date.now() - new Date(t.pausedAt).getTime();
      return { ...t, pausedAt: null, totalPausedMs: t.totalPausedMs + extra, endedAt: new Date().toISOString() };
    });
  }, [setTimer]);

  const reset = useCallback(() => {
    setTimer({ startedAt: null, pausedAt: null, totalPausedMs: 0, endedAt: null });
  }, [setTimer]);

  return { timer, autoStart, pause, finish, reset };
}

function WorkoutTimerDisplay({ timer, onPause, onFinish, onReset, exerciseCount, totalExercises }) {
  const [now, setNow] = useState(Date.now());
  const { startedAt, pausedAt, totalPausedMs, endedAt } = timer;
  const isPaused = !!pausedAt;
  const isDone = !!endedAt;
  const isRunning = !!startedAt && !isPaused && !isDone;

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  if (!startedAt) return null;

  const end = endedAt ? new Date(endedAt).getTime() : now;
  const paused = totalPausedMs + (pausedAt ? (now - new Date(pausedAt).getTime()) : 0);
  const elapsedMs = Math.max(0, end - new Date(startedAt).getTime() - paused);

  const pct = totalExercises > 0 ? (exerciseCount / totalExercises) * 100 : 0;

  return (
    <div style={{
      background: T.card,
      border: `1px solid ${isDone ? T.amber + "44" : isPaused ? T.amber + "44" : T.accent + "44"}`,
      borderRadius: 18, padding: "16px 20px", marginBottom: 20,
      boxShadow: T.shadowMd,
    }}>
      {/* Timer row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Pulse dot */}
        <div style={{
          width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
          background: isDone ? T.amber : isPaused ? T.amber : T.accent,
          ...(isRunning ? { animation: "spinePulse 1.5s ease-in-out infinite" } : {}),
        }} />

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {isDone ? "Workout Completed" : isPaused ? "Paused" : "Workout Time"}
          </div>
          <div style={{
            fontVariantNumeric: "tabular-nums", fontSize: 32, fontWeight: 900, lineHeight: 1.1,
            color: isDone ? T.amber : isPaused ? T.amber : T.accent, letterSpacing: "0.04em",
          }}>
            {formatElapsed(elapsedMs)}
          </div>
        </div>

        {/* Controls */}
        {!isDone && (
          <button
            onClick={onPause}
            style={{
              background: isPaused ? T.accent : T.surface,
              border: `1px solid ${isPaused ? T.accent : T.border}`,
              borderRadius: 12, padding: "10px 16px", cursor: "pointer",
              color: isPaused ? "#fff" : T.textSec, fontSize: 13, fontWeight: 800,
              transition: "all 0.2s",
            }}
            aria-label={isPaused ? "Resume timer" : "Pause timer"}
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
        )}
        {isDone && (
          <button onClick={onReset} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", cursor: "pointer", color: T.textMuted, fontSize: 12 }}>
            Reset
          </button>
        )}
      </div>

      {/* Progress bar */}
      {totalExercises > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
              {exerciseCount} / {totalExercises} exercises done
            </span>
            <span style={{ fontSize: 11, color: T.textMuted }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ background: T.surface, borderRadius: 6, height: 6, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 6,
              background: isDone ? T.amber : T.accent,
              width: `${pct}%`, transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Exercise Item ────────────────────────────────────────────────────────────
function ExerciseItem({ exercise, category, completed, setsDone, totalSets, onToggleSet, onDetails }) {
  const meta = CATEGORY_META[category];
  const isFullyDone = setsDone >= totalSets;

  return (
    <div
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "12px 14px", borderRadius: 12,
        background: isFullyDone ? T.accent + "0c" : "transparent",
        border: `1px solid ${isFullyDone ? T.accent + "33" : "transparent"}`,
        marginBottom: 4, transition: "all 0.2s", cursor: "pointer",
      }}
      onClick={() => onDetails(exercise, category)}
    >
      {/* Completion circle */}
      <button
        onClick={e => { e.stopPropagation(); onToggleSet(exercise.id); }}
        style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
          border: `2px solid ${isFullyDone ? T.accent : T.border}`,
          background: isFullyDone ? T.accent : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s", marginTop: 1,
        }}
        aria-label={isFullyDone ? "Mark incomplete" : "Mark set done"}
      >
        {isFullyDone && <span style={{ color: "#fff", fontSize: 14, lineHeight: 1 }}>✓</span>}
      </button>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700, fontSize: 14, color: isFullyDone ? T.textSec : T.text,
          textDecoration: isFullyDone ? "line-through" : "none", marginBottom: 4,
        }}>
          {exercise.name}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
          <Badge color={meta.color} small>{exercise.duration}</Badge>
          {exercise.difficulty && <Badge color={DIFF_COLOR[exercise.difficulty]} small>{exercise.difficulty}</Badge>}
          <WeightBadge weight={exercise.weight} weightUnit={exercise.weightUnit} />
        </div>
        {exercise.muscles?.length > 0 && (
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, lineHeight: 1.3 }}>
            {exercise.muscles.slice(0, 3).join(" · ")}
          </div>
        )}
      </div>

      {/* Sets counter */}
      {totalSets > 1 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 }}>
          {Array.from({ length: totalSets }, (_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); onToggleSet(exercise.id, i + 1); }}
              style={{
                width: 20, height: 20, borderRadius: 6,
                border: `1.5px solid ${i < setsDone ? T.accent : T.border}`,
                background: i < setsDone ? T.accent : "transparent",
                cursor: "pointer", transition: "all 0.15s", padding: 0,
              }}
              aria-label={`Set ${i + 1}`}
            />
          ))}
          <span style={{ fontSize: 10, color: T.textMuted, fontWeight: 700 }}>
            {setsDone}/{totalSets}
          </span>
        </div>
      )}

      {/* Chevron */}
      <span style={{ color: T.textMuted, fontSize: 16, alignSelf: "center", flexShrink: 0 }}>›</span>
    </div>
  );
}

// ─── Exercise Group Card ──────────────────────────────────────────────────────
function GroupCard({ group, exercises, exMap, sessionSets, onToggleSet, onDetails, garminBadge }) {
  const [collapsed, setCollapsed] = useState(false);
  const meta = group.color;

  const groupExercises = group.exercises.map(slot => {
    const ex = exMap.get(slot.exerciseId);
    return ex ? { ex, category: slot.category } : null;
  }).filter(Boolean);

  const totalSets = groupExercises.reduce((s, { ex }) => s + parseSets(ex.duration), 0);
  const doneSets = groupExercises.reduce((s, { ex }) => s + (sessionSets[ex.id] || 0), 0);
  const isGroupDone = doneSets >= totalSets && totalSets > 0;

  return (
    <div style={{
      background: T.card, border: `1px solid ${isGroupDone ? group.color + "44" : T.border}`,
      borderRadius: 16, marginBottom: 14, overflow: "hidden",
      borderLeft: `4px solid ${group.color}`, boxShadow: T.shadow,
      transition: "border-color 0.2s",
    }}>
      {/* Group header */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", cursor: "pointer" }}
        onClick={() => setCollapsed(c => !c)}
      >
        {/* Done check */}
        <div style={{
          width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
          border: `2px solid ${isGroupDone ? group.color : T.border}`,
          background: isGroupDone ? group.color : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
        }}>
          {isGroupDone && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: T.text, lineHeight: 1.2 }}>
            {group.name}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            {garminBadge && (
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                background: group.color + "18", color: group.color,
                border: `1px solid ${group.color}30`, borderRadius: 6, padding: "2px 8px",
              }}>
                {garminBadge}
              </span>
            )}
            <span style={{ fontSize: 11, color: T.textMuted }}>
              {groupExercises.length} exercises · {doneSets}/{totalSets} sets
            </span>
          </div>
        </div>

        <span style={{ color: T.textMuted, fontSize: 18, transition: "transform 0.2s", transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}>
          ‹
        </span>
      </div>

      {/* Exercise list */}
      {!collapsed && (
        <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${T.border}` }}>
          {groupExercises.map(({ ex, category }) => (
            <ExerciseItem
              key={ex.id}
              exercise={ex}
              category={category}
              setsDone={sessionSets[ex.id] || 0}
              totalSets={parseSets(ex.duration)}
              onToggleSet={onToggleSet}
              onDetails={onDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rest Day Card ────────────────────────────────────────────────────────────
function RestDayCard({ isLightDay, dayLabel }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 20,
      padding: 28, textAlign: "center", boxShadow: T.shadow,
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{isLightDay ? "🫁" : "😴"}</div>
      <div style={{ fontWeight: 900, fontSize: 20, color: T.text, marginBottom: 8 }}>
        {isLightDay ? "Light Recovery Day" : "Rest Day"}
      </div>
      <div style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
        {isLightDay
          ? "Today is a light breathwork / mobility session. Rest is training too — this is where the adaptations happen."
          : "Full rest today. Let your body consolidate the adaptations from the week. Active recovery (short walk, sunlight) is always a good idea."}
      </div>
    </div>
  );
}

// ─── Today View ──────────────────────────────────────────────────────────────
export default function TodayView() {
  const { exercises, schedule, workoutLog, setWorkoutLog, sessionCycleStart } = useWorkout();
  const today = todayISO();
  const { timer, autoStart, pause, finish, reset } = useWorkoutTimer(today);

  // Build exercise map
  const exMap = useMemo(() => {
    const m = new Map();
    for (const cat of Object.values(exercises)) for (const e of cat) m.set(e.id, e);
    return m;
  }, [exercises]);

  // Determine today's session
  const sessionPattern = useMemo(() => buildSessionPattern(schedule), [schedule]);
  const completedCount = useMemo(
    () => (workoutLog || []).filter(l => l.date !== today).length,
    [workoutLog, today]
  );
  const sessionIdx = sessionPattern.length > 0
    ? (completedCount + (sessionCycleStart || 0)) % sessionPattern.length
    : -1;
  const todaySession = sessionIdx >= 0 ? sessionPattern[sessionIdx] : null;
  const groups = todaySession ? (schedule[todaySession.dayKey] || []) : [];

  // Session sets state (localStorage, keyed by today's date)
  const setsKey = `pt_sets_${today}`;
  const [sessionSets, setSessionSetsRaw] = useState(() => {
    try { const s = localStorage.getItem(setsKey); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });

  const setSessionSets = (updater) => {
    setSessionSetsRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem(setsKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Toggle set completion — auto-starts timer on first interaction
  const handleToggleSet = useCallback((exId, targetSet) => {
    autoStart(); // start timer on first exercise interaction
    setSessionSets(prev => {
      const ex = exMap.get(exId);
      const total = ex ? parseSets(ex.duration) : 1;
      const current = prev[exId] || 0;
      let next;
      if (targetSet !== undefined) {
        // Clicked a specific set button
        next = targetSet <= current ? targetSet - 1 : targetSet;
      } else {
        // Clicked the main checkbox — toggle all sets
        next = current >= total ? 0 : total;
      }
      return { ...prev, [exId]: Math.max(0, Math.min(total, next)) };
    });
  }, [autoStart, exMap]);

  // Compute total progress
  const { totalExercises, completedExercises } = useMemo(() => {
    let total = 0, done = 0;
    groups.forEach(g => {
      g.exercises.forEach(slot => {
        const ex = exMap.get(slot.exerciseId);
        if (!ex) return;
        const sets = parseSets(ex.duration);
        total += sets;
        done += Math.min(sets, sessionSets[ex.id] || 0);
      });
    });
    return { totalExercises: total, completedExercises: done };
  }, [groups, exMap, sessionSets]);

  const isWorkoutDone = completedExercises > 0 && completedExercises >= totalExercises;
  const isTodayLogged = (workoutLog || []).some(l => l.date === today);

  // Mark workout complete
  const handleComplete = () => {
    if (isTodayLogged) return;
    finish();
    const exercisesDone = Object.values(sessionSets).filter(v => v > 0).length;
    setWorkoutLog(prev => [
      ...(prev || []).filter(l => l.date !== today),
      {
        date: today,
        sessionLabel: todaySession?.dayLabel || "Session",
        garminType: groups[0]?.garminType || "",
        exerciseCount: exercisesDone,
        duration: timer.startedAt
          ? Math.round((Date.now() - new Date(timer.startedAt).getTime() - timer.totalPausedMs) / 60000)
          : 0,
      },
    ]);
  };

  // Detail modal
  const [detail, setDetail] = useState(null);
  const [showRest, setShowRest] = useState(false);

  // Date info
  const dateLabel = new Date(today + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div>
      {/* Date header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: T.textMuted, fontWeight: 600, marginBottom: 4 }}>
          {dateLabel}
        </div>
        <h2 style={{ margin: 0, fontSize: 26, color: T.text, fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
          {isTodayLogged
            ? "Workout Complete ✓"
            : todaySession
            ? todaySession.dayLabel + " Session"
            : "Rest Day"}
        </h2>
        {todaySession && !isTodayLogged && (
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {groups[0]?.garminType && (
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                background: T.accent + "14", color: T.accent,
                border: `1px solid ${T.accent}30`, borderRadius: 20, padding: "4px 12px",
              }}>
                🏃 Garmin: {groups[0].garminType}
              </span>
            )}
            <span style={{ fontSize: 11, color: T.textMuted, alignSelf: "center" }}>
              Session {sessionIdx + 1} · {groups.length} group{groups.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Workout timer (shows once first exercise is started) */}
      <WorkoutTimerDisplay
        timer={timer}
        onPause={pause}
        onFinish={finish}
        onReset={reset}
        exerciseCount={completedExercises}
        totalExercises={totalExercises}
      />

      {/* Already logged */}
      {isTodayLogged && (
        <div style={{
          background: T.accent + "12", border: `1px solid ${T.accent}33`,
          borderRadius: 16, padding: "18px 20px", marginBottom: 20,
          display: "flex", gap: 14, alignItems: "center",
        }}>
          <span style={{ fontSize: 32 }}>🎉</span>
          <div>
            <div style={{ fontWeight: 800, color: T.accent, fontSize: 16 }}>Great work today!</div>
            <div style={{ fontSize: 13, color: T.textSec, marginTop: 2 }}>
              Session logged. Rest, eat well, and come back stronger.
            </div>
          </div>
        </div>
      )}

      {/* No session */}
      {!todaySession && !isTodayLogged && <RestDayCard isLightDay={false} />}

      {/* Exercise groups */}
      {todaySession && groups.map(group => (
        <GroupCard
          key={group.id}
          group={group}
          exercises={exercises}
          exMap={exMap}
          sessionSets={sessionSets}
          onToggleSet={handleToggleSet}
          onDetails={(ex, cat) => setDetail({ ex, category: cat })}
          garminBadge={group.garminType}
        />
      ))}

      {/* Rest Timer floating button */}
      {todaySession && timer.startedAt && !timer.endedAt && (
        <button
          onClick={() => setShowRest(true)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: "10px 16px", cursor: "pointer",
            color: T.textSec, fontSize: 13, fontWeight: 700, marginBottom: 16,
            width: "100%", justifyContent: "center",
          }}
        >
          ⏱ Rest Timer
        </button>
      )}

      {/* Complete workout button */}
      {todaySession && !isTodayLogged && completedExercises > 0 && (
        <button
          onClick={handleComplete}
          disabled={isTodayLogged}
          style={{
            width: "100%", padding: "16px",
            background: isWorkoutDone ? T.accent : T.surface,
            border: `1px solid ${isWorkoutDone ? T.accent : T.border}`,
            borderRadius: 16, cursor: "pointer",
            fontWeight: 900, fontSize: 16,
            color: isWorkoutDone ? "#fff" : T.textSec,
            transition: "all 0.2s", marginBottom: 16,
            boxShadow: isWorkoutDone ? `0 4px 20px ${T.accent}40` : "none",
          }}
        >
          {isWorkoutDone ? "✓ Finish & Log Workout" : `Log Workout (${completedExercises}/${totalExercises} done)`}
        </button>
      )}

      {/* Tips section — only when no session started */}
      {todaySession && !timer.startedAt && (
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: "14px 16px", marginBottom: 16,
          borderLeft: `3px solid ${T.accent}`,
        }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            💡 Session Tips
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: T.textSec, fontSize: 13, lineHeight: 1.8 }}>
            <li>Start with the first group — your session timer will begin automatically.</li>
            <li>Tap any exercise name to see full instructions.</li>
            <li>Tap the set squares to track individual sets.</li>
            <li>Use ⏸ Pause if you need a break mid-workout.</li>
          </ul>
        </div>
      )}

      {/* Modals */}
      <ExerciseDetailModal
        ex={detail?.ex}
        category={detail?.category}
        open={!!detail}
        onClose={() => setDetail(null)}
      />
      {showRest && <RestTimer onDismiss={() => setShowRest(false)} />}
    </div>
  );
}
