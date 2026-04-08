/* ════════════════════════════════════════════════════════════════
   SPINESYNC — app.js
   Single-file vanilla JS application for SpineSync PWA
   ════════════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   1. CONSTANTS & GLOBAL STATE
─────────────────────────────────────────────────────────────── */
const LS = {
  LOGS:      'ss_logs',
  BOLT:      'ss_bolt',
  MILESTONES:'ss_milestones',
  CUSTOM:    'ss_custom',
  PREFS:     'ss_prefs',
};

const App = {
  schedule:  null,
  kineto:    null,
  strength:  null,
  cardio:    null,
  dataReady: false,
  /* merged exercise index: id → exercise object */
  exercises: {},
};

/* Active workout state */
const WS = {
  active:       false,
  exercises:    [],
  currentIndex: 0,
  sets:         {},  /* id → [{reps,weightKg,durationSec,left,right,done}] */
  notes:        {},  /* id → string */
  startTime:    null,
  restHandle:   null,
  restLeft:     0,
  restTotal:    0,
  sessionType:  null,
  strengthDay:  null,
  phase:        null,
  timerHandles: {}, /* set timer handles: "K-01_0" → handle */
  timerElapsed: {}, /* "K-01_0" → elapsed seconds */
  timerRunning: {}, /* "K-01_0" → bool */
};

/* Breathing animation */
const BREATH = {
  handle: null,
  phase:  'inhale',
  sec:    0,
  done:   0,
  target: 8,
};

/* Milestone list (static) */
const MILESTONES = [
  { id: 'm01', month: 1, week: 2,  text: 'Complete 5 consecutive kinetotherapy sessions' },
  { id: 'm02', month: 1, week: 4,  text: 'Feel comfortable with all Phase 1 exercises' },
  { id: 'm03', month: 1, week: 4,  text: 'Hold Bird-Dog for 5 seconds without wobbling' },
  { id: 'm04', month: 1, week: 8,  text: 'Complete all Phase 1 sessions for 4 weeks straight' },
  { id: 'm05', month: 2, week: 9,  text: 'Start Phase 2 — add K-11 through K-16' },
  { id: 'm06', month: 2, week: 12, text: 'Hold modified side plank 30 sec each side' },
  { id: 'm07', month: 2, week: 12, text: 'Achieve BOLT score ≥ 20 seconds' },
  { id: 'm08', month: 3, week: 17, text: 'Complete 50 total sessions' },
  { id: 'm09', month: 3, week: 17, text: 'Bird-Dog with resistance band, controlled' },
  { id: 'm10', month: 4, week: 18, text: 'Start Phase 3 advanced exercises' },
  { id: 'm11', month: 4, week: 22, text: 'Single-leg balance 30 sec eyes closed' },
  { id: 'm12', month: 5, week: 24, text: 'Achieve BOLT score ≥ 25 seconds' },
  { id: 'm13', month: 6, week: 26, text: 'Complete full 6-month program — 182 sessions' },
  { id: 'm14', month: 6, week: 26, text: 'Visible improvement in postural measurements' },
];

/* ──────────────────────────────────────────────────────────────
   2. UTILITIES
─────────────────────────────────────────────────────────────── */
function fmt2(n) { return String(Math.floor(n)).padStart(2, '0'); }
function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  return fmt2(Math.floor(s / 60)) + ':' + fmt2(s % 60);
}
function fmtDuration(ms) {
  const min = Math.round(ms / 60000);
  return min < 1 ? '<1 min' : min + ' min';
}
function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' });
}
function isoDate(d) {
  return d.getFullYear() + '-' + fmt2(d.getMonth()+1) + '-' + fmt2(d.getDate());
}
function parseISO(s) {
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m-1, d);
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function lsGet(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function showToast(msg, dur = 2400) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), dur);
}

/* ──────────────────────────────────────────────────────────────
   3. SCHEDULE ENGINE
─────────────────────────────────────────────────────────────── */
function getWeekNumber(date) {
  const start = parseISO(App.schedule.startDate);
  const diff  = date - start;
  return Math.floor(diff / (7 * 86400000)) + 1;
}

function getCurrentPhase(weekNum) {
  const { phases, transitions } = App.schedule;
  const tr = transitions.find(t => t.week === weekNum);
  if (tr) return tr.from; /* transition week → use current phase */
  const ph = phases.find(p => weekNum >= p.weekStart && weekNum <= p.weekEnd);
  return ph ? ph.id : (weekNum > 26 ? 3 : 1);
}

function getSessionType(date, weekNum) {
  if (weekNum < 1 || weekNum > 26) return 'rest';
  const dow = date.getDay(); /* 0=Sun */
  return App.schedule.weeklyPattern[String(dow)] || 'rest';
}

function getStrengthDay(date, weekNum) {
  const dow     = date.getDay();
  const pattern = (weekNum - 1) % 3;
  const order   = App.schedule.strengthDayOrder; /* [2,4,0] */
  const idx     = order.indexOf(dow);
  if (idx === -1) return 'A'; /* fallback */
  return App.schedule.strengthPatterns[pattern][idx];
}

function getProgramStatus() {
  const today   = new Date();
  const weekNum = getWeekNumber(today);
  if (weekNum < 1) return { before: true };
  if (weekNum > 26) return { after: true };

  const phase       = getCurrentPhase(weekNum);
  const sessionType = getSessionType(today, weekNum);
  let   strengthDay = null;
  if (sessionType === 'strength') strengthDay = getStrengthDay(today, weekNum);

  /* transition detection */
  const trans = App.schedule.transitions.find(t => t.week === weekNum);

  return { today, weekNum, phase, sessionType, strengthDay, trans,
           phaseName: App.schedule.phases.find(p => p.id === phase)?.name || '' };
}

/* ──────────────────────────────────────────────────────────────
   4. EXERCISE HELPERS
─────────────────────────────────────────────────────────────── */
function buildExerciseIndex() {
  App.exercises = {};
  const add = list => list.forEach(ex => { App.exercises[ex.id] = ex; });
  add(App.kineto.exercises);
  add(App.strength.exercises);
  if (App.cardio.breathingExercises) add(App.cardio.breathingExercises);
  /* apply custom overrides */
  const custom = lsGet(LS.CUSTOM, []);
  custom.forEach(ex => { App.exercises[ex.id] = ex; });
}

function getSessionExercises(sessionType, phase, strengthDay) {
  let ids = [];
  if (sessionType === 'kinetotherapy') {
    ids = App.kineto.sessions['phase'+phase] || App.kineto.sessions.phase1;
  } else if (sessionType === 'strength') {
    const day = (strengthDay || 'A').toLowerCase();
    ids = App.strength.sessions['day'+day.toUpperCase()]?.['phase'+phase]
       || App.strength.sessions.dayA?.phase1
       || [];
  }
  return ids.map(id => App.exercises[id]).filter(Boolean);
}

function getCategoryColor(cat) {
  return { warmup: '#f59e0b', main: '#2563eb', cooldown: '#10b981' }[cat] || '#64748b';
}

function getCategoryBg(cat) {
  return { warmup: '#fef3c7', main: '#dbeafe', cooldown: '#d1fae5' }[cat] || '#f1f5f9';
}

function trackingLabel(ex) {
  switch (ex.trackingType) {
    case 'reps':           return `${ex.sets} × ${ex.repsPerSet} reps`;
    case 'reps_weighted':  return `${ex.sets} × ${ex.repsPerSet} reps  +  weight`;
    case 'bilateral_reps': return `${ex.sets} × ${ex.repsPerSet} reps / side`;
    case 'timed':          return `${ex.sets} × ${ex.durationSec}s`;
    case 'bilateral_timed':return `${ex.sets} × ${ex.durationSec}s / side`;
    case 'breathing':      return `${ex.repsPerSet} breath cycles`;
    default:               return '';
  }
}

