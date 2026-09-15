import { dayKey } from './timer.js';

export const CAREER_KEY = 'focus_os_career_v1';
export const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const defaultCareer = () => ({ version: 1, classDays: [1, 2, 3, 4, 5], startDate: '2026-09-15', days: {}, milestones: {}, applications: [], contests: [] });
export const shiftDate = (key, amount) => { const date = new Date(`${key}T12:00:00`); date.setDate(date.getDate() + amount); return dayKey(date); };
export const weekDates = key => { const day = new Date(`${key}T12:00:00`).getDay(); const monday = shiftDate(key, -((day + 6) % 7)); return Array.from({ length: 7 }, (_, i) => shiftDate(monday, i)); };

const themes = [
  ['Weekly review & applications', 'Review mistakes, check deadlines, choose next week’s three outcomes.'],
  ['Recovery evening', 'Monday is long. The morning session is enough.'],
  ['C++ & systems', 'Work through the current roadmap topic; write and run a small example.'],
  ['SDE fundamentals', 'Alternate SQL/DBMS, networking, and a design discussion using your work experience.'],
  ['HFT engineering project', 'Implement and test one small order-book or benchmarking feature.'],
  ['Applications & interview stories', 'Check eligibility, submit a suitable application, or refine a real work story.'],
  ['Timed practice & review', 'Use the morning for a timed problem and the evening to explain and repair mistakes.'],
];

export function scheduleFor(key, classDays, mode = 'intensive') {
  if (mode === 'intensive') return intensiveSchedule(key, classDays);
  const day = new Date(`${key}T12:00:00`).getDay();
  const hasClass = classDays.includes(day);
  const monday = day === 1 && hasClass;
  const block = (id, time, title, detail, minutes = 0, track = false) => ({ id, time, title, detail, minutes, track });
  if (!hasClass && (day === 0 || day === 6)) {
    const rows = [block('wake', '08:00–09:00', 'Slow morning & breakfast', 'Sleep in a little. No preparation before breakfast.')];
    if (mode === 'minimum') rows.push(block('minimum', '09:00–09:20', 'Minimum day: one small step', '15 minutes of familiar revision; 5 minutes to choose your next action.', 20, true));
    else if (mode === 'standard') {
      rows.push(block('dsa', day === 6 ? '09:00–10:00' : '09:00–09:30', day === 6 ? 'Timed coding / mock interview' : 'Revisit the week’s mistakes', 'Explain your reasoning, test edge cases, and record one gap to repair.', day === 6 ? 60 : 30, true));
      if (day === 6) rows.push(block('break', '10:00–10:30', 'Take a break', 'Leave the screen.'));
      rows.push(block('specialist', day === 6 ? '10:30–12:00' : '09:30–10:00', day === 6 ? 'Build the HFT engineering project' : 'Weekly review & applications', day === 6 ? 'Two 40-minute sessions with a 10-minute break. Finish one testable increment.' : 'Check deadlines, review progress, and choose three outcomes for next week.', day === 6 ? 90 : 30, true));
    } else rows.push(block('rest-morning', '09:00–12:00', 'Rest morning', 'No career preparation scheduled.'));
    rows.push(block('lunch', '12:00–14:00', 'Lunch & open time', 'Friends, hobbies, and errands.'));
    rows.push(block('academic', '14:00–15:30', 'Academic assignments / research', 'Protect this buffer for labs, submissions, and exam revision. Free it when work is complete.', 0, true));
    rows.push(block('move', '16:00–17:00', 'Sport, walk, or gym', 'Move and spend time away from the desk.', 0, true));
    rows.push(block('life', '17:00–22:15', 'Free evening & dinner', 'Plan an outing, see friends, call home, or enjoy a hobby.', 0, true));
    rows.push(block('review', '22:15–22:25', 'Close the day', 'Record what happened and choose one next step.', 0, true));
    rows.push(block('sleep', day === 0 ? '22:25–07:00' : '22:25–08:00', 'Wind down & sleep', 'Lights out around 22:45. On Sunday, wake at 07:00 for Monday.'));
    return rows;
  }
  const rows = [block('wake', '07:00–07:30', 'Wake up & get ready', 'Water, daylight, and a quiet start.')];
  if (mode === 'rest') rows.push(block('rest-morning', '07:30–08:30', 'Rest morning', 'No career preparation scheduled.'));
  else if (mode === 'minimum') rows.push(block('minimum', '07:30–07:50', 'Minimum day: one small step', 'Re-solve one familiar problem for 15 minutes; write tomorrow’s next step for 5 minutes.', 20, true));
  else rows.push(block('dsa', '07:30–08:30', day === 0 ? 'DSA revision' : day === 6 ? 'Timed DSA practice' : 'DSA: one problem, understood well', 'Attempt for 25–35 minutes, review the idea, then code and test. Explain complexity. Revisit errors after 1, 7, and 21 days.', 60, true));
  rows.push(block('breakfast', '08:30–09:30', 'Breakfast & travel buffer', 'Adjust travel time to your actual campus routine.'));
  rows.push(hasClass ? block('classes', monday ? '09:30–17:30' : '09:30–16:30', 'Classes, labs & lunch', 'Protect attendance and coursework. Lunch is a real break.') : block('open', '09:30–16:30', 'Open day: life, lunch & academic work', 'Use only 60–90 minutes for pending coursework if needed; keep the rest available for friends, errands, or an outing.'));
  rows.push(block('move', monday ? '17:30–18:30' : '16:30–17:30', 'Decompress & move', 'Snack, walk, sport, or gym; choose 20–30 minutes of movement.', 0, true));
  if (!monday) rows.push(block('buffer', '17:30–18:00', 'Shower & buffer', 'Give yourself room between activities.'));
  rows.push(block('academic', monday ? '18:30–19:15' : '18:00–19:00', 'Coursework & class revision', 'Review today’s notes and the nearest assignment. Extend this into prep time during exams.', 0, true));
  rows.push(block('dinner', '19:15–20:00', 'Dinner & friends', 'Leave the desk.'));
  if (mode === 'standard' && !monday) rows.push(block('specialist', '20:00–20:45', themes[day][0], themes[day][1], 45, true));
  rows.push(block('life', mode === 'standard' && !monday ? '20:45–22:15' : '20:00–22:15', 'Enjoy your evening', 'Friends, a call home, music, a hobby, or a show. This belongs in the plan.', 0, true));
  rows.push(block('review', '22:15–22:25', 'Close the day', 'Tick what happened, record one lesson, choose the next tiny action. No catch-up debt.', 0, true));
  rows.push(block('sleep', '22:25–07:00', 'Wind down & sleep', 'Aim for lights out around 22:45, leaving 8 hours 15 minutes for sleep.'));
  return rows;
}

