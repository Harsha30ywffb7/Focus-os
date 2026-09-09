import test from 'node:test';
import assert from 'node:assert/strict';
import { validHistoryRange } from './history-range.js';
test('accepts same-day and historical bounded queries', () => {
  assert.equal(validHistoryRange('2026-09-09', '2026-09-09'), true);
  assert.equal(validHistoryRange('2026-08-13', '2026-09-09'), true);
});
test('rejects malformed, impossible, reversed, absent, and excessive dates', () => {
  for (const [start, end] of [[null, null], ['2026-02-30', '2026-03-01'], ['2026-09-09', '2026-09-08'], ['2020-01-01', '2026-09-09'], ['invalid', '2026-09-09']]) {
    assert.equal(validHistoryRange(start, end), false);
  }
});