/* ──────────────────────────────────────────────────────────────
   5. DATA LOADING
─────────────────────────────────────────────────────────────── */
async function loadData() {
  const files = ['data/schedule.json','data/kinetotherapy.json','data/strength.json','data/cardio.json'];
  try {
    const results = await Promise.all(files.map(f => fetch(f).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status} for ${f}`);
      return r.json();
    })));
    [App.schedule, App.kineto, App.strength, App.cardio] = results;
    buildExerciseIndex();
    App.dataReady = true;
  } catch (err) {
    console.error('Failed to load data:', err);
    document.getElementById('today-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p><strong>Cannot load exercise data.</strong><br>
        If testing locally, please run a local server:<br>
        <code>python3 -m http.server 8000</code><br>
        then open <a href="http://localhost:8000">localhost:8000</a></p>
      </div>`;
    throw err;
  }
}

/* ──────────────────────────────────────────────────────────────
   6. LOG MANAGER
─────────────────────────────────────────────────────────────── */
function getLogs() { return lsGet(LS.LOGS, []); }

function getLogForDate(dateStr) {
  return getLogs().find(l => l.date === dateStr) || null;
}

function saveLog(log) {
  const logs = getLogs().filter(l => l.date !== log.date);
  logs.push(log);
  lsSet(LS.LOGS, logs);
}

function getStreak() {
  const logs  = getLogs().filter(l => l.completedAll);
  const today = isoDate(new Date());
  let streak  = 0;
  let check   = new Date();
  for (let i = 0; i < 365; i++) {
    const d = isoDate(check);
    if (logs.find(l => l.date === d)) {
      streak++;
    } else if (d !== today) {
      break;
    }
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

function getTotalSessions() { return getLogs().filter(l => l.completedAll).length; }

/* ──────────────────────────────────────────────────────────────
   7. ROUTER
─────────────────────────────────────────────────────────────── */
const Router = {
  current: 'today',
  navigate(viewName) {
    if (!App.dataReady && viewName !== 'today') return;
    this.current = viewName;
    /* toggle views */
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById('view-' + viewName);
    if (el) el.classList.add('active');
    /* toggle nav */
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === viewName);
    });
    /* render */
    if (viewName === 'today')    renderTodayView();
    if (viewName === 'library')  renderLibraryView();
    if (viewName === 'progress') renderProgressView();
    if (viewName === 'edit')     renderEditView();
    /* don't re-render workout view here — handled by workout engine */
  }
};

/* ──────────────────────────────────────────────────────────────
   8. TODAY VIEW
─────────────────────────────────────────────────────────────── */
function renderTodayView() {
  if (!App.dataReady) return;
  const cont  = document.getElementById('today-content');
  const status = getProgramStatus();

  if (status.before) {
    const start = parseISO(App.schedule.startDate);
    const days  = Math.ceil((start - new Date()) / 86400000);
    cont.innerHTML = `
      <div class="today-hero">
        <div class="today-hero-eyebrow">Program starts in</div>
        <div class="today-hero-title">${days} days</div>
        <div class="today-hero-sub">${fmtDate(start)}</div>
      </div>
      <div class="streak-row">
        ${streakCardsHTML(0, 0, 0)}
      </div>`;
    return;
  }

  if (status.after) {
    const total = getTotalSessions();
    cont.innerHTML = `
      <div class="today-hero" style="background:linear-gradient(135deg,#10b981,#059669)">
        <div class="today-hero-eyebrow">Program Complete!</div>
        <div class="today-hero-title">🎉 Well done!</div>
        <div class="today-hero-sub">6-month program finished</div>
      </div>
      <div class="streak-row">
        ${streakCardsHTML(getStreak(), total, 182)}
      </div>`;
    return;
  }

  const { today, weekNum, phase, sessionType, strengthDay, phaseName, trans } = status;
  const todayStr  = isoDate(today);
  const done      = !!getLogForDate(todayStr)?.completedAll;
  const exercises = sessionType !== 'rest'
    ? getSessionExercises(sessionType, phase, strengthDay)
    : [];
  const streak    = getStreak();
  const total     = getTotalSessions();
  const weekTotal = countWeekSessions(today);

  /* Hero card colour by session type */
  const heroGrad = sessionType === 'kinetotherapy'
    ? 'linear-gradient(135deg,#2563eb,#4f46e5)'
    : sessionType === 'strength'
    ? 'linear-gradient(135deg,#10b981,#0d9488)'
    : 'linear-gradient(135deg,#64748b,#475569)';

  const sessionLabel = sessionType === 'kinetotherapy'
    ? '🏥 Kinetotherapy'
    : sessionType === 'strength'
    ? `💪 Strength · Day ${strengthDay}`
    : '🌿 Rest Day';

  const phaseLabel = `Phase ${phase} · ${phaseName}`;
  const transNote  = trans
    ? `<div style="background:rgba(255,255,255,.15);border-radius:8px;padding:8px 12px;font-size:12px;margin-top:10px;">🔄 Transition week — gradually introducing Phase ${trans.to} exercises</div>`
    : '';

  const startBtn = (sessionType !== 'rest' && !done)
    ? `<button class="btn-start" id="btn-start-workout">▶ Start Workout</button>`
    : sessionType !== 'rest' && done
    ? `<div style="background:rgba(255,255,255,.15);border-radius:10px;padding:12px;text-align:center;font-weight:700;font-size:15px;margin-top:14px;">✅ Session Complete!</div>`
    : '';

  cont.innerHTML = `
    <div class="today-hero" style="background:${heroGrad}">
      <div class="today-hero-eyebrow">${fmtDate(today)} · Week ${weekNum}</div>
      <div class="today-hero-title">${sessionLabel}</div>
      <div class="today-hero-sub">${phaseLabel}</div>
      <div class="today-hero-meta">
        <span>📋 ${exercises.length} exercises</span>
        <span>⏱ ~${Math.round(exercises.length * 3)} min</span>
      </div>
      ${transNote}
      ${startBtn}
    </div>

    <div class="streak-row">
      ${streakCardsHTML(streak, total, weekTotal)}
    </div>

    ${exercises.length > 0 ? exercisePreviewHTML(exercises) : ''}
  `;

  if (!done && sessionType !== 'rest') {
    document.getElementById('btn-start-workout')?.addEventListener('click', () => {
      startWorkout(exercises, sessionType, strengthDay, phase);
    });
  }
}

function streakCardsHTML(streak, total, weekDone) {
  return `
    <div class="streak-card"><div class="streak-num">${streak}</div><div class="streak-label">Day Streak</div></div>
    <div class="streak-card"><div class="streak-num">${total}</div><div class="streak-label">Total Sessions</div></div>
    <div class="streak-card"><div class="streak-num">${weekDone}</div><div class="streak-label">This Week</div></div>
  `;
}

function countWeekSessions(date) {
  const logs = getLogs().filter(l => l.completedAll);
  const d = new Date(date);
  const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay()+6)%7));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return logs.filter(l => {
    const ld = parseISO(l.date); return ld >= mon && ld <= sun;
  }).length;
}

function exercisePreviewHTML(exercises) {
  const MAX_PREVIEW = 5;
  const shown = exercises.slice(0, MAX_PREVIEW);
  const more  = exercises.length - MAX_PREVIEW;
  return `
    <div class="exercise-preview">
      <div class="exercise-preview-header">
        <span>Today's exercises</span>
        <span class="text-sm text-3">${exercises.length} total</span>
      </div>
      <div class="exercise-preview-list">
        ${shown.map(ex => `
          <div class="exercise-preview-item">
            <span class="cat-dot cat-${ex.category}"></span>
            <span>${ex.name}</span>
            <span class="text-xs text-3" style="margin-left:auto">${trackingLabel(ex)}</span>
          </div>`).join('')}
      </div>
      ${more > 0 ? `<div class="exercise-preview-more">+ ${more} more</div>` : ''}
    </div>`;
}

/* ──────────────────────────────────────────────────────────────
   9. WORKOUT ENGINE
─────────────────────────────────────────────────────────────── */
function startWorkout(exercises, sessionType, strengthDay, phase) {
  /* init state */
  Object.assign(WS, {
    active:       true,
    exercises,
    currentIndex: 0,
    sets:         {},
    notes:        {},
    startTime:    Date.now(),
    restHandle:   null,
    restLeft:     0,
    restTotal:    0,
    sessionType,
    strengthDay,
    phase,
    timerHandles: {},
    timerElapsed: {},
    timerRunning: {},
  });

  /* Initialise set state for all exercises */
  exercises.forEach(ex => {
    WS.sets[ex.id] = buildInitialSets(ex);
    WS.notes[ex.id] = '';
  });

  /* Switch to workout view */
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-workout').classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  renderWorkoutView();

  /* Start elapsed timer */
  WS._clockHandle = setInterval(() => {
    const el = document.getElementById('ws-timer');
    if (el) el.textContent = fmtTime(Date.now() - WS.startTime);
  }, 1000);
}

function buildInitialSets(ex) {
  const n = ex.sets || 1;
  switch (ex.trackingType) {
    case 'reps':            return Array.from({length:n}, () => ({reps: ex.repsPerSet||0, done:false}));
    case 'reps_weighted':   return Array.from({length:n}, () => ({reps: ex.repsPerSet||0, weightKg: ex.startWeightKg||0, done:false}));
    case 'bilateral_reps':  return Array.from({length:n}, () => ({left: ex.repsPerSet||0, right: ex.repsPerSet||0, done:false}));
    case 'timed':           return Array.from({length:n}, () => ({elapsed:0, done:false}));
    case 'bilateral_timed': return Array.from({length:n}, () => ({leftDone:false, rightDone:false, done:false}));
    case 'breathing':       return [{breaths:0, done:false}];
    default:                return [{done:false}];
  }
}