function intensiveSchedule(key, classDays) {
  const day = new Date(`${key}T12:00:00`).getDay();
  const hasClass = classDays.includes(day);
  const monday = day === 1 && hasClass;
  const row = (id, time, title, detail, minutes = 0, track = false) => ({ id: `intensive-${id}`, time, title, detail, minutes, track });
  const study = (id, time, title, minutes, detail) => row(id, time, title, detail, minutes, true);
  const rows = [row('wake', '06:00–06:30', 'Wake & get ready', 'Fixed wake time; sleep is 22:00–06:00.')];
  if (!hasClass && day === 6) {
    rows.push(
      study('contest', '06:30–09:00', 'Codeforces virtual contest / timed practice', 150, 'Pick an unseen round at your level. Use its actual duration; if it is shorter, use the remaining time for independent attempts. A live round replaces this block; it is not extra.'),
      row('breakfast', '09:00–09:30', 'Breakfast & break', 'Leave the screen.'),
      study('upsolve', '09:30–11:00', 'Upsolve Codeforces', 90, 'Solve one or two missed problems after the round. Try again before opening the editorial; reconstruct the solution without looking.'),
      row('break1', '11:00–11:15', 'Break', 'Stand up and rest your eyes.'),
      study('cpp', '11:15–12:45', 'C++ & systems', 90, 'Learn one roadmap concept and implement a small example.'),
      row('lunch', '12:45–13:30', 'Lunch & rest', 'Protect the full break.'),
      row('academic', '13:30–14:30', 'Academic assignments', 'One protected hour. If coursework needs more, replace preparation blocks.', 0, true),
      study('project1', '14:30–15:30', 'HFT project: implement', 60, 'Build one order-book, replay, or benchmark feature.'),
      row('break2', '15:30–15:40', 'Break', 'Step away from the desk.'),
      study('project2', '15:40–16:40', 'HFT project: test & measure', 60, 'Test correctness and save reproducible evidence.'),
      row('move', '16:40–17:00', 'Walk & snack', 'Movement away from screens.', 0, true),
      study('sde', '17:00–18:30', 'SDE / mock interview', 90, 'Alternate design, SQL, and a project interview. For a confirmed 20:00–21:30 LeetCode biweekly, move this block to that time and use 17:00–18:30 for rest.'),
      row('life', '18:30–21:30', 'Dinner & free time', 'On a biweekly contest evening, free time ends at 20:00; the moved 17:00 block becomes rest.', 0, true),
    );
  } else if (!hasClass && day === 0) {
    rows.push(
      study('review', '06:30–07:30', 'DSA pattern revision', 60, 'Re-solve previous errors, without looking at solutions.'),
      row('breakfast', '07:30–08:00', 'Breakfast & contest setup', 'Check the official contest countdown and your environment.'),
      study('contest', '08:00–09:30', 'LeetCode weekly / virtual contest', 90, 'Reserved IST practice slot, not a verified live event. Confirm the official countdown; use a past contest if no live contest fits.'),
      row('break1', '09:30–10:00', 'Break', 'Leave the desk after the contest.'),
      study('upsolve', '10:00–11:30', 'Upsolve LeetCode', 90, 'Review your first unsolved problem, implement it, and record the missing idea.'),
      row('break2', '11:30–11:45', 'Break', 'Move and rest.'),
      study('systems', '11:45–13:15', 'C++ / OS / networking', 90, 'Use this week’s roadmap topic; explain it aloud and demonstrate it.'),
      row('lunch', '13:15–14:00', 'Lunch & rest', 'A proper meal break.'),
      row('academic', '14:00–15:00', 'Academic assignments', 'Prepare submissions and the next week’s classes; borrow from prep if needed.', 0, true),
      study('project1', '15:00–16:00', 'Project / SDE fundamentals', 60, 'Implement one feature or practise a design question.'),
      row('break3', '16:00–16:15', 'Break', 'Step away.'),
      study('project2', '16:15–17:15', 'Project tests / SQL', 60, 'Verify your feature, or practise queries and database trade-offs.'),
      row('move', '17:15–17:45', 'Walk & snack', 'Time outside or movement.', 0, true),
      study('applications', '17:45–19:15', 'Applications, work stories & weekly review', 90, 'Check eligible roles, submit quality applications, review contest errors, and choose next week’s outcomes.'),
      row('life', '19:15–21:30', 'Dinner & free time', 'Spend time with friends, family, or a hobby.', 0, true),
    );
  } else {
    rows[0] = row('wake', '06:00–06:15', 'Wake & get ready', 'This tight template assumes a short campus commute. Protect 22:00–06:00 sleep.');
    rows.push(
      study('dsa', '06:15–07:30', 'DSA for interviews', 75, 'Topic-based practice, complexity, edge cases, and re-solving mistakes.'),
      row('break1', '07:30–07:40', 'Break', 'Leave the screen.'),
      study('cp', '07:40–08:55', 'Codeforces practice / upsolving', 75, 'Use C++. Choose problems near your current level, finish the first missed contest problem, and explain the idea.'),
      row('breakfast', '08:55–09:30', 'Breakfast & travel', 'Only 35 minutes available. If your commute or meals need longer, reduce prep rather than arriving late.'),
      row('classes', monday ? '09:30–17:30' : '09:30–16:30', hasClass ? 'Classes, labs & lunch' : 'Open day / academic work', hasClass ? 'Attend classes. Lunch is included in this class-day span.' : 'No class configured; this block is available for coursework and life.'),
      row('move', monday ? '17:30–17:45' : '16:30–17:00', 'Travel, snack & short walk', 'A limited recovery buffer, especially on Monday.', 0, true),
    );
    if (!monday) rows.push(row('academic', '17:00–18:00', 'Coursework & class revision', 'Protect assignments; replace preparation if academic work exceeds this hour.', 0, true));
    rows.push(
      study('systems', monday ? '17:45–19:00' : '18:00–19:15', 'C++ / systems / HFT fundamentals', 75, 'Mon: C++ and debugging. Tue: ownership/STL. Wed: OS/networking. Thu: performance/concurrency. Fri: revise weak concepts.'),
      row('dinner', monday ? '19:00–19:30' : '19:15–19:45', 'Dinner', 'Leave the desk for a meal.'),
      study('specialist', monday ? '19:30–20:45' : '19:45–21:00', 'SDE / HFT project / applications', 75, 'Mon: SDE revision. Tue/Thu: HFT project. Wed: SQL/API design. Fri: applications and work stories. A fitting live contest replaces study time; do not add it on top.'),
    );
    if (monday) rows.push(row('academic', '20:45–21:30', 'Coursework & class revision', 'Only 45 minutes fit on Monday. More academic work requires reducing job prep.', 0, true));
    else rows.push(row('life', '21:00–21:30', 'Free time & check-in', 'Call home, talk to friends, or relax.', 0, true));
  }
  rows.push(row('wind', '21:30–22:00', 'Close the day & wind down', 'Record evidence and your next action. Lights out at 22:00; no catch-up work.', 0, true));
  rows.push(row('sleep', '22:00–06:00', 'Sleep · 8 hours', 'Eight hours of sleep opportunity. If you need longer in bed, reduce prep to make room.'));
  return rows;
}

