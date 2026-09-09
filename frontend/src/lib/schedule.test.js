import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutEvents, minuteOfDay, snapStart, timeOfDay } from './schedule.js';

test('a two-hour event occupies its true time range', () => {
  const [event] = layoutEvents([{ id: 'study', timeSlot: '09:30', durationMinutes: 120 }]);
  assert.equal(event.start, 570);
  assert.equal(event.end, 690);
  assert.equal(event.columns, 1);
});
test('simultaneous events get separate columns and back-to-back events share a column', () => {
  const events = layoutEvents([
    { id: 'a', timeSlot: '09:00', durationMinutes: 120 },
    { id: 'b', timeSlot: '09:30', durationMinutes: 30 },
    { id: 'c', timeSlot: '10:00', durationMinutes: 30 },
    { id: 'd', timeSlot: '11:00', durationMinutes: 60 },
  ]);
  assert.equal(events[0].columns, 2);
  assert.notEqual(events[0].column, events[1].column);
  assert.equal(events[1].column, events[2].column);
  assert.equal(events[3].columns, 1);
});
test('transitive overlaps share consistent widths without hiding events', () => {
  const events = layoutEvents([
    { id: 'a', timeSlot: '09:00', durationMinutes: 120 },
    { id: 'b', timeSlot: '09:30', durationMinutes: 120 },
    { id: 'c', timeSlot: '10:30', durationMinutes: 120 },
  ]);
  assert.deepEqual(events.map(e => e.columns), [3, 3, 3]);
  assert.equal(new Set(events.map(e => e.column)).size, 3);
});
test('dragging snaps to quarter hours and respects day boundaries', () => {
  assert.equal(snapStart(572, 120), 570);
  assert.equal(snapStart(1430, 120), 1320);
  assert.equal(snapStart(-30, 60), 0);
  assert.equal(timeOfDay(snapStart(1430, 120)), '22:00');
});
test('invalid start times are excluded and midnight is represented correctly', () => {
  assert.equal(minuteOfDay('not-a-time'), null);
  assert.equal(minuteOfDay('24:00'), null);
  assert.equal(minuteOfDay('00:00'), 0);
  assert.equal(timeOfDay(1440), '24:00');
  assert.equal(layoutEvents([{ timeSlot: 'bad' }]).length, 0);
});