function renderWorkoutView() {
  if (!WS.active) return;
  const view = document.getElementById('view-workout');
  const ex   = WS.exercises[WS.currentIndex];
  const isLast = WS.currentIndex === WS.exercises.length - 1;
  const pct  = Math.round(WS.currentIndex / WS.exercises.length * 100);

  view.innerHTML = `
    <div class="workout-topbar">
      <button class="icon-btn" id="ws-back-btn" aria-label="Back to today">✕</button>
      <span class="workout-idx">${WS.currentIndex+1} / ${WS.exercises.length}</span>
      <span class="workout-timer" id="ws-timer">00:00</span>
    </div>
    <div class="workout-progress-bar"><div class="workout-progress-fill" style="width:${pct}%"></div></div>

    <div class="exercise-player" id="exercise-player">
      ${renderExerciseCard(ex)}
      ${renderSetTracker(ex)}
      <div class="notes-row">
        <textarea class="notes-input" id="notes-${ex.id}" rows="2"
          placeholder="Session note…">${WS.notes[ex.id]||''}</textarea>
      </div>
    </div>

    <div id="rest-bar-wrap"></div>

    <div class="workout-nav">
      ${WS.currentIndex > 0
        ? `<button class="btn-nav prev" id="ws-prev">← Prev</button>`
        : `<button class="btn-nav prev" id="ws-quit" style="color:var(--danger)">✕ Quit</button>`}
      ${isLast
        ? `<button class="btn-nav finish" id="ws-finish">Finish ✓</button>`
        : `<button class="btn-nav next" id="ws-next">Next →</button>`}
    </div>
  `;

  /* Re-attach elapsed clock */
  clearInterval(WS._clockHandle);
  WS._clockHandle = setInterval(() => {
    const el = document.getElementById('ws-timer');
    if (el) el.textContent = fmtTime(Date.now() - WS.startTime);
  }, 1000);

  attachWorkoutEvents(ex, isLast);
  tickBreathIfNeeded(ex);
}

function renderExerciseCard(ex) {
  const gifSrc = ex.gifUrl || 'assets/placeholder.svg';
  const warningHTML = ex.warning
    ? `<div class="warning-box">⚠️ ${ex.warning}</div>` : '';
  const cueHTML = (ex.cues||[]).map(c=>`<span class="cue-chip">${c}</span>`).join('');

  return `
    <div class="gif-container">
      <img src="${gifSrc}" alt="${ex.name}" loading="lazy" onerror="this.src='assets/placeholder.svg'">
    </div>
    <div class="exercise-info">
      <div class="exercise-name">${ex.name}</div>
      <div class="exercise-meta">
        <span style="color:${getCategoryColor(ex.category)};font-weight:600">${capitalize(ex.category)}</span>
        <span>${trackingLabel(ex)}</span>
      </div>
      <p style="font-size:13px;color:var(--text-2);margin-top:10px;line-height:1.6">${ex.instructions||''}</p>
      ${warningHTML}
      ${cueHTML ? `<div class="cues-chip-row">${cueHTML}</div>` : ''}
    </div>`;
}

function renderSetTracker(ex) {
  const sets = WS.sets[ex.id];
  switch (ex.trackingType) {
    case 'reps':            return renderRepsTracker(ex, sets);
    case 'reps_weighted':   return renderWeightedTracker(ex, sets);
    case 'bilateral_reps':  return renderBilateralRepsTracker(ex, sets);
    case 'timed':           return renderTimedTracker(ex, sets);
    case 'bilateral_timed': return renderBilateralTimedTracker(ex, sets);
    case 'breathing':       return renderBreathingTracker(ex, sets);
    default:                return renderSimpleTracker(ex, sets);
  }
}

function renderRepsTracker(ex, sets) {
  const rows = sets.map((s,i) => {
    const label = ex.setLabels?.[i] || `Set ${i+1}`;
    return `
      <div class="set-row ${s.done?'done':''}" data-setrow="${i}">
        <span class="set-label">${label}</span>
        <div class="counter">
          <button class="btn-counter minus" data-action="dec" data-ex="${ex.id}" data-set="${i}">−</button>
          <span class="counter-val" id="cv-${ex.id}-${i}">${s.reps}</span>
          <button class="btn-counter" data-action="inc" data-ex="${ex.id}" data-set="${i}">+</button>
        </div>
        <button class="btn-done-set ${s.done?'checked':''}" data-action="done" data-ex="${ex.id}" data-set="${i}">
          ${s.done?'✓':''}
        </button>
      </div>`;
  }).join('');
  return `<div class="set-tracker"><div class="set-tracker-title">Sets</div>${rows}</div>`;
}

function renderWeightedTracker(ex, sets) {
  const rows = sets.map((s,i) => `
    <div class="set-row ${s.done?'done':''}" data-setrow="${i}">
      <span class="set-label">Set ${i+1}</span>
      <div class="weight-row">
        <button class="btn-weight" data-action="wdec" data-ex="${ex.id}" data-set="${i}">−</button>
        <span class="weight-val" id="wv-${ex.id}-${i}">${s.weightKg} kg</span>
        <button class="btn-weight" data-action="winc" data-ex="${ex.id}" data-set="${i}">+</button>
      </div>
      <div class="counter" style="margin-left:6px">
        <button class="btn-counter minus" data-action="dec" data-ex="${ex.id}" data-set="${i}">−</button>
        <span class="counter-val" id="cv-${ex.id}-${i}">${s.reps}</span>
        <button class="btn-counter" data-action="inc" data-ex="${ex.id}" data-set="${i}">+</button>
      </div>
      <button class="btn-done-set ${s.done?'checked':''}" data-action="done" data-ex="${ex.id}" data-set="${i}">
        ${s.done?'✓':''}
      </button>
    </div>`).join('');
  return `<div class="set-tracker"><div class="set-tracker-title">Sets</div>${rows}</div>`;
}

function renderBilateralRepsTracker(ex, sets) {
  const rows = sets.map((s,i) => `
    <div class="set-row ${s.done?'done':''}" data-setrow="${i}">
      <span class="set-label">Set ${i+1}</span>
      <div style="display:flex;gap:8px;margin-left:auto;align-items:center">
        <span class="set-side-badge side-l">L</span>
        <div class="counter">
          <button class="btn-counter minus" data-action="ldec" data-ex="${ex.id}" data-set="${i}">−</button>
          <span class="counter-val" id="lv-${ex.id}-${i}">${s.left}</span>
          <button class="btn-counter" data-action="linc" data-ex="${ex.id}" data-set="${i}">+</button>
        </div>
        <span class="set-side-badge side-r">R</span>
        <div class="counter">
          <button class="btn-counter minus" data-action="rdec" data-ex="${ex.id}" data-set="${i}">−</button>
          <span class="counter-val" id="rv-${ex.id}-${i}">${s.right}</span>
          <button class="btn-counter" data-action="rinc" data-ex="${ex.id}" data-set="${i}">+</button>
        </div>
      </div>
      <button class="btn-done-set ${s.done?'checked':''}" data-action="done" data-ex="${ex.id}" data-set="${i}">
        ${s.done?'✓':''}
      </button>
    </div>`).join('');
  return `<div class="set-tracker"><div class="set-tracker-title">Sets</div>${rows}</div>`;
}

function renderTimedTracker(ex, sets) {
  const rows = sets.map((s,i) => {
    const label  = ex.setLabels?.[i] || `Set ${i+1}`;
    const key    = ex.id + '_' + i;
    const remaining = ex.durationSec - (WS.timerElapsed[key]||0);
    const running   = WS.timerRunning[key];
    return `
      <div class="set-row ${s.done?'done':''}" data-setrow="${i}">
        <span class="set-label">${label}</span>
        <div class="timer-circle-wrap">
          <span class="timer-val" id="tv-${ex.id}-${i}">${fmt2(Math.max(0,Math.floor(remaining/60)))}:${fmt2(Math.max(0,remaining%60))}</span>
          <button class="btn-timer ${running?'running':''}" data-action="${running?'pause':'start'}timer"
            data-ex="${ex.id}" data-set="${i}" data-dur="${ex.durationSec}">
            ${running?'⏸ Pause':'▶ Start'}
          </button>
        </div>
        <button class="btn-done-set ${s.done?'checked':''}" data-action="done" data-ex="${ex.id}" data-set="${i}">
          ${s.done?'✓':''}
        </button>
      </div>`;
  }).join('');
  return `<div class="set-tracker"><div class="set-tracker-title">Sets</div>${rows}</div>`;
}

