import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultCareer, scheduleFor, weeklySummary, weekDates, shiftDate, validateCareer, contestConflicts } from './career.js';

test('intensive week has exactly 5/9 prep hours excluding breaks, without overlaps, and 8 hours sleep', () => {
  const data = defaultCareer();
  const minutes = time => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
  for (const [i, date] of weekDates('2026-09-15').entries()) {
    const rows = scheduleFor(date, data.classDays);
    assert.equal(rows.reduce((sum, r) => sum + r.minutes, 0), i < 5 ? 300 : 540);
    let end = 0;
    for (const row of rows) {
      const [a, b] = row.time.split('–').map(minutes);
      assert.ok(a >= end, `${date}: overlapping ${row.title}`);
      const duration = (b - a + 1440) % 1440;
      if (row.minutes) assert.equal(row.minutes, duration, row.title);
      if (row.id === 'intensive-sleep') assert.equal(duration, 480);
      end = b < a ? b + 1440 : b;
    }
    assert.ok(rows.some(r => r.id === 'intensive-academic'));
  }
  assert.equal(weeklySummary(data, '2026-09-15').plannedMinutes, 2580);
  assert.equal(scheduleFor('2026-09-14', data.classDays).find(r => r.id === 'intensive-classes').time, '09:30–17:30');
});

test('live contest warnings catch classes, sleep and overnight durations at exact boundaries', () => {
  const days = defaultCareer().classDays;
  const c = { date: '2026-09-21', startTime: '20:05', duration: 150 };
  assert.equal(contestConflicts(c, days).length, 1);
  assert.match(contestConflicts(c, days)[0], /sleep/);
  assert.match(contestConflicts({ ...c, startTime: '17:00', duration: 60 }, days)[0], /classes/);
  assert.deepEqual(contestConflicts({ ...c, startTime: '17:30', duration: 120 }, days), []);
  assert.deepEqual(contestConflicts({ ...c, date: '2026-09-20', startTime: '08:00', duration: 90 }, days), []);
  assert.deepEqual(contestConflicts({ ...c, startTime: '20:00', duration: 120 }, days), []);
  assert.match(contestConflicts({ ...c, startTime: '23:00' }, days)[0], /sleep/);
});

test('legacy backups and intensive contest records round-trip; malformed contest records fail validation', () => {
  const data = defaultCareer();
  delete data.contests;
  assert.ok(validateCareer(data));
  data.days['2026-09-15'] = { mode: 'intensive', checked: { 'intensive-dsa': true }, note: '' };
  const contest = { id: 'c1', name: 'Practice', date: '2026-09-20', startTime: '08:00', duration: 90, platform: 'LeetCode', participation: 'Virtual', status: 'Reviewed', url: 'https://leetcode.com/contest/', solved: 2, upsolved: 1, notes: 'Revisit DP' };
  data.contests = [contest];
  assert.ok(validateCareer(JSON.parse(JSON.stringify(data))));
  for (const patch of [{ duration: -1 }, { solved: 1.5 }, { startTime: '25:00' }, { url: 'javascript:alert(1)' }, { date: '2026-02-30' }, { participation: 'Invalid' }]) assert.equal(validateCareer({ ...data, contests: [{ ...contest, ...patch }] }), false);
  assert.equal(validateCareer({ ...data, contests: [contest, contest] }), false);
});

test('lighter plan preserves Monday extension and free weekends', () => {
  const data = defaultCareer();
  for (const date of weekDates('2026-09-15')) data.days[date] = { mode: 'standard', checked: {}, note: '' };
  const monday = scheduleFor('2026-09-14', data.classDays, 'standard');
  assert.equal(monday.find(b => b.id === 'classes').time, '09:30–17:30');
  assert.equal(monday.some(b => b.id === 'specialist'), false);
  assert.equal(scheduleFor('2026-09-15', data.classDays, 'standard').find(b => b.id === 'classes').time, '09:30–16:30');
  for (const date of ['2026-09-19', '2026-09-20']) {
    const rows = scheduleFor(date, data.classDays, 'standard');
    assert.equal(rows.some(b => b.id === 'classes'), false);
    assert.equal(rows.find(b => b.id === 'life').time, '17:00–22:15');
  }
  assert.equal(scheduleFor('2026-09-20', data.classDays, 'standard').find(b => b.id === 'sleep').time, '22:25–07:00');
  assert.equal(weeklySummary(data, '2026-09-15').plannedMinutes, 690);
});

test('minimum and rest modes reduce preparation without removing academics or life', () => {
  for (const date of ['2026-09-14', '2026-09-15', '2026-09-19', '2026-09-20']) {
    for (const [mode, minutes] of [['minimum', 20], ['rest', 0]]) {
      const rows = scheduleFor(date, defaultCareer().classDays, mode);
      assert.equal(rows.reduce((sum, row) => sum + row.minutes, 0), minutes);
      for (const id of ['academic', 'move', 'life', 'sleep']) assert.ok(rows.some(row => row.id === id));
    }
  }
});

test('date arithmetic works across years and Sunday belongs to preceding Monday', () => {
  assert.equal(shiftDate('2026-12-31', 1), '2027-01-01');
  assert.deepEqual(weekDates('2027-01-03'), ['2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03']);
});

test('dated progress does not leak into other weeks or count hidden standard tasks in minimum mode', () => {
  const data = defaultCareer();
  for (const date of weekDates('2026-09-15')) data.days[date] = { mode: 'standard', checked: {}, note: '' };
  data.days['2026-09-15'] = { mode: 'minimum', checked: { dsa: true, specialist: true, minimum: true }, note: '' };
  data.days['2026-09-16'] = { mode: 'rest', checked: {}, note: '' };
  const stats = weeklySummary(data, '2026-09-15');
  assert.equal(stats.completed, 1);
  assert.equal(stats.prepDays, 1);
  assert.equal(stats.restDays, 1);
  assert.equal(stats.plannedMinutes, 500);
  assert.equal(weeklySummary(data, '2026-09-22').completed, 0);
});

test('backups round-trip and reject invalid dates, shapes, statuses, URLs, or duplicate IDs', () => {
  const data = defaultCareer();
  data.days['2026-09-15'] = { mode: 'standard', checked: { dsa: true }, note: 'Reviewed binary search.' };
  data.applications.push({ id: 'one', company: 'Example', role: 'Intern', url: 'https://example.com/job', eligibility: 'To verify', status: 'Researching', deadline: '', followUp: '2026-09-20', notes: '' });
  assert.ok(validateCareer(JSON.parse(JSON.stringify(data))));
  for (const invalid of [null, [], { ...data, days: { '2026-02-30': data.days['2026-09-15'] } }, { ...data, classDays: [8] }, { ...data, milestones: { x: 'true' } }, { ...data, applications: [{ ...data.applications[0], url: 'javascript:alert(1)' }] }, { ...data, applications: [{ ...data.applications[0], status: 'Invented' }] }, { ...data, applications: [data.applications[0], data.applications[0]] }]) assert.equal(validateCareer(invalid), false);
});
