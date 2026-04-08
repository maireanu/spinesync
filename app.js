/* ════════════════════════════════════════════════════════════════
   SPINESYNC — app.js  v2
   Dual sessions · wger.de images · Cardio player · Swipe nav
   ════════════════════════════════════════════════════════════════ */
'use strict';

/* ──────────────────────────────────────────────────────────────
   1. CONSTANTS & STATE
─────────────────────────────────────────────────────────────── */
const LS = {
  LOGS:       'ss_logs',
  BOLT:       'ss_bolt',
  MILESTONES: 'ss_milestones',
  CUSTOM:     'ss_custom',
  PREFS:      'ss_prefs',
  IMG_CACHE:  'ss_imgs_v2',
};

const App = {
  schedule:  null,
  kineto:    null,
  strength:  null,
  cardio:    null,
  dataReady: false,
  exercises: {},
  imgCache:  {},
};

const CARDIO_PHASE_PROTOCOL = { 1: 'zone2', 2: 'intervals_2x4', 3: 'intervals_3x4' };

const WS = {
  active: false, mode: 'exercises',
  exercises: [], currentIndex: 0,
  sets: {}, notes: {},
  startTime: null, sessionType: null,
  strengthDay: null, phase: null,
  restHandle: null, restLeft: 0, restTotal: 0,
  timerHandles: {}, timerElapsed: {}, timerRunning: {},
  _clockHandle: null,
  cardioProtocol: null, cardioBlockIndex: 0,
  cardioBlockSec: 0, cardioHandle: null, cardioPaused: false,
};

const BREATH = { handle: null, phase: 'inhale', sec: 0, done: 0, target: 8 };

const MILESTONES = [
  { id: 'm01', month: 1, week: 2,  text: 'Complete 5 consecutive kinetotherapy sessions' },
  { id: 'm02', month: 1, week: 4,  text: 'Feel comfortable with all Phase 1 exercises' },
  { id: 'm03', month: 1, week: 4,  text: 'Hold Bird-Dog for 5 seconds without wobbling' },
  { id: 'm04', month: 1, week: 8,  text: 'Complete all Phase 1 sessions for 4 weeks straight' },
  { id: 'm05', month: 2, week: 9,  text: 'Start Phase 2 — add K-11 through K-16' },
  { id: 'm06', month: 2, week: 12, text: 'Hold modified side plank 30 sec each side' },
  { id: 'm07', month: 2, week: 12, text: 'Achieve BOLT score >= 20 seconds' },
  { id: 'm08', month: 3, week: 17, text: 'Complete 50 total sessions' },
  { id: 'm09', month: 3, week: 17, text: 'Bird-Dog with resistance band, controlled' },
  { id: 'm10', month: 4, week: 18, text: 'Start Phase 3 advanced exercises' },
  { id: 'm11', month: 4, week: 22, text: 'Single-leg balance 30 sec eyes closed' },
  { id: 'm12', month: 5, week: 24, text: 'Achieve BOLT score >= 25 seconds' },
  { id: 'm13', month: 6, week: 26, text: 'Complete full 6-month program' },
  { id: 'm14', month: 6, week: 26, text: 'Visible improvement in postural measurements' },
];