export const roadmap = [
  { title: 'Set up & apply now', weeks: 'Week 1', offset: 0, tasks: [
    'Take a 60-minute DSA baseline: arrays, hashing, binary search. Record where you needed help.',
    'Refresh C++ syntax, STL containers, references, and complexity; build and debug a small program.',
    'Prepare a one-page résumé: M.Tech dates, 1.8 years of work, and 3 truthful impact bullets. Collect transcript.',
    'Ask the NIT Jalandhar placement office about 2027 internships, M.Tech eligibility, academic release, and HFT campus access.',
    'Find 5 suitable roles, verify graduation/work-authorisation requirements, and apply to eligible openings now.',
    'Take one suitable Codeforces round and one LeetCode contest live or virtually; record a baseline and review the first missed problem.',
  ] },
  { title: 'Build the shared foundation', weeks: 'Weeks 2–4', offset: 7, tasks: [
    'Practice arrays, strings, hashing, two pointers, sliding windows, stacks, queues, and binary search.',
    'Learn C++ const, RAII, ownership, smart pointers, lifetime, and iterator invalidation; write examples.',
    'Explain processes vs threads, virtual memory, TCP vs UDP, SQL joins, indexes, and transactions.',
    'Finish 18–24 carefully reviewed problems across these topics; re-solve 6 without hints.',
    'Write two work stories: a difficult bug and a measurable performance or reliability improvement.',
    'Maintain a contest error log: missing idea, complexity, bug, or time management. Re-solve reviewed problems after 1, 7, and 21 days.',
  ] },
  { title: 'Trees, graphs & a working project', weeks: 'Weeks 5–8', offset: 28, tasks: [
    'Practice trees, heaps, recursion, backtracking, BFS, DFS, topological sorting, and shortest paths.',
    'Learn C++ move semantics, memory layout, cache locality, and profiling; explain a measurement.',
    'Build a C++ limit order book with integer prices, price-time priority, add/cancel, and partial fills.',
    'Test duplicate IDs, invalid input, FIFO ordering, cancellation, and crossing orders; document invariants.',
    'Practice HTTP/API design, database choice, pagination, caching, and failure handling using an existing full-stack project.',
    'Complete one coding mock every other week and log the mistakes to revisit.',
    'Compare four weeks of independent contest solves and successful re-solves; increase practice difficulty only when ready.',
  ] },
  { title: 'Performance & interview depth', weeks: 'Weeks 9–12', offset: 56, tasks: [
    'Practice greedy algorithms, intervals, union-find, and 1D/2D dynamic programming; explain the recurrence.',
    'Study mutexes, condition variables, atomics, data races, false sharing, and deadlocks; favour a correct simple baseline.',
    'Add deterministic event replay and benchmark throughput plus p50/p95/p99 latency; document hardware and workload.',
    'Measure one optimisation against the same baseline and verify correctness; make no production-latency claims.',
    'Review DB isolation, OS scheduling, sockets, DNS/TLS, and basic probability: conditional probability and expectation.',
    'Complete weekly coding mocks, alternating a C++/systems discussion and an SDE design discussion.',
  ] },
  { title: 'Package the evidence', weeks: 'Weeks 13–16', offset: 84, tasks: [
    'Publish a readable project README with build commands, tests, reproducible benchmarks, and limitations.',
    'Create HFT engineering and SDE résumé variants from the same truthful experience.',
    'Prepare six stories covering ownership, collaboration, disagreement, failure, debugging, and impact.',
    'Reach 80–110 distinct problems only if time allows; prioritise re-solving weak patterns over the count.',
    'Run a 45-minute interview: clarify, solve aloud, test edge cases, and analyse complexity; repeat weak areas.',
  ] },
  { title: 'Convert preparation into interviews', weeks: 'Jan–Apr 2027', offset: 112, tasks: [
    'Continue 3–5 quality applications per week when suitable roles exist, plus up to 2 specific alumni messages.',
    'Keep 3 DSA sessions, 2 C++/systems sessions, and 1 mock per week by replacing existing blocks.',
    'Review the application funnel monthly: no screens → improve targeting/résumé; failed screens → practise those gaps.',
    'Broaden to strong product companies, backend/platform teams, fintech, and trading-infrastructure roles.',
    'Before interviews, use two regular sessions for that role’s published requirements and project discussion.',
  ] },
  { title: 'Prepare for the summer', weeks: 'May–Jun 2027', offset: 224, tasks: [
    'Confirm offer dates, location, documents, and academic approval directly with the employer and institute.',
    'If still searching, continue verified rolling openings and discuss faculty research or substantive engineering work.',
    'Keep a light revision routine and prepare a learning plan for your internship or alternative project.',
  ] },
];

