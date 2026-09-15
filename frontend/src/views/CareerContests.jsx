import { useRef, useState } from 'react';
import { contestConflicts } from '../lib/career';

const blank = date => ({ name: '', date, platform: 'Codeforces', participation: 'Virtual', status: 'Planned', url: '', startTime: '', duration: 120, solved: 0, upsolved: 0, notes: '' });

export function CareerContests({ data, save, readBlocked, today }) {
  const [draft, setDraft] = useState(() => blank(today));
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const form = useRef(null);
  const contests = data.contests || [];
  const update = (key, value) => setDraft(previous => ({ ...previous, [key]: value }));
  const submit = event => {
    event.preventDefault();
    const record = { ...draft, name: draft.name.trim(), url: draft.url.trim(), duration: Number(draft.duration), solved: Number(draft.solved), upsolved: Number(draft.upsolved), id: editingId || crypto.randomUUID() };
    if (!record.name || (record.url && !/^https?:\/\//i.test(record.url))) { setMessage('Enter a contest name and an http(s) link if supplied.'); return; }
    if (record.date > today && record.status !== 'Planned') { setMessage('Future contests must stay Planned until the contest date.'); return; }
    save({ ...data, contests: editingId ? contests.map(c => c.id === editingId ? record : c) : [...contests, record] });
    setDraft(blank(today)); setEditingId(null); setMessage('Contest record saved. This does not register you or move timetable blocks.');
  };
  return <>
    <div className="career-section-heading"><div><h2>Compete. Review. Solve it again.</h2><p>One LeetCode weekly and one suitable Codeforces round each week, live or virtual. Add biweekly only when you can review it. Contest time is part of your 43 hours.</p></div></div>
    <section className="career-notice"><strong>Live times must be checked</strong><p>Use the <a href="https://codeforces.com/contests" target="_blank" rel="noreferrer">Codeforces calendar ↗</a> and <a href="https://leetcode.com/contest/" target="_blank" rel="noreferrer">LeetCode contest page ↗</a>. The app does not fetch or register events. Enter dates and start times in IST (Asia/Kolkata). Sunday 08:00–09:30 is a reserved LeetCode practice slot; the live countdown takes precedence. Codeforces has varying starts and durations.</p><p>If a round overlaps class or 22:00 bedtime, use virtual participation. Replace equivalent prep time when moving a contest; keep meals and academics. For a confirmed Saturday 20:00–21:30 biweekly, swap the 17:00–18:30 SDE block to that time. Review it during the next coding block.</p></section>
    <form ref={form} className="career-application-form" onSubmit={submit}><h3>{editingId ? 'Edit contest & review' : 'Plan a contest'}</h3><fieldset disabled={readBlocked}><div className="career-form-grid">
      <label>Contest name<input required maxLength={200} value={draft.name} onChange={e => update('name', e.target.value)} placeholder="Round / contest number" /></label>
      <label>Platform<select value={draft.platform} onChange={e => update('platform', e.target.value)}><option>Codeforces</option><option>LeetCode</option></select></label>
      <label>Date (IST)<input type="date" required value={draft.date} onChange={e => update('date', e.target.value)} /></label>
      <label>Start time (IST)<input type="time" value={draft.startTime} onChange={e => update('startTime', e.target.value)} /></label>
      <label>Duration in minutes<input type="number" min="1" max="1440" step="1" required value={draft.duration} onChange={e => update('duration', e.target.value)} /></label>
      <label>Participation<select value={draft.participation} onChange={e => update('participation', e.target.value)}><option>Live</option><option>Virtual</option></select></label>
      <label className="wide">Official contest URL<input type="url" value={draft.url} onChange={e => update('url', e.target.value)} placeholder="https://codeforces.com/contest/…" /></label>
      <label>Status<select value={draft.status} onChange={e => update('status', e.target.value)}><option>Planned</option><option>Participated</option><option>Reviewed</option></select></label>
      <label>Solved during contest<input type="number" min="0" step="1" required value={draft.solved} onChange={e => update('solved', e.target.value)} /></label>
      <label>Additional problems solved after contest<input type="number" min="0" step="1" required value={draft.upsolved} onChange={e => update('upsolved', e.target.value)} /></label>
      <label className="wide">Errors, problem links, rating/rank & re-solve dates<textarea rows={4} maxLength={5000} value={draft.notes} onChange={e => update('notes', e.target.value)} placeholder="Why I got stuck: idea / complexity / bug / time management&#10;First unsolved problem and lesson:&#10;Re-solve on +1, +7, +21 days:&#10;Which scheduled block this contest replaces:" /></label>
    </div>{contestConflicts(draft, data.classDays).map(warning => <p className="career-notice" key={warning}>{warning}</p>)}<div className="career-actions"><button className="career-primary" type="submit">{editingId ? 'Save contest' : 'Add contest'}</button>{editingId && <button type="button" onClick={() => { setDraft(blank(today)); setEditingId(null); }}>Cancel edit</button>}</div></fieldset></form>
    {message && <p role="status" className="career-notice">{message}</p>}
    <div className="career-applications">{contests.length === 0 && <section className="career-empty"><h3>No contests logged yet.</h3><p>Choose a suitable Codeforces round and a LeetCode contest. Register on the platform, then record your plan here.</p></section>}{[...contests].sort((a, b) => b.date.localeCompare(a.date)).map(contest => <article key={contest.id}><div><p className="career-eyebrow">{contest.platform} · {contest.participation} · {contest.status}</p><h3>{contest.name}</h3><p>{contest.date} · {contest.startTime || 'Time to verify'} IST · {contest.duration} minutes</p><p>{contest.solved} solved during contest · {contest.upsolved} additional problems solved afterward</p>{contestConflicts(contest, data.classDays).map(warning => <p className="career-due" key={warning}>{warning}</p>)}<p className="career-app-note">{contest.notes}</p></div><div className="career-actions">{contest.url && <a href={contest.url} target="_blank" rel="noreferrer">Open contest ↗</a>}<button onClick={() => { const { id, ...values } = contest; setDraft(values); setEditingId(id); form.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Edit / log review</button></div></article>)}</div>
    <section className="career-notice"><strong>Coding progression</strong><p>First 2 weeks: establish a baseline and use C++ consistently. Weeks 3–6: arrays, strings, sorting, prefix sums, binary search, two pointers, and basic greedy. Weeks 7–12: trees, graphs, DP, and mixed timed practice alongside the roadmap. Start with Div. 4/3 material if appropriate; increase difficulty when you can solve and explain problems independently.</p><p>During a contest, work independently within the platform’s rules. Afterward, attempt the first missed problem before reading an editorial, code it without copying, and re-solve it later. Track independently solved problems, time to solution, wrong submissions, and repeated mistakes; rating is a trend, not a daily quota.</p></section>
  </>;
}
