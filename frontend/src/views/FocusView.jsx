import { useState } from 'react';
import { ArrowUpRight, BookOpen, CheckCircle2, Download, Pause, Play, Timer, Maximize2, Minimize2 } from 'lucide-react';
import { useTimer } from '../context/TimerContext';
import { useFocus } from '../context/FocusContext';
import { clockLabel, dailyTotals, dayKey, durationLabel, elapsed } from '../lib/timer';
import './FocusView.css';

export function FocusSummary() {
  const { sessions, timer, now } = useTimer();
  const { setActiveView } = useFocus();
  const total = dailyTotals(sessions)[dayKey(now)] || 0;
  return <button className="focus-summary" onClick={() => setActiveView('focus')}><span className="focus-summary-icon"><Timer size={24} /></span><span><strong>{timer ? `${clockLabel(timer.duration - elapsed(timer, now))} remaining` : 'Make room for deep focus'}</strong><small>{durationLabel(total)} recorded today · Open your study timer</small></span><ArrowUpRight size={20} /></button>;
}
export function StudyHistory() {
  const { sessions, now } = useTimer();
  const [date, setDate] = useState(dayKey());
  const totals = dailyTotals(sessions);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() - 6 + i); return dayKey(d); });
  const max = Math.max(3600000, ...days.map(d => totals[d] || 0));
  const selected = sessions.filter(s => s.intervals.some(([a, b]) => dayKey(a) <= date && dayKey(b - 1) >= date));
  const exportSessions = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ sessions, dailyTotals: totals }, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'focus-study-history.json'; a.click(); URL.revokeObjectURL(url);
  };
  return <section className="study-history">
    <div className="focus-section-heading"><div><span className="focus-eyebrow">YOUR TIME, WELL SPENT</span><h2>A little progress, every day.</h2></div><button className="focus-secondary" onClick={exportSessions} aria-label="Export study history"><Download size={16} /> Export</button></div>
    <div className="study-stats"><div><span>Today</span><strong>{durationLabel(totals[dayKey(now)] || 0)}</strong></div><div><span>Last 7 days</span><strong>{durationLabel(days.reduce((sum, d) => sum + (totals[d] || 0), 0))}</strong></div><div><span>Sessions completed</span><strong>{sessions.filter(s => s.status === 'completed').length}</strong></div></div>
    <div className="study-chart" aria-label="Study time over the last seven days">{days.map(d => <button key={d} className={d === date ? 'selected' : ''} onClick={() => setDate(d)} aria-label={`${d}: ${durationLabel(totals[d] || 0)}`}><small>{durationLabel(totals[d] || 0)}</small><div className="study-bar-track"><div style={{ height: `${Math.max(3, (totals[d] || 0) / max * 100)}%` }} /></div><span>{new Date(`${d}T12:00:00`).toLocaleDateString([], { weekday: 'short' })}</span></button>)}</div>
    <div className="focus-section-heading session-heading"><h3>Session journal <span>{durationLabel(totals[date] || 0)}</span></h3><input aria-label="Session history date" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
    {!selected.length ? <div className="study-empty"><BookOpen size={26} /><strong>Your focus starts here.</strong><p>No sessions for this day. Finish a timer to see your time here.</p></div> : <div className="session-list">{selected.map(s => <div className="session-row" key={s.id}><CheckCircle2 size={20} /><div><strong>{s.title}</strong><small>{new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {s.status === 'completed' ? 'Completed' : 'Ended early'}{Object.keys(dailyTotals([s])).length > 1 ? ' · Spans multiple days' : ''}</small></div><b>{durationLabel(dailyTotals([s])[date] || 0)}</b></div>)}</div>}
    <p className="storage-note">Saved in this browser. Export your journal to keep a backup. Pauses are excluded; overnight time is split between days.</p>
  </section>;
}
export function FocusView() {
  const { timer, now, completed, storageError, start, pause, resume, finish } = useTimer();
  const [minutes, setMinutes] = useState(120);
  const [title, setTitle] = useState('');
  const [immersive, setImmersive] = useState(false);
  const spent = elapsed(timer, now);
  const remaining = timer ? timer.duration - spent : (Number(minutes) || 0) * 60000;
  const valid = Number(minutes) >= 1 && Number(minutes) <= 720 && Number.isInteger(Number(minutes));
  return <div className={`focus-page ${immersive ? 'focus-immersive' : ''}`}>
    <div className="focus-page-heading"><div><span className="focus-eyebrow">FOCUS SPACE</span><h1>One thing at a time.</h1><p>Set your intention. Settle in. Make the time yours.</p></div><span className="focus-date">{new Date(now).toLocaleDateString([], { month: 'long', day: 'numeric', weekday: 'long' })}</span></div>
    {storageError && <p role="alert" className="focus-warning">Browser storage is unavailable. Keep this page open and export your journal before leaving.</p>}
    {completed && !timer && <p role="status" className="focus-success"><CheckCircle2 size={18} /> “{completed}” is complete. Your study time has been recorded.</p>}
    <div className="focus-layout"><section className="timer-card"><div className="timer-card-top"><span><span className={`status-dot ${timer?.runningSince != null ? 'running' : ''}`} />{timer ? timer.runningSince === null ? 'PAUSED' : 'FOCUS IN PROGRESS' : 'READY WHEN YOU ARE'}</span><button className="focus-icon" onClick={() => setImmersive(!immersive)} aria-label={immersive ? 'Exit focus mode' : 'Enter focus mode'}>{immersive ? <Minimize2 size={19} /> : <Maximize2 size={19} />}</button></div>
    <div className="timer-orbit" style={{ '--progress': `${timer ? spent / timer.duration * 360 : 0}deg` }}><div><span className="timer-caption">{timer ? timer.title : 'A moment for your mind'}</span><div className="timer-digits" role="timer" aria-label="Time remaining">{clockLabel(remaining)}</div><span className="timer-caption">{timer ? `${durationLabel(spent)} of ${durationLabel(timer.duration)}` : 'hours : minutes : seconds'}</span></div></div>
    {!timer ? <form className="timer-setup" onSubmit={e => { e.preventDefault(); if (valid) start(title, Number(minutes)); }}><label htmlFor="study-title">What are you focusing on?</label><input id="study-title" maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mathematics · Chapter 04" /><div className="timer-presets">{[25, 50, 60, 120].map(m => <button type="button" key={m} aria-pressed={Number(minutes) === m} className={Number(minutes) === m ? 'active' : ''} onClick={() => setMinutes(m)}>{m < 60 ? `${m} min` : `${m / 60} ${m === 60 ? 'hour' : 'hours'}`}</button>)}</div><label className="custom-duration" htmlFor="study-duration">Custom duration <span><input id="study-duration" type="number" min="1" max="720" step="1" required value={minutes} onChange={e => setMinutes(e.target.value)} /> min</span></label><button className="focus-primary" disabled={!valid}><Play size={18} fill="currentColor" /> Start focusing</button></form> : <div className="timer-controls"><button className="focus-primary" onClick={timer.runningSince === null ? resume : pause}>{timer.runningSince === null ? <Play size={18} /> : <Pause size={18} />}{timer.runningSince === null ? 'Resume session' : 'Pause session'}</button><button className="focus-secondary" onClick={finish}>End & save elapsed time</button><p>Take your time. Your timer continues when you leave this screen.</p></div>}
    <div className="timer-footer"><BookOpen size={15} /> Small sessions. Lasting progress.</div></section><aside className="focus-side"><StudyHistory /></aside></div>
  </div>;
}