/* ──────────────────────────────────────────────────────────────
   2. UTILITIES
─────────────────────────────────────────────────────────────── */
const fmt2    = n => String(Math.floor(n)).padStart(2, '0');
const fmtMs   = ms => { const s=Math.floor(ms/1000); return fmt2(Math.floor(s/60))+':'+fmt2(s%60); };
const fmtMin  = ms => { const m=Math.round(ms/60000); return m<1?'<1 min':m+' min'; };
const isoDate = d => d.getFullYear()+'-'+fmt2(d.getMonth()+1)+'-'+fmt2(d.getDate());
const fmtSec  = s => fmt2(Math.floor(s/60))+':'+fmt2(s%60);
function parseISO(s) { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
const fmtDate  = d => d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
const capitalize = s => s.charAt(0).toUpperCase()+s.slice(1);

function lsGet(k,def) { try{const v=localStorage.getItem(k);return v?JSON.parse(v):def;}catch{return def;} }
function lsSet(k,v)   { try{localStorage.setItem(k,JSON.stringify(v));}catch{} }

function showToast(msg, dur=2400) {
  const el=document.getElementById('toast');
  el.textContent=msg; el.classList.remove('hidden');
  clearTimeout(el._t); el._t=setTimeout(()=>el.classList.add('hidden'),dur);
}

/* ──────────────────────────────────────────────────────────────
   3. SCHEDULE ENGINE
─────────────────────────────────────────────────────────────── */
function getWeekNumber(date) {
  const start=parseISO(App.schedule.startDate);
  return Math.floor((date-start)/(7*86400000))+1;
}

function getCurrentPhase(weekNum) {
  const {phases,transitions}=App.schedule;
  const tr=transitions.find(t=>t.week===weekNum);
  if(tr) return tr.from;
  const ph=phases.find(p=>weekNum>=p.weekStart&&weekNum<=p.weekEnd);
  return ph?ph.id:(weekNum>26?3:1);
}

function getSessionTypes(date, weekNum) {
  if(weekNum<1||weekNum>26) return ['rest'];
  const raw=App.schedule.weeklyPattern[String(date.getDay())];
  if(!raw) return ['rest'];
  return Array.isArray(raw)?raw:[raw];
}

function getStrengthDay(date, weekNum) {
  const pattern=(weekNum-1)%3;
  const order=App.schedule.strengthDayOrder;
  const idx=order.indexOf(date.getDay());
  if(idx===-1) return 'A';
  return App.schedule.strengthPatterns[pattern][idx];
}

function getProgramStatus() {
  const today=new Date();
  const weekNum=getWeekNumber(today);
  if(weekNum<1) return {before:true};
  if(weekNum>26) return {after:true};
  const phase=getCurrentPhase(weekNum);
  const sessionTypes=getSessionTypes(today,weekNum);
  const strengthDay=sessionTypes.includes('strength')?getStrengthDay(today,weekNum):null;
  const trans=App.schedule.transitions.find(t=>t.week===weekNum);
  return {
    today, weekNum, phase, sessionTypes, strengthDay, trans,
    phaseName: App.schedule.phases.find(p=>p.id===phase)?.name||'',
  };
}

/* ──────────────────────────────────────────────────────────────
   4. EXERCISE HELPERS
─────────────────────────────────────────────────────────────── */
function buildExerciseIndex() {
  App.exercises={};
  const add=list=>list.forEach(ex=>{App.exercises[ex.id]=ex;});
  add(App.kineto.exercises);
  add(App.strength.exercises);
  (App.cardio.breathingExercises||[]).forEach(ex=>{App.exercises[ex.id]=ex;});
  lsGet(LS.CUSTOM,[]).forEach(ex=>{App.exercises[ex.id]=ex;});
}

function getSessionExercises(sessionType, phase, strengthDay) {
  let ids=[];
  if(sessionType==='kinetotherapy') ids=App.kineto.sessions['phase'+phase]||App.kineto.sessions.phase1;
  else if(sessionType==='strength') ids=App.strength.sessions['day'+(strengthDay||'A').toUpperCase()]?.['phase'+phase]||App.strength.sessions.dayA?.phase1||[];
  return ids.map(id=>App.exercises[id]).filter(Boolean);
}

function getCardioProtocol(phase) {
  const id=CARDIO_PHASE_PROTOCOL[phase]||'zone2';
  return App.cardio.intervalProtocols.find(p=>p.id===id)||App.cardio.intervalProtocols[0];
}

function getCategoryColor(cat) {
  return {warmup:'#f59e0b',main:'#2563eb',cooldown:'#10b981'}[cat]||'#64748b';
}
function getCategoryBg(cat) {
  return {warmup:'#fef3c7',main:'#dbeafe',cooldown:'#d1fae5'}[cat]||'#f1f5f9';
}

function trackingLabel(ex) {
  switch(ex.trackingType){
    case 'reps':            return `${ex.sets}x${ex.repsPerSet} reps`;
    case 'reps_weighted':   return `${ex.sets}x${ex.repsPerSet} reps + weight`;
    case 'bilateral_reps':  return `${ex.sets}x${ex.repsPerSet}/side`;
    case 'timed':           return `${ex.sets}x${ex.durationSec}s`;
    case 'bilateral_timed': return `${ex.sets}x${ex.durationSec}s/side`;
    case 'breathing':       return `${ex.repsPerSet} breath cycles`;
    default:                return '';
  }
}

function getExerciseImage(ex) {
  return ex.gifUrl||App.imgCache[ex.id]||'assets/placeholder.svg';
}

/* ──────────────────────────────────────────────────────────────
   5. DATA LOADING
─────────────────────────────────────────────────────────────── */
async function loadData() {
  const files=['data/schedule.json','data/kinetotherapy.json','data/strength.json','data/cardio.json'];
  try {
    const results=await Promise.all(files.map(f=>fetch(f).then(r=>{
      if(!r.ok) throw new Error('HTTP '+r.status+' for '+f);
      return r.json();
    })));
    [App.schedule,App.kineto,App.strength,App.cardio]=results;
    buildExerciseIndex();
    App.dataReady=true;
  } catch(err) {
    console.error('Failed to load data:',err);
    document.getElementById('today-content').innerHTML=`
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <p><strong>Cannot load exercise data.</strong><br>
        Run a local server: <code>python3 -m http.server 8080</code></p>
      </div>`;
    throw err;
  }
}

/* ──────────────────────────────────────────────────────────────
   6. IMAGE CACHE (wger.de background fetch)
─────────────────────────────────────────────────────────────── */
function getGifSearchTerm(ex) {
  if(ex.gifSearch) return ex.gifSearch;
  return ex.name
    .replace(/\s*[—–-]\s*.*/g,'')
    .replace(/\s*\(.*?\)/g,'')
    .replace(/\bwith\b.*/i,'')
    .replace(/[^a-zA-Z\s-]/g,'')
    .trim();
}

async function fetchExerciseImages() {
  const CACHE_TTL=7*24*3600*1000;
  const cached=lsGet(LS.IMG_CACHE,null);
  if(cached&&Date.now()-cached.ts<CACHE_TTL){
    App.imgCache=cached.data||{};
    return;
  }
  const toFetch=Object.values(App.exercises).filter(ex=>!ex.gifUrl&&ex.trackingType!=='breathing');
  const imgMap={};
  for(const ex of toFetch){
    const term=getGifSearchTerm(ex);
    if(!term||term.length<3) continue;
    try {
      const url='https://wger.de/api/v2/exercise/search/?term='+encodeURIComponent(term)+'&language=english&format=json';
      const res=await fetch(url,{signal:AbortSignal.timeout(6000)});
      if(!res.ok) continue;
      const data=await res.json();
      const hit=data.suggestions?.[0]?.data;
      if(hit?.image){
        imgMap[ex.id]=hit.image;
        document.querySelectorAll('[data-exid="'+ex.id+'"]').forEach(img=>{img.src=hit.image;});
      }
    } catch {}
    await new Promise(r=>setTimeout(r,80));
  }
  lsSet(LS.IMG_CACHE,{ts:Date.now(),data:imgMap});
  App.imgCache=imgMap;
}

/* ──────────────────────────────────────────────────────────────
   7. LOG MANAGER
─────────────────────────────────────────────────────────────── */
function getLogs() { return lsGet(LS.LOGS,[]); }

function saveLog(log) {
  const logs=getLogs().filter(l=>!(l.date===log.date&&l.type===log.type));
  logs.push(log);
  lsSet(LS.LOGS,logs);
}

function isSessionDone(dateStr, sessionType) {
  return getLogs().some(l=>l.date===dateStr&&l.type===sessionType&&l.completedAll);
}

function isDayDone(dateStr) {
  if(!App.dataReady) return false;
  const date=parseISO(dateStr);
  const week=getWeekNumber(date);
  const types=getSessionTypes(date,week).filter(s=>s!=='rest');
  if(!types.length) return true;
  return types.every(t=>isSessionDone(dateStr,t));
}

function getStreak() {
  const check=new Date();
  const today=isoDate(check);
  let streak=0;
  for(let i=0;i<400;i++){
    const d=isoDate(check);
    const week=getWeekNumber(check);
    const types=App.dataReady?getSessionTypes(check,week):[];
    const isRest=!types.length||(types.length===1&&types[0]==='rest');
    if(!isRest){
      if(isDayDone(d)) streak++;
      else if(d!==today) break;
    }
    check.setDate(check.getDate()-1);
  }
  return streak;
}

function getTotalSessions() { return getLogs().filter(l=>l.completedAll).length; }

function countWeekSessions(date) {
  const d=new Date(date);
  const mon=new Date(d); mon.setDate(d.getDate()-((d.getDay()+6)%7));
  const sun=new Date(mon); sun.setDate(mon.getDate()+6);
  return getLogs().filter(l=>l.completedAll&&parseISO(l.date)>=mon&&parseISO(l.date)<=sun).length;
}

/* ──────────────────────────────────────────────────────────────
   8. ROUTER
─────────────────────────────────────────────────────────────── */
const Router={
  current:'today',
  navigate(name){
    if(!App.dataReady&&name!=='today') return;
    this.current=name;
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById('view-'+name)?.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
    if(name==='today')    renderTodayView();
    if(name==='library')  renderLibraryView();
    if(name==='progress') renderProgressView();
    if(name==='edit')     renderEditView();
  }
};

/* ──────────────────────────────────────────────────────────────
   9. TODAY VIEW
─────────────────────────────────────────────────────────────── */
function renderTodayView(){
  if(!App.dataReady) return;
  const cont=document.getElementById('today-content');
  const status=getProgramStatus();

  if(status.before){
    const start=parseISO(App.schedule.startDate);
    cont.innerHTML=`
      <div class="today-hero" style="background:linear-gradient(135deg,#475569,#334155)">
        <div class="today-hero-eyebrow">Program starts in</div>
        <div class="today-hero-title">${Math.ceil((start-new Date())/86400000)} days</div>
        <div class="today-hero-sub">${fmtDate(start)}</div>
      </div>`;
    return;
  }
  if(status.after){
    cont.innerHTML=`
      <div class="today-hero" style="background:linear-gradient(135deg,#10b981,#059669)">
        <div class="today-hero-eyebrow">Program Complete!</div>
        <div class="today-hero-title">Amazing work!</div>
        <div class="today-hero-sub">6-month program finished</div>
      </div>`;
    return;
  }

  const {today,weekNum,phase,sessionTypes,strengthDay,phaseName,trans}=status;
  const todayStr=isoDate(today);
  const streak=getStreak(), total=getTotalSessions(), weekDone=countWeekSessions(today);
  const isRestDay=sessionTypes.includes('rest')||!sessionTypes.length;

  const transNote=trans
    ?`<div class="today-trans-note">Transition week — gradually introducing Phase ${trans.to} exercises</div>`:'';

  const headerHTML=`
    <div class="today-date-row">
      <span class="today-date-label">${fmtDate(today)}</span>
      <span class="phase-badge phase-${phase}">Week ${weekNum} · P${phase}</span>
    </div>${transNote}`;

  const statsHTML=`
    <div class="stats-row-today">
      <div class="stat-today"><div class="stat-today-num">${streak}</div><div class="stat-today-label">Streak</div></div>
      <div class="stat-today"><div class="stat-today-num">${total}</div><div class="stat-today-label">Sessions</div></div>
      <div class="stat-today"><div class="stat-today-num">${weekDone}</div><div class="stat-today-label">This week</div></div>
    </div>`;

  if(isRestDay){
    cont.innerHTML=headerHTML+statsHTML+`
      <div class="session-card rest-card">
        <div class="session-card-icon">🌿</div>
        <div class="session-card-body">
          <div class="session-card-title">Rest Day</div>
          <div class="session-card-sub">Active recovery — gentle walk, stretching</div>
        </div>
      </div>`;
    return;
  }

  const sessionCards=sessionTypes.map((sType,idx)=>{
    const done=isSessionDone(todayStr,sType);
    return buildSessionCard(sType,phase,strengthDay,done,idx,sessionTypes.length,phaseName,todayStr);
  }).join('');

  cont.innerHTML=headerHTML+statsHTML+sessionCards;

  cont.querySelectorAll('[data-start-session]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const sType=btn.dataset.startSession;
      if(sType==='cardio') startCardioSession(getCardioProtocol(phase),phase);
      else {
        const exercises=getSessionExercises(sType,phase,strengthDay);
        startExerciseWorkout(exercises,sType,strengthDay,phase);
      }
    });
  });
}

function buildSessionCard(sType,phase,strengthDay,done,idx,total,phaseName,todayStr){
  const configs={
    kinetotherapy:{emoji:'🏥',label:'Kinetotherapy',grad:'linear-gradient(135deg,#2563eb,#4f46e5)'},
    strength:{emoji:'💪',label:'Strength · Day '+(strengthDay||'A'),grad:'linear-gradient(135deg,#10b981,#0d9488)'},
    cardio:{emoji:'🫁',label:'Cardio & Breathing',grad:'linear-gradient(135deg,#f59e0b,#ea580c)'},
  };
  const cfg=configs[sType]||{emoji:'⚡',label:capitalize(sType),grad:'linear-gradient(135deg,#64748b,#475569)'};
  let details='', actionBtn='';

  if(sType==='cardio'){
    const proto=getCardioProtocol(phase);
    details=`<div class="session-card-detail">${proto.name} · ${proto.durationMin} min</div>`;
  } else {
    const exercises=getSessionExercises(sType,phase,strengthDay);
    const cats=[...new Set(exercises.map(e=>e.category))];
    details=`
      <div class="session-card-detail">${exercises.length} exercises · ~${Math.round(exercises.length*3)} min</div>
      <div class="session-card-cats">${cats.map(c=>`<span class="cat-pill cat-${c}">${capitalize(c)}</span>`).join('')}</div>`;
  }

  if(done){
    actionBtn=`<div class="session-done-badge">✓ Complete</div>`;
  } else {
    const muted=idx>0&&!isSessionDone(todayStr,'kinetotherapy')&&!isSessionDone(todayStr,'strength');
    actionBtn=`<button class="btn-start-session${muted?' btn-start-muted':''}" data-start-session="${sType}">
      ${muted?'Do first session first':'Start '+cfg.label}
    </button>`;
  }

  return `
    <div class="session-card${done?' session-card-done':''}">
      <div class="session-card-header" style="background:${cfg.grad}">
        <span class="session-card-emoji">${cfg.emoji}</span>
        <div class="session-card-title-wrap">
          <div class="session-card-title">${cfg.label}</div>
          <div class="session-card-phase">Phase ${phase} · ${phaseName}</div>
        </div>
        ${done?'<span class="session-header-check">✓</span>':''}
      </div>
      <div class="session-card-body">${details}${actionBtn}</div>
    </div>`;
}

/* ──────────────────────────────────────────────────────────────
   10. WORKOUT ENGINE
─────────────────────────────────────────────────────────────── */
function startExerciseWorkout(exercises, sessionType, strengthDay, phase){
  Object.assign(WS,{
    active:true, mode:'exercises',
    exercises, currentIndex:0,
    sets:{}, notes:{},
    startTime:Date.now(),
    sessionType, strengthDay, phase,
    restHandle:null, restLeft:0, restTotal:0,
    timerHandles:{}, timerElapsed:{}, timerRunning:{},
    _clockHandle:null,
  });
  exercises.forEach(ex=>{WS.sets[ex.id]=buildInitialSets(ex); WS.notes[ex.id]='';});
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-workout').classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  renderExerciseView();
}