function renderBilateralTimedTracker(ex, sets) {
  const rows = sets.map((s,i) => {
    const keyL = ex.id + '_' + i + '_L';
    const keyR = ex.id + '_' + i + '_R';
    const remL = ex.durationSec - (WS.timerElapsed[keyL]||0);
    const remR = ex.durationSec - (WS.timerElapsed[keyR]||0);
    const runL = WS.timerRunning[keyL];
    const runR = WS.timerRunning[keyR];
    const fmtT = r => `${fmt2(Math.max(0,Math.floor(r/60)))}:${fmt2(Math.max(0,r%60))}`;
    return `
      <div class="set-row ${s.done?'done':''}" data-setrow="${i}">
        <span class="set-label">Set ${i+1}</span>
        <div style="display:flex;flex-direction:column;gap:6px;margin-left:auto">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="set-side-badge side-l">L</span>
            <span class="timer-val" id="tv-${ex.id}-${i}-L" style="font-size:16px">${fmtT(remL)}</span>
            <button class="btn-timer ${runL?'running':''}" data-action="${runL?'pause':'start'}timerL"
              data-ex="${ex.id}" data-set="${i}" data-dur="${ex.durationSec}" style="font-size:12px;padding:5px 10px">
              ${runL?'⏸':'▶'}
            </button>
            <span class="btn-done-set ${s.leftDone?'checked':''}" id="lcheck-${ex.id}-${i}" style="font-size:14px;cursor:pointer" data-action="ldone" data-ex="${ex.id}" data-set="${i}">
              ${s.leftDone?'✓':'○'}
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="set-side-badge side-r">R</span>
            <span class="timer-val" id="tv-${ex.id}-${i}-R" style="font-size:16px">${fmtT(remR)}</span>
            <button class="btn-timer ${runR?'running':''}" data-action="${runR?'pause':'start'}timerR"
              data-ex="${ex.id}" data-set="${i}" data-dur="${ex.durationSec}" style="font-size:12px;padding:5px 10px">
              ${runR?'⏸':'▶'}
            </button>
            <span class="btn-done-set ${s.rightDone?'checked':''}" id="rcheck-${ex.id}-${i}" style="font-size:14px;cursor:pointer" data-action="rdone" data-ex="${ex.id}" data-set="${i}">
              ${s.rightDone?'✓':'○'}
            </span>
          </div>
        </div>
        <button class="btn-done-set ${s.done?'checked':''}" data-action="done" data-ex="${ex.id}" data-set="${i}">
          ${s.done?'✓':''}
        </button>
      </div>`;
  }).join('');
  return `<div class="set-tracker"><div class="set-tracker-title">Sets</div>${rows}</div>`;
}

function renderBreathingTracker(ex, sets) {
  const s = sets[0];
  const target = ex.repsPerSet || 8;
  return `
    <div class="breathing-display">
      <div class="breath-circle" id="breath-circle">
        <div class="breath-phase" id="breath-phase">Inhale</div>
        <div class="breath-count" id="breath-count">4</div>
      </div>
      <div class="breath-rep-count" id="breath-reps">${s.breaths} / ${target} breaths</div>
      <div style="margin-top:16px;display:flex;gap:10px;justify-content:center">
        <button class="btn-timer" id="breath-start-btn">▶ Start Breathing</button>
        ${s.done?'<span style="color:var(--secondary);font-weight:700">✓ Done</span>':''}
      </div>
    </div>`;
}

function renderSimpleTracker(ex, sets) {
  return `
    <div class="set-tracker">
      <button class="btn-done-set ${sets[0]?.done?'checked':''}" data-action="done" data-ex="${ex.id}" data-set="0" style="width:100%;border-radius:8px;height:44px">
        ${sets[0]?.done ? '✓ Done' : 'Mark Complete'}
      </button>
    </div>`;
}

function attachWorkoutEvents(ex, isLast) {
  const view = document.getElementById('view-workout');

  /* Close / quit */
  document.getElementById('ws-back-btn')?.addEventListener('click', quitWorkout);
  document.getElementById('ws-quit')?.addEventListener('click', quitWorkout);

  /* Navigation */
  document.getElementById('ws-prev')?.addEventListener('click', () => {
    saveNote(ex.id);
    clearAllTimers();
    stopBreathing();
    WS.currentIndex--;
    renderWorkoutView();
  });

  document.getElementById('ws-next')?.addEventListener('click', () => {
    saveNote(ex.id);
    clearAllTimers();
    stopBreathing();
    WS.currentIndex++;
    renderWorkoutView();
    triggerRestIfNeeded(ex);
  });

  document.getElementById('ws-finish')?.addEventListener('click', () => {
    saveNote(ex.id);
    clearAllTimers();
    stopBreathing();
    finishWorkout();
  });

  /* Breathing start */
  document.getElementById('breath-start-btn')?.addEventListener('click', () => {
    startBreathing(ex);
  });

  /* Event delegation for set interactions (use onclick to avoid duplicates) */
  view.onclick = (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, ex: exId, set } = btn.dataset;
    const si = parseInt(set, 10);
    if (!exId || isNaN(si)) return;
    const sets = WS.sets[exId];
    if (!sets) return;
    const s = sets[si];

    switch (action) {
      case 'inc':  s.reps = (s.reps||0) + 1;  updateCounterVal(exId, si, s.reps, 'cv'); break;
      case 'dec':  s.reps = Math.max(0,(s.reps||0)-1); updateCounterVal(exId, si, s.reps, 'cv'); break;
      case 'linc': s.left = (s.left||0)+1;  updateCounterVal(exId, si, s.left, 'lv'); break;
      case 'ldec': s.left = Math.max(0,(s.left||0)-1); updateCounterVal(exId, si, s.left, 'lv'); break;
      case 'rinc': s.right = (s.right||0)+1; updateCounterVal(exId, si, s.right, 'rv'); break;
      case 'rdec': s.right = Math.max(0,(s.right||0)-1); updateCounterVal(exId, si, s.right, 'rv'); break;
      case 'winc': s.weightKg = +(( (s.weightKg||0)+0.5).toFixed(1)); updateWeightVal(exId, si, s.weightKg); break;
      case 'wdec': s.weightKg = Math.max(0, +((s.weightKg||0)-0.5).toFixed(1)); updateWeightVal(exId, si, s.weightKg); break;
      case 'done': toggleSetDone(exId, si, btn, sets); break;
      case 'ldone': s.leftDone=!s.leftDone; e.target.textContent=s.leftDone?'✓':'○'; e.target.classList.toggle('checked',s.leftDone); checkBilateralDone(exId,si,s); break;
      case 'rdone': s.rightDone=!s.rightDone; e.target.textContent=s.rightDone?'✓':'○'; e.target.classList.toggle('checked',s.rightDone); checkBilateralDone(exId,si,s); break;
      case 'starttimer':  startTimer(exId, si, parseInt(btn.dataset.dur)); break;
      case 'pausetimer':  pauseTimer(exId, si); break;
      case 'starttimerL': startTimer(exId, si+'_L', parseInt(btn.dataset.dur)); break;
      case 'pausetimerL': pauseTimer(exId, si+'_L'); break;
      case 'starttimerR': startTimer(exId, si+'_R', parseInt(btn.dataset.dur)); break;
      case 'pausetimerR': pauseTimer(exId, si+'_R'); break;
    }
  };
}

function updateCounterVal(exId, si, val, prefix) {
  const el = document.getElementById(`${prefix}-${exId}-${si}`);
  if (el) el.textContent = val;
}
function updateWeightVal(exId, si, val) {
  const el = document.getElementById(`wv-${exId}-${si}`);
  if (el) el.textContent = val + ' kg';
}
function toggleSetDone(exId, si, btn, sets) {
  sets[si].done = !sets[si].done;
  btn.classList.toggle('checked', sets[si].done);
  btn.textContent = sets[si].done ? '✓' : '';
  const row = btn.closest('.set-row');
  if (row) row.classList.toggle('done', sets[si].done);
}
function checkBilateralDone(exId, si, s) {
  if (s.leftDone && s.rightDone) {
    s.done = true;
    const row = document.querySelector(`[data-setrow="${si}"]`);
    if (row) row.classList.add('done');
  }
}

/* Timed sets */
function startTimer(exId, key, totalSec) {
  const fullKey = exId + '_' + key;
  if (WS.timerRunning[fullKey]) return;
  WS.timerRunning[fullKey] = true;
  /* update button */
  const btnSrc = document.querySelector(`[data-action$="timer"][data-ex="${exId}"][data-set="${key.toString().split('_')[0]}"]`);
  if (btnSrc) { btnSrc.dataset.action = btnSrc.dataset.action.replace('start','pause'); btnSrc.textContent = '⏸ Pause'; btnSrc.classList.add('running'); }

  WS.timerHandles[fullKey] = setInterval(() => {
    WS.timerElapsed[fullKey] = (WS.timerElapsed[fullKey]||0) + 1;
    const rem = Math.max(0, totalSec - WS.timerElapsed[fullKey]);
    /* find timer display */
    const tvId = fullKey.replace(exId+'_','').includes('L') || fullKey.includes('R')
      ? `tv-${exId}-${key.toString().replace('_','').replace('L','').replace('R','')}-${key.toString().split('_')[1]||''}`
      : `tv-${exId}-${key}`;
    const tv = document.getElementById(tvId) || document.getElementById(`tv-${exId}-${key}`);
    if (tv) tv.textContent = `${fmt2(Math.floor(rem/60))}:${fmt2(rem%60)}`;
    if (rem === 0) { pauseTimer(exId, key); autoMarkTimedDone(exId, key); }
  }, 1000);
}

