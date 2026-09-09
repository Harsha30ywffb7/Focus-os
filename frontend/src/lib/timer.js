export const dayKey = (value = Date.now()) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export const elapsed = (timer, now) => timer ? Math.min(timer.duration, timer.spent + (timer.runningSince === null ? 0 : Math.max(0, now - timer.runningSince))) : 0;
export function closeInterval(timer, now) {
  const end = timer.runningSince === null ? null : Math.min(now, timer.runningSince + timer.duration - timer.spent);
  return { ...timer, spent: elapsed(timer, now), runningSince: null, intervals: end > timer.runningSince && timer.runningSince !== null ? [...timer.intervals, [timer.runningSince, end]] : timer.intervals };
}
export function dailyTotals(sessions) {
  const totals = {};
  for (const session of sessions) for (const [start, end] of session.intervals) {
    let cursor = start;
    while (cursor < end) {
      const next = new Date(cursor);
      next.setHours(24, 0, 0, 0);
      const stop = Math.min(end, next.getTime());
      const key = dayKey(cursor);
      totals[key] = (totals[key] || 0) + stop - cursor;
      cursor = stop;
    }
  }
  return totals;
}
export const durationLabel = (ms) => {
  const minutes = Math.floor(ms / 60000);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : minutes ? `${minutes}m` : `${Math.floor(ms / 1000)}s`;
};
export const clockLabel = (ms) => {
  const seconds = Math.ceil(ms / 1000);
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(n => String(n).padStart(2, '0')).join(':');
};