function buildInitialSets(ex){
  const n=ex.sets||1;
  switch(ex.trackingType){
    case 'reps':            return Array.from({length:n},()=>({reps:ex.repsPerSet||0,done:false}));
    case 'reps_weighted':   return Array.from({length:n},()=>({reps:ex.repsPerSet||0,weightKg:ex.startWeightKg||0,done:false}));
    case 'bilateral_reps':  return Array.from({length:n},()=>({left:ex.repsPerSet||0,right:ex.repsPerSet||0,done:false}));
    case 'timed':           return Array.from({length:n},()=>({elapsed:0,done:false}));
    case 'bilateral_timed': return Array.from({length:n},()=>({leftDone:false,rightDone:false,done:false}));
    case 'breathing':       return [{breaths:0,done:false}];
    default:                return [{done:false}];
  }
}

function renderExerciseView(){
  clearInterval(WS._clockHandle);
  if(!WS.active||WS.mode!=='exercises') return;
  const view=document.getElementById('view-workout');
  const ex=WS.exercises[WS.currentIndex];
  const isLast=WS.currentIndex===WS.exercises.length-1;
  const pct=Math.round(WS.currentIndex/WS.exercises.length*100);
  const imgSrc=getExerciseImage(ex);
  const sessionLabel={kinetotherapy:'🏥 Kinetotherapy',strength:'💪 Strength · Day '+(WS.strengthDay||'A')}[WS.sessionType]||capitalize(WS.sessionType||'');

  view.innerHTML=`
    <div class="workout-topbar">
      <button class="icon-btn" id="ws-back-btn">✕</button>
      <div style="text-align:center">
        <div style="font-size:11px;color:var(--text-3);font-weight:600">${sessionLabel}</div>
        <div style="font-size:13px;font-weight:700">${WS.currentIndex+1} / ${WS.exercises.length}</div>
      </div>
      <span class="workout-timer" id="ws-timer">00:00</span>
    </div>
    <div class="workout-progress-bar"><div class="workout-progress-fill" id="ws-progress" style="width:${pct}%"></div></div>
    <div class="exercise-player" id="exercise-player">
      <div class="gif-container" id="gif-container">
        <img src="${imgSrc}" data-exid="${ex.id}" alt="${ex.name}"
             onerror="this.src='assets/placeholder.svg'" id="ex-gif">
        <div class="gif-tap-hint">Tap to expand</div>
      </div>
      <div class="exercise-info">
        <div class="exercise-name">${ex.name}</div>
        <div class="exercise-meta">
          <span style="color:${getCategoryColor(ex.category)};font-weight:600">${capitalize(ex.category)}</span>
          <span>${trackingLabel(ex)}</span>
        </div>
        <p class="exercise-instructions">${ex.instructions||''}</p>
        ${ex.warning?`<div class="warning-box">⚠️ ${ex.warning}</div>`:''}
        ${(ex.cues||[]).length?`<div class="cues-chip-row">${ex.cues.map(c=>`<span class="cue-chip">${c}</span>`).join('')}</div>`:''}
      </div>
      ${renderSetTracker(ex)}
      <div class="notes-row">
        <textarea class="notes-input" id="notes-${ex.id}" rows="2" placeholder="Notes…">${WS.notes[ex.id]||''}</textarea>
      </div>
    </div>
    <div id="rest-bar-wrap"></div>
    <div class="workout-nav">
      ${WS.currentIndex>0
        ?`<button class="btn-nav prev" id="ws-prev">←</button>`
        :`<button class="btn-nav prev" id="ws-quit" style="color:var(--danger)">✕</button>`}
      ${isLast
        ?`<button class="btn-nav finish" id="ws-finish">Finish ✓</button>`
        :`<button class="btn-nav next" id="ws-next">Next →</button>`}
    </div>`;

  WS._clockHandle=setInterval(()=>{
    const el=document.getElementById('ws-timer');
    if(el) el.textContent=fmtMs(Date.now()-WS.startTime);
  },1000);

  document.getElementById('gif-container')?.addEventListener('click',()=>{
    showFullscreenImg(imgSrc,ex.name);
  });

  attachExerciseEvents(ex, isLast);
  addSwipeNav(document.getElementById('exercise-player'),ex);
}

/* ── Set Trackers ───────────────────────────── */
function renderSetTracker(ex){
  const sets=WS.sets[ex.id];
  switch(ex.trackingType){
    case 'reps':            return renderRepsTracker(ex,sets);
    case 'reps_weighted':   return renderWeightedTracker(ex,sets);
    case 'bilateral_reps':  return renderBilateralRepsTracker(ex,sets);
    case 'timed':           return renderTimedTracker(ex,sets);
    case 'bilateral_timed': return renderBilateralTimedTracker(ex,sets);
    case 'breathing':       return renderBreathingTracker(ex,sets);
    default: return `<div class="set-tracker"><button class="btn-done-set ${sets[0]?.done?'checked':''}" data-action="done" data-ex="${ex.id}" data-set="0" style="width:100%;border-radius:8px;height:44px">${sets[0]?.done?'Done':'Mark Complete'}</button></div>`;
  }
}

function setRowHTML(ex,sets,bodyFn){
  return `<div class="set-tracker"><div class="set-tracker-title">Sets</div>${
    sets.map((s,i)=>`
      <div class="set-row ${s.done?'done':''}" data-setrow="${i}">
        <span class="set-label">${ex.setLabels?.[i]||'Set '+(i+1)}</span>
        ${bodyFn(s,i)}
        <button class="btn-done-set ${s.done?'checked':''}" data-action="done" data-ex="${ex.id}" data-set="${i}">${s.done?'✓':''}</button>
      </div>`).join('')
  }</div>`;
}

function renderRepsTracker(ex,sets){
  return setRowHTML(ex,sets,(s,i)=>`
    <div class="counter">
      <button class="btn-counter minus" data-action="dec" data-ex="${ex.id}" data-set="${i}">−</button>
      <span class="counter-val" id="cv-${ex.id}-${i}">${s.reps}</span>
      <button class="btn-counter" data-action="inc" data-ex="${ex.id}" data-set="${i}">+</button>
    </div>`);
}

function renderWeightedTracker(ex,sets){
  return setRowHTML(ex,sets,(s,i)=>`
    <div class="weight-row">
      <button class="btn-weight" data-action="wdec" data-ex="${ex.id}" data-set="${i}">−</button>
      <span class="weight-val" id="wv-${ex.id}-${i}">${s.weightKg} kg</span>
      <button class="btn-weight" data-action="winc" data-ex="${ex.id}" data-set="${i}">+</button>
    </div>
    <div class="counter" style="margin-left:4px">
      <button class="btn-counter minus" data-action="dec" data-ex="${ex.id}" data-set="${i}">−</button>
      <span class="counter-val" id="cv-${ex.id}-${i}">${s.reps}</span>
      <button class="btn-counter" data-action="inc" data-ex="${ex.id}" data-set="${i}">+</button>
    </div>`);
}

function renderBilateralRepsTracker(ex,sets){
  return setRowHTML(ex,sets,(s,i)=>`
    <div style="display:flex;gap:6px;align-items:center;margin-left:auto">
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
    </div>`);
}

function renderTimedTracker(ex,sets){
  return setRowHTML(ex,sets,(s,i)=>{
    const key=ex.id+'_'+i;
    const rem=ex.durationSec-(WS.timerElapsed[key]||0);
    const run=WS.timerRunning[key];
    return `
      <div class="timer-circle-wrap">
        <span class="timer-val" id="tv-${ex.id}-${i}">${fmtSec(Math.max(0,rem))}</span>
        <button class="btn-timer${run?' running':''}" data-action="${run?'pause':'start'}timer"
          data-ex="${ex.id}" data-set="${i}" data-dur="${ex.durationSec}">
          ${run?'Pause':'Start'}
        </button>
      </div>`;
  });
}

function renderBilateralTimedTracker(ex,sets){
  return setRowHTML(ex,sets,(s,i)=>{
    const kL=ex.id+'_'+i+'_L',kR=ex.id+'_'+i+'_R';
    const remL=ex.durationSec-(WS.timerElapsed[kL]||0),remR=ex.durationSec-(WS.timerElapsed[kR]||0);
    const runL=WS.timerRunning[kL],runR=WS.timerRunning[kR];
    return `
      <div style="display:flex;flex-direction:column;gap:5px;margin-left:auto">
        <div style="display:flex;align-items:center;gap:6px">
          <span class="set-side-badge side-l">L</span>
          <span class="timer-val" id="tv-${ex.id}-${i}-L" style="font-size:15px">${fmtSec(Math.max(0,remL))}</span>
          <button class="btn-timer${runL?' running':''}" data-action="${runL?'pause':'start'}timerL" data-ex="${ex.id}" data-set="${i}" data-dur="${ex.durationSec}" style="font-size:11px;padding:4px 9px">${runL?'Pause':'Start'}</button>
          <span class="btn-done-set ${s.leftDone?'checked':''}" style="cursor:pointer" data-action="ldone" data-ex="${ex.id}" data-set="${i}">${s.leftDone?'✓':'○'}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span class="set-side-badge side-r">R</span>
          <span class="timer-val" id="tv-${ex.id}-${i}-R" style="font-size:15px">${fmtSec(Math.max(0,remR))}</span>
          <button class="btn-timer${runR?' running':''}" data-action="${runR?'pause':'start'}timerR" data-ex="${ex.id}" data-set="${i}" data-dur="${ex.durationSec}" style="font-size:11px;padding:4px 9px">${runR?'Pause':'Start'}</button>
          <span class="btn-done-set ${s.rightDone?'checked':''}" style="cursor:pointer" data-action="rdone" data-ex="${ex.id}" data-set="${i}">${s.rightDone?'✓':'○'}</span>
        </div>
      </div>`;
  });
}