export const resources = [
  ['Codeforces contests & virtual rounds', 'https://codeforces.com/contests', 'Check each round’s start, timezone, duration, and registration. Use virtual participation when live rounds clash with classes or sleep.'],
  ['LeetCode contests', 'https://leetcode.com/contest/', 'Check the official countdown for weekly and biweekly contests. Reserved practice slots are not an automatically synced event calendar.'],
  ['Graviton careers', 'https://www.gravitontrading.com/careers', 'Official careers hub. Verify current engineering internships, 2028 graduation requirements, and M.Tech eligibility in each listing.'],
  ['Quadeye careers', 'https://www.quadeye.com/jobs', 'Official roles and recruitment hub, including a placement-committee route. Openings load dynamically; availability is not confirmed here.'],
  ['Tower Research internships', 'https://tower-research.com/internships/', 'Engineering, trading, and research internship hub. Check the linked openings for 2027 timing, location, and degree eligibility.'],
  ['C++ foundations', 'https://www.learncpp.com/', 'Use the chapters relevant to the week; write code after reading.'],
  ['DSA practice: CSES', 'https://cses.fi/problemset/', 'Choose topic-matched problems; the entire set is not a daily checklist.'],
  ['Operating systems: OSTEP', 'https://pages.cs.wisc.edu/~remzi/OSTEP/', 'Selected chapters on processes, memory, concurrency, and persistence.'],
  ['Jane Street interview guides', 'https://www.janestreet.com/join-jane-street/interviewing/', 'Separate software, trading, and research guidance.'],
  ['Optiver 2027 London listing', 'https://www.optiver.com/join-us/jobs/technology/london/software-engineer-internship-2027-start/', 'Checked 15 Sep 2026: India applicants directed to placement-office hiring; UK role requires right to work without sponsorship. Verify current details.'],
  ['IMC India engineering internships', 'https://www.imc.com/in/careers/students-graduates/internships/technology-internship', 'Checked 15 Sep 2026: overview describes undergraduates and C++/Java assessment. Confirm M.Tech eligibility for the actual vacancy.'],
  ['Google Application Engineering 2027', 'https://www.google.com/about/careers/applications/jobs/results/127840103736189638-application-engineering-intern-summer-2027-english', 'Checked 15 Sep 2026: deadline listed as 15 Sep; 2028 graduation and bachelor’s enrolment listed. M.Tech eligibility is not established.'],
];

