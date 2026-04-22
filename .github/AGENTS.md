# SpineSync — AI Agent Instructions

This file is the authoritative context document for AI agents working on this codebase.
Read this before making any changes. Update it when significant facts change.

---

## Patient Profile

- **Diagnosis:** Cifoscolioza dorso-lombara + sechele Morbus Scheuermann
- **In plain English:** Dorso-lumbar kyphoscoliosis (structural lateral + sagittal curve) with residual damage from Scheuermann's osteochondrosis (wedge-shaped vertebrae, Schmorl's nodes, disc degeneration at the thoraco-lumbar junction)
- **Garmin watch user** — logs activities by Garmin activity type; `garminType` field on schedule groups must match Garmin's vocabulary exactly
- **Home training only** — no gym access, no barbell

## Equipment (exact)

- **Dumbbells:** 4, 5.5, 7, 8.5, 10, 11.5, 13, 14.5, 16, 17.5, 19, 20.5, 22, 23.5 kg (1.5 kg increments)
- **Elastic bands:** Domyos (Decathlon) pilates set — 3 bands: **7 kg / 10 kg / 15 kg**
- **Stick:** standard gymnastics/broom stick (used for pull-aparts, overhead walks, rowing)
- **Foam roller:** thoracic use only (T4–T10), never on lumbar

**Weight assignment rule:** All `weight` fields must use a value from the dumbbell list above (4, 5.5, 7, 8.5, 10 … 23.5). Never write 6, 8, 9, etc. Band exercises use `weightUnit: "band"` with the band's kg rating (7, 10, or 15).

---

## Medical Constraints — Never Violate

1. **No heavy axial spinal loading** — no barbell squat, no barbell deadlift, no overhead barbell press
2. **No full spinal flexion under load** — no sit-ups, no crunches. Core work follows McGill protocol only (Bird-Dog, Dead Bug, Modified Curl-Up)
3. **Pull:Push ratio ≥ 2:1** — for every pushing exercise there must be at least two pulling/scapular-retraction exercises in the same session
4. **Session 7 must NOT be Strength** — the 7-session weekly cycle ends on Sunday = HIIT/Cardio. This is a hard constraint that must survive all schedule edits
5. **Foam roller never on lumbar** — only T4–T10. Always include this warning in tips
6. **Thoracic extension exercises take priority** — the towel roll and prone cobra are the most clinically important exercises; they must appear in every kinetotherapy session
7. **Cervical exercises are conservative** — no full neck circles backward. Only semi-circles (ear to shoulder, chin to chest)

---

## Code Architecture

### Data flow

```
exercises-data.js  ──→  context.jsx (useIdbStorage)  ──→  all views
     EXERCISES                  exercises state
     SCHEDULE                   schedule state
                                workoutLog state
                                sessionCycleStart state
```

### State persistence layers

| Data | Storage | Key pattern |
|------|---------|-------------|
| exercises, schedule, workoutLog, sessionCycleStart | IndexedDB (idb-keyval) | `"pt_exercises"`, `"pt_schedule"`, `"pt_log"`, `"pt_scs"` |
| Today's set progress | localStorage | `pt_sets_YYYY-MM-DD` |
| Workout timer state | localStorage | `pt_wt_YYYY-MM-DD` |
| Dark mode preference | localStorage | `pt_dark_mode` |

### Session rotation logic

```js
// In helpers.js:
buildSessionPattern(schedule)
  // → filters Mon–Sun for days with exercises.length > 0
  // → returns [{ dayKey, dayLabel }, ...]

// Active session index:
(completedCount + sessionCycleStart) % pattern.length
// completedCount = workoutLog entries not for today
// sessionCycleStart = user-adjustable offset (Data view)
```

### Theme system

All styling is inline CSS via JS objects. Never use CSS files or className.

```js
import { T } from "./constants.js";
// T.bg, T.card, T.surface, T.border, T.text, T.textSec, T.textMuted
// T.accent, T.blue, T.red, T.teal, T.purple, T.amber, T.pink, T.green
// T.shadow, T.shadowMd
// All values are CSS var() references: var(--c-bg), etc.
// LIGHT_VARS / DARK_VARS are applied as inline style on the root div
```

### Exercise data shape

```js
{
  id: "k01",              // unique string — never change existing IDs (breaks user IDB data)
  name: "Cat-Cow",
  image: "",              // populated by scripts/fetch-exercise-images.mjs
  muscles: ["..."],       // array of muscle name strings
  duration: "2×10",       // string — parseSets() extracts set count via /^(\d+)\s*[×x]/
  difficulty: "Easy",     // "Easy" | "Medium" | "Hard"
  weight: "7",            // string number OR "" — always from the dumbbell list
  weightUnit: "kg",       // "kg" | "band" | "bodyweight" | ""
  notes: "Phase 1+",      // short context string — shown in library
  tips: "...",            // full instruction text — shown in detail modal
}
```