function renderBreathingTracker(ex,sets){
  const s=sets[0]; const target=ex.repsPerSet||8;
  return `
    <div class="breathing-display">
      <div class="breath-circle" id="breath-circle">
        <div class="breath-phase" id="breath-phase">Inhale</div>
        <div class="breath-count" id="breath-count">4</div>
      </div>
      <div class="breath-rep-count" id="breath-reps">${s.breaths}/${target} breaths</div>
      <div style="margin-top:14px;display:flex;gap:10px;justify-content:center">
        <button class="btn-timer" id="breath-start-btn">Start</button>
        ${s.done?'<span style="color:var(--secondary);font-weight:700">Done</span>':''}
      </div>
    </div>`;
}

/* ── Events ─────────────────────────────────── */
function attachExerciseEvents(ex, isLast){
  const view=document.getElementById('view-workout');
  document.getElementById('ws-back-btn')?.addEventListener('click',quitWorkout);
  document.getElementById('ws-quit')?.addEventListener('click',quitWorkout);
  document.getElementById('ws-prev')?.addEventListener('click',()=>navExercise(-1,ex));
  document.getElementById('ws-next')?.addEventListener('click',()=>navExercise(+1,ex));
  document.getElementById('ws-finish')?.addEventListener('click',()=>{saveNote(ex.id);clearAllTimers();stopBreathing();finishExerciseWorkout();});
  document.getElementById('breath-start-btn')?.addEventListener('click',()=>startBreathing(ex));

  view.onclick=e=>{
    const btn=e.target.closest('[data-action]'); if(!btn) return;
    const {action}=btn.dataset;
    const exId=btn.dataset.ex, si=parseInt(btn.dataset.set,10);
    if(!exId) return;
    const sets=WS.sets[exId]; if(!sets) return;
    const s=sets[si];
    switch(action){
      case 'inc':   s.reps=(s.reps||0)+1;  document.getElementById('cv-'+exId+'-'+si)?.((el=>el.textContent=s.reps)||(()=>{})); updateVal('cv-'+exId+'-'+si,s.reps); break;
      case 'dec':   s.reps=Math.max(0,(s.reps||0)-1); updateVal('cv-'+exId+'-'+si,s.reps); break;
      case 'linc':  s.left=(s.left||0)+1;  updateVal('lv-'+exId+'-'+si,s.left); break;
      case 'ldec':  s.left=Math.max(0,(s.left||0)-1); updateVal('lv-'+exId+'-'+si,s.left); break;
      case 'rinc':  s.right=(s.right||0)+1; updateVal('rv-'+exId+'-'+si,s.right); break;
      case 'rdec':  s.right=Math.max(0,(s.right||0)-1); updateVal('rv-'+exId+'-'+si,s.right); break;
      case 'winc':  s.weightKg=+((s.weightKg||0)+0.5).toFixed(1); updateVal('wv-'+exId+'-'+si,s.weightKg+' kg'); break;
      case 'wdec':  s.weightKg=Math.max(0,+((s.weightKg||0)-0.5).toFixed(1)); updateVal('wv-'+exId+'-'+si,s.weightKg+' kg'); break;
      case 'done':  toggleSetDone(exId,si,btn,sets); break;
      case 'ldone': s.leftDone=!s.leftDone; e.target.textContent=s.leftDone?'✓':'○'; e.target.classList.toggle('checked',s.leftDone); if(s.leftDone&&s.rightDone){s.done=true;btn.closest('.set-row')?.classList.add('done');} break;
      case 'rdone': s.rightDone=!s.rightDone; e.target.textContent=s.rightDone?'✓':'○'; e.target.classList.toggle('checked',s.rightDone); if(s.leftDone&&s.rightDone){s.done=true;btn.closest('.set-row')?.classList.add('done');} break;
      case 'starttimer':  startTimer(exId,si,parseInt(btn.dataset.dur)); break;
      case 'pausetimer':  pauseTimer(exId,si); break;
      case 'starttimerL': startTimer(exId,si+'_L',parseInt(btn.dataset.dur)); break;
      case 'pausetimerL': pauseTimer(exId,si+'_L'); break;
      case 'starttimerR': startTimer(exId,si+'_R',parseInt(btn.dataset.dur)); break;
      case 'pausetimerR': pauseTimer(exId,si+'_R'); break;
    }
  };
}

function updateVal(id, val){ const el=document.getElementById(id); if(el) el.textContent=val; }

function navExercise(dir, currentEx){
  saveNote(currentEx.id); clearAllTimers(); stopBreathing();
  if(dir>0) triggerRestIfNeeded(currentEx);
  WS.currentIndex+=dir;
  renderExerciseView();
}

function toggleSetDone(exId,si,btn,sets){
  sets[si].done=!sets[si].done;
  btn.classList.toggle('checked',sets[si].done);
  btn.textContent=sets[si].done?'✓':'';
  btn.closest('.set-row')?.classList.toggle('done',sets[si].done);
}

/* ── Timers ─────────────────────────────────── */
function startTimer(exId, key, totalSec){
  const fk=exId+'_'+key;
  if(WS.timerRunning[fk]) return;
  WS.timerRunning[fk]=true;
  WS.timerHandles[fk]=setInterval(()=>{
    WS.timerElapsed[fk]=(WS.timerElapsed[fk]||0)+1;
    const rem=Math.max(0,totalSec-WS.timerElapsed[fk]);
    const tvId='tv-'+exId+'-'+String(key).replace('_L','').replace('_R','')+(String(key).includes('_L')?'-L':String(key).includes('_R')?'-R':'');
    updateVal(tvId,fmtSec(rem));
    if(rem===0){ pauseTimer(exId,key); autoMarkTimedDone(exId,String(key).split('_')[0]); }
  },1000);
}
function pauseTimer(exId,key){
  const fk=exId+'_'+key;
  clearInterval(WS.timerHandles[fk]); delete WS.timerHandles[fk]; WS.timerRunning[fk]=false;
}
function autoMarkTimedDone(exId,siStr){
  const si=parseInt(siStr,10);
  if(!isNaN(si)&&WS.sets[exId]?.[si]) WS.sets[exId][si].done=true;
  document.querySelector('[data-setrow="'+si+'"]')?.classList.add('done');
}
function clearAllTimers(){
  Object.keys(WS.timerHandles).forEach(k=>clearInterval(WS.timerHandles[k]));
  WS.timerHandles={};
  Object.keys(WS.timerRunning).forEach(k=>{WS.timerRunning[k]=false;});
}

/* ── Breathing ───────────────────────────────── */
const BREATH_TIMING={inhale:4,hold:2,exhale:6};
function startBreathing(ex){
  stopBreathing();
  const target=ex.repsPerSet||8;
  BREATH.done=WS.sets[ex.id][0].breaths||0; BREATH.target=target;
  BREATH.phase='inhale'; BREATH.sec=BREATH_TIMING.inhale;
  updateBreathUI();
  BREATH.handle=setInterval(()=>{
    BREATH.sec--;
    if(BREATH.sec<=0){
      if(BREATH.phase==='inhale'){BREATH.phase='hold';BREATH.sec=BREATH_TIMING.hold;}
      else if(BREATH.phase==='hold'){BREATH.phase='exhale';BREATH.sec=BREATH_TIMING.exhale;}
      else{
        BREATH.done++;
        WS.sets[ex.id][0].breaths=BREATH.done;
        const el=document.getElementById('breath-reps');
        if(el) el.textContent=BREATH.done+'/'+BREATH.target+' breaths';
        if(BREATH.done>=BREATH.target){stopBreathing();WS.sets[ex.id][0].done=true;showToast('Breathing complete!');return;}
        BREATH.phase='inhale'; BREATH.sec=BREATH_TIMING.inhale;
      }
    }
    updateBreathUI();
  },1000);
}
function updateBreathUI(){
  const circle=document.getElementById('breath-circle');
  if(circle) circle.className='breath-circle '+BREATH.phase;
  const p=document.getElementById('breath-phase'); if(p) p.textContent=capitalize(BREATH.phase);
  const c=document.getElementById('breath-count'); if(c) c.textContent=BREATH.sec;
}
function stopBreathing(){ clearInterval(BREATH.handle); BREATH.handle=null; }

/* ── Rest bar ─────────────────────────────────── */
function triggerRestIfNeeded(ex){
  if(ex.category==='warmup'||ex.category==='cooldown') return;
  showRestBar(45);
}
function showRestBar(sec){
  clearTimeout(WS.restHandle); WS.restLeft=sec; WS.restTotal=sec;
  const wrap=document.getElementById('rest-bar-wrap'); if(!wrap) return;
  wrap.innerHTML=`
    <div class="rest-bar">
      <span class="rest-label">Rest</span>
      <span class="rest-countdown" id="rest-cd">${sec}s</span>
      <div class="rest-track"><div class="rest-fill" id="rest-fill" style="width:100%"></div></div>
      <button class="btn-skip-rest" id="btn-skip-rest">Skip</button>
    </div>`;
  document.getElementById('btn-skip-rest')?.addEventListener('click',clearRestTimer);
  tickRest();
}
function tickRest(){
  if(WS.restLeft<=0){clearRestTimer();return;}
  WS.restHandle=setTimeout(()=>{
    WS.restLeft--;
    const cd=document.getElementById('rest-cd'),fill=document.getElementById('rest-fill');
    if(cd) cd.textContent=WS.restLeft+'s';
    if(fill) fill.style.width=Math.round(WS.restLeft/WS.restTotal*100)+'%';
    if(WS.restLeft<=0) clearRestTimer(); else tickRest();
  },1000);
}
function clearRestTimer(){ clearTimeout(WS.restHandle); const w=document.getElementById('rest-bar-wrap'); if(w) w.innerHTML=''; }