function pauseTimer(exId, key) {
  const fullKey = exId + '_' + key;
  clearInterval(WS.timerHandles[fullKey]);
  WS.timerRunning[fullKey] = false;
}

function autoMarkTimedDone(exId, key) {
  const si = parseInt(String(key).split('_')[0], 10);
  if (!isNaN(si) && WS.sets[exId]?.[si]) WS.sets[exId][si].done = true;
  const row = document.querySelector(`[data-setrow="${si}"]`);
  if (row) row.classList.add('done');
}

function clearAllTimers() {
  Object.keys(WS.timerHandles).forEach(k => clearInterval(WS.timerHandles[k]));
  WS.timerHandles = {};
}

/* Breathing */
const BREATH_TIMING = { inhale:4, hold:2, exhale:6 };

function startBreathing(ex) {
  stopBreathing();
  const target = ex.repsPerSet || 8;
  BREATH.done   = WS.sets[ex.id][0].breaths || 0;
  BREATH.target = target;
  BREATH.phase  = 'inhale';
  BREATH.sec    = BREATH_TIMING.inhale;
  updateBreathUI();

  BREATH.handle = setInterval(() => {
    BREATH.sec--;
    if (BREATH.sec <= 0) {
      if (BREATH.phase === 'inhale') { BREATH.phase = 'hold'; BREATH.sec = BREATH_TIMING.hold; }
      else if (BREATH.phase === 'hold') { BREATH.phase = 'exhale'; BREATH.sec = BREATH_TIMING.exhale; }
      else { /* exhale done — one breath complete */
        BREATH.done++;
        WS.sets[ex.id][0].breaths = BREATH.done;
        if (BREATH.done >= BREATH.target) { stopBreathing(); markBreathingDone(ex); return; }
        const repEl = document.getElementById('breath-reps');
        if (repEl) repEl.textContent = `${BREATH.done} / ${BREATH.target} breaths`;
        BREATH.phase = 'inhale'; BREATH.sec = BREATH_TIMING.inhale;
      }
    }
    updateBreathUI();
  }, 1000);
}

function updateBreathUI() {
  const circle   = document.getElementById('breath-circle');
  const phaseEl  = document.getElementById('breath-phase');
  const countEl  = document.getElementById('breath-count');
  if (!circle) return;
  circle.className = `breath-circle ${BREATH.phase}`;
  phaseEl.textContent = capitalize(BREATH.phase);
  countEl.textContent = BREATH.sec;
}

function stopBreathing() {
  clearInterval(BREATH.handle);
  BREATH.handle = null;
}

function markBreathingDone(ex) {
  WS.sets[ex.id][0].done = true;
  const btn = document.getElementById('breath-start-btn');
  if (btn) btn.insertAdjacentHTML('afterend','<span style="color:var(--secondary);font-weight:700;margin-left:8px">✓ Done</span>');
  const repEl = document.getElementById('breath-reps');
  if (repEl) repEl.textContent = `${BREATH.done} / ${BREATH.target} breaths ✓`;
  showToast('Breathing complete! 🌬️');
}

/* Rest timer */
function triggerRestIfNeeded(ex) {
  const restSec = ex.category === 'warmup' ? 0 : ex.category === 'cooldown' ? 0 : 45;
  if (restSec <= 0) return;
  showRestBar(restSec);
}