### Schedule group shape

```js
{
  id: "mon_km",           // unique string
  name: "Kineto · Spine & Posture",
  color: "#3b82f6",       // hex color from GROUP_COLORS in constants.js
  garminType: "Functional Fitness",  // must match Garmin vocabulary exactly
  exercises: [
    { category: "physical_therapy", exerciseId: "k02" },
    // category must be a key of EXERCISES: physical_therapy|muscle|cardio|breathing|mobility
  ],
}
```

### Workout log entry shape

```js
{
  date: "2026-04-22",          // ISO date string from todayISO()
  sessionLabel: "Mon Session", // human label
  garminType: "Functional Fitness",
  exerciseCount: 12,
  duration: 38,                // minutes (integer)
}
```

---

## File Ownership Map

| File | What to touch it for |
|------|---------------------|
| `exercises-data.js` | Adding/editing exercises or the default schedule |
| `constants.js` | Adding categories, changing colors/theme tokens, shared style objects |
| `context.jsx` | Adding new persisted state fields |
| `helpers.js` | Utility logic: date, session math, streak |
| `views/TodayView.jsx` | Today workout UX — timer, set tracking, complete flow |
| `views/ScheduleView.jsx` | Schedule editor, group editor, 7-day calendar |
| `views/ExercisesView.jsx` | Exercise library browser |
| `views/HistoryView.jsx` | Workout log display, streak, charts |
| `views/ImportExportView.jsx` | JSON backup/restore |
| `components/ui.jsx` | Reusable UI primitives: Badge, Modal, ExerciseDetailModal, RestTimer |
| `components/timers.jsx` | Timer hooks and display components — `formatElapsed` is imported by TodayView |

---

## Common Gotchas

- **Never rename an exercise `id`** — it will silently break any user's IDB-stored schedule that references the old ID
- **`parseSets("2×10")` returns `2`** — the set count is the first number. Duration strings must follow `N×M` format for set tracking to work; single-set exercises like `"5 min"` return 1
- **`weight` is always a string**, not a number — `"7"` not `7`. The UI renders it with `weightUnit` appended
- **`base: '/spinesync/'`** in vite.config.js is required for GitHub Pages — do not remove it or change it
- **Category `muscle`** is the IDB key — changing it to `strength` would break stored data. The display label is "Strength" in `CATEGORY_META` but the code key stays `muscle`
- **`mobility`** is the 5th category added in session 2 of development — it is in `CATEGORY_META`, `EXERCISES`, and supported by `ExercisesView` and `ScheduleView` dynamically
- **Garmin type strings must be exact** — `"Strength Training"` not `"Strength"`, `"Functional Fitness"` not `"Functional"`, etc.
- **Light days (Tue/Thu/Sat) still appear in the session pattern** — they have exercises in the schedule so `buildSessionPattern` includes them. "Light" is a label/design distinction only

---

## Adding a New Exercise

1. Add the object to the appropriate array in `exercises-data.js` (`physical_therapy`, `muscle`, `cardio`, `breathing`, or `mobility`)
2. Choose an ID: use the existing prefix convention (`k` = kineto, `s` = strength, `ca` = cardio, `br` = breathing, `mob` = mobility)
3. Set `weight` to a value from the dumbbell list or `""` if bodyweight/band
4. Set `weightUnit` to `"kg"` / `"band"` / `"bodyweight"` / `""`
5. Add `{ category: "...", exerciseId: "..." }` to the appropriate schedule group if it should appear in the default schedule
6. Run `npm run build` to verify no compile errors

## Adding a New Schedule Group

1. Add to `SCHEDULE[dayKey]` array in `exercises-data.js`
2. Pick a color from `GROUP_COLORS` in `constants.js`
3. Set `garminType` to a valid Garmin vocabulary string
4. Ensure pull:push ratio is maintained if it's a strength day
5. Verify Session 7 (Sunday) remains non-Strength

---

## Deployment

- **Auto-deploy:** push to `main` → GitHub Actions runs `npm run build` → deploys `dist/` to GitHub Pages
- **Base URL:** `https://[username].github.io/spinesync/`
- **PWA:** service worker auto-updates on new deploy; users see new version on next app open

---

## Current Phase Status (as of Apr 2026)

The user is on **Phase 1 / Session 7** of the program.
- Phase 1 = Foundation (Apr–Jun 2026) — all exercises marked `Phase 1+` are active
- Phase 2 exercises (`k11`–`k16`, `sa6`+, `sb9`+, `sc7`+) unlock in Jun 2026
- Phase 3 exercises unlock Aug 2026
- `sessionCycleStart` offset in the Data view is used to keep the rotating session counter aligned with the real-world week