function saveNote(exId){ const el=document.getElementById('notes-'+exId); if(el) WS.notes[exId]=el.value; }

/* ── Swipe nav ─────────────────────────────────── */
function addSwipeNav(el, currentEx){
  if(!el) return;
  let sx=0,sy=0;
  el.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  el.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.5) return;
    if(dx<0&&WS.currentIndex<WS.exercises.length-1) navExercise(+1,currentEx);
    else if(dx>0&&WS.currentIndex>0) navExercise(-1,currentEx);
  },{passive:true});
}

/* ── Fullscreen image ─────────────────────────── */
function showFullscreenImg(src, alt){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;cursor:zoom-out';
  ov.innerHTML=`<img src="${src}" alt="${alt}" style="max-width:96%;max-height:92dvh;object-fit:contain;border-radius:12px">
    <button style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,.15);border:none;color:#fff;font-size:24px;width:44px;height:44px;border-radius:50%;cursor:pointer">✕</button>`;
  ov.onclick=()=>ov.remove();
  document.body.appendChild(ov);
}

/* ── Finish ───────────────────────────────────── */
function finishExerciseWorkout(){
  clearInterval(WS._clockHandle); clearAllTimers(); clearRestTimer(); stopBreathing();
  const duration=Date.now()-WS.startTime;
  const completedAll=WS.exercises.every(ex=>WS.sets[ex.id]?.some(s=>s.done));
  saveLog({
    date:isoDate(new Date()),
    type:WS.sessionType,
    strengthDay:WS.strengthDay,
    phase:WS.phase,
    durationMs:duration,
    completedAll,
    exercises:WS.exercises.map(ex=>({id:ex.id,sets:WS.sets[ex.id]||[],note:WS.notes[ex.id]||''})),
  });
  WS.active=false;
  renderSummaryScreen(duration,WS.exercises.length,completedAll,WS.sessionType);
}

function quitWorkout(){
  if(!WS.active){Router.navigate('today');return;}
  if(!confirm('Quit? Progress will be lost.')) return;
  clearInterval(WS._clockHandle); clearAllTimers(); clearRestTimer(); stopBreathing();
  if(WS.mode==='cardio') clearCardioTimers();
  WS.active=false;
  Router.navigate('today');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==='today'));
}

function renderSummaryScreen(duration, count, completedAll, sessionType){
  const view=document.getElementById('view-workout');
  const streak=getStreak(), total=getTotalSessions();
  view.innerHTML=`
    <div class="summary-screen">
      <div class="summary-icon">${completedAll?'🎉':'💪'}</div>
      <div class="summary-title">${completedAll?'Session Complete!':'Good effort!'}</div>
      <div class="summary-sub">${capitalize(sessionType||'')} · ${fmtMin(duration)}</div>
      <div class="summary-stats">
        <div class="stat-card"><div class="stat-num">${fmtMin(duration)}</div><div class="stat-label">Duration</div></div>
        <div class="stat-card"><div class="stat-num">${count}</div><div class="stat-label">Exercises</div></div>
        <div class="stat-card"><div class="stat-num">${streak}</div><div class="stat-label">Streak</div></div>
        <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">Sessions</div></div>
      </div>
      <button class="btn-primary" id="btn-back-today">Back to Today</button>
    </div>`;
  document.getElementById('btn-back-today')?.addEventListener('click',()=>{
    Router.navigate('today');
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==='today'));
  });
}

/* ──────────────────────────────────────────────────────────────
   11. CARDIO SESSION PLAYER
─────────────────────────────────────────────────────────────── */
function startCardioSession(protocol, phase){
  Object.assign(WS,{
    active:true, mode:'cardio',
    startTime:Date.now(),
    sessionType:'cardio', phase,
    cardioProtocol:protocol,
    cardioBlockIndex:0, cardioBlockSec:0,
    cardioHandle:null, cardioPaused:false,
    _clockHandle:null,
  });
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-workout').classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  renderCardioView();
}

function renderCardioView(){
  const view=document.getElementById('view-workout');
  const proto=WS.cardioProtocol;
  const blocks=proto.structure||[];
  const blockIdx=WS.cardioBlockIndex;
  const isDone=blockIdx>=blocks.length;
  const totalBlocks=blocks.length;
  const pct=isDone?100:Math.round(blockIdx/totalBlocks*100);
  const zColor={1:'#64748b',2:'#22c55e',3:'#f59e0b',4:'#ef4444',5:'#a21caf'};
  const zLabel={1:'Zone 1 - Easy',2:'Zone 2 - Aerobic',3:'Zone 3 - Tempo',4:'Zone 4 - Hard',5:'Zone 5 - Max'};

  let blockHTML='';
  if(isDone){
    blockHTML=`
      <div style="text-align:center;padding:32px 20px">
        <div style="font-size:56px;margin-bottom:16px">🎉</div>
        <div style="font-size:22px;font-weight:800;margin-bottom:8px">Cardio Complete!</div>
        <div style="font-size:14px;color:var(--text-2)">Total: ${fmtMin(Date.now()-WS.startTime)}</div>
      </div>`;
  } else {
    const curBlock=blocks[blockIdx];
    const blockSec=(curBlock.durationMin||0)*60;
    const elapsed=WS.cardioBlockSec;
    const remaining=Math.max(0,blockSec-elapsed);
    const fillPct=blockSec>0?Math.round(elapsed/blockSec*100):0;
    const zone=curBlock.zone||2;
    const zc=zColor[zone]||'#2563eb';

    blockHTML=`
      <div class="cardio-zone-bar" style="background:${zc}20;border-left:4px solid ${zc}">
        <div class="cardio-zone-label" style="color:${zc}">${zLabel[zone]||'Zone '+zone}</div>
        <div class="cardio-block-label">${curBlock.label||''}</div>
      </div>
      <div class="cardio-timer-wrap">
        <div class="cardio-timer-display" style="color:${zc}" id="cardio-time">${fmtSec(remaining)}</div>
        <div class="cardio-block-progress">
          <div class="cardio-block-fill" id="cardio-block-fill" style="width:${fillPct}%;background:${zc}"></div>
        </div>
        <div class="cardio-block-meta">${blockIdx+1} / ${totalBlocks} blocks</div>
      </div>
      <div class="cardio-controls">
        <button class="btn-cardio-ctrl" id="btn-cardio-toggle">${WS.cardioPaused?'Resume':'Pause'}</button>
        <button class="btn-cardio-skip" id="btn-cardio-skip">Skip block</button>
      </div>
      ${blocks[blockIdx+1]?`
        <div class="cardio-next-up">
          Next: <strong>${blocks[blockIdx+1].label}</strong>
          · ${blocks[blockIdx+1].durationMin} min
          · <span style="color:${zColor[blocks[blockIdx+1].zone]||'#2563eb'}">${zLabel[blocks[blockIdx+1].zone]||''}</span>
        </div>`:''} `;
  }

  view.innerHTML=`
    <div class="workout-topbar">
      <button class="icon-btn" id="ws-back-btn">✕</button>
      <div style="text-align:center">
        <div style="font-size:11px;color:var(--text-3);font-weight:600">Cardio & Breathing</div>
        <div style="font-size:12px;font-weight:700">${proto.name}</div>
      </div>
      <span class="workout-timer" id="ws-timer">00:00</span>
    </div>
    <div class="workout-progress-bar"><div class="workout-progress-fill" style="width:${pct}%"></div></div>
    <div style="padding:0 16px 80px;overflow-y:auto">
      ${blockHTML}
      ${(proto.activities||[]).length?`
        <div class="cardio-activities">
          <div style="font-size:11px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Suggested activities</div>
          ${proto.activities.map(a=>`<div class="cardio-activity-item">· ${a}</div>`).join('')}
        </div>`:''}
      <div style="margin-top:16px">
        <textarea class="notes-input" id="cardio-notes" rows="2" placeholder="How did it feel? HR reached?">${WS.notes?.cardio||''}</textarea>
      </div>
    </div>
    <div class="workout-nav">
      <button class="btn-nav prev" id="ws-quit" style="color:var(--danger)">Quit</button>
      ${isDone
        ?`<button class="btn-nav finish" id="cardio-finish">Save</button>`
        :`<button class="btn-nav finish" id="cardio-finish" style="font-size:13px">Complete</button>`}
    </div>`;

  clearInterval(WS._clockHandle);
  WS._clockHandle=setInterval(()=>{
    const el=document.getElementById('ws-timer');
    if(el) el.textContent=fmtMs(Date.now()-WS.startTime);
  },1000);

  document.getElementById('ws-back-btn')?.addEventListener('click',quitWorkout);
  document.getElementById('ws-quit')?.addEventListener('click',quitWorkout);
  document.getElementById('cardio-finish')?.addEventListener('click',()=>{
    const note=document.getElementById('cardio-notes')?.value||'';
    clearCardioTimers(); clearInterval(WS._clockHandle);
    saveLog({date:isoDate(new Date()),type:'cardio',phase:WS.phase,protocol:WS.cardioProtocol?.id,durationMs:Date.now()-WS.startTime,completedAll:true,note});
    WS.active=false;
    renderSummaryScreen(Date.now()-WS.startTime,0,true,'cardio');
  });

  if(!isDone){
    document.getElementById('btn-cardio-toggle')?.addEventListener('click',toggleCardioTimer);
    document.getElementById('btn-cardio-skip')?.addEventListener('click',skipCardioBlock);
    if(!WS.cardioPaused&&!WS.cardioHandle) startCardioTimer();
  }
}