export function weeklySummary(data, key) {
  return weekDates(key).reduce((summary, date) => {
    const log = data.days[date];
    const tasks = scheduleFor(date, data.classDays, log?.mode).filter(row => row.track);
    summary.plannedMinutes += tasks.reduce((sum, row) => sum + row.minutes, 0);
    summary.completed += tasks.filter(row => log?.checked?.[row.id]).length;
    summary.total += tasks.length;
    if (log?.mode === 'rest') summary.restDays++;
    if (tasks.some(row => row.minutes && log?.checked?.[row.id])) summary.prepDays++;
    return summary;
  }, { plannedMinutes: 0, completed: 0, total: 0, prepDays: 0, restDays: 0 });
}

export function contestConflicts(contest, classDays) {
  if (!contest.startTime) return ['Start time is missing; check the official event countdown.'];
  const [hour, minute] = contest.startTime.split(':').map(Number);
  const start = hour * 60 + minute;
  const end = start + Number(contest.duration);
  const day = new Date(`${contest.date}T12:00:00`).getDay();
  const warnings = [];
  if (start < 360 || end > 1320) warnings.push('Overlaps 22:00–06:00 sleep. Choose a virtual slot or another round.');
  if (classDays.includes(day) && start < (day === 1 ? 1050 : 990) && end > 570) warnings.push('Overlaps classes. Choose a virtual slot or another round.');
  return warnings;
}

