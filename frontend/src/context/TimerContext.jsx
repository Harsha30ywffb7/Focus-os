import { createContext, useContext, useEffect, useState } from 'react';
import { closeInterval, elapsed } from '../lib/timer';
const TimerContext = createContext(null);
const KEY = 'focus_os_study_v1';
const empty = { timer: null, sessions: [], completed: null };
function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    if (value && Array.isArray(value.sessions) && value.sessions.every(s => Array.isArray(s.intervals)) && (!value.timer || (Number.isFinite(value.timer.duration) && Array.isArray(value.timer.intervals)))) return value;
  } catch { /* Start with an empty journal when storage is unavailable. */ }
  return empty;
}
export function TimerProvider({ children }) {
  const [data, setData] = useState(read);
  const [now, setNow] = useState(Date.now());
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [data]);
  useEffect(() => {
    const tick = () => {
      const time = Date.now();
      setNow(time);
      setData(prev => {
        if (!prev.timer || elapsed(prev.timer, time) < prev.timer.duration) return prev;
        const session = { ...closeInterval(prev.timer, time), status: 'completed' };
        return { timer: null, sessions: [session, ...prev.sessions.filter(s => s.id !== session.id)], completed: session.title };
      });
    };
    tick();
    const id = setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, []);
  const start = (title, minutes) => {
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 720) return;
    const time = Date.now();
    setNow(time);
    setData(prev => prev.timer ? prev : { ...prev, completed: null, timer: { id: crypto.randomUUID(), title: title.trim() || 'Study session', duration: minutes * 60000, spent: 0, runningSince: time, startedAt: time, intervals: [] } });
  };
  const pause = () => setData(prev => prev.timer ? { ...prev, timer: closeInterval(prev.timer, Date.now()) } : prev);
  const resume = () => { setNow(Date.now()); setData(prev => prev.timer && prev.timer.runningSince === null ? { ...prev, timer: { ...prev.timer, runningSince: Date.now() } } : prev); };
  const finish = () => setData(prev => {
    if (!prev.timer) return prev;
    const session = { ...closeInterval(prev.timer, Date.now()), status: elapsed(prev.timer, Date.now()) >= prev.timer.duration ? 'completed' : 'partial' };
    return { ...prev, timer: null, sessions: session.spent > 0 ? [session, ...prev.sessions] : prev.sessions };
  });
  return <TimerContext.Provider value={{ ...data, now, storageError, start, pause, resume, finish }}>{children}</TimerContext.Provider>;
}
export const useTimer = () => useContext(TimerContext);