function startCardioTimer(){
  if(WS.cardioHandle) return;
  WS.cardioPaused=false;
  const blocks=WS.cardioProtocol.structure||[];
  WS.cardioHandle=setInterval(()=>{
    const curBlock=blocks[WS.cardioBlockIndex];
    if(!curBlock){clearCardioTimers();return;}
    WS.cardioBlockSec++;
    const blockSec=(curBlock.durationMin||0)*60;
    const remaining=Math.max(0,blockSec-WS.cardioBlockSec);
    updateVal('cardio-time',fmtSec(remaining));
    const fillEl=document.getElementById('cardio-block-fill');
    if(fillEl) fillEl.style.width=Math.round(WS.cardioBlockSec/blockSec*100)+'%';
    if(remaining<=0){
      WS.cardioBlockIndex++; WS.cardioBlockSec=0;
      clearCardioTimers();
      if(WS.cardioBlockIndex>=blocks.length) showToast('All intervals complete!');
      renderCardioView();
    }
  },1000);
}

function toggleCardioTimer(){
  if(WS.cardioPaused){
    WS.cardioPaused=false; startCardioTimer();
    const btn=document.getElementById('btn-cardio-toggle'); if(btn) btn.textContent='Pause';
  } else {
    WS.cardioPaused=true; clearCardioTimers();
    const btn=document.getElementById('btn-cardio-toggle'); if(btn) btn.textContent='Resume';
  }
}

function skipCardioBlock(){
  clearCardioTimers();
  WS.cardioBlockIndex++; WS.cardioBlockSec=0;
  renderCardioView();
}

function clearCardioTimers(){ clearInterval(WS.cardioHandle); WS.cardioHandle=null; }

/* ──────────────────────────────────────────────────────────────
   12. LIBRARY VIEW
─────────────────────────────────────────────────────────────── */
function renderLibraryView(){
  if(!App.dataReady) return;
  const allExercises=[...App.kineto.exercises,...App.strength.exercises,...(App.cardio.breathingExercises||[])];
  renderLibList(allExercises,'');
  const filterBar=document.getElementById('lib-filters');
  const filters=[
    {label:'All',val:''},{label:'Kineto',val:'kineto'},
    {label:'Strength',val:'strength'},{label:'Breathing',val:'breathing'},
    {label:'Warmup',val:'cat:warmup'},{label:'Main',val:'cat:main'},{label:'Cooldown',val:'cat:cooldown'},
  ];
  filterBar.innerHTML=filters.map(f=>`<button class="filter-chip ${f.val===''?'active':''}" data-filter="${f.val}">${f.label}</button>`).join('');
  let activeFilter='', searchQuery='';
  function applyFilter(){
    let list=allExercises;
    if(activeFilter==='kineto') list=App.kineto.exercises;
    if(activeFilter==='strength') list=App.strength.exercises;
    if(activeFilter==='breathing') list=App.cardio.breathingExercises||[];
    if(activeFilter.startsWith('cat:')) list=allExercises.filter(e=>e.category===activeFilter.slice(4));
    if(searchQuery){ const q=searchQuery.toLowerCase(); list=list.filter(e=>e.name.toLowerCase().includes(q)||(e.instructions||'').toLowerCase().includes(q)); }
    renderLibList(list,searchQuery);
  }
  filterBar.onclick=e=>{
    const chip=e.target.closest('.filter-chip'); if(!chip) return;
    activeFilter=chip.dataset.filter;
    document.querySelectorAll('.filter-chip').forEach(c=>c.classList.toggle('active',c.dataset.filter===activeFilter));
    applyFilter();
  };
  const srch=document.getElementById('lib-search');
  if(srch) srch.oninput=e=>{searchQuery=e.target.value.trim();applyFilter();};
}

function renderLibList(list,query){
  const cont=document.getElementById('lib-list');
  if(!list.length){ cont.innerHTML=`<div class="empty-state"><div class="empty-state-icon">🔍</div><p>No exercises found</p></div>`; return; }
  const icons={warmup:'🔥',main:'⚡',cooldown:'🌊',breathing:'🌬️'};
  cont.innerHTML=list.map(ex=>{
    const imgSrc=getExerciseImage(ex);
    const bg=getCategoryBg(ex.category);
    return `
      <div class="lib-item" data-id="${ex.id}">
        <div class="lib-item-header">
          <div class="lib-item-thumb" style="background:${bg}">
            <img src="${imgSrc}" data-exid="${ex.id}" alt="${ex.name}" onerror="this.style.display='none'" loading="lazy">
            <span class="lib-item-thumb-fallback">${icons[ex.category]||'💪'}</span>
          </div>
          <div class="lib-item-text">
            <div class="lib-item-name">${highlight(ex.name,query)}</div>
            <div class="lib-item-sub">${ex.id} · ${trackingLabel(ex)}</div>
          </div>
          <span class="lib-item-expand">▾</span>
        </div>
        <div class="lib-item-body">
          <img class="lib-gif" src="${imgSrc}" data-exid="${ex.id}" alt="${ex.name}"
               loading="lazy" onerror="this.src='assets/placeholder.svg'"
               onclick="window._showImg&&window._showImg(this.src,'${ex.name.replace(/'/g,'').replace(/"/g,'')}')">
          <p class="lib-instructions">${ex.instructions||''}</p>
          ${(ex.cues||[]).length?`<div class="lib-cues">${ex.cues.map(c=>`<div class="lib-cue">${c}</div>`).join('')}</div>`:''}
          ${ex.warning?`<div class="lib-warning">⚠️ ${ex.warning}</div>`:''}
        </div>
      </div>`;
  }).join('');
  cont.onclick=e=>{
    const item=e.target.closest('.lib-item'); if(!item) return;
    if(e.target.closest('.lib-gif')) return;
    item.classList.toggle('open');
  };
}

