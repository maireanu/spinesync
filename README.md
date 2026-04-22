# SpineSync

A personal Progressive Web App (PWA) for managing a medically-guided exercise program.
Hosted at: **https://[username].github.io/spinesync/**

---

## Medical Context

**Diagnosis:** Cifoscolioza dorso-lombara + sechele Morbus Scheuermann
(Dorso-lumbar kyphoscoliosis + Scheuermann's disease sequelae)

**What this means for the exercise program:**
- Thoracic kyphosis and scoliosis require a higher ratio of pull:push exercises (≥2:1)
- Intervertebral disc changes from Scheuermann's contraindicate heavy spinal loading
- Forward head posture (secondary to kyphosis) needs dedicated cervical work
- Glute medius weakness creates Trendelenburg gait that amplifies the scoliotic curve
- Hip flexor tightness increases lumbar anterior tilt — must be addressed alongside spinal work
- All core work avoids full spinal flexion (no sit-ups, no crunches) per McGill protocol
- Equipment is home-based — no barbell loading, no overhead barbell press

**Protocols referenced:**
- McGill Big 3 (Bird-Dog, Dead Bug, Modified Curl-Up)
- McKenzie Method (prone extension for disc health)
- Schroth Method Phase 3 (rotational breathing for scoliosis)
- Norwegian 2×4 HIIT (cardiovascular base)
- Huberman Lab (breathwork, NSDR, sunlight protocol)
- FRC / Functional Range Conditioning (CARs for joint health)

---

## Equipment

| Equipment | Detail |
|-----------|--------|
| Dumbbells | 4 – 24 kg in 1.5 kg steps: 4, 5.5, 7, 8.5, 10, 11.5, 13, 14.5, 16, 17.5, 19, 20.5, 22, 23.5 kg |
| Elastic bands | Domyos (Decathlon) pilates set — 3 bands: **7 kg / 10 kg / 15 kg** |
| Stick | Standard gymnastics/broom stick |
| Foam roller | For thoracic mobilization (T4–T10 only, never lumbar) |
| Garmin watch | Activity type must match Garmin categories for accurate training load tracking |

---

## Exercise Categories

| Category key | Display name | Icon | Purpose |
|---|---|---|---|
| `physical_therapy` | Kinetotherapy | 🩺 | McGill / McKenzie / Schroth spine rehab |
| `muscle` | Strength | 💪 | Upper body push + pull, legs, anti-rotation core |
| `cardio` | Cardio / HIIT | 🏃 | Norwegian method Zone 2 + intervals |
| `breathing` | Breathwork | 🫁 | Huberman protocols, CO₂ tolerance, NSDR |
| `mobility` | Mobility / Yoga | 🧘 | FRC, thoracic rotation, hip mobility |

---

## Weekly Schedule

| Day | Type | Garmin | Duration |
|-----|------|--------|----------|
| Mon | Kinetotherapy — Spine & Posture | Functional Fitness | ~35 min |
| Tue *(light)* | Breathwork morning reset | Breathing | ~10 min |
| Wed | Strength — Upper Push + Pull + Zone 2 | Strength Training / Cardio | ~50 min |
| Thu *(light)* | Mobility & Recovery | Yoga | ~20 min |
| Fri | Kinetotherapy + Core & Stability | Functional Fitness | ~40 min |
| Sat *(light)* | Active Recovery / Yoga + NSDR | Yoga / Breathing | ~20 min |
| Sun | Cardio / HIIT (Norwegian 2×4) | HIIT | ~30 min |

**Session 7 = Sunday = HIIT — deliberately not Strength** (constraint preserved through all schedule edits)

---

## Training Phases

| Phase | Months | Period |
|---|---|---|
| Phase 1 — Foundation | Months 1–2 | Apr – Jun 2026 |
| Phase 2 — Progression | Months 3–4 | Jun – Aug 2026 |
| Phase 3 — Advanced | Months 5–6 | Aug – Oct 2026 |

Exercise IDs encode their phase: `k01`–`k10` = Phase 1, `k11`–`k16` = Phase 2, `k17`–`k22` = Phase 3.

---

## App Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (JSX, hooks) |
| Build tool | Vite 8 |
| Routing | react-router-dom v7 |
| Persistence | idb-keyval (IndexedDB) via `useIdbStorage` hook |
| PWA | vite-plugin-pwa (Workbox, auto-update) |
| Charts | recharts |
| Drag & drop | @hello-pangea/dnd |
| Icons | lucide-react |
| Validation | zod |
| Tests | Vitest + @testing-library/react |
| Styling | Inline styles only — CSS custom properties via JS objects (`LIGHT_VARS` / `DARK_VARS`) |
| Hosting | GitHub Pages (`/spinesync/` base path) |

---

## Project Structure

```
spinesync/
├── constants.js          # Theme tokens (T.*), CATEGORY_META, GROUP_COLORS, shared style objects
├── context.jsx           # WorkoutProvider — all IDB-backed global state
├── exercises-data.js     # EXERCISES export + SCHEDULE default (source of truth)
├── exercise-images.js    # Auto-generated image map (populated by scripts/fetch-exercise-images.mjs)
├── helpers.js            # todayISO, buildSessionPattern, computeStreak, parseSets, uid
├── helpers.test.js       # Vitest unit tests for helpers
├── main.jsx              # React root, BrowserRouter
├── spinesync-app.jsx     # App shell — nav bar, routing, dark mode
├── vite.config.js        # Vite + PWA config, base: '/spinesync/'
├── components/
│   ├── timers.jsx        # formatElapsed, useElapsed, timer UI components
│   └── ui.jsx            # Badge, Modal, ExerciseDetailModal, RestTimer, etc.
├── views/
│   ├── TodayView.jsx     # Main workout view — session timer, set tracking, complete/log
│   ├── ScheduleView.jsx  # 7-day template editor + projected calendar (drag-and-drop)
│   ├── ExercisesView.jsx # Exercise library browser by category
│   ├── HistoryView.jsx   # Workout log, streak, 28-day calendar, bar chart
│   └── ImportExportView.jsx # JSON export/import of all user data
├── public/
│   └── manifest.json     # PWA manifest
└── scripts/
    └── fetch-exercise-images.mjs # RapidAPI image fetcher (run manually)
```

---

## Key Architectural Decisions

**State persistence:** All user data (exercises, schedule, workout log, session cycle start) lives in IndexedDB via `idb-keyval`. Timer state and today's set progress use `localStorage` (keyed by ISO date) for fast per-session access without async.

**Session rotation:** `buildSessionPattern(schedule)` extracts days with exercises in order Mon→Sun, returns an ordered array. Active session = `(completedCount + sessionCycleStart) % pattern.length`. `sessionCycleStart` is adjustable from the Data view to resync with the real-world session number.

**No backend:** Fully client-side. Data never leaves the device. Export/import via JSON file for backup.

**PWA:** Installable on Android/iOS homescreen, works offline after first load via Workbox service worker.

**Base path:** `/spinesync/` — required for GitHub Pages project site. All internal links use relative paths.

---

## Development

```bash
npm install
npm run dev       # http://localhost:5173/spinesync/
npm run build     # production build → dist/
npm run test      # Vitest unit tests
npm run preview   # preview production build locally
```

---

## Deployment

Automatic via GitHub Actions (`.github/workflows/pages.yml`):
- Trigger: push to `main` branch
- Build: `npm run build`
- Deploy: `dist/` → GitHub Pages

Manual deploy: push to `main` and the workflow runs automatically.

---

## Garmin Integration

Exercises and schedule groups have a `garminType` field. This is a **display-only hint** — SpineSync does not connect to Garmin Connect API. The user manually starts the corresponding activity type on the watch before beginning the session.

Garmin activity types used: `Functional Fitness` · `Strength Training` · `Cardio` · `HIIT` · `Yoga` · `Breathing` · `Walk`