function showRestBar(sec) {
  clearTimeout(WS.restHandle);
  WS.restLeft  = sec;
  WS.restTotal = sec;
  const wrap = document.getElementById('rest-bar-wrap');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="rest-bar">
      <span class="rest-label">Rest</span>
      <span class="rest-countdown" id="rest-cd">${sec}s</span>
      <div class="rest-track"><div class="rest-fill" id="rest-fill" style="width:100%"></div></div>
      <button class="btn-skip-rest" id="btn-skip-rest">Skip</button>
    </div>`;
  document.getElementById('btn-skip-rest')?.addEventListener('click', clearRestTimer);
  tickRestTimer();
}

function tickRestTimer() {
  if (WS.restLeft <= 0) { clearRestTimer(); return; }
  WS.restHandle = setTimeout(() => {
    WS.restLeft--;
    const cd   = document.getElementById('rest-cd');
    const fill = document.getElementById('rest-fill');
    if (cd)   cd.textContent = WS.restLeft + 's';
    if (fill) fill.style.width = Math.round(WS.restLeft / WS.restTotal * 100) + '%';
    if (WS.restLeft <= 0) clearRestTimer();
    else tickRestTimer();
  }, 1000);
}
function clearRestTimer() {
  clearTimeout(WS.restHandle);
  const wrap = document.getElementById('rest-bar-wrap');
  if (wrap) wrap.innerHTML = '';
}

/* Save notes */
function saveNote(exId) {
  const el = document.getElementById('notes-' + exId);
  if (el) WS.notes[exId] = el.value;
}

/* Finish workout */
function finishWorkout() {
  clearInterval(WS._clockHandle);
  clearAllTimers();
  clearRestTimer();
  stopBreathing();

  const duration = Date.now() - WS.startTime;
  const exercises = WS.exercises.map(ex => ({
    id:   ex.id,
    sets: WS.sets[ex.id] || [],
    note: WS.notes[ex.id] || '',
  }));
  const completedAll = WS.exercises.every(ex =>
    WS.sets[ex.id]?.some(s => s.done));

  const log = {
    date:        isoDate(new Date()),
    type:        WS.sessionType,
    strengthDay: WS.strengthDay,
    phase:       WS.phase,
    durationMs:  duration,
    exercises,
    completedAll,
  };
  saveLog(log);
  WS.active = false;

  renderSummaryScreen(duration, WS.exercises.length, completedAll);
}

function renderSummaryScreen(duration, numExercises, completedAll) {
  const view = document.getElementById('view-workout');
  view.innerHTML = `
    <div class="summary-screen">
      <div class="summary-icon">${completedAll ? '🎉' : '💪'}</div>
      <div class="summary-title">${completedAll ? 'Session Complete!' : 'Good Effort!'}</div>
      <div class="summary-sub">${completedAll ? 'You crushed it today!' : 'Partial session saved.'}</div>
      <div class="summary-stats">
        <div class="stat-card"><div class="stat-num">${fmtDuration(duration)}</div><div class="stat-label">Duration</div></div>
        <div class="stat-card"><div class="stat-num">${numExercises}</div><div class="stat-label">Exercises</div></div>
        <div class="stat-card"><div class="stat-num">${getTotalSessions()}</div><div class="stat-label">Total Sessions</div></div>
        <div class="stat-card"><div class="stat-num">${getStreak()}</div><div class="stat-label">Current Streak</div></div>
      </div>
      <button class="btn-primary" id="btn-back-today">← Back to Today</button>
    </div>`;
  document.getElementById('btn-back-today')?.addEventListener('click', () => {
    Router.navigate('today');
    document.querySelectorAll('.nav-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.view === 'today'));
  });
}

function quitWorkout() {
  if (!WS.active) { Router.navigate('today'); return; }
  if (!confirm('Quit workout? Progress will be lost.')) return;
  clearInterval(WS._clockHandle);
  clearAllTimers();
  clearRestTimer();
  stopBreathing();
  WS.active = false;
  Router.navigate('today');
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === 'today'));
}

/* ──────────────────────────────────────────────────────────────
   10. LIBRARY VIEW
─────────────────────────────────────────────────────────────── */
function renderLibraryView() {
  if (!App.dataReady) return;

  const allExercises = [
    ...App.kineto.exercises,
    ...App.strength.exercises,
    ...(App.cardio.breathingExercises||[]),
  ];

  renderLibList(allExercises, '');

  /* Filters */
  const filterBar = document.getElementById('lib-filters');
  const filters = [
    { label:'All', val:'' },
    { label:'Kinetotherapy', val:'kineto' },
    { label:'Strength', val:'strength' },
    { label:'Warmup', val:'cat:warmup' },
    { label:'Main', val:'cat:main' },
    { label:'Cooldown', val:'cat:cooldown' },
  ];
  filterBar.innerHTML = filters.map(f =>
    `<button class="filter-chip ${f.val===''?'active':''}" data-filter="${f.val}">${f.label}</button>`
  ).join('');

  let activeFilter = '';
  let searchQuery  = '';

  function applyFilter() {
    let list = allExercises;
    if (activeFilter === 'kineto')   list = App.kineto.exercises;
    if (activeFilter === 'strength') list = App.strength.exercises;
    if (activeFilter.startsWith('cat:')) {
      const cat = activeFilter.slice(4);
      list = allExercises.filter(e => e.category === cat);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) || (e.instructions||'').toLowerCase().includes(q));
    }
    renderLibList(list, searchQuery);
  }

  filterBar.onclick = (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    activeFilter = chip.dataset.filter;
    document.querySelectorAll('.filter-chip').forEach(c =>
      c.classList.toggle('active', c.dataset.filter === activeFilter));
    applyFilter();
  };

  const srch = document.getElementById('lib-search');
  if (srch) srch.oninput = (e) => { searchQuery = e.target.value.trim(); applyFilter(); };
}

function renderLibList(list, query) {
  const cont = document.getElementById('lib-list');
  if (!list.length) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No exercises found</p></div>`;
    return;
  }
  cont.innerHTML = list.map(ex => {
    const bg    = getCategoryBg(ex.category);
    const color = getCategoryColor(ex.category);
    const icon  = { warmup:'🔥', main:'⚡', cooldown:'🌊' }[ex.category] || '💪';
    return `
      <div class="lib-item" data-id="${ex.id}">
        <div class="lib-item-header">
          <div class="lib-item-icon" style="background:${bg};">${icon}</div>
          <div class="lib-item-text">
            <div class="lib-item-name">${highlight(ex.name, query)}</div>
            <div class="lib-item-sub">${ex.id}  ·  ${trackingLabel(ex)}</div>
          </div>
          <span class="lib-item-expand">▾</span>
        </div>
        <div class="lib-item-body">
          <img class="lib-gif" src="${ex.gifUrl||'assets/placeholder.svg'}" alt="${ex.name}"
               loading="lazy" onerror="this.src='assets/placeholder.svg'">
          <p class="lib-instructions">${ex.instructions||''}</p>
          ${(ex.cues||[]).length ? `
            <div class="lib-cues">${ex.cues.map(c=>`<div class="lib-cue">${c}</div>`).join('')}</div>` : ''}
          ${ex.warning ? `<div class="lib-warning">⚠️ ${ex.warning}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  cont.onclick = (e) => {
    const item = e.target.closest('.lib-item');
    if (!item) return;
    item.classList.toggle('open');
  };
}

function highlight(text, query) {
  if (!query) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return text.replace(re, `<mark style="background:var(--primary-lt);border-radius:2px">$1</mark>`);
}

/* ──────────────────────────────────────────────────────────────
   11. PROGRESS VIEW
─────────────────────────────────────────────────────────────── */
let activeProgressTab = 'heatmap';

function renderProgressView() {
  if (!App.dataReady) return;
  renderProgressTab(activeProgressTab);

  const pTabs = document.getElementById('progress-tabs');
  if (pTabs) pTabs.onclick = (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    activeProgressTab = btn.dataset.tab;
    document.querySelectorAll('#progress-tabs .tab-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === activeProgressTab));
    renderProgressTab(activeProgressTab);
  };
}

function renderProgressTab(tab) {
  const cont = document.getElementById('progress-content');
  if (tab === 'heatmap')    renderHeatmap(cont);
  if (tab === 'charts')     renderCharts(cont);
  if (tab === 'milestones') renderMilestones(cont);
  if (tab === 'bolt')       renderBoltView(cont);
}

/* Heatmap */
function renderHeatmap(cont) {
  const logs    = getLogs();
  const start   = parseISO(App.schedule.startDate);
  const end     = parseISO(App.schedule.endDate);
  const today   = new Date();
  const streak  = getStreak();
  const total   = getTotalSessions();
  const weekNow = getWeekNumber(today);

  const doneSet = {};
  logs.forEach(l => { doneSet[l.date] = l.type; });

  /* Build by month */
  const months = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    months.push({ year: cur.getFullYear(), month: cur.getMonth() });
    cur = new Date(cur.getFullYear(), cur.getMonth()+1, 1);
  }

  const DAY_NAMES = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  const heatHTML = months.map(({year, month}) => {
    const label = new Date(year, month, 1).toLocaleString('default', {month:'long', year:'numeric'});
    const firstDay = new Date(year, month, 1).getDay(); /* 0=Sun */
    const offset   = (firstDay + 6) % 7; /* Mon-based offset */
    const daysInMonth = new Date(year, month+1, 0).getDate();

    const cells = [];
    for (let e = 0; e < offset; e++) cells.push(`<div class="heatmap-cell empty"></div>`);
    for (let d = 1; d <= daysInMonth; d++) {
      const date  = new Date(year, month, d);
      const ds    = isoDate(date);
      const type  = doneSet[ds];
      const isToday = ds === isoDate(today);
      const isFuture = date > today;
      let cls = 'heatmap-cell';
      if (type === 'kinetotherapy') cls += ' done-kine';
      else if (type === 'strength') cls += ' done-str';
      else if (type === 'both')     cls += ' done-both';
      if (isToday)  cls += ' today';
      if (isFuture) cls += ' future';
      cells.push(`<div class="${cls}" title="${ds}${type?' — '+type:''}"></div>`);
    }

    return `
      <div class="heatmap-month">
        <div class="heatmap-month-title">${label}</div>
        <div class="heatmap-grid">
          ${DAY_NAMES.map(dn=>`<div class="heatmap-day-label">${dn}</div>`).join('')}
          ${cells.join('')}
        </div>
      </div>`;
  }).join('');

  cont.innerHTML = `
    <div class="stats-row">
      <div class="stats-card"><div class="stats-num">${total}</div><div class="stats-label">Sessions</div></div>
      <div class="stats-card"><div class="stats-num">${streak}</div><div class="stats-label">Streak</div></div>
      <div class="stats-card"><div class="stats-num">${weekNow<1?0:Math.min(weekNow,26)}</div><div class="stats-label">Week</div></div>
    </div>
    <div style="display:flex;gap:10px;padding:0 0 16px;font-size:12px;align-items:center">
      <span style="width:12px;height:12px;background:#2563eb;border-radius:2px;display:inline-block"></span> Kinetotherapy
      <span style="width:12px;height:12px;background:#10b981;border-radius:2px;display:inline-block;margin-left:8px"></span> Strength
    </div>
    <div class="heatmap-months">${heatHTML}</div>`;
}

/* Charts */
function renderCharts(cont) {
  const logs = getLogs();
  if (!logs.length) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📊</div><p>Complete workouts to see charts.</p></div>`;
    return;
  }

  /* Per-exercise weighted history */
  const weightedExIds = Object.values(App.exercises)
    .filter(e => e.trackingType === 'reps_weighted')
    .map(e => e.id);

  /* Build dataset: exId → [{date, avgWeight}] */
  const datasets = {};
  weightedExIds.forEach(id => { datasets[id] = []; });

  logs.forEach(log => {
    log.exercises?.forEach(le => {
      if (!datasets[le.id]) return;
      const weights = (le.sets||[]).map(s=>s.weightKg||0).filter(w=>w>0);
      if (!weights.length) return;
      const avg = weights.reduce((a,b)=>a+b,0)/weights.length;
      datasets[le.id].push({ date: log.date, weight: avg });
    });
  });

  const selOpts = weightedExIds.map(id =>
    `<option value="${id}">${App.exercises[id]?.name||id}</option>`
  ).join('');

  cont.innerHTML = `
    <div style="margin-bottom:16px">
      <label class="form-label">Exercise</label>
      <select id="chart-select" class="form-select">${selOpts}</select>
    </div>
    <canvas id="progress-chart" height="180"></canvas>
    <div id="chart-no-data" class="empty-state" style="display:none">
      <div class="empty-state-icon">📉</div>
      <p>No weight data for this exercise yet.</p>
    </div>`;

  function drawChart(exId) {
    const data = datasets[exId]||[];
    const canvas = document.getElementById('progress-chart');
    const noData = document.getElementById('chart-no-data');
    if (!data.length) { canvas.style.display='none'; noData.style.display=''; return; }
    canvas.style.display=''; noData.style.display='none';

    const ctx   = canvas.getContext('2d');
    const W     = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 320;
    const H     = 180;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const vals  = data.map(d=>d.weight);
    const min   = Math.max(0, Math.min(...vals) - 1);
    const max   = Math.max(...vals) + 1;
    const pad   = { top:20, right:20, bottom:30, left:40 };
    const iW    = W - pad.left - pad.right;
    const iH    = H - pad.top  - pad.bottom;

    const theme = document.documentElement.dataset.theme === 'dark';
    const fg    = theme ? '#f1f5f9' : '#0f172a';
    const grid  = theme ? '#334155' : '#e2e8f0';

    ctx.clearRect(0,0,W,H);

    /* Grid lines */
    ctx.strokeStyle = grid; ctx.lineWidth = 1;
    for (let i=0;i<=4;i++) {
      const y = pad.top + iH * (1 - i/4);
      ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(W-pad.right,y); ctx.stroke();
      ctx.fillStyle = fg; ctx.font = '10px sans-serif'; ctx.textAlign='right';
      ctx.fillText(((min + (max-min)*i/4)).toFixed(1)+'kg', pad.left-4, y+4);
    }

    /* Line */
    const pt = (i) => ({
      x: pad.left + (data.length>1 ? i/(data.length-1) * iW : iW/2),
      y: pad.top  + iH * (1 - (data[i].weight-min)/(max-min)),
    });

    ctx.strokeStyle = '#2563eb'; ctx.lineWidth=2;
    ctx.beginPath();
    data.forEach((d,i) => { const p=pt(i); i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y); });
    ctx.stroke();

    /* Dots */
    ctx.fillStyle='#2563eb';
    data.forEach((_,i)=>{ const p=pt(i); ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fill(); });

    /* X labels */
    ctx.fillStyle=fg; ctx.textAlign='center'; ctx.font='10px sans-serif';
    const step = Math.ceil(data.length/4);
    data.forEach((d,i)=>{ if(i%step===0){ ctx.fillText(d.date.slice(5), pt(i).x, H-8); } });
  }

  const sel = document.getElementById('chart-select');
  /* Defer drawing until layout is done */
  requestAnimationFrame(() => drawChart(sel.value));
  sel.onchange = () => drawChart(sel.value);
}

/* Milestones */
function renderMilestones(cont) {
  const checked = lsGet(LS.MILESTONES, []);

  const byMonth = {};
  MILESTONES.forEach(m => {
    if (!byMonth[m.month]) byMonth[m.month] = [];
    byMonth[m.month].push(m);
  });

  const weeks = Object.entries(byMonth).map(([month, items]) => `
    <div class="milestone-month">
      <div class="milestone-month-title">Month ${month}</div>
      ${items.map(m => `
        <div class="milestone-item ${checked.includes(m.id)?'checked':''}" data-id="${m.id}">
          <div class="milestone-check ${checked.includes(m.id)?'checked':''}">
            ${checked.includes(m.id)?'✓':''}
          </div>
          <div class="milestone-text">${m.text}<br><span class="text-xs text-3">Week ${m.week}</span></div>
        </div>`).join('')}
    </div>`).join('');

  cont.innerHTML = `<div style="padding:0">${weeks}</div>`;

  cont.onclick = (e) => {
    const item = e.target.closest('.milestone-item');
    if (!item) return;
    const id  = item.dataset.id;
    let list  = lsGet(LS.MILESTONES, []);
    if (list.includes(id)) list = list.filter(i=>i!==id);
    else list.push(id);
    lsSet(LS.MILESTONES, list);
    renderMilestones(cont);
  };
}

/* BOLT Score */
function renderBoltView(cont) {
  const scores = lsGet(LS.BOLT, []);

  function boltBadge(s) {
    if (s < 10) return `<span class="bolt-badge" style="background:#fee2e2;color:#991b1b">Poor (< 10s)</span>`;
    if (s < 20) return `<span class="bolt-badge" style="background:#fef3c7;color:#92400e">Fair (10-19s)</span>`;
    if (s < 30) return `<span class="bolt-badge" style="background:#d1fae5;color:#065f46">Good (20-29s)</span>`;
    return `<span class="bolt-badge" style="background:#dbeafe;color:#1d4ed8">Excellent (≥30s)</span>`;
  }

  cont.innerHTML = `
    <div class="bolt-score-input card card-pad">
      <h3>Log BOLT Score</h3>
      <p style="font-size:13px;color:var(--text-2);margin-top:6px;line-height:1.5">
        Breathe normally, then after a normal exhale, pinch your nose and hold until you feel first urge to breathe.
        Note the seconds.
      </p>
      <div class="bolt-number-row">
        <input type="number" id="bolt-input" class="bolt-input" min="0" max="120" placeholder="0" value="">
        <span class="bolt-unit">seconds</span>
        <span id="bolt-badge-live"></span>
      </div>
      <button class="btn-primary" id="btn-save-bolt" style="margin-top:8px">Save Score</button>
    </div>
    <div class="bolt-log" style="margin-top:16px">
      <h3 style="margin-bottom:10px">History</h3>
      ${scores.length === 0
        ? '<p class="text-sm text-3">No scores yet.</p>'
        : scores.slice().reverse().map(s => `
          <div class="bolt-log-item">
            <span>${s.date}</span>
            <span style="font-weight:700">${s.seconds}s</span>
            ${boltBadge(s.seconds)}
          </div>`).join('')}
    </div>`;

  document.getElementById('bolt-input')?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value,10);
    const badge = document.getElementById('bolt-badge-live');
    if (badge) badge.innerHTML = isNaN(val)||val<0 ? '' : boltBadge(val);
  });

  document.getElementById('btn-save-bolt')?.addEventListener('click', () => {
    const val = parseInt(document.getElementById('bolt-input')?.value,10);
    if (isNaN(val) || val < 0 || val > 120) { showToast('Enter a valid time (0-120s)'); return; }
    const arr = lsGet(LS.BOLT, []);
    arr.push({ date: isoDate(new Date()), seconds: val });
    lsSet(LS.BOLT, arr);
    showToast('BOLT score saved! ' + val + 's');
    renderBoltView(cont);
  });
}

/* ──────────────────────────────────────────────────────────────
   12. EDIT VIEW
─────────────────────────────────────────────────────────────── */
let activeEditTab = 'exercises';

function renderEditView() {
  if (!App.dataReady) return;
  renderEditTab(activeEditTab);

  const eTabs = document.getElementById('edit-tabs');
  if (eTabs) eTabs.onclick = (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    activeEditTab = btn.dataset.tab;
    document.querySelectorAll('#edit-tabs .tab-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === activeEditTab));
    renderEditTab(activeEditTab);
  };
}

function renderEditTab(tab) {
  const cont = document.getElementById('edit-content');
  if (tab === 'exercises') renderEditExercises(cont);
  if (tab === 'sessions')  renderEditSessions(cont);
  if (tab === 'backup')    renderEditBackup(cont);
}

function renderEditExercises(cont) {
  const allExercises = [
    ...App.kineto.exercises,
    ...App.strength.exercises,
  ];

  cont.innerHTML = `
    <div class="edit-section-title">All Exercises (${allExercises.length})</div>
    ${allExercises.map(ex => `
      <div class="edit-exercise-item">
        <span class="edit-exercise-id text-3">${ex.id}</span>
        <span class="edit-exercise-name">${ex.name}</span>
        <button class="btn-edit-ex" data-action="edit-ex" data-id="${ex.id}">Edit</button>
      </div>`).join('')}
    <button class="btn-add" id="btn-add-exercise">+ Add Exercise</button>`;

  cont.onclick = (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'edit-ex') openEditExerciseModal(btn.dataset.id);
    if (btn.id === 'btn-add-exercise')    openAddExerciseModal();
  };
}

function renderEditSessions(cont) {
  const phases = [1,2,3];
  const phaseNames = {1:'Foundation',2:'Progression',3:'Advanced'};

  const html = phases.map(p => `
    <div style="margin-bottom:20px">
      <div class="edit-section-title">Phase ${p} — ${phaseNames[p]}</div>
      <div style="font-size:13px;font-weight:600;color:var(--text-2);margin-bottom:6px">Kinetotherapy</div>
      <div style="font-size:12px;color:var(--text-3);line-height:1.8">
        ${(App.kineto.sessions['phase'+p]||[]).join(' → ')}
      </div>
      <div style="font-size:13px;font-weight:600;color:var(--text-2);margin:10px 0 6px">Strength A</div>
      <div style="font-size:12px;color:var(--text-3);line-height:1.8">
        ${(App.strength.sessions.dayA?.['phase'+p]||[]).join(' → ')}
      </div>
      <div style="font-size:13px;font-weight:600;color:var(--text-2);margin:10px 0 6px">Strength B</div>
      <div style="font-size:12px;color:var(--text-3);line-height:1.8">
        ${(App.strength.sessions.dayB?.['phase'+p]||[]).join(' → ')}
      </div>
      <div style="font-size:13px;font-weight:600;color:var(--text-2);margin:10px 0 6px">Strength C</div>
      <div style="font-size:12px;color:var(--text-3);line-height:1.8">
        ${(App.strength.sessions.dayC?.['phase'+p]||[]).join(' → ')}
      </div>
    </div>`).join('');

  cont.innerHTML = `
    <div style="font-size:13px;color:var(--text-2);margin-bottom:12px;line-height:1.5">
      Session templates define which exercises appear in each phase. Edit the data/kinetotherapy.json and data/strength.json files to customise session order.
    </div>
    ${html}`;
}

function renderEditBackup(cont) {
  cont.innerHTML = `
    <div class="backup-section">
      <h3 style="margin-bottom:8px">Export Data</h3>
      <p>Download all workout logs and settings as a JSON file.</p>
      <button class="btn-secondary" id="btn-export">⬇ Export Backup</button>
    </div>
    <div class="divider"></div>
    <div class="backup-section">
      <h3 style="margin-bottom:8px">Import Data</h3>
      <p>Import a previously exported backup. This will merge with existing data.</p>
      <input type="file" id="import-file" accept=".json" style="display:none">
      <button class="btn-secondary" id="btn-import">⬆ Import Backup</button>
    </div>
    <div class="divider"></div>
    <div class="backup-section">
      <h3 style="margin-bottom:8px;color:var(--danger)">Clear Data</h3>
      <p>Remove all workout logs. This cannot be undone.</p>
      <button class="btn-secondary" id="btn-clear" style="color:var(--danger);border-color:var(--danger)">🗑 Clear Logs</button>
    </div>`;

  document.getElementById('btn-export')?.addEventListener('click', () => {
    const data = {
      exportedAt: new Date().toISOString(),
      logs:       getLogs(),
      bolt:       lsGet(LS.BOLT,[]),
      milestones: lsGet(LS.MILESTONES,[]),
      custom:     lsGet(LS.CUSTOM,[]),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url; a.download = `spinesync-backup-${isoDate(new Date())}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast('Backup exported!');
  });

  document.getElementById('btn-import')?.addEventListener('click', () => {
    document.getElementById('import-file')?.click();
  });

  document.getElementById('import-file')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.logs)       { const existing=getLogs(); const merged=[...existing,...data.logs.filter(l=>!existing.find(e=>e.date===l.date))]; lsSet(LS.LOGS,merged); }
        if (data.bolt)       { const existing=lsGet(LS.BOLT,[]); const merged=[...existing,...data.bolt.filter(b=>!existing.find(e=>e.date===b.date))]; lsSet(LS.BOLT,merged); }
        if (data.milestones) lsSet(LS.MILESTONES, data.milestones);
        showToast('Backup imported!');
        renderEditBackup(cont);
      } catch { showToast('Invalid backup file!'); }
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-clear')?.addEventListener('click', () => {
    if (!confirm('Delete all workout logs? This cannot be undone.')) return;
    lsSet(LS.LOGS, []);
    showToast('Logs cleared.');
  });
}

