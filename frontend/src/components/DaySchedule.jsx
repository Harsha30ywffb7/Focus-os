import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react';
import { useFocus } from '../context/FocusContext';
import { dayKey } from '../lib/timer';
import { layoutEvents, minuteOfDay, snapStart, timeOfDay } from '../lib/schedule';
import './DaySchedule.css';

const HOUR_HEIGHT = 72;
export function DaySchedule() {
  const { state, changeSelectedDate, addTimeBlock, updateTimeBlock, deleteTimeBlock } = useFocus();
  const date = state.selectedDate;
  const [now, setNow] = useState(new Date());
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(null);
  const scroller = useRef(null);
  const dialog = useRef(null);
  const titleInput = useRef(null);
  const events = layoutEvents(state.timeBlocks);
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 7 * HOUR_HEIGHT;
  }, [date, state.isDateLoading]);
  const editorOpen = draft !== null;
  useEffect(() => {
    if (editorOpen) { dialog.current?.showModal(); titleInput.current?.focus(); }
    else dialog.current?.close();
  }, [editorOpen]);
  const navigate = delta => { const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + delta); changeSelectedDate(dayKey(next)); };
  const create = minutes => { setError(''); setDraft({ title: '', timeSlot: timeOfDay(minutes), durationMinutes: Math.min(60, 1440 - minutes), category: 'Deep Work', status: 'upcoming', date }); };
  const save = async e => {
    e.preventDefault();
    if (busy) return;
    if (!draft.title.trim()) return;
    const start = minuteOfDay(draft.timeSlot);
    const duration = Number(draft.durationMinutes);
    if (start === null || !Number.isInteger(duration) || duration < 15 || duration > 1440 || start + duration > 1440) {
      setError('Choose at least 15 minutes and an end time no later than midnight.'); return;
    }
    setBusy(true); setError('');
    const data = { ...draft, title: draft.title.trim(), durationMinutes: duration };
    const result = draft.id ? await updateTimeBlock(draft.id, data) : await addTimeBlock(data);
    setBusy(false);
    if (result) setDraft(null);
    else setError('Couldn’t save this block. Check your connection and try again.');
  };
  const remove = async () => {
    setBusy(true);
    const result = await deleteTimeBlock(draft.id);
    setBusy(false);
    if (result) setDraft(null);
    else if (result === null) setError('Couldn’t delete this block. Please try again.');
  };
  const drop = async e => {
    e.preventDefault();
    if (!drag || busy) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const minutes = snapStart((e.clientY - rect.top) / HOUR_HEIGHT * 60 - drag.offset, drag.durationMinutes);
    const block = drag; setDrag(null); setBusy(true); setError('');
    const saved = await updateTimeBlock(block.id, { timeSlot: timeOfDay(minutes) });
    setBusy(false);
    if (!saved) setError('Couldn’t move this block. Its original time has been kept.');
  };
  const today = dayKey(now);
  return <section className="day-schedule" aria-label="Daily time-block calendar">
    <div className="schedule-toolbar"><div className="schedule-title"><h2>Your schedule</h2><p>{new Date(`${date}T12:00:00`).toLocaleDateString([], { month: 'long', year: 'numeric' })}</p></div><div className="schedule-navigation"><button onClick={() => changeSelectedDate(today)}>Today</button><button aria-label="Previous day" onClick={() => navigate(-1)}><ChevronLeft size={18} /></button><button aria-label="Next day" onClick={() => navigate(1)}><ChevronRight size={18} /></button><label className="schedule-date-label"><span className="sr-only">Choose schedule date</span><input type="date" value={date} onChange={e => e.target.value && changeSelectedDate(e.target.value)} /></label></div><button className="schedule-add" onClick={() => create(9 * 60)} disabled={state.isDateLoading}><Plus size={17} /><span>Add block</span></button></div>
    <div className="schedule-day-heading"><span className="schedule-timezone">{Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ')}</span><div><span>{new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: 'long' })}</span><strong className={date === today ? 'is-today' : ''}>{Number(date.slice(-2))}</strong></div><p>Tap a time to plan. Tap a block to edit.<span> Drag blocks to reschedule.</span></p></div>
    {state.dateError && <p role="alert" className="schedule-error">Your schedule couldn’t load. <button onClick={() => changeSelectedDate(date)}>Try again</button></p>}
    {error && !draft && <p role="alert" className="schedule-error">{error}</p>}
    <div ref={scroller} className="schedule-scroll" aria-busy={state.isDateLoading || busy}>
      {state.isDateLoading ? <p role="status" className="schedule-loading">Loading schedule…</p> : <div className="schedule-canvas" style={{ height: HOUR_HEIGHT * 24 }}>
        <div className="schedule-hours" aria-hidden="true">{Array.from({ length: 24 }, (_, hour) => <span key={hour} style={{ top: hour * HOUR_HEIGHT }}>{hour === 0 ? '12 AM' : `${hour > 12 ? hour - 12 : hour} ${hour < 12 ? 'AM' : 'PM'}`}</span>)}</div>
        <div className="schedule-track" onDragOver={e => { if (drag) e.preventDefault(); }} onDrop={drop}>
          {Array.from({ length: 48 }, (_, i) => <button key={i} className={`schedule-time-slot ${i % 2 === 0 ? 'on-hour' : ''}`} style={{ top: i * HOUR_HEIGHT / 2, height: HOUR_HEIGHT / 2 }} aria-label={`Add a block at ${timeOfDay(i * 30)}`} disabled={busy || state.dateError} onClick={() => create(i * 30)} />)}
          {events.map(event => <button key={event.id} className={`schedule-event ${event.status} ${event.duration <= 30 ? 'short-event' : ''}`} style={{ top: event.start / 60 * HOUR_HEIGHT, height: Math.max(18, (event.end - event.start) / 60 * HOUR_HEIGHT - 2), left: `${event.column / event.columns * 100}%`, width: `calc(${100 / event.columns}% - 5px)` }} disabled={busy} draggable={!busy} onDragStart={e => { e.dataTransfer.setData('text/plain', event.id); e.dataTransfer.effectAllowed = 'move'; setDrag({ ...event, durationMinutes: event.duration, offset: (e.clientY - e.currentTarget.getBoundingClientRect().top) / HOUR_HEIGHT * 60 }); }} onDragEnd={() => setDrag(null)} onClick={() => { setError(''); setDraft({ ...event, durationMinutes: event.duration }); }} aria-label={`${event.title}, ${event.timeSlot} to ${timeOfDay(event.end)}, ${event.status}. Edit block.`}><strong>{event.title}</strong><span>{event.timeSlot} – {timeOfDay(event.end)}</span>{event.duration >= 60 && <small>{event.category || 'General'} · {event.status === 'completed' ? 'Completed' : event.status === 'in-progress' ? 'In progress' : 'Planned'}</small>}</button>)}
          {date === today && <div className="schedule-now" style={{ top: (now.getHours() * 60 + now.getMinutes()) / 60 * HOUR_HEIGHT }} aria-label={`Current time ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}><i /></div>}
        </div>
      </div>}
    </div>
    <dialog ref={dialog} aria-label="Time block editor" className="schedule-dialog" onCancel={e => { e.preventDefault(); if (!busy) setDraft(null); }} onClick={e => { if (e.target === dialog.current && !busy) setDraft(null); }}>
      {draft && <form onSubmit={save}><header><div><span className="focus-eyebrow">{new Date(`${draft.date}T12:00:00`).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span><h3>{draft.id ? 'Edit time block' : 'Make time for something'}</h3></div><button type="button" aria-label="Close time block editor" disabled={busy} onClick={() => setDraft(null)}><X size={20} /></button></header>
        <label>Title<input ref={titleInput} required maxLength={160} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Study mathematics" /></label>
        <div className="schedule-form-row"><label>Start time<input required type="time" value={draft.timeSlot} onChange={e => setDraft({ ...draft, timeSlot: e.target.value })} /></label><label>Duration (minutes)<input type="number" required min="15" max="1440" step="1" value={draft.durationMinutes} onChange={e => setDraft({ ...draft, durationMinutes: e.target.value })} /></label></div>
        <div className="schedule-form-row"><label>Category<input value={draft.category || ''} maxLength={60} onChange={e => setDraft({ ...draft, category: e.target.value })} /></label><label>Status<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}><option value="upcoming">Planned</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></label></div>
        {error && <p role="alert" className="schedule-error">{error}</p>}
        <footer>{draft.id && <button type="button" className="schedule-delete" disabled={busy} onClick={remove}><Trash2 size={16} /> Delete</button>}<button type="button" disabled={busy} onClick={() => setDraft(null)}>Cancel</button><button type="submit" disabled={busy || !draft.title.trim()} className="schedule-add">{busy ? 'Saving…' : 'Save block'}</button></footer>
      </form>}
    </dialog>
  </section>;
}
