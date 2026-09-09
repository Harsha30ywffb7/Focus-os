export const minuteOfDay = time => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || '')) return null;
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};
export const timeOfDay = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
export function layoutEvents(blocks) {
  const events = blocks.map(block => ({ ...block, start: minuteOfDay(block.timeSlot), duration: Math.max(15, Number(block.durationMinutes) || 60) }))
    .filter(block => block.start !== null).map(block => ({ ...block, end: Math.min(1440, block.start + block.duration) }))
    .sort((a, b) => a.start - b.start || b.end - a.end);
  let group = [], groupEnd = 0;
  const assign = () => {
    const columns = [];
    for (const event of group) {
      let column = columns.findIndex(end => end <= event.start);
      if (column === -1) column = columns.length;
      columns[column] = event.end;
      event.column = column;
    }
    group.forEach(event => { event.columns = columns.length; });
  };
  for (const event of events) {
    if (group.length && event.start >= groupEnd) { assign(); group = []; groupEnd = 0; }
    group.push(event); groupEnd = Math.max(groupEnd, event.end);
  }
  assign();
  return events;
}
export const snapStart = (minutes, duration) => Math.max(0, Math.min(Math.floor((1440 - duration) / 15) * 15, Math.round(minutes / 15) * 15));