/* ──────────────────────────────────────────────────────────────
   13. MODALS
─────────────────────────────────────────────────────────────── */
function openModal(html) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  content.innerHTML = html;
  overlay.classList.remove('hidden');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  }, {once:true});
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function openEditExerciseModal(exId) {
  const ex = App.exercises[exId];
  if (!ex) return;
  openModal(`
    <button class="modal-close" onclick="window.closeModal()">×</button>
    <div class="modal-title">Edit Exercise</div>
    <div class="form-group">
      <label class="form-label">ID</label>
      <input class="form-input" value="${ex.id}" readonly disabled>
    </div>
    <div class="form-group">
      <label class="form-label">Name</label>
      <input class="form-input" id="ex-name" value="${ex.name}">
    </div>
    <div class="form-group">
      <label class="form-label">GIF URL (optional)</label>
      <input class="form-input" id="ex-gif" value="${ex.gifUrl||''}" placeholder="https://…">
    </div>
    <div class="form-group">
      <label class="form-label">Instructions</label>
      <textarea class="form-textarea" id="ex-instructions">${ex.instructions||''}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Sets</label>
      <input class="form-input" id="ex-sets" type="number" min="1" value="${ex.sets}">
    </div>
    <div class="form-group">
      <label class="form-label">Reps per Set (or Duration in sec)</label>
      <input class="form-input" id="ex-reps" type="number" min="0"
        value="${ex.repsPerSet ?? ex.durationSec ?? 0}">
    </div>
    <button class="btn-primary" id="btn-save-ex" style="margin-top:4px">Save Changes</button>
  `);

  document.getElementById('btn-save-ex')?.addEventListener('click', () => {
    const updated = {
      ...ex,
      name:         document.getElementById('ex-name').value.trim() || ex.name,
      gifUrl:       document.getElementById('ex-gif').value.trim() || null,
      instructions: document.getElementById('ex-instructions').value.trim() || ex.instructions,
      sets:         parseInt(document.getElementById('ex-sets').value,10) || ex.sets,
    };
    const repVal = parseInt(document.getElementById('ex-reps').value,10);
    if (ex.trackingType === 'timed' || ex.trackingType === 'bilateral_timed') updated.durationSec = repVal;
    else updated.repsPerSet = repVal;

    /* Save to custom overrides */
    const custom = lsGet(LS.CUSTOM, []).filter(e=>e.id!==ex.id);
    custom.push(updated);
    lsSet(LS.CUSTOM, custom);
    App.exercises[ex.id] = updated;
    closeModal();
    showToast('Exercise updated!');
  });
}

