import { dailyTotals, dayKey } from './timer.js';

export function recentDays(end, count = 28) {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(`${end}T12:00:00`);
    date.setDate(date.getDate() - count + i + 1);
    return dayKey(date);
  });
}

export function activityDays({ dates, tasks = [], blocks = [], sessions = [], targetMinutes = 120, today = dayKey(), historyAvailable = true }) {
  const focusByDay = dailyTotals(sessions);
  return dates.map(date => {
    const dayTasks = tasks.filter(t => t.date === date);
    const dayBlocks = blocks.filter(b => b.date === date);
    const completed = dayTasks.filter(t => t.completed).length + dayBlocks.filter(b => b.status === 'completed').length;
    const planned = dayTasks.length + dayBlocks.length;
    const focus = focusByDay[date] || 0;
    const scheduledTime = dayBlocks.filter(b => b.status === 'completed').reduce((sum, b) => sum + (Number(b.durationMinutes) || 0) * 60000, 0);
    const progress = focus > 0 || completed > 0 || dayBlocks.some(b => b.status === 'in-progress');
    let status;
    if (date > today) status = 'upcoming';
    else if (focus >= targetMinutes * 60000 || (historyAvailable && planned > 0 && completed === planned)) status = 'prime';
    else if (progress) status = 'semi';
    else if (!historyAvailable) status = 'unknown';
    else status = date === today ? 'open' : 'wasted';
    return { date, status, focus, scheduledTime, completed, planned, tasks: dayTasks, blocks: dayBlocks };
  });
}

export const activityLabels = { prime: 'Prime', semi: 'Semi', wasted: 'Wasted', open: 'In progress', unknown: 'Unavailable', upcoming: 'Upcoming' };
