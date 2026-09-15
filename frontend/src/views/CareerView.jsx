import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Download, Upload, Target, BookOpen, CalendarDays, BriefcaseBusiness, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFocus } from '../context/FocusContext';
import { dayKey } from '../lib/timer';
import { CAREER_KEY, defaultCareer, scheduleFor, roadmap, resources, weekdays, shiftDate, weekDates, weeklySummary, validateCareer } from '../lib/career';
import './CareerView.css';
import { CareerContests } from './CareerContests';

const tabs = [['day', 'My week', CalendarDays], ['contests', 'Coding contests', Target], ['roadmap', 'Roadmap', Target], ['applications', 'Applications', BriefcaseBusiness], ['guide', 'Strategy & resources', BookOpen]];
const statuses = ['Researching', 'Ready', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Closed'];
const blankApplication = () => ({ company: '', role: '', url: '', eligibility: 'To verify', status: 'Researching', deadline: '', followUp: '', notes: '' });
const formatDate = key => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

export function CareerView() {
  const { setActiveView } = useFocus();
  const [initial] = useState(() => {
    try {
      const raw = localStorage.getItem(CAREER_KEY);
      if (!raw) return { data: defaultCareer(), error: '' };
      const data = JSON.parse(raw);
      if (!validateCareer(data)) throw new Error('Invalid saved data');
      return { data, error: '' };
    } catch { return { data: defaultCareer(), error: 'Saved preparation data could not be read. Export or recover your existing browser data before replacing it. Changes are disabled until you restore a valid backup.' }; }
  });
  const [data, setData] = useState(initial.data);
  const [error, setError] = useState(initial.error);
  const [readBlocked, setReadBlocked] = useState(Boolean(initial.error));
  const [tab, setTab] = useState('day');
  const [today, setToday] = useState(dayKey());
  const [selectedDate, setSelectedDate] = useState(null);
  const date = selectedDate || today;
  const [draft, setDraft] = useState(blankApplication);
  const [editingId, setEditingId] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [message, setMessage] = useState('');
  const fileInput = useRef(null);
  const form = useRef(null);
  useEffect(() => { const id = setInterval(() => setToday(dayKey()), 30000); return () => clearInterval(id); }, []);

  const save = (next, restoring = false) => {
    if (readBlocked && !restoring) return;
    try { localStorage.setItem(CAREER_KEY, JSON.stringify(next)); setError(''); setReadBlocked(false); }
    catch { setError('Your changes are in memory only: browser storage is unavailable or full. Export a backup before closing this page.'); }
    setData(next);
  };
  const log = data.days[date] || { mode: 'intensive', checked: {}, note: '' };
  const updateDay = patch => save({ ...data, days: { ...data.days, [date]: { ...log, ...patch } } });
  const rows = scheduleFor(date, data.classDays, log.mode);
  const stats = weeklySummary(data, date);
  const milestones = roadmap.flatMap((phase, i) => phase.tasks.map((_, j) => `${i}-${j}`));
  const completeMilestones = milestones.filter(id => data.milestones[id]).length;
  const exportBackup = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `focusos-career-${today}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importBackup = async event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 5000000) throw new Error('File too large');
      const incoming = JSON.parse(await file.text());
      if (!validateCareer(incoming)) throw new Error('Invalid backup');
      setPendingImport(incoming); setMessage('');
    } catch { setMessage('Could not read this backup. Choose a valid FocusOS career JSON export (up to 5 MB). Nothing was replaced.'); }
  };
  const submitApplication = event => {
    event.preventDefault();
    const app = { ...draft, company: draft.company.trim(), role: draft.role.trim(), url: draft.url.trim(), id: editingId || crypto.randomUUID() };
    if (!app.company || !app.role || (app.url && !/^https?:\/\//i.test(app.url))) { setMessage('Enter a company, role, and an http(s) URL if supplied.'); return; }
    save({ ...data, applications: editingId ? data.applications.map(item => item.id === editingId ? app : item) : [...data.applications, app] });
    setDraft(blankApplication()); setEditingId(null); setMessage('Application record updated.');
  };
  const activeApplications = data.applications.filter(app => !['Rejected', 'Closed', 'Offer'].includes(app.status));
  const due = activeApplications.filter(app => (app.deadline && app.deadline <= shiftDate(today, 7) && ['Researching', 'Ready'].includes(app.status)) || (app.followUp && app.followUp <= today));

  return <div className="career-page">
    <header className="career-heading"><div><p className="career-eyebrow">NIT JALANDHAR · M.TECH 2028 · SUMMER 2027</p><h1>A career you want.<br /><span>A life you enjoy.</span></h1><p>One shared foundation for HFT engineering and SDE. Small, repeatable steps with room for classes, sleep, and friends.</p></div><div className="career-heading-actions"><button onClick={exportBackup}><Download size={16} /> Export backup</button><button onClick={() => fileInput.current?.click()}><Upload size={16} /> Restore</button><input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={importBackup} /></div></header>
    {error && <div className="career-notice" role="alert">{error}</div>}
    {message && <p className="career-notice" role="status">{message}</p>}
    {pendingImport && <section className="career-notice"><h2>Restore this backup?</h2><p>It contains {Object.keys(pendingImport.days).length} dated check-ins, {(pendingImport.contests || []).length} contests, and {pendingImport.applications.length} application records. Restoring replaces your current preparation tracker. Export your current progress first if you need it.</p><div className="career-actions"><button onClick={() => { save(pendingImport, true); setPendingImport(null); setMessage('Backup loaded.'); }}>Replace with this backup</button><button onClick={() => setPendingImport(null)}>Cancel</button></div></section>}
    <section className="career-stats" aria-label="Preparation overview"><div><strong>{(stats.plannedMinutes / 60).toFixed(1)}<small>h</small></strong><span>allocated prep this week</span></div><div><strong>{stats.prepDays}<small>/ 7</small></strong><span>days with prep checked</span></div><div><strong>{completeMilestones}<small>/ {milestones.length}</small></strong><span>roadmap outcomes completed</span></div><div><strong>{due.length}</strong><span>deadlines / follow-ups to check</span></div></section>
    <nav className="career-tabs" aria-label="Career preparation sections">{tabs.map(([id, label, Icon]) => <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}><Icon size={17} />{label}</button>)}</nav>

    {tab === 'day' && <>
      <div className="career-section-heading"><div><h2>Your 43-hour preparation week</h2><p>5 hours per weekday · 9 hours per free weekend day · contests included. Sleep stays 22:00–06:00.</p></div><button onClick={() => setActiveView('focus')}>Open focus timer <ArrowRight size={16} /></button></div>
      <p className="career-notice">This is an intensive target, not a minimum needed to get hired. Alongside 36 class hours, it leaves tight meal/travel buffers and only 45 minutes of coursework on Monday. If academics or sleep need more time, reduce prep. Breaks are separate from the 5/9 planned hours; actual focus time may be lower. Previously saved days keep their selected mode.</p>
      <details className="career-settings"><summary>Class days & plan start</summary><p>Confirmed: Monday–Friday, 09:30–16:30; Monday ends at 17:30. Change these days if your timetable changes.</p><div className="career-actions">{[1, 2, 3, 4, 5, 6, 0].map(day => <label key={day}><input type="checkbox" checked={data.classDays.includes(day)} disabled={readBlocked} onChange={() => save({ ...data, classDays: data.classDays.includes(day) ? data.classDays.filter(d => d !== day) : [...data.classDays, day] })} />{weekdays[day]}</label>)}</div><label>Roadmap start <input type="date" value={data.startDate} disabled={readBlocked} onChange={e => { if (e.target.value) save({ ...data, startDate: e.target.value }); }} /></label><p>Times use your browser’s local calendar. Start dates shift the first 16 weeks; Jan–Jun 2027 remains the internship target.</p></details>
      <div className="career-date-controls"><button aria-label="Previous week" onClick={() => setSelectedDate(shiftDate(date, -7))}><ChevronLeft size={18} /></button><label>View date <input type="date" value={date} onChange={e => { if (e.target.value) setSelectedDate(e.target.value); }} /></label><button aria-label="Next week" onClick={() => setSelectedDate(shiftDate(date, 7))}><ChevronRight size={18} /></button><button onClick={() => setSelectedDate(null)}>Today</button></div>
      <div className="career-week">{weekDates(date).map(key => { const entry = data.days[key]; const count = scheduleFor(key, data.classDays, entry?.mode).filter(row => row.track && entry?.checked?.[row.id]).length; return <button key={key} aria-label={`${formatDate(key)}, ${count} check-ins${entry?.mode === 'rest' ? ', rest day' : ''}`} aria-pressed={date === key} onClick={() => setSelectedDate(key)}><span>{weekdays[new Date(`${key}T12:00:00`).getDay()]}</span><strong>{Number(key.slice(-2))}</strong><small>{entry?.mode === 'rest' ? 'Rest' : count ? `${count} checked` : '—'}</small></button>; })}</div>
      <div className="career-day-layout"><section><div className="career-section-heading"><div><h2>{formatDate(date)}</h2><p>Check-ins record what happened; allocated time is not measured study time.</p></div><label>Day mode<select value={log.mode} disabled={readBlocked} onChange={e => updateDay({ mode: e.target.value })}><option value="intensive">Intensive · 5h / 9h</option><option value="standard">Lighter plan</option><option value="minimum">Minimum · 20 min</option><option value="rest">Rest / recovery</option></select></label></div>
        {date > today && <p className="career-notice">Future schedule preview. Completion check-ins unlock on the date.</p>}
        <div className="career-schedule">{rows.map(row => <div key={row.id} className={`career-block ${row.minutes ? 'prep' : ''} ${log.checked[row.id] ? 'done' : ''}`}><time>{row.time}</time><div><strong>{row.title}</strong><p>{row.detail}</p></div>{row.track && <input type="checkbox" aria-label={`Complete ${row.title}`} checked={Boolean(log.checked[row.id])} disabled={readBlocked || date > today} onChange={() => updateDay({ checked: { ...log.checked, [row.id]: !log.checked[row.id] } })} />}</div>)}</div>
      </section><aside className="career-aside"><section><p className="career-eyebrow">CONSISTENCY, WITHOUT GUILT</p><h3>Keep the next step small.</h3><ol><li>Before a session, write the exact problem or feature.</li><li>Put your phone away. Start with 25 minutes.</li><li>Use minimum mode on overloaded days; rest when you need it.</li><li>Resume the next scheduled block. Don’t double tomorrow’s work.</li></ol><p>During exams, replace evening career prep with academic work. Start with 70–80% of planned prep blocks; adjust after two weeks.</p></section><section><h3>Daily evidence & next action</h3><label className="career-sr-only" htmlFor="career-note">Daily evidence and next action</label><textarea id="career-note" value={log.note} maxLength={5000} disabled={readBlocked} onChange={e => updateDay({ note: e.target.value })} placeholder="Problem / commit / lesson…&#10;Revisit on…&#10;Tomorrow’s first step…" rows={7} /><p>Use a problem link, a commit, or a sentence you can explain. Note 1-, 7-, and 21-day review dates here.</p></section><section><h3>Weekly review · Sunday</h3><p>{stats.completed} / {stats.total} scheduled check-ins completed · {stats.restDays} planned rest days.</p><p>Which topic needs review? Are assignments under control? What are next week’s three outcomes? Which application is due first?</p></section></aside></div>
    </>}

    {tab === 'contests' && <CareerContests data={data} save={save} readBlocked={readBlocked} today={today} />}
    {tab === 'roadmap' && <><div className="career-section-heading"><div><h2>The route to summer 2027</h2><p>Apply from week one. These are flexible outcome targets; extend a phase when academics need the time.</p></div></div><div className="career-roadmap">{roadmap.map((phase, i) => <section key={phase.title}><div className="career-phase-number">{String(i + 1).padStart(2, '0')}</div><div><p className="career-eyebrow">{phase.weeks}{i < 5 ? ` · from ${formatDate(shiftDate(data.startDate, phase.offset))}` : ''}</p><h3>{phase.title}</h3>{phase.tasks.map((task, j) => { const id = `${i}-${j}`; return <label className="career-check" key={id}><input type="checkbox" checked={Boolean(data.milestones[id])} disabled={readBlocked} onChange={() => save({ ...data, milestones: { ...data.milestones, [id]: !data.milestones[id] } })} /><span>{task}</span></label>; })}</div></section>)}</div></>}

    {tab === 'applications' && <><div className="career-section-heading"><div><h2>Applications move alongside preparation</h2><p>Aim for 3–5 suitable applications per week when openings exist. Confirm M.Tech eligibility, 2028 graduation, location, and summer availability.</p></div></div><p className="career-notice">This is your application log. Adding or editing a record does not submit an application or send a message. Deadlines are entered by you; check the employer’s date, time, and timezone.</p>
      <form ref={form} className="career-application-form" onSubmit={submitApplication}><h3>{editingId ? 'Edit application' : 'Add an opportunity'}</h3><fieldset disabled={readBlocked}><div className="career-form-grid"><label>Company<input required maxLength={120} value={draft.company} onChange={e => setDraft({ ...draft, company: e.target.value })} /></label><label>Role / location<input required maxLength={200} value={draft.role} onChange={e => setDraft({ ...draft, role: e.target.value })} placeholder="Software engineering intern · Mumbai" /></label><label className="wide">Official listing URL<input type="url" value={draft.url} onChange={e => setDraft({ ...draft, url: e.target.value })} placeholder="https://…" /></label><label>Eligibility<select value={draft.eligibility} onChange={e => setDraft({ ...draft, eligibility: e.target.value })}><option>To verify</option><option>Confirmed eligible</option><option>Not eligible</option></select></label><label>Status<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label><label>Application deadline<input type="date" value={draft.deadline} onChange={e => setDraft({ ...draft, deadline: e.target.value })} /></label><label>Next action / follow-up date<input type="date" value={draft.followUp} onChange={e => setDraft({ ...draft, followUp: e.target.value })} /></label><label className="wide">Notes, referral, assessment date & next action<textarea maxLength={5000} rows={3} value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} placeholder="Eligibility source, application date, résumé version, assessment date, recruiter instructions…" /></label></div><div className="career-actions"><button className="career-primary" type="submit">{editingId ? 'Save changes' : 'Add to tracker'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(blankApplication()); }}>Cancel edit</button>}</div></fieldset></form>
      <div className="career-applications">{data.applications.length === 0 && <section className="career-empty"><BriefcaseBusiness size={28} /><h3>Your first step: find one eligible role.</h3><p>Use the verified sources in Strategy & resources and your placement office. Add the exact listing and next action here.</p></section>}{data.applications.map(app => <article key={app.id}><div><p className="career-eyebrow">{app.status} · {app.eligibility}</p><h3>{app.company}</h3><p>{app.role}</p><p>Deadline: {app.deadline || 'Not recorded'} · Next action: {app.followUp || 'Not scheduled'}</p>{due.some(item => item.id === app.id) && <strong className="career-due">Action due / deadline within 7 days — check listing</strong>}<p className="career-app-note">{app.notes}</p></div><div className="career-actions">{app.url && <a href={app.url} target="_blank" rel="noreferrer">Open listing ↗</a>}<button onClick={() => { const { id, ...values } = app; setDraft(values); setEditingId(id); form.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Edit</button></div></article>)}</div></>}

    {tab === 'guide' && <div className="career-guide"><section><p className="career-eyebrow">YOUR MAIN TARGET</p><h2>HFT software engineering → broader SDE opportunities</h2><p>Your full-stack experience is useful evidence of shipping, debugging, and ownership. Build on it with DSA, C++, OS, networking, and performance work. Keep SQL, API design, and work stories in the weekly rotation for SDE interviews.</p><p>HFT describes an industry, not one job. Quant trading emphasises probability and decision-making; quant research adds statistics, modelling, and research. This plan targets engineering. Compensation and offers depend on the role, location, employer, and interview performance.</p></section><section><h2>The weekly allocation · 43 hours</h2><p>Monday–Friday: 2.5 hours of interview DSA and Codeforces practice in the morning; 1.25 hours of C++/systems and 1.25 hours of SDE/project/application work later. Saturday and Sunday each contain 9 planned preparation hours, with breaks scheduled separately.</p><p>Saturday includes a Codeforces virtual round and upsolving. Sunday reserves 08:00–09:30 IST for LeetCode weekly or virtual practice and 90 minutes afterward for upsolving. Confirm live event times on the official pages; these are practice reservations. A live contest replaces an equivalent study block. LeetCode biweekly is optional and replaces Saturday’s 90-minute SDE block when its confirmed time fits.</p><p>Sleep stays 22:00–06:00. Monday has only 45 minutes for academics; other class days and weekends reserve an hour. This assumes a short campus commute and gives up most weekday leisure. If coursework needs more time, lower preparation rather than attendance or sleep. Lighter, minimum, and rest modes remain available.</p></section><section><h2>One project, two ways to discuss it</h2><p>Build a small C++ order book and event replay tool. Start with correct matching and tests; then benchmark measured changes. HFT interviews can explore memory, latency, and trade-offs. SDE interviews can explore clean interfaces, testing, debugging, and maintainability. Use your existing full-stack work for API and database design stories.</p><p>Portfolio work is evidence, not a guarantee of interview selection. Use synthetic events and document limitations; live trading is unnecessary.</p></section><section><h2>Apply this week</h2><ol><li>Prepare two résumé variants, transcript, graduation dates, and confirmed summer availability.</li><li>Contact your placement office about firms accepting M.Tech students and remaining 2027 internship rounds.</li><li>Check exact employer listings. Log eligibility, deadline, assessment date, and next action.</li><li>Apply to HFT engineering and SDE roles concurrently. Include good product, backend, platform, and fintech teams.</li><li>Review the funnel monthly and spend more practice time on the stage where you are struggling.</li></ol></section><section><h2>A small resource shelf</h2><p>Hiring information below was checked on 15 September 2026. Listings can close or change; an overview is not confirmation of an eligible opening.</p><div className="career-resources">{resources.map(([label, url, description]) => <a key={url} href={url} target="_blank" rel="noreferrer"><strong>{label} ↗</strong><span>{description}</span></a>)}</div></section></div>}
    <footer className="career-footer">Career check-ins, contests, roadmap, and applications save in this browser only. Use one tab and export regularly. They do not sync to the backend, Calendar, or Analytics. Measured study sessions live in Focus Timer.</footer>
  </div>;
}
