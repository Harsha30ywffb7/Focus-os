import test from 'node:test';
import assert from 'node:assert/strict';
import { elapsed, closeInterval, dailyTotals, dayKey, clockLabel } from './timer.js';
const start = new Date(2026, 8, 9, 12).getTime();
const timer = { duration: 7200000, spent: 0, runningSince: start, intervals: [] };
test('two-hour timer is capped after background suspension or refresh', () => {
  assert.equal(elapsed(timer, start + 9000000), 7200000);
  assert.deepEqual(closeInterval(timer, start + 9000000).intervals, [[start, start + 7200000]]);
  assert.equal(clockLabel(7200000), '02:00:00');
});
test('pausing excludes the break and resuming preserves active time', () => {
  const paused = closeInterval(timer, start + 600000);
  assert.equal(elapsed(paused, start + 1800000), 600000);
  const resumed = { ...paused, runningSince: start + 1800000 };
  const stopped = closeInterval(resumed, start + 2100000);
  assert.equal(stopped.spent, 900000);
  assert.equal(dailyTotals([stopped])[dayKey(start)], 900000);
});
test('overnight sessions are allocated to local calendar days', () => {
  const a = new Date(2026, 8, 9, 23, 30).getTime();
  const b = new Date(2026, 8, 10, 1, 30).getTime();
  assert.deepEqual(dailyTotals([{ intervals: [[a, b]] }]), { '2026-09-09': 1800000, '2026-09-10': 5400000 });
});
test('closing an already paused interval never duplicates time', () => {
  const paused = closeInterval(timer, start + 600000);
  assert.deepEqual(closeInterval(paused, start + 900000), paused);
});
test('empty history and timer are safe', () => {
  assert.deepEqual(dailyTotals([]), {});
  assert.equal(elapsed(null, start), 0);
});
