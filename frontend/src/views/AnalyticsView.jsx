import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, Download, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useFocus } from '../context/FocusContext';
import { useTimer } from '../context/TimerContext';
import { apiService } from '../services/api';
import { activityDays, activityLabels, recentDays } from '../lib/activity';
import { dailyTotals, dayKey, durationLabel } from '../lib/timer';
import './AnalyticsView.css';

const readableDate = date => new Date(`${date}T12:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' });
const TARGET_KEY = 'focus_os_daily_target';

export function AnalyticsView() {
  const { state, addTimelineItem, deleteTimelineItem } = useFocus();
  const { sessions, now } = useTimer();
  const today = dayKey(now);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(today);
  const [retry, setRetry] = useState(0);
  const [history, setHistory] = useState({ status: 'loading', tasks: [], blocks: [], range: '' });
  const [target, setTarget] = useState(() => {
    try { const value = Number(localStorage.getItem(TARGET_KEY)); return [60, 120, 240].includes(value) ? value : 120; }
    catch { return 120; }
  });
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Learning');
  const [newDate, setNewDate] = useState(today);
  const [newNote, setNewNote] = useState('');
  const end = new Date(`${today}T12:00:00`);
  end.setDate(end.getDate() - offset);
  const endKey = dayKey(end);
  const dates = useMemo(() => recentDays(endKey), [endKey]);
  const startKey = dates[0];
  const range = `${startKey}/${endKey}`;
  useEffect(() => {
    const controller = new AbortController();
    setHistory({ status: 'loading', tasks: [], blocks: [], range });
    apiService.getActivityHistory(startKey, endKey, controller.signal).then(data => {
      if (!controller.signal.aborted) setHistory({ status: 'ready', tasks: data.microTasks, blocks: data.timeBlocks, range });
    }).catch(() => {
      if (!controller.signal.aborted) setHistory({ status: 'error', tasks: [], blocks: [], range });
    });
    return () => controller.abort();
  }, [startKey, endKey, range, retry]);

  const available = history.status === 'ready' && history.range === range;
  const days = useMemo(() => activityDays({ dates, tasks: available ? history.tasks : [], blocks: available ? history.blocks : [], sessions, targetMinutes: target, today, historyAvailable: available }), [dates, available, history.tasks, history.blocks, sessions, target, today]);
  const chosen = days.find(d => d.date === selected) || days[days.length - 1];
  const selectedSessions = sessions.map(s => ({ ...s, dayTime: dailyTotals([s])[chosen.date] || 0 })).filter(s => s.dayTime > 0);
  const completedItems = [...chosen.tasks.map(t => ({ ...t, kind: 'Task', done: t.completed })), ...chosen.blocks.map(b => ({ ...b, kind: `Schedule · ${durationLabel((Number(b.durationMinutes) || 0) * 60000)}`, done: b.status === 'completed' }))];
  const move = direction => { setOffset(value => Math.max(0, value + direction * 28)); };
  const exportHistory = () => {
    const blob = new Blob([JSON.stringify({ start: startKey, end: endKey, targetMinutes: target, historyAvailable: available, days, sessions }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `focus-history-${endKey}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const addMoment = e => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;
    addTimelineItem({ title: newTitle.trim(), date: newDate, category: newCategory, note: newNote.trim() });
    setNewTitle(''); setNewNote('');
  };
  return <div className="analytics-page page-enter">
    <header className="analytics-header"><div><span className="focus-eyebrow">YOUR DAYS, AT A GLANCE</span><h1>Make the days count.</h1><p>See where your time went, and build on the good days.</p></div><button className="analytics-action" onClick={exportHistory}><Download size={17} /> Export</button></header>

    <section className="activity-wall" aria-labelledby="activity-title">
      <div className="analytics-section-heading"><div><h2 id="activity-title">Your activity wall</h2><p>{readableDate(startKey)} – {readableDate(endKey)}, {end.getFullYear()}</p></div><div className="activity-navigation"><button aria-label="Previous 28 days" onClick={() => move(1)}><ArrowLeft size={18} /></button>{offset > 0 && <button onClick={() => setOffset(0)}>Recent</button>}<button aria-label="Next 28 days" disabled={offset === 0} onClick={() => move(-1)}><ArrowRight size={18} /></button></div></div>
      <div className="activity-options"><div className="activity-legend">{['prime', 'semi', 'wasted'].map(status => <span key={status}><i className={`activity-swatch ${status}`} />{activityLabels[status]}</span>)}</div><label>Daily study target <select value={target} onChange={e => { const value = Number(e.target.value); setTarget(value); try { localStorage.setItem(TARGET_KEY, String(value)); } catch { /* Selection still works for this visit. */ } }}><option value={60}>1 hour</option><option value={120}>2 hours</option><option value={240}>4 hours</option></select></label></div>
      {history.status === 'loading' && <p role="status" className="history-notice">Loading your past tasks and schedules…</p>}
      {history.status === 'error' && <div role="status" className="history-notice">Past tasks and schedules couldn’t load. Saved study sessions are still shown; other days stay unclassified.<button className="analytics-action" onClick={() => setRetry(v => v + 1)}><RefreshCw size={15} /> Retry</button></div>}
      <div className="activity-days" aria-label="28 days of activity">{days.map(day => <button key={day.date} className={`activity-day ${day.status} ${chosen.date === day.date ? 'selected' : ''}`} aria-pressed={chosen.date === day.date} aria-label={`${readableDate(day.date)}: ${activityLabels[day.status]}, ${durationLabel(day.focus)} studied, ${day.completed} of ${day.planned} planned items completed`} onClick={() => setSelected(day.date)}><span>{new Date(`${day.date}T12:00:00`).toLocaleDateString([], { weekday: 'short' })}</span><strong>{Number(day.date.slice(-2))}</strong><small>{day.date === today ? 'Today' : new Date(`${day.date}T12:00:00`).toLocaleDateString([], { month: 'short' })}</small></button>)}</div>
      <p className="activity-rule"><b>Prime:</b> study target met or all planned tasks and blocks done. <b>Semi:</b> some recorded progress. <b>Wasted:</b> a past day with none. Today stays open until progress is recorded. Colors describe your records, not untracked time.</p>
      <div className="activity-summary"><div><strong>{days.filter(d => d.status === 'prime').length}</strong><span>prime days</span></div><div><strong>{durationLabel(days.reduce((sum, d) => sum + d.focus, 0))}</strong><span>study time</span></div><div><strong>{available ? days.reduce((sum, d) => sum + d.completed, 0) : '—'}</strong><span>planned items done</span></div></div>
    </section>

    <section className="activity-detail" aria-labelledby="day-detail-title"><div className="analytics-section-heading"><div><span className="focus-eyebrow">THE DAILY RECORD</span><h2 id="day-detail-title">{chosen.date === today ? 'Today' : new Date(`${chosen.date}T12:00:00`).toLocaleDateString([], { weekday: 'long' })}, {readableDate(chosen.date)}</h2></div><span className="day-status"><i className={`activity-swatch ${chosen.status}`} />{activityLabels[chosen.status]}</span></div>
      <p className="day-description">{durationLabel(chosen.focus)} studied{available ? ` · ${chosen.completed}/${chosen.planned} planned items complete` : ''}{chosen.scheduledTime > 0 ? ` · ${durationLabel(chosen.scheduledTime)} of scheduled blocks completed` : ''}</p>
      <div className="daily-records">{selectedSessions.map(s => <div className="daily-record" key={s.id}><Clock size={18} /><div><strong>{s.title}</strong><small>Study · {s.status === 'completed' ? 'Completed' : 'Ended early'}</small></div><span>{durationLabel(s.dayTime)}</span></div>)}{completedItems.map(item => <div className="daily-record" key={`${item.kind}-${item.id}`}>{item.done ? <Check size={18} /> : <span className="record-pending" />}<div><strong>{item.title}</strong><small>{item.kind}</small></div><span>{item.done ? 'Done' : item.status === 'in-progress' ? 'In progress' : 'Pending'}</span></div>)}</div>
      {!selectedSessions.length && !completedItems.length && <p className="day-empty">{available ? chosen.date === today ? 'Your day is still unfolding. Start a focus session or complete a planned task.' : 'No study sessions or planned tasks were recorded for this day.' : 'No saved study sessions for this day. Task history will appear when it loads.'}</p>}
      <p className="activity-footnote">Study time excludes pauses and splits overnight sessions across days. Scheduled block time is shown separately to avoid counting it twice. Habits have no dated history yet and aren’t included in day colors.</p>
    </section>

    <details className="analytics-more"><summary>Goals & life pillars <span>View progress</span></summary><div className="progress-list">{state.goals.length === 0 && state.pillars.length === 0 && <p>No goals or pillars yet.</p>}{state.goals.map(goal => <div className="daily-record" key={goal.id}><div><strong>{goal.title}</strong><small>Goal</small></div><span>{goal.column === 'complete' ? 'Complete' : `${goal.progress || 0}%`}</span></div>)}{state.pillars.map(pillar => <div className="daily-record" key={pillar.id}><div><strong>{pillar.name}</strong><small>Life pillar</small></div><span>{(pillar.milestones || []).filter(m => m.completed).length}/{(pillar.milestones || []).length} milestones</span></div>)}</div></details>

    <details className="analytics-more"><summary>Milestone journal <span>{state.milestonesTimeline.length} moments</span></summary><form className="milestone-form" onSubmit={addMoment}><label>Moment<input required maxLength={160} value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What moved you forward?" /></label><div><label>Date<input required type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></label><label>Category<select value={newCategory} onChange={e => setNewCategory(e.target.value)}>{['Learning', 'Career', 'Health', 'Finance', 'Social'].map(c => <option key={c}>{c}</option>)}</select></label></div><label>Note<input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="A little context (optional)" /></label><button className="analytics-action" type="submit"><Plus size={16} /> Log moment</button></form>{state.milestonesTimeline.length === 0 && <p className="day-empty">Add your first moment worth remembering.</p>}{state.milestonesTimeline.map(item => <div className="daily-record" key={item.id}><div><strong>{item.title}</strong><small>{String(item.date).slice(0, 10)} · {item.category}</small>{item.note && <p>{item.note}</p>}</div><button className="analytics-action" aria-label={`Delete ${item.title}`} onClick={() => deleteTimelineItem(item.id)}><Trash2 size={16} /></button></div>)}</details>
  </div>;
}
