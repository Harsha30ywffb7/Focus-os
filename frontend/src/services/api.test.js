import test from 'node:test';
import assert from 'node:assert/strict';
import { apiService } from './api.js';

test('schedule saves report failed HTTP responses instead of accepting error bodies', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ error: 'Database unavailable' }), { status: 500 }));
  assert.equal(await apiService.addTimeBlock({ title: 'Study' }), null);
  assert.equal(await apiService.updateTimeBlock('test', { timeSlot: '10:00' }), null);
  assert.equal(await apiService.deleteTimeBlock('test'), false);
});
test('rescheduling updates the same event with PUT, without deleting or recreating it', async t => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url, ...options });
    return new Response(JSON.stringify({ id: 'existing-block', timeSlot: '10:00' }));
  });
  const saved = await apiService.updateTimeBlock('existing-block', { timeSlot: '10:00' });
  assert.equal(saved.id, 'existing-block');
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, 'PUT');
  assert.ok(requests[0].url.endsWith('/time-blocks/existing-block'));
  assert.deepEqual(JSON.parse(requests[0].body), { timeSlot: '10:00' });
});
