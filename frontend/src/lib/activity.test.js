import test from 'node:test';
import assert from 'node:assert/strict';
import { activityDays, recentDays } from './activity.js';
const today = '2026-09-09';
const dates = recentDays(today);
const calculate = (extra = {}) => activityDays({ dates, today, ...extra });
const find = (days, date) => days.find(day => day.date === date);

test('recent wall always includes the last 28 calendar days, ending today', () => {
  assert.equal(dates.length, 28);
  assert.equal(dates[0], '2026-08-13');
  assert.equal(dates.at(-1), today);
  assert.equal(recentDays('2026-08-12').at(-1), '2026-08-12');
});
test('past days without progress are red; today remains open', () => {
  assert.equal(find(calculate(), '2026-09-08').status, 'wasted');
  assert.equal(find(calculate(), today).status, 'open');
});
test('historical tasks produce green and orange days independently of today', () => {
  const tasks = [
    { id: 'a', date: '2026-09-07', completed: true },
    { id: 'b', date: '2026-09-08', completed: true },
    { id: 'c', date: '2026-09-08', completed: false },
    { id: 'd', date: today, completed: false },
  ];
  const result = calculate({ tasks });
  assert.equal(find(result, '2026-09-07').status, 'prime');
  assert.equal(find(result, '2026-09-08').status, 'semi');
  assert.equal(find(result, today).status, 'open');
});
test('pending plans alone do not count as progress, active blocks do', () => {
  assert.equal(find(calculate({ tasks: [{ date: '2026-09-08', completed: false }] }), '2026-09-08').status, 'wasted');
  assert.equal(find(calculate({ blocks: [{ date: '2026-09-08', status: 'in-progress' }] }), '2026-09-08').status, 'semi');
});
test('timer history is split by local date and prime threshold is configurable', () => {
  const start = new Date(2026, 8, 7, 23).getTime();
  const end = new Date(2026, 8, 8, 2).getTime();
  const sessions = [{ intervals: [[start, end]] }];
  const result = calculate({ sessions });
  assert.equal(find(result, '2026-09-07').status, 'semi');
  assert.equal(find(result, '2026-09-08').status, 'prime');
  assert.equal(find(calculate({ sessions, targetMinutes: 240 }), '2026-09-08').status, 'semi');
});
test('missing server history is unknown, never falsely wasted', () => {
  assert.equal(find(calculate({ historyAvailable: false }), '2026-09-08').status, 'unknown');
  const start = new Date(2026, 8, 8, 12).getTime();
  const sessions = [{ intervals: [[start, start + 7200000]] }];
  assert.equal(find(calculate({ historyAvailable: false, sessions }), '2026-09-08').status, 'prime');
});
test('scheduled time and timer time remain separate', () => {
  const start = new Date(2026, 8, 8, 12).getTime();
  const day = find(calculate({ sessions: [{ intervals: [[start, start + 3600000]] }], blocks: [{ date: '2026-09-08', status: 'completed', durationMinutes: 60 }] }), '2026-09-08');
  assert.equal(day.focus, 3600000);
  assert.equal(day.scheduledTime, 3600000);
});