// Validate backups before replacing any locally saved progress.
export function validateCareer(value) {
  const object = item => item !== null && typeof item === 'object' && !Array.isArray(item);
  const date = item => typeof item === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item) && dayKey(new Date(`${item}T12:00:00`)) === item;
  const boolMap = item => object(item) && Object.values(item).every(v => typeof v === 'boolean');
  if (!object(value) || value.version !== 1 || !date(value.startDate) || !Array.isArray(value.classDays) || !value.classDays.every(d => Number.isInteger(d) && d >= 0 && d <= 6) || !object(value.days) || !boolMap(value.milestones) || !Array.isArray(value.applications)) return false;
  if (!Object.entries(value.days).every(([key, log]) => date(key) && object(log) && ['intensive', 'standard', 'minimum', 'rest'].includes(log.mode) && boolMap(log.checked) && typeof log.note === 'string')) return false;
  if (value.contests !== undefined && (!Array.isArray(value.contests) || !value.contests.every(c => object(c) && ['id', 'name', 'date', 'platform', 'participation', 'status', 'url', 'startTime', 'notes'].every(k => typeof c[k] === 'string') && date(c.date) && ['Codeforces', 'LeetCode'].includes(c.platform) && ['Live', 'Virtual'].includes(c.participation) && ['Planned', 'Participated', 'Reviewed'].includes(c.status) && (!c.url || /^https?:\/\//i.test(c.url)) && (!c.startTime || /^([01]\d|2[0-3]):[0-5]\d$/.test(c.startTime)) && ['duration', 'solved', 'upsolved'].every(k => Number.isInteger(c[k]) && c[k] >= 0) && c.duration >= 1 && c.duration <= 1440) || new Set(value.contests.map(c => c.id)).size !== value.contests.length)) return false;
  const statuses = ['Researching', 'Ready', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Closed'];
  return value.applications.every(app => object(app) && ['id', 'company', 'role', 'url', 'notes', 'eligibility', 'status', 'deadline', 'followUp'].every(k => typeof app[k] === 'string') && statuses.includes(app.status) && (!app.deadline || date(app.deadline)) && (!app.followUp || date(app.followUp)) && (!app.url || /^https?:\/\//i.test(app.url))) && new Set(value.applications.map(a => a.id)).size === value.applications.length;
}
