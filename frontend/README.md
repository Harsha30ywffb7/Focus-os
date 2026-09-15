# React + Vite

### Personal career preparation

Open **Career Prep** from the sidebar or command search for the M.Tech 2028 /
summer 2027 HFT engineering and SDE plan. The default class week is Monday–Friday,
09:30–16:30, with Monday ending at 17:30. The schedule protects 8+ hours of sleep,
academic buffers, and a requested intensive target of 5 hours per weekday and
9 hours per free weekend day (43 hours weekly). Monday has tight buffers and only
45 minutes for coursework. A lighter schedule remains available. Read [the complete plan](../CAREER_PLAN_2027.md).

The view provides dated check-ins, intensive/lighter/minimum/rest modes, a milestone
roadmap, a Codeforces/LeetCode contest and upsolving journal, and editable internship records with eligibility, deadlines, next action
dates, statuses, links, and notes. It does not submit applications, register contests, sync live event times, or send reminders.
Contest conflict checks flag classes and 22:00–06:00 sleep using entered IST times.
Contests replace equivalent preparation blocks; timetable swaps are manual.
Preparation data uses `focus_os_career_v1` in browser local storage, independently
of the backend and other planner views. Use one tab; export regular JSON backups.
Restore validates and previews a backup before explicit replacement. Allocated
schedule hours are not measured focus time; use Focus Timer for actual sessions.

Career logic checks: `node --test src/lib/career.test.js`.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

### Study timer

Open **Focus Timer** from the sidebar or the Today focus card. Name your session,
choose a preset (including two hours) or enter 1–720 minutes, and start. Focus mode
expands the timer into a distraction-free screen. Pause excludes break time;
**End & save elapsed time** records a partial session. Completed timers are saved
automatically. The journal and Analytics show recorded time by local calendar day,
with overnight sessions split at midnight.

Timer state and history use browser local storage, independently of the backend.
Refreshes preserve the countdown; if the browser was closed at completion, the
session is recorded when the app next opens. Use one browser tab for timing.
History does not sync across devices. Export the journal for a JSON backup.

Timer calculation checks: `node --test src/lib/timer.test.js`.

### Daily activity wall

Analytics opens on the latest 28 local calendar days. Use the arrows to browse
older periods and tap a date to see its study sessions, tasks, and scheduled
blocks. The frontend now calls `GET /api/analytics/history?start=YYYY-MM-DD&end=YYYY-MM-DD`;
restart or deploy the updated backend alongside the frontend. No schema migration
is required. Historical reads do not change the date or tasks in the Today planner.

- **Prime (green):** the study target is met, or every planned task and block for
  that date is completed. The default study target is two hours and is adjustable.
- **Semi (orange):** some study time, a completed item, or an active block exists.
- **Wasted (red):** a past day has no recorded progress, including empty days.
- Today stays open until progress exists. Unavailable history stays neutral rather
  than being treated as a wasted day. Retry restores the server history.

Colors describe recorded activity only. Study timers remain browser-local. Habits
lack dated records and are excluded; scheduled durations and timer durations are
reported separately so they aren't added together twice.

The responsive interface uses a seven-column day wall on phones, safe-area-aware
bottom navigation, and open vertical sections for Today, Focus, and Analytics.

From the repository root, run the activity and timer checks with:
`node --test frontend/src/lib/*.test.js backend/src/history-range.test.js`.

### Calendar-style daily schedule

Today now shows a 24-hour timeline with duration-sized events, side-by-side
columns for overlapping blocks, and a current-time indicator. Tap a half-hour
slot to create a block, or tap an event to edit its title, start, duration,
category, and status. Desktop dragging moves an existing event in 15-minute
increments. Mobile editing uses the same tap-to-edit form. Blocks created in
this editor must end by midnight; split overnight plans across two dates.

Changes appear only after the backend confirms the save. A failed move preserves
the original block. Date navigation clears stale events while loading.

The top bar has consistent search, theme, and Create controls; mobile uses a
compact search button. Search includes the selected day's tasks and schedules,
goals, and navigation. Use arrow keys and Enter to select, or Escape to dismiss.

Run all frontend logic and API checks from the repository root:
`node --test frontend/src/lib/*.test.js frontend/src/services/api.test.js backend/src/history-range.test.js`.
