import React, { useState } from "react";
import { useFocus } from "../context/FocusContext";
import {
  BarChart3,
  Flame,
  TrendingUp,
  PieChart,
  Award,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  Circle,
  Target,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Info,
} from "lucide-react";

export const AnalyticsView = () => {
  const { state, addTimelineItem, deleteTimelineItem } = useFocus();

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Career");
  const [newNote, setNewNote] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState(null);

  // 1. REAL METRICS FROM DB STATE
  const totalGoals = state.goals.length;
  const completedGoals = state.goals.filter(
    (g) => g.column === "complete",
  ).length;
  const goalCompletionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const totalMicroTasks = state.microTasks.length;
  const completedMicroTasks = state.microTasks.filter(
    (m) => m.completed,
  ).length;
  const taskCompletionRate =
    totalMicroTasks > 0
      ? Math.round((completedMicroTasks / totalMicroTasks) * 100)
      : 0;

  const totalTimeBlocks = state.timeBlocks.length;
  const completedTimeBlocks = state.timeBlocks.filter(
    (tb) => tb.status === "completed",
  ).length;

  const totalHabits = state.habits.length;
  const completedHabits = state.habits.filter((h) => h.completed).length;

  // 2. REAL DYNAMIC MONTHLY GOAL RATES
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyData = monthNames.map((month, idx) => {
    const monthGoals = state.goals.filter((g) => {
      if (!g.targetDate) return false;
      const d = new Date(g.targetDate);
      return d.getMonth() === idx;
    });
    const total = monthGoals.length;
    const comp = monthGoals.filter((g) => g.column === "complete").length;
    const rate = total > 0 ? Math.round((comp / total) * 100) : 0;
    return { month, rate, total, comp };
  });

  // Calculate SVG line path points for monthly chart
  const chartPoints = monthlyData.map((d, i) => {
    const x = (i / 11) * 500;
    const y = 200 - (d.rate / 100) * 160 - 20;
    return `${x},${y}`;
  });
  const linePathD = `M ${chartPoints.join(" L ")}`;
  const areaPathD = `M 0,200 L ${chartPoints.join(" L ")} L 500,200 Z`;

  // 3. REAL DYNAMIC RADAR CHART FROM PILLARS
  const pillarScores = state.pillars.map((pillar) => {
    const totalM = pillar.milestones ? pillar.milestones.length : 0;
    const compM = pillar.milestones
      ? pillar.milestones.filter((m) => m.completed).length
      : 0;
    const score = totalM > 0 ? Math.round((compM / totalM) * 100) : 0;
    return {
      name: pillar.name.split(" ")[0],
      score,
      totalM,
      compM,
    };
  });

  const radarPoints = pillarScores
    .slice(0, 5)
    .map((p, i) => {
      const angle = (i * 72 - 90) * (Math.PI / 180);
      const radius = (p.score / 100) * 70;
      const x = Math.round(100 + radius * Math.cos(angle));
      const y = Math.round(100 + radius * Math.sin(angle));
      return `${x},${y}`;
    })
    .join(" ");

  // 4. REAL DYNAMIC HEATMAP WITH PENDING ORANGE & COMPLETE GREEN STATUS
  const generateHeatmapDays = () => {
    const days = [];
    const startDate = new Date(2026, 0, 1);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    today.setHours(23, 59, 59, 999);

    let curr = new Date(startDate);
    while (curr <= today) {
      const dateStr = curr.toISOString().slice(0, 10);
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;

      // 1. Filter Micro Tasks for dateStr
      const dayTasks = isToday
        ? state.microTasks
        : state.microTasks.filter((m) => m.date === dateStr);
      const completedTasks = dayTasks.filter((m) => m.completed);
      const pendingTasks = dayTasks.filter((m) => !m.completed);

      // 2. Filter Time Blocks for dateStr
      const dayBlocks = isToday
        ? state.timeBlocks
        : state.timeBlocks.filter((tb) => tb.date === dateStr);
      const completedBlocks = dayBlocks.filter(
        (tb) => tb.status === "completed",
      );
      const pendingBlocks = dayBlocks.filter((tb) => tb.status !== "completed");

      // 3. Filter Goals targeting dateStr
      const dayGoals = isToday
        ? state.goals
        : state.goals.filter((g) => g.targetDate === dateStr);
      const completedGoalsList = dayGoals.filter(
        (g) => g.column === "complete",
      );
      const pendingGoalsList = dayGoals.filter((g) => g.column !== "complete");

      // 4. Habit Stack for dateStr
      const dayHabits = state.habits;
      const completedHabitsList = dayHabits.filter((h) => h.completed);
      const pendingHabitsList = dayHabits.filter((h) => !h.completed);

      const totalItems =
        dayTasks.length +
        dayBlocks.length +
        dayGoals.length +
        (isToday ? dayHabits.length : 0);
      const totalPending =
        pendingTasks.length +
        pendingBlocks.length +
        pendingGoalsList.length +
        (isToday ? pendingHabitsList.length : 0);
      const totalCompleted =
        completedTasks.length +
        completedBlocks.length +
        completedGoalsList.length +
        (isToday ? completedHabitsList.length : 0);

      let status = "empty"; // 'empty' | 'completed' | 'pending'
      let level = 0;

      if (totalItems > 0) {
        if (totalPending > 0) {
          status = "pending"; // Orange warning if any task, habit, block, or goal is pending
        } else if (totalCompleted > 0) {
          status = "completed"; // Green if ALL items are 100% completed
          const count = totalCompleted * 2;
          if (count >= 6) level = 4;
          else if (count >= 4) level = 3;
          else if (count >= 2) level = 2;
          else level = 1;
        }
      }

      days.push({
        date: dateStr,
        status,
        level,
        isPast,
        isToday,
        dayTasks,
        completedTasks,
        pendingTasks,
        dayBlocks,
        completedBlocks,
        pendingBlocks,
        dayGoals,
        completedGoalsList,
        pendingGoalsList,
        dayHabits,
        completedHabitsList,
        pendingHabitsList,
        totalCompleted,
        totalPending,
      });

      curr.setDate(curr.getDate() + 1);
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays();

  const getHeatmapColorStyle = (day) => {
    if (!day) return { backgroundColor: "var(--fs-heatmap-l0)" };
    console.log("inside the getHeatmap color", day);

    if (day.status === "pending") {
      // Warning Orange for ANY pending task, habit, timeblock, or goal
      return {
        backgroundColor: "#f97316",
        border: "1px solid #f97316",
        boxShadow: "0 0 6px rgba(249, 115, 22, 0.7)",
      };
    }

    switch (day.level) {
      case 0:
        return { backgroundColor: "var(--fs-heatmap-l0)" };
      case 1:
        return { backgroundColor: "var(--fs-heatmap-l1)" };
      case 2:
        return { backgroundColor: "var(--fs-heatmap-l2)" };
      case 3:
        return { backgroundColor: "var(--fs-heatmap-l3)" };
      case 4:
        return { backgroundColor: "var(--fs-heatmap-l4)" };
      default:
        return { backgroundColor: "var(--fs-heatmap-l0)" };
    }
  };

  const handleAddTimeline = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTimelineItem({
      title: newTitle.trim(),
      category: newCategory,
      note: newNote,
      date: newDate,
    });
    setNewTitle("");
    setNewNote("");
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header Banner */}
      <div className="card-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fs-color-text-primary)] tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-[var(--fs-color-brand-primary)]" />
            <span>Yearly Progress Analytics & Insights</span>
          </h1>
          <p className="text-xs text-[var(--fs-color-text-secondary)] mt-1">
            Real-time metric telemetry synchronized directly with PostgreSQL
            database.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="btn-primary py-2 px-4 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* REAL DB METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-glass space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider">
              Goal Execution
            </span>
            <Target className="w-4 h-4 text-[var(--fs-color-brand-primary)]" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--fs-color-text-primary)]">
            {goalCompletionRate}%
          </div>
          <p className="text-[11px] text-[var(--fs-color-text-tertiary)]">
            {completedGoals} of {totalGoals} goals complete
          </p>
        </div>

        <div className="card-glass space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider">
              Micro Tasks
            </span>
            <CheckCircle2 className="w-4 h-4 text-[var(--fs-color-success)]" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--fs-color-text-primary)]">
            {taskCompletionRate}%
          </div>
          <p className="text-[11px] text-[var(--fs-color-text-tertiary)]">
            {completedMicroTasks} of {totalMicroTasks} tasks done
          </p>
        </div>

        <div className="card-glass space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider">
              Time Blocks
            </span>
            <Clock className="w-4 h-4 text-[var(--fs-color-category-relations)]" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--fs-color-text-primary)]">
            {completedTimeBlocks}
          </div>
          <p className="text-[11px] text-[var(--fs-color-text-tertiary)]">
            {totalTimeBlocks} blocks scheduled
          </p>
        </div>

        <div className="card-glass space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider">
              Habit Stack
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--fs-color-text-primary)]">
            {completedHabits}/{totalHabits}
          </div>
          <p className="text-[11px] text-[var(--fs-color-text-tertiary)]">
            Active routines completed
          </p>
        </div>
      </div>

      {/* HEATMAP SECTION */}
      <div className="card-glass space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[var(--fs-color-brand-primary)]" />
              <span>Dynamic Productivity Activity Grid</span>
            </h2>
            <p className="text-xs text-[var(--fs-color-text-secondary)]">
              Click any date cell to view task details. Red cells highlight
              missed past tasks.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-3 text-[10px] text-[var(--fs-color-text-tertiary)] flex-wrap">
            <span className="flex items-center space-x-1">
              <span
                className="w-3 h-3 rounded-[2px]"
                style={{ backgroundColor: "var(--fs-heatmap-l0)" }}
              />
              <span>None</span>
            </span>
            <span className="flex items-center space-x-1">
              <span
                className="w-3 h-3 rounded-[2px]"
                style={{ backgroundColor: "var(--fs-heatmap-l2)" }}
              />
              <span>Completed</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-[2px] bg-amber-500" />
              <span>Pending Today</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-[2px] bg-rose-500" />
              <span>Missed Warning</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-rows-7 grid-flow-col gap-[3px] min-w-[780px]">
            {heatmapDays.map((d, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedHeatmapDay(d)}
                className="w-3 h-3 rounded-[2px] transition-all hover:scale-125 cursor-pointer"
                style={getHeatmapColorStyle(d)}
                title={`${d.date}: ${d.totalCompleted} completed, ${d.totalPending} pending`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Real Monthly Goal Completion Line Chart */}
        <div className="lg:col-span-7 chart-container space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[var(--fs-color-brand-primary)]" />
              <span>Monthly Goal Completion Rate (%)</span>
            </h2>
            <span className="text-xs font-bold text-[var(--fs-color-brand-primary)]">
              Overall: {goalCompletionRate}%
            </span>
          </div>

          <div className="h-64 w-full relative pt-4">
            <svg
              viewBox="0 0 500 200"
              className="w-full h-full overflow-visible"
            >
              <line
                x1="0"
                y1="40"
                x2="500"
                y2="40"
                className="chart-grid"
                strokeDasharray="4 4"
              />
              <line
                x1="0"
                y1="100"
                x2="500"
                y2="100"
                className="chart-grid"
                strokeDasharray="4 4"
              />
              <line
                x1="0"
                y1="160"
                x2="500"
                y2="160"
                className="chart-grid"
                strokeDasharray="4 4"
              />

              <defs>
                <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--fs-color-brand-primary)"
                    stopOpacity="0.4"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--fs-color-brand-secondary)"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              <path d={areaPathD} fill="url(#brandGradient)" />
              <path
                d={linePathD}
                fill="none"
                stroke="var(--fs-color-brand-primary)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {monthlyData.map((d, i) => {
                const x = (i / 11) * 500;
                const y = 200 - (d.rate / 100) * 160 - 20;
                return (
                  <g key={i} className="group cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="var(--fs-color-brand-primary)"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y - 10}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-[var(--fs-color-text-primary)]"
                    >
                      {d.rate}%
                    </text>
                    <text
                      x={x}
                      y={195}
                      textAnchor="middle"
                      className="chart-axis-text"
                      fontWeight="600"
                    >
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Dynamic Real Life Balance Radar Chart */}
        <div className="lg:col-span-5 chart-container space-y-4">
          <h2 className="text-sm font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-[var(--fs-color-category-relations)]" />
            <span>Life Balance Radar Across Pillars</span>
          </h2>

          <div className="h-64 w-full flex items-center justify-center relative py-2">
            <svg
              viewBox="-40 -20 280 240"
              className="w-full h-full max-h-56 overflow-visible"
            >
              {/* Pentagon Background Grid */}
              <polygon
                points="100,30 166,78 141,156 59,156 34,78"
                fill="none"
                stroke="var(--fs-color-surface-glass-border)"
                strokeWidth="1"
              />
              <polygon
                points="100,50 144,82 127,137 73,137 56,82"
                fill="none"
                stroke="var(--fs-color-surface-glass-border)"
                strokeWidth="1"
              />

              {/* Dynamic Real Polygon from Pillar Scores */}
              <polygon
                points={radarPoints}
                fill="rgba(99, 102, 241, 0.25)"
                stroke="var(--fs-color-brand-primary)"
                strokeWidth="2.5"
              />

              {pillarScores.slice(0, 5).map((p, idx) => {
                const labels = [
                  { x: 100, y: 12, anchor: "middle" },
                  { x: 175, y: 78, anchor: "start" },
                  { x: 148, y: 175, anchor: "start" },
                  { x: 52, y: 175, anchor: "end" },
                  { x: 25, y: 78, anchor: "end" },
                ];
                const pos = labels[idx] || labels[0];
                return (
                  <text
                    key={idx}
                    x={pos.x}
                    y={pos.y}
                    textAnchor={pos.anchor}
                    className="text-[11px] font-extrabold fill-[var(--fs-color-text-primary)]"
                  >
                    {p.name} ({p.score}%)
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Pillar Score Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 border-t border-[var(--fs-color-surface-glass-border)]">
            {pillarScores.map((p, idx) => (
              <span
                key={idx}
                className="badge badge-category text-[10px] font-bold"
              >
                {p.name}: {p.score}% ({p.compM}/{p.totalM})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* DYNAMIC MILESTONES TIMELINE & ADD FORM */}
      <div className="card-glass space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Milestone Moments & Breakthroughs</span>
          </h2>
          <span className="badge badge-category">
            {state.milestonesTimeline.length} Entries
          </span>
        </div>

        {/* Quick Add Timeline Entry Form */}
        <form
          onSubmit={handleAddTimeline}
          className="p-3 rounded-xl bg-[var(--fs-color-surface-secondary)] border border-[var(--fs-color-surface-glass-border)] space-y-2.5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Milestone title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input-text text-xs"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="input-text text-xs cursor-pointer"
            >
              <option value="Career">Career</option>
              <option value="Health">Health</option>
              <option value="Finance">Finance</option>
              <option value="Learning">Learning</option>
              <option value="Social">Social</option>
            </select>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="input-text text-xs cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Note / description (e.g. Achieved sub-4h marathon)..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="input-text flex-1 text-xs"
            />
            <button
              type="submit"
              className="btn-primary py-1.5 px-4 text-xs font-bold shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Breakthrough</span>
            </button>
          </div>
        </form>

        {/* Timeline Log List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {state.milestonesTimeline.length === 0 ? (
            <p className="text-xs text-[var(--fs-color-text-tertiary)] italic p-3 text-center">
              No milestone breakthroughs logged yet. Add your first achievement
              above!
            </p>
          ) : (
            state.milestonesTimeline.map((item) => (
              <div
                key={item.id}
                className="timeline-item p-3 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] flex items-start justify-between"
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5 flex-shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[var(--fs-color-text-primary)] truncate">
                        {item.title}
                      </span>
                      <span className="badge badge-category flex-shrink-0">
                        {item.category}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-xs text-[var(--fs-color-text-secondary)] mt-1">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                  <span className="text-xs font-mono text-[var(--fs-color-text-tertiary)]">
                    {item.date}
                  </span>
                  <button
                    onClick={() => deleteTimelineItem(item.id)}
                    className="p-1 rounded text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-danger)] transition-colors"
                    title="Delete milestone log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* HEATMAP DAY DETAIL MODAL */}
      {selectedHeatmapDay && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedHeatmapDay(null)}
        >
          <div
            className="modal-content max-w-lg space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--fs-color-surface-glass-border)]">
              <div>
                <h3 className="text-base font-bold text-[var(--fs-color-text-primary)]">
                  Daily Log Details: {selectedHeatmapDay.date}
                </h3>
                <p className="text-xs text-[var(--fs-color-text-secondary)]">
                  {selectedHeatmapDay.isToday
                    ? "Today's Activity Snapshot"
                    : "Historical Past Record"}
                </p>
              </div>
              <button
                onClick={() => setSelectedHeatmapDay(null)}
                className="btn-icon"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Alert Banner */}
            {selectedHeatmapDay.status === "pending" ? (
              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>⚠️ Pending Execution Warning</span>
                </div>
                <p>
                  You have {selectedHeatmapDay.totalPending} pending task(s),
                  habit(s), or time block(s) uncompleted for this date. Complete
                  all items to turn this day green!
                </p>
              </div>
            ) : selectedHeatmapDay.status === "completed" ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  🎉 100% Clean Execution! All microtasks, habits, schedules,
                  and goals completed for this date!
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] text-xs text-[var(--fs-color-text-secondary)] flex items-center space-x-2">
                <Info className="w-4 h-4 text-[var(--fs-color-text-tertiary)] shrink-0" />
                <span>
                  No activity or schedules were recorded for this date.
                </span>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)]">
                <span className="text-[var(--fs-color-text-secondary)] font-medium block mb-1">
                  Completed Items
                </span>
                <span className="text-lg font-bold text-[var(--fs-color-success)]">
                  {selectedHeatmapDay.totalCompleted}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)]">
                <span className="text-[var(--fs-color-text-secondary)] font-medium block mb-1">
                  Pending Items
                </span>
                <span
                  className={`text-lg font-bold ${selectedHeatmapDay.totalPending > 0 ? "text-amber-400" : "text-[var(--fs-color-text-secondary)]"}`}
                >
                  {selectedHeatmapDay.totalPending}
                </span>
              </div>
            </div>

            {/* Itemized Tasks Breakdown */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider">
                Execution Breakdown (Microtasks, Schedules, Habits, Goals)
              </h4>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {/* 1. Micro Tasks */}
                {selectedHeatmapDay.dayTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      t.completed
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400 font-medium"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {t.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span className="truncate">{t.title} (Microtask)</span>
                    </div>
                    <span className="text-[10px] font-mono shrink-0 ml-2">
                      {t.completed ? "Done ✓" : "Pending"}
                    </span>
                  </div>
                ))}

                {/* 2. Time Blocks */}
                {selectedHeatmapDay.dayBlocks.map((tb) => (
                  <div
                    key={tb.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      tb.status === "completed"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400 font-medium"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Clock className="w-3.5 h-3.5 text-[var(--fs-color-brand-primary)] shrink-0" />
                      <span className="font-mono text-[var(--fs-color-brand-primary)]">
                        {tb.timeSlot}
                      </span>
                      <span className="truncate">{tb.title}</span>
                    </div>
                    <span className="text-[10px] badge badge-category shrink-0 ml-2">
                      {tb.status}
                    </span>
                  </div>
                ))}

                {/* 3. Habit Stack */}
                {selectedHeatmapDay.isToday &&
                  selectedHeatmapDay.dayHabits.map((h) => (
                    <div
                      key={h.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        h.completed
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-400 font-medium"
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{h.name} (Habit)</span>
                      </div>
                      <span className="text-[10px] font-mono shrink-0 ml-2">
                        {h.completed ? "Done ✓" : "Pending"}
                      </span>
                    </div>
                  ))}

                {/* 4. Goals */}
                {selectedHeatmapDay.dayGoals.map((g) => (
                  <div
                    key={g.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      g.column === "complete"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-medium"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400 font-medium"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{g.title} (Goal Target)</span>
                    </div>
                    <span className="text-[10px] font-mono shrink-0 ml-2">
                      {g.column === "complete" ? "Completed" : `${g.progress}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
