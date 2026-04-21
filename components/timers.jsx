import { useState, useEffect, useRef } from "react";
import { T } from "../constants.js";

function playCompletionBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
    try { if (typeof navigator.vibrate === "function") navigator.vibrate([150, 80, 150]); } catch {}
  } catch {}
}

export function formatElapsed(ms) {
  if (ms < 0) ms = 0;
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export function useElapsed(startedAt, endedAt) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!startedAt || endedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt, endedAt]);
  if (!startedAt) return null;
  return (endedAt ? new Date(endedAt).getTime() : now) - new Date(startedAt).getTime();
}

export function GroupTimerBadge({ startedAt, endedAt }) {
  const elapsed = useElapsed(startedAt, endedAt);
  if (elapsed === null) return null;
  const running = !!startedAt && !endedAt;
  return (
    <span style={{ fontSize:11,fontVariantNumeric:"tabular-nums",fontWeight:700,color:running?T.accent:T.amber+"88",background:running?T.accent+"0c":T.amber+"0a",border:`1px solid ${running?T.accent+"30":T.amber+"22"}`,borderRadius:6,padding:"2px 8px",flexShrink:0 }}>
      ⏱ {formatElapsed(elapsed)}
    </span>
  );
}

export function GroupSessionTimer({ groupName, color, startedAt, endedAt }) {
  const elapsed = useElapsed(startedAt, endedAt);
  if (elapsed === null) return null;
  const running = !!startedAt && !endedAt;
  return (
    <div style={{ display:"flex",alignItems:"center",gap:10,background:T.surface,border:`1px solid ${running?`${color}40`:T.amber+"30"}`,borderRadius:12,padding:"9px 14px",margin:"0 16px 8px" }}>
      <div style={{ width:7,height:7,borderRadius:"50%",background:running?color:T.amber,flexShrink:0,...(running?{animation:"spinePulse 1.5s ease-in-out infinite"}:{}) }} />
      <span style={{ fontSize:11,color:T.textMuted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" }}>Group Time</span>
      <span style={{ flex:1,textAlign:"right",fontVariantNumeric:"tabular-nums",fontSize:18,fontWeight:900,color:running?color:T.amber,letterSpacing:"0.04em" }}>{formatElapsed(elapsed)}</span>
      {!running && <span style={{ fontSize:10,color:T.amber,fontWeight:700 }}>DONE ✓</span>}
    </div>
  );
}

export function TotalSessionTimer({ groupTimers }) {
  const [now, setNow] = useState(Date.now());
  const anyRunning = Object.values(groupTimers || {}).some(t => t.startedAt && !t.endedAt);
  useEffect(() => {
    if (!anyRunning) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [anyRunning]);

  const entries = Object.values(groupTimers || {}).filter(t => t.startedAt);
  if (entries.length === 0) return null;

  const totalMs = entries.reduce((sum, t) => {
    const end = t.endedAt ? new Date(t.endedAt).getTime() : now;
    return sum + Math.max(0, end - new Date(t.startedAt).getTime());
  }, 0);
  const allDone = entries.length > 0 && entries.every(t => t.endedAt);

  const prevAllDone = useRef(false);
  useEffect(() => {
    if (allDone && !prevAllDone.current) playCompletionBeep();
    prevAllDone.current = allDone;
  }, [allDone]);

  return (
    <div style={{ display:"flex",alignItems:"center",gap:10,background:T.card,border:`1px solid ${allDone?T.amber+"30":T.accent+"30"}`,borderRadius:14,padding:"11px 16px",marginBottom:22,boxShadow:T.shadow }}>
      <div style={{ width:8,height:8,borderRadius:"50%",background:allDone?T.amber:T.accent,flexShrink:0,...(!allDone?{animation:"spinePulse 1.5s ease-in-out infinite"}:{}) }} />
      <span style={{ fontSize:11,color:T.textMuted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" }}>Total Session Time</span>
      <span style={{ flex:1,textAlign:"right",fontVariantNumeric:"tabular-nums",fontSize:22,fontWeight:900,color:allDone?T.amber:T.accent,letterSpacing:"0.04em" }}>{formatElapsed(totalMs)}</span>
      {allDone && <span style={{ fontSize:11,color:T.amber,fontWeight:700 }}>DONE ✓</span>}
    </div>
  );
}