function highlight(text,query){
  if(!query) return text;
  const re=new RegExp('('+query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
  return text.replace(re,'<mark style="background:var(--primary-lt);border-radius:2px">$1</mark>');
}

/* ──────────────────────────────────────────────────────────────
   13. PROGRESS VIEW
─────────────────────────────────────────────────────────────── */
let activeProgressTab='heatmap';
function renderProgressView(){
  if(!App.dataReady) return;
  renderProgressTab(activeProgressTab);
  const pTabs=document.getElementById('progress-tabs');
  if(pTabs) pTabs.onclick=e=>{
    const btn=e.target.closest('.tab-btn'); if(!btn) return;
    activeProgressTab=btn.dataset.tab;
    document.querySelectorAll('#progress-tabs .tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===activeProgressTab));
    renderProgressTab(activeProgressTab);
  };
}
function renderProgressTab(tab){
  const cont=document.getElementById('progress-content');
  if(tab==='heatmap')    renderHeatmap(cont);
  if(tab==='charts')     renderCharts(cont);
  if(tab==='milestones') renderMilestones(cont);
  if(tab==='bolt')       renderBoltView(cont);
}

function renderHeatmap(cont){
  const logs=getLogs();
  const start=parseISO(App.schedule.startDate), end=parseISO(App.schedule.endDate);
  const today=new Date();
  const streak=getStreak(), total=getTotalSessions(), weekNow=getWeekNumber(today);
  const doneSet={};
  logs.forEach(l=>{
    if(!l.completedAll) return;
    if(!doneSet[l.date]) doneSet[l.date]=new Set();
    doneSet[l.date].add(l.type);
  });
  const months=[];
  let cur=new Date(start.getFullYear(),start.getMonth(),1);
  while(cur<=end){months.push({year:cur.getFullYear(),month:cur.getMonth()});cur=new Date(cur.getFullYear(),cur.getMonth()+1,1);}
  const DAY=['Mo','Tu','We','Th','Fr','Sa','Su'];
  const heatHTML=months.map(({year,month})=>{
    const label=new Date(year,month,1).toLocaleString('default',{month:'long',year:'numeric'});
    const offset=(new Date(year,month,1).getDay()+6)%7;
    const days=new Date(year,month+1,0).getDate();
    const cells=[];
    for(let e=0;e<offset;e++) cells.push(`<div class="heatmap-cell empty"></div>`);
    for(let d=1;d<=days;d++){
      const date=new Date(year,month,d);
      const ds=isoDate(date);
      const types=doneSet[ds];
      const isTd=ds===isoDate(today), isFut=date>today;
      let cls='heatmap-cell';
      if(types){
        const hK=types.has('kinetotherapy'),hS=types.has('strength'),hC=types.has('cardio');
        if(hK&&hC&&hS) cls+=' done-all';
        else if(hK&&hC) cls+=' done-kine-cardio';
        else if(hK)     cls+=' done-kine';
        else if(hC)     cls+=' done-cardio';
        else if(hS)     cls+=' done-str';
      }
      if(isTd) cls+=' today';
      if(isFut) cls+=' future';
      cells.push(`<div class="${cls}" title="${ds}"></div>`);
    }
    return `<div class="heatmap-month"><div class="heatmap-month-title">${label}</div>
      <div class="heatmap-grid">${DAY.map(d=>`<div class="heatmap-day-label">${d}</div>`).join('')}${cells.join('')}</div></div>`;
  }).join('');
  cont.innerHTML=`
    <div class="stats-row">
      <div class="stats-card"><div class="stats-num">${total}</div><div class="stats-label">Sessions</div></div>
      <div class="stats-card"><div class="stats-num">${streak}</div><div class="stats-label">Streak</div></div>
      <div class="stats-card"><div class="stats-num">${weekNow<1?0:Math.min(weekNow,26)}</div><div class="stats-label">Week</div></div>
    </div>
    <div class="heatmap-legend">
      <span class="heatmap-swatch" style="background:#2563eb"></span>Kineto
      <span class="heatmap-swatch" style="background:#f59e0b;margin-left:10px"></span>Cardio
      <span class="heatmap-swatch" style="background:#10b981;margin-left:10px"></span>Strength
      <span class="heatmap-swatch" style="background:#8b5cf6;margin-left:10px"></span>All done
    </div>
    <div class="heatmap-months">${heatHTML}</div>`;
}

function renderCharts(cont){
  const logs=getLogs();
  if(!logs.length){cont.innerHTML=`<div class="empty-state"><div class="empty-state-icon">📊</div><p>Complete workouts to see charts.</p></div>`;return;}
  const weightedExIds=Object.values(App.exercises).filter(e=>e.trackingType==='reps_weighted').map(e=>e.id);
  const datasets={}; weightedExIds.forEach(id=>{datasets[id]=[];});
  logs.forEach(log=>{
    (log.exercises||[]).forEach(le=>{
      if(!datasets[le.id]) return;
      const ws=(le.sets||[]).map(s=>s.weightKg||0).filter(w=>w>0);
      if(!ws.length) return;
      datasets[le.id].push({date:log.date,weight:ws.reduce((a,b)=>a+b,0)/ws.length});
    });
  });
  const selOpts=weightedExIds.map(id=>`<option value="${id}">${App.exercises[id]?.name||id}</option>`).join('');
  cont.innerHTML=`
    <div style="margin-bottom:16px">
      <label class="form-label">Exercise</label>
      <select id="chart-select" class="form-select">${selOpts||'<option>No weighted exercises yet</option>'}</select>
    </div>
    <canvas id="progress-chart" height="180"></canvas>
    <div id="chart-no-data" class="empty-state" style="display:none"><div class="empty-state-icon">📉</div><p>No weight data yet.</p></div>`;
  function drawChart(exId){
    const data=datasets[exId]||[]; const canvas=document.getElementById('progress-chart'); const noData=document.getElementById('chart-no-data');
    if(!data.length){canvas.style.display='none';noData.style.display='';return;}
    canvas.style.display='';noData.style.display='none';
    const ctx=canvas.getContext('2d'),W=canvas.offsetWidth||canvas.parentElement?.offsetWidth||320,H=180;
    canvas.width=W*devicePixelRatio;canvas.height=H*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);
    const vals=data.map(d=>d.weight),min=Math.max(0,Math.min(...vals)-1),max=Math.max(...vals)+1;
    const pad={top:20,right:20,bottom:30,left:40},iW=W-pad.left-pad.right,iH=H-pad.top-pad.bottom;
    const dark=document.documentElement.dataset.theme==='dark',fg=dark?'#f1f5f9':'#0f172a',grid=dark?'#334155':'#e2e8f0';
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle=grid;ctx.lineWidth=1;
    for(let i=0;i<=4;i++){const y=pad.top+iH*(1-i/4);ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(W-pad.right,y);ctx.stroke();ctx.fillStyle=fg;ctx.font='10px sans-serif';ctx.textAlign='right';ctx.fillText(((min+(max-min)*i/4)).toFixed(1)+'kg',pad.left-4,y+4);}
    const pt=i=>({x:pad.left+(data.length>1?i/(data.length-1)*iW:iW/2),y:pad.top+iH*(1-(data[i].weight-min)/(max-min))});
    ctx.strokeStyle='#2563eb';ctx.lineWidth=2;ctx.beginPath();data.forEach((_,i)=>{const p=pt(i);i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);});ctx.stroke();
    ctx.fillStyle='#2563eb';data.forEach((_,i)=>{const p=pt(i);ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle=fg;ctx.textAlign='center';ctx.font='10px sans-serif';
    const step=Math.ceil(data.length/4);data.forEach((d,i)=>{if(i%step===0)ctx.fillText(d.date.slice(5),pt(i).x,H-8);});
  }
  const sel=document.getElementById('chart-select');
  if(sel){requestAnimationFrame(()=>drawChart(sel.value));sel.onchange=()=>drawChart(sel.value);}
}

function renderMilestones(cont){
  const checked=lsGet(LS.MILESTONES,[]);
  const byMonth={};
  MILESTONES.forEach(m=>{if(!byMonth[m.month])byMonth[m.month]=[];byMonth[m.month].push(m);});
  cont.innerHTML=Object.entries(byMonth).map(([month,items])=>`
    <div class="milestone-month">
      <div class="milestone-month-title">Month ${month}</div>
      ${items.map(m=>`
        <div class="milestone-item ${checked.includes(m.id)?'checked':''}" data-id="${m.id}">
          <div class="milestone-check ${checked.includes(m.id)?'checked':''}">${checked.includes(m.id)?'✓':''}</div>
          <div class="milestone-text">${m.text}<br><span class="text-xs text-3">Week ${m.week}</span></div>
        </div>`).join('')}
    </div>`).join('');
  cont.onclick=e=>{
    const item=e.target.closest('.milestone-item'); if(!item) return;
    let list=lsGet(LS.MILESTONES,[]);
    list=list.includes(item.dataset.id)?list.filter(i=>i!==item.dataset.id):[...list,item.dataset.id];
    lsSet(LS.MILESTONES,list); renderMilestones(cont);
  };
}

function renderBoltView(cont){
  const scores=lsGet(LS.BOLT,[]);
  const boltBadge=s=>{
    if(s<10) return`<span class="bolt-badge" style="background:#fee2e2;color:#991b1b">Poor</span>`;
    if(s<20) return`<span class="bolt-badge" style="background:#fef3c7;color:#92400e">Fair</span>`;
    if(s<30) return`<span class="bolt-badge" style="background:#d1fae5;color:#065f46">Good</span>`;
    return`<span class="bolt-badge" style="background:#dbeafe;color:#1d4ed8">Excellent</span>`;
  };
  cont.innerHTML=`
    <div class="bolt-score-input card card-pad">
      <h3>Log BOLT Score</h3>
      <p style="font-size:13px;color:var(--text-2);margin-top:6px;line-height:1.5">After normal exhale, pinch nose — hold until first urge to breathe.</p>
      <div class="bolt-number-row">
        <input type="number" id="bolt-input" class="bolt-input" min="0" max="120" placeholder="0">
        <span class="bolt-unit">sec</span>
        <span id="bolt-badge-live"></span>
      </div>
      <button class="btn-primary" id="btn-save-bolt" style="margin-top:8px">Save</button>
    </div>
    <div class="bolt-log" style="margin-top:16px">
      <h3 style="margin-bottom:10px">History</h3>
      ${scores.length===0?'<p class="text-sm text-3">No scores yet.</p>':scores.slice().reverse().map(s=>`<div class="bolt-log-item"><span>${s.date}</span><span style="font-weight:700">${s.seconds}s</span>${boltBadge(s.seconds)}</div>`).join('')}
    </div>`;
  document.getElementById('bolt-input')?.addEventListener('input',e=>{
    const val=parseInt(e.target.value,10);
    const badge=document.getElementById('bolt-badge-live');
    if(badge) badge.innerHTML=isNaN(val)||val<0?'':boltBadge(val);
  });
  document.getElementById('btn-save-bolt')?.addEventListener('click',()=>{
    const val=parseInt(document.getElementById('bolt-input')?.value,10);
    if(isNaN(val)||val<0||val>120){showToast('Enter 0-120s');return;}
    const arr=lsGet(LS.BOLT,[]); arr.push({date:isoDate(new Date()),seconds:val});
    lsSet(LS.BOLT,arr); showToast('BOLT: '+val+'s saved!'); renderBoltView(cont);
  });
}

/* ──────────────────────────────────────────────────────────────
   14. EDIT VIEW
─────────────────────────────────────────────────────────────── */
let activeEditTab='exercises';
function renderEditView(){
  if(!App.dataReady) return;
  renderEditTab(activeEditTab);
  const eTabs=document.getElementById('edit-tabs');
  if(eTabs) eTabs.onclick=e=>{
    const btn=e.target.closest('.tab-btn'); if(!btn) return;
    activeEditTab=btn.dataset.tab;
    document.querySelectorAll('#edit-tabs .tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===activeEditTab));
    renderEditTab(activeEditTab);
  };
}
function renderEditTab(tab){
  const cont=document.getElementById('edit-content');
  if(tab==='exercises') renderEditExercises(cont);
  if(tab==='sessions')  renderEditSessions(cont);
  if(tab==='backup')    renderEditBackup(cont);
}

function renderEditExercises(cont){
  const all=[...App.kineto.exercises,...App.strength.exercises];
  cont.innerHTML=`
    <div class="edit-section-title">All Exercises (${all.length})</div>
    ${all.map(ex=>`
      <div class="edit-exercise-item">
        <span class="edit-exercise-id text-3">${ex.id}</span>
        <span class="edit-exercise-name">${ex.name}</span>
        <button class="btn-edit-ex" data-action="edit-ex" data-id="${ex.id}">Edit</button>
      </div>`).join('')}
    <button class="btn-add" id="btn-add-exercise">+ Add Exercise</button>`;
  cont.onclick=e=>{
    const btn=e.target.closest('[data-action]'); if(!btn) return;
    if(btn.dataset.action==='edit-ex') openEditExerciseModal(btn.dataset.id);
    if(btn.id==='btn-add-exercise')    openAddExerciseModal();
  };
}

function renderEditSessions(cont){
  const phaseNames={1:'Foundation',2:'Progression',3:'Advanced'};
  cont.innerHTML=[1,2,3].map(p=>`
    <div style="margin-bottom:20px">
      <div class="edit-section-title">Phase ${p} — ${phaseNames[p]}</div>
      <div class="session-block-label">Kinetotherapy</div><div class="session-id-list">${(App.kineto.sessions['phase'+p]||[]).join(' → ')}</div>
      <div class="session-block-label">Strength A</div><div class="session-id-list">${(App.strength.sessions.dayA?.['phase'+p]||[]).join(' → ')}</div>
      <div class="session-block-label">Strength B</div><div class="session-id-list">${(App.strength.sessions.dayB?.['phase'+p]||[]).join(' → ')}</div>
      <div class="session-block-label">Strength C</div><div class="session-id-list">${(App.strength.sessions.dayC?.['phase'+p]||[]).join(' → ')}</div>
      <div class="session-block-label">Cardio</div><div class="session-id-list">${App.cardio.intervalProtocols?.find(p2=>p2.id===CARDIO_PHASE_PROTOCOL[p])?.name||''}</div>
    </div>`).join('');
}

function renderEditBackup(cont){
  cont.innerHTML=`
    <div class="backup-section"><h3 style="margin-bottom:8px">Export</h3><p>Download all logs as JSON.</p><button class="btn-secondary" id="btn-export">Export Backup</button></div>
    <div class="divider"></div>
    <div class="backup-section"><h3 style="margin-bottom:8px">Import</h3><p>Merge a previous backup.</p><input type="file" id="import-file" accept=".json" style="display:none"><button class="btn-secondary" id="btn-import">Import Backup</button></div>
    <div class="divider"></div>
    <div class="backup-section"><h3 style="margin-bottom:8px;color:var(--danger)">Clear</h3><p>Delete all workout logs.</p><button class="btn-secondary" id="btn-clear" style="color:var(--danger);border-color:var(--danger)">Clear Logs</button></div>`;
  document.getElementById('btn-export')?.addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),logs:getLogs(),bolt:lsGet(LS.BOLT,[]),milestones:lsGet(LS.MILESTONES,[]),custom:lsGet(LS.CUSTOM,[])},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='spinesync-'+isoDate(new Date())+'.json';a.click();URL.revokeObjectURL(url);
    showToast('Exported!');
  });
  document.getElementById('btn-import')?.addEventListener('click',()=>document.getElementById('import-file')?.click());
  document.getElementById('import-file')?.addEventListener('change',e=>{
    const file=e.target.files?.[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const d=JSON.parse(ev.target.result);
        if(d.logs){const ex=getLogs();lsSet(LS.LOGS,[...ex,...d.logs.filter(l=>!ex.find(e=>e.date===l.date&&e.type===l.type))]);}
        if(d.bolt){const ex=lsGet(LS.BOLT,[]);lsSet(LS.BOLT,[...ex,...d.bolt.filter(b=>!ex.find(e=>e.date===b.date))]);}
        if(d.milestones) lsSet(LS.MILESTONES,d.milestones);
        showToast('Imported!');renderEditBackup(cont);
      }catch{showToast('Invalid file!');}
    };
    reader.readAsText(file);
  });
  document.getElementById('btn-clear')?.addEventListener('click',()=>{
    if(!confirm('Delete all logs? Cannot undo.')) return;
    lsSet(LS.LOGS,[]);showToast('Logs cleared.');
  });
}