function openAddExerciseModal() {
  openModal(`
    <button class="modal-close" onclick="window.closeModal()">×</button>
    <div class="modal-title">Add Exercise</div>
    <div class="form-group">
      <label class="form-label">ID (unique, e.g. MY-01)</label>
      <input class="form-input" id="new-id" placeholder="MY-01">
    </div>
    <div class="form-group">
      <label class="form-label">Name</label>
      <input class="form-input" id="new-name" placeholder="Exercise name">
    </div>
    <div class="form-group">
      <label class="form-label">Category</label>
      <select class="form-select" id="new-cat">
        <option value="warmup">Warmup</option>
        <option value="main" selected>Main</option>
        <option value="cooldown">Cooldown</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Tracking Type</label>
      <select class="form-select" id="new-type">
        <option value="reps">Reps</option>
        <option value="reps_weighted">Reps + Weight</option>
        <option value="bilateral_reps">Bilateral Reps (L/R)</option>
        <option value="timed">Timed</option>
        <option value="bilateral_timed">Bilateral Timed (L/R)</option>
        <option value="breathing">Breathing</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Sets</label>
      <input class="form-input" id="new-sets" type="number" min="1" value="3">
    </div>
    <div class="form-group">
      <label class="form-label">Reps / Duration (sec) per Set</label>
      <input class="form-input" id="new-reps" type="number" min="0" value="10">
    </div>
    <div class="form-group">
      <label class="form-label">Instructions</label>
      <textarea class="form-textarea" id="new-instructions" placeholder="How to perform this exercise…"></textarea>
    </div>
    <button class="btn-primary" id="btn-save-new">Add Exercise</button>
  `);

  document.getElementById('btn-save-new')?.addEventListener('click', () => {
    const id   = document.getElementById('new-id').value.trim();
    const name = document.getElementById('new-name').value.trim();
    if (!id || !name) { showToast('ID and Name are required'); return; }
    if (App.exercises[id]) { showToast(`ID "${id}" already exists`); return; }

    const type = document.getElementById('new-type').value;
    const reps = parseInt(document.getElementById('new-reps').value,10)||10;
    const newEx = {
      id, name,
      category:     document.getElementById('new-cat').value,
      phaseMin:     1,
      trackingType: type,
      sets:         parseInt(document.getElementById('new-sets').value,10)||3,
      repsPerSet:   (type==='timed'||type==='bilateral_timed') ? null : reps,
      durationSec:  (type==='timed'||type==='bilateral_timed') ? reps : null,
      startWeightKg: type==='reps_weighted' ? 5 : null,
      gifUrl:       null,
      instructions: document.getElementById('new-instructions').value.trim(),
      cues:         [],
      warning:      null,
      _custom:      true,
    };
    App.exercises[id] = newEx;
    const custom = lsGet(LS.CUSTOM, []).filter(e=>e.id!==id);
    custom.push(newEx);
    lsSet(LS.CUSTOM, custom);
    closeModal();
    showToast('Exercise added! It appears in the library.');
  });
}

/* ──────────────────────────────────────────────────────────────
   14. THEME
─────────────────────────────────────────────────────────────── */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = document.getElementById('btn-theme');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  lsSet(LS.PREFS, { ...lsGet(LS.PREFS,{}), theme });
}

function initTheme() {
  const prefs  = lsGet(LS.PREFS, {});
  const stored = prefs.theme;
  const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(stored || prefer);
}

/* ──────────────────────────────────────────────────────────────
   15. INIT & EVENT LISTENERS
─────────────────────────────────────────────────────────────── */
async function init() {
  initTheme();

  /* Navigation */
  document.getElementById('bottom-nav')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    if (WS.active) {
      /* if workout is active, switch back to workout view */
      if (btn.dataset.view !== 'today') { showToast('Finish or quit your workout first'); return; }
      /* clicking Today while workout active → show workout */
      document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
      document.getElementById('view-workout').classList.add('active');
      return;
    }
    Router.navigate(btn.dataset.view);
  });

  /* Theme toggle */
  document.getElementById('btn-theme')?.addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme;
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });

  /* Modal close on backdrop */
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });

  /* expose closeModal globally for inline onclick */
  window.closeModal = closeModal;

  /* Load data */
  await loadData();

  /* Render today */
  Router.navigate('today');

  /* Service worker */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