/* ── Modals ──────────────────────────────────── */
function openModal(html){
  const ov=document.getElementById('modal-overlay'),cont=document.getElementById('modal-content');
  cont.innerHTML=html;ov.classList.remove('hidden');
  ov.addEventListener('click',e=>{if(e.target===ov)closeModal();},{once:true});
}
function closeModal(){ document.getElementById('modal-overlay').classList.add('hidden'); }

function openEditExerciseModal(exId){
  const ex=App.exercises[exId]; if(!ex) return;
  openModal(`
    <button class="modal-close" onclick="window.closeModal()">x</button>
    <div class="modal-title">Edit — ${ex.name}</div>
    <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="ex-name" value="${ex.name}"></div>
    <div class="form-group"><label class="form-label">Image / GIF URL</label><input class="form-input" id="ex-gif" value="${ex.gifUrl||''}" placeholder="https://…"></div>
    <div class="form-group"><label class="form-label">Instructions</label><textarea class="form-textarea" id="ex-instructions">${ex.instructions||''}</textarea></div>
    <div class="form-group"><label class="form-label">Sets</label><input class="form-input" id="ex-sets" type="number" min="1" value="${ex.sets}"></div>
    <div class="form-group"><label class="form-label">Reps / Duration (sec)</label><input class="form-input" id="ex-reps" type="number" min="0" value="${ex.repsPerSet??ex.durationSec??0}"></div>
    <button class="btn-primary" id="btn-save-ex" style="margin-top:4px">Save</button>`);
  document.getElementById('btn-save-ex')?.addEventListener('click',()=>{
    const updated={...ex,
      name:document.getElementById('ex-name').value.trim()||ex.name,
      gifUrl:document.getElementById('ex-gif').value.trim()||null,
      instructions:document.getElementById('ex-instructions').value.trim(),
      sets:parseInt(document.getElementById('ex-sets').value,10)||ex.sets};
    const repVal=parseInt(document.getElementById('ex-reps').value,10);
    if(ex.trackingType==='timed'||ex.trackingType==='bilateral_timed') updated.durationSec=repVal; else updated.repsPerSet=repVal;
    const custom=lsGet(LS.CUSTOM,[]).filter(e=>e.id!==ex.id);custom.push(updated);lsSet(LS.CUSTOM,custom);
    App.exercises[ex.id]=updated;delete App.imgCache[ex.id];closeModal();showToast('Saved!');
  });
}

function openAddExerciseModal(){
  openModal(`
    <button class="modal-close" onclick="window.closeModal()">x</button>
    <div class="modal-title">Add Exercise</div>
    <div class="form-group"><label class="form-label">ID (unique, e.g. MY-01)</label><input class="form-input" id="new-id" placeholder="MY-01"></div>
    <div class="form-group"><label class="form-label">Name</label><input class="form-input" id="new-name"></div>
    <div class="form-group"><label class="form-label">Category</label><select class="form-select" id="new-cat"><option value="warmup">Warmup</option><option value="main" selected>Main</option><option value="cooldown">Cooldown</option></select></div>
    <div class="form-group"><label class="form-label">Tracking Type</label><select class="form-select" id="new-type"><option value="reps">Reps</option><option value="reps_weighted">Reps + Weight</option><option value="bilateral_reps">Bilateral Reps (L/R)</option><option value="timed">Timed</option><option value="bilateral_timed">Bilateral Timed (L/R)</option><option value="breathing">Breathing</option></select></div>
    <div class="form-group"><label class="form-label">Sets</label><input class="form-input" id="new-sets" type="number" min="1" value="3"></div>
    <div class="form-group"><label class="form-label">Reps / Duration (sec)</label><input class="form-input" id="new-reps" type="number" min="0" value="10"></div>
    <div class="form-group"><label class="form-label">Image URL (optional)</label><input class="form-input" id="new-gif" placeholder="https://…"></div>
    <div class="form-group"><label class="form-label">Instructions</label><textarea class="form-textarea" id="new-instructions"></textarea></div>
    <button class="btn-primary" id="btn-save-new">Add Exercise</button>`);
  document.getElementById('btn-save-new')?.addEventListener('click',()=>{
    const id=document.getElementById('new-id').value.trim(),name=document.getElementById('new-name').value.trim();
    if(!id||!name){showToast('ID and Name required');return;}
    if(App.exercises[id]){showToast('ID "'+id+'" already exists');return;}
    const type=document.getElementById('new-type').value,reps=parseInt(document.getElementById('new-reps').value,10)||10;
    const newEx={id,name,category:document.getElementById('new-cat').value,phaseMin:1,trackingType:type,
      sets:parseInt(document.getElementById('new-sets').value,10)||3,
      repsPerSet:(type==='timed'||type==='bilateral_timed')?null:reps,
      durationSec:(type==='timed'||type==='bilateral_timed')?reps:null,
      startWeightKg:type==='reps_weighted'?5:null,
      gifUrl:document.getElementById('new-gif').value.trim()||null,
      instructions:document.getElementById('new-instructions').value.trim(),
      cues:[],warning:null,_custom:true};
    App.exercises[id]=newEx;const cs=lsGet(LS.CUSTOM,[]).filter(e=>e.id!==id);cs.push(newEx);lsSet(LS.CUSTOM,cs);
    closeModal();showToast('Exercise added!');
  });
}

/* ──────────────────────────────────────────────────────────────
   15. THEME
─────────────────────────────────────────────────────────────── */
function applyTheme(theme){
  document.documentElement.dataset.theme=theme;
  const btn=document.getElementById('btn-theme');
  if(btn) btn.textContent=theme==='dark'?'☀️':'🌙';
  lsSet(LS.PREFS,{...lsGet(LS.PREFS,{}),theme});
}
function initTheme(){
  const stored=lsGet(LS.PREFS,{}).theme;
  const prefer=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  applyTheme(stored||prefer);
}

/* ──────────────────────────────────────────────────────────────
   16. INIT
─────────────────────────────────────────────────────────────── */
async function init(){
  initTheme();

  document.getElementById('bottom-nav')?.addEventListener('click',e=>{
    const btn=e.target.closest('.nav-btn'); if(!btn) return;
    if(WS.active){
      if(btn.dataset.view!=='today'){showToast('Finish or quit your workout first');return;}
      document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
      document.getElementById('view-workout').classList.add('active');
      return;
    }
    Router.navigate(btn.dataset.view);
  });

  document.getElementById('btn-theme')?.addEventListener('click',()=>{
    applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
  });

  document.getElementById('modal-overlay')?.addEventListener('click',e=>{
    if(e.target.id==='modal-overlay') closeModal();
  });

  window.closeModal=closeModal;
  window._showImg=showFullscreenImg;

  await loadData();
  Router.navigate('today');

  fetchExerciseImages().catch(()=>{});

  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
}

document.addEventListener('DOMContentLoaded',init);
