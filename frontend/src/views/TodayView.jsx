import React, { useState } from 'react';
import { useFocus } from '../context/FocusContext';
import {
  Sun,
  CloudSun,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Check,
  FileText,
  Zap,
  Flame,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';

export const TodayView = () => {
  const {
    state,
    changeSelectedDate,
    updateDailyIntention,
    toggleHabit,
    addHabit,
    deleteHabit,
    addTimeBlock,
    updateTimeBlockStatus,
    updateTimeBlock,
    deleteTimeBlock,
    addMicroTask,
    toggleMicroTask,
    deleteMicroTask,
    updateGoalColumn,
    deleteGoal
  } = useFocus();

  const [newHabitText, setNewHabitText] = useState('');
  const [newMicroText, setNewMicroText] = useState('');
  const [newMicroCategory, setNewMicroCategory] = useState('Engineering');
  const [newMicroPriority, setNewMicroPriority] = useState('medium');
  const [draggedTimeBlock, setDraggedTimeBlock] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDate = state.selectedDate || todayStr;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    changeSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    changeSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    changeSelectedDate(todayStr);
  };

  // Dynamically derive Top 3 Priorities from active tasks & goals (excluding Backlog items)
  const priorityRank = { high: 1, medium: 2, low: 3 };
  const topPrioritiesList = [
    ...state.microTasks
      .map(m => ({
        id: m.id,
        title: m.title,
        category: m.category || 'Task',
        isTask: true,
        priority: m.priority,
        completed: !!m.completed
      })),
    ...state.goals
      .filter(g => g.column !== 'backlog') // Exclude Backlog goals from Top 3 Priorities
      .map(g => ({
        id: g.id,
        title: g.title,
        category: g.category || 'Goal',
        isTask: false,
        priority: g.priority,
        completed: g.column === 'complete' || g.column === 'completed' || (g.progress !== undefined && Number(g.progress) >= 100)
      }))
  ]
    .sort((a, b) => {
      // Keep uncompleted first, then completed, sorted by priority
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (priorityRank[a.priority] || 2) - (priorityRank[b.priority] || 2);
    })
    .slice(0, 3);

  const timeSlots = [];
  for (let hour = 5; hour <= 23; hour++) {
    const hh = hour.toString().padStart(2, '0');
    timeSlots.push(`${hh}:00`);
    timeSlots.push(`${hh}:30`);
  }

  const handleAddMicro = (e) => {
    e.preventDefault();
    if (!newMicroText.trim()) return;
    addMicroTask(newMicroText, newMicroCategory, newMicroPriority);
    setNewMicroText('');
  };

  const handleDragStart = (block) => {
    setDraggedTimeBlock(block);
  };

  const handleDropOnSlot = (slotTime) => {
    if (draggedTimeBlock) {
      deleteTimeBlock(draggedTimeBlock.id);
      addTimeBlock({
        ...draggedTimeBlock,
        timeSlot: slotTime
      });
      setDraggedTimeBlock(null);
    }
  };

  console.log("statestae", state);

  return (
    <div className="max-w-5xl mx-auto space-y-6 page-enter pb-8">

      {/* 1. Morning Focus Brief & Top Priorities */}
      <div className="card-glass space-y-5 border-t-2 border-t-[var(--fs-color-brand-primary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-[var(--fs-color-text-primary)]">Morning Focus Brief</span>
          </div>
          <span className="badge badge-category font-semibold">Optimal Focus ☀️</span>
        </div>

        {/* Top 3 Priorities */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider">Top 3 Priorities</h3>
            <span className="text-[10px] text-[var(--fs-color-brand-primary)] font-semibold">Anchor Tasks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topPrioritiesList.length === 0 ? (
              <p className="text-xs text-[var(--fs-color-text-tertiary)] italic p-2 col-span-3">No active priorities. Add a task or goal!</p>
            ) : (
              topPrioritiesList.map((item, idx) => (
                <div key={item.id} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${item.completed
                    ? 'bg-[var(--fs-color-success)]/10 border-[var(--fs-color-success)]/30 text-[var(--fs-color-success)]'
                    : 'bg-[var(--fs-color-surface-elevated)] border-[var(--fs-color-surface-glass-border)] text-[var(--fs-color-text-primary)]'
                  }`}>
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                    <span className={`w-5 h-5 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 ${item.completed
                        ? 'bg-[var(--fs-color-success)]/20 text-[var(--fs-color-success)]'
                        : 'bg-[var(--fs-color-brand-primary)]/20 text-[var(--fs-color-brand-primary)]'
                      }`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold truncate ${item.completed ? 'text-[var(--fs-color-success)] font-bold' : 'text-[var(--fs-color-text-primary)]'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-[var(--fs-color-text-tertiary)] inline-block">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => {
                        if (item.isTask) {
                          toggleMicroTask(item.id);
                        } else {
                          updateGoalColumn(item.id, item.completed ? 'in-progress' : 'complete');
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${item.completed
                          ? 'text-[var(--fs-color-success)] bg-[var(--fs-color-success)]/20 hover:bg-[var(--fs-color-success)]/30'
                          : 'text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-success)] hover:bg-[var(--fs-color-surface-tertiary)]'
                        }`}
                      title={item.completed ? "Mark Incomplete" : "Mark Complete"}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (item.isTask) deleteMicroTask(item.id);
                        else deleteGoal(item.id);
                      }}
                      className="p-1.5 rounded-lg text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-danger)] hover:bg-[var(--fs-color-surface-tertiary)] transition-colors"
                      title="Delete Priority"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Habits Stack */}
        <div className="space-y-3 pt-3 border-t border-[var(--fs-color-surface-glass-border)]">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider">Habit Stack</h3>
            <span className="text-[10px] text-amber-400 font-semibold flex items-center space-x-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>{state.habits.filter(h => h.completed).length}/{state.habits.length}</span>
            </span>
          </div>

          {/* Add New Habit Form */}
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!newHabitText.trim()) return;
            addHabit(newHabitText.trim());
            setNewHabitText('');
          }} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add new habit..."
              value={newHabitText}
              onChange={(e) => setNewHabitText(e.target.value)}
              className="input-text flex-1 text-xs py-1.5 px-3 min-h-[36px]"
            />
            <button type="submit" className="btn-primary py-1 px-3 min-h-[36px] text-xs shrink-0">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Habit</span>
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {state.habits.map((habit) => (
              <div
                key={habit.id}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${habit.completed
                    ? 'bg-[var(--fs-color-success)]/10 border-[var(--fs-color-success)]/30 text-[var(--fs-color-success)]'
                    : 'bg-[var(--fs-color-surface-elevated)] border-[var(--fs-color-surface-glass-border)] text-[var(--fs-color-text-primary)]'
                  }`}
              >
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className="flex items-center space-x-2.5 flex-1 min-w-0 text-left"
                >
                  {habit.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--fs-color-success)] flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-[var(--fs-color-text-tertiary)] flex-shrink-0" />
                  )}
                  <span className={`text-xs font-medium truncate ${habit.completed ? 'line-through opacity-70' : ''}`}>
                    {habit.text}
                  </span>
                </button>

                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-1 rounded text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-danger)] transition-colors ml-2 flex-shrink-0"
                  title="Delete habit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Time-Blocked Schedule */}
      <div className="card-glass flex flex-col min-h-[500px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[var(--fs-color-surface-glass-border)]">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[var(--fs-color-brand-primary)]" />
            <div>
              <h2 className="text-sm font-bold text-[var(--fs-color-text-primary)]">Time-Blocked Schedule</h2>
              <p className="text-[11px] text-[var(--fs-color-text-secondary)]">05:00 – 23:00 • 30-min increments</p>
            </div>
          </div>

          {/* Date Selector & Day-by-Day History Controls */}
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg border border-[var(--fs-color-surface-glass-border)] bg-[var(--fs-color-surface-elevated)] hover:bg-[var(--fs-color-surface-tertiary)] text-[var(--fs-color-text-primary)] transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative flex items-center bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] rounded-lg px-2.5 py-1 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-[var(--fs-color-brand-primary)]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => changeSelectedDate(e.target.value)}
                className="bg-transparent border-none text-[var(--fs-color-text-primary)] focus:outline-none cursor-pointer text-xs"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg border border-[var(--fs-color-surface-glass-border)] bg-[var(--fs-color-surface-elevated)] hover:bg-[var(--fs-color-surface-tertiary)] text-[var(--fs-color-text-primary)] transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {selectedDate !== todayStr && (
              <button
                onClick={handleToday}
                className="px-2 py-1 rounded-lg text-xs font-semibold bg-[var(--fs-color-brand-primary)] text-white hover:opacity-90 transition-opacity"
              >
                Today
              </button>
            )}

            <div className="flex items-center space-x-2 text-[10px] font-semibold ml-2">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[var(--fs-color-success)]" />
                <span>Done</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[var(--fs-color-brand-primary)] animate-pulse" />
                <span>Active</span>
              </span>
            </div>
          </div>
        </div>

        {/* Time Slot Timeline Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-4 max-h-[600px]">
          {timeSlots.map((slot) => {
            const slotToMins = (s) => {
              if (!s) return 0;
              const [h, m] = s.split(':').map(Number);
              return h * 60 + m;
            };

            const currentSlotMins = slotToMins(slot);

            // Primary blocks starting at this slot
            const primaryBlocks = state.timeBlocks.filter(tb => tb.timeSlot === slot);

            // Spanning blocks covering this slot from earlier slots
            const spanningBlocks = state.timeBlocks.filter(tb => {
              if (tb.timeSlot === slot) return false;
              const start = slotToMins(tb.timeSlot);
              const end = start + (tb.durationMinutes || 30);
              return currentSlotMins > start && currentSlotMins < end;
            });

            const isEmpty = primaryBlocks.length === 0 && spanningBlocks.length === 0;

            return (
              <div
                key={slot}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnSlot(slot)}
                className="flex items-start space-x-3 p-1 rounded-xl transition-all group hover:bg-[var(--fs-color-surface-secondary)]"
              >
                <div className="w-12 text-right text-xs font-mono text-[var(--fs-color-text-tertiary)] pt-1">
                  {slot}
                </div>

                <div className="flex-1 min-h-[48px] rounded-xl border border-dashed border-[var(--fs-color-surface-glass-border)] p-2 flex flex-col justify-center gap-1.5 bg-[var(--fs-color-surface-elevated)]">
                  {isEmpty ? (
                    <div className="text-[11px] text-[var(--fs-color-text-tertiary)] italic flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span>Click or drag task to assign slot</span>
                      <Plus className="w-3.5 h-3.5 text-[var(--fs-color-brand-primary)]" />
                    </div>
                  ) : (
                    <>
                      {/* Primary Starting Time Blocks */}
                      {primaryBlocks.map(block => (
                        <div
                          key={block.id}
                          draggable
                          onDragStart={() => handleDragStart(block)}
                          className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between cursor-grab transition-all ${block.status === 'completed'
                              ? 'bg-[var(--fs-color-success)]/15 border-[var(--fs-color-success)]/40 text-[var(--fs-color-success)] line-through'
                              : block.status === 'in-progress'
                                ? 'bg-[var(--fs-color-brand-primary)]/20 border-[var(--fs-color-brand-primary)] text-[var(--fs-color-text-primary)] shadow-md shadow-indigo-500/20'
                                : 'bg-[var(--fs-color-surface-secondary)] border-[var(--fs-color-surface-glass-border)] text-[var(--fs-color-text-primary)]'
                            }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            {/* Dynamic Duration Selector */}
                            <select
                              value={block.durationMinutes || 60}
                              onChange={(e) => updateTimeBlock(block.id, { durationMinutes: parseInt(e.target.value) })}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--fs-color-surface-tertiary)] text-[var(--fs-color-text-brand)] border border-[var(--fs-color-surface-glass-border)] cursor-pointer focus:outline-none"
                              title="Change Duration"
                            >
                              <option value={30}>30m</option>
                              <option value={60}>1h (60m)</option>
                              <option value={90}>1.5h (90m)</option>
                              <option value={120}>2h (120m)</option>
                              <option value={150}>2.5h (150m)</option>
                              <option value={180}>3h (180m)</option>
                              <option value={240}>4h (240m)</option>
                              <option value={300}>5h (300m)</option>
                              <option value={360}>6h (360m)</option>
                              <option value={480}>8h (480m)</option>
                            </select>
                            <span className="font-semibold truncate">{block.title}</span>
                          </div>

                          <div className="flex items-center space-x-1.5 ml-2">
                            <button
                              onClick={() => updateTimeBlockStatus(block.id, block.status === 'completed' ? 'upcoming' : 'completed')}
                              className="p-1 rounded hover:text-[var(--fs-color-success)]"
                              title="Toggle Complete"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateTimeBlockStatus(block.id, block.status === 'in-progress' ? 'upcoming' : 'in-progress')}
                              className="p-1 rounded hover:text-[var(--fs-color-brand-primary)]"
                              title="Toggle Active"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTimeBlock(block.id)}
                              className="p-1 rounded hover:text-[var(--fs-color-danger)]"
                              title="Delete Block"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Spanning / Continuation Slots for Multi-Hour Tasks */}
                      {spanningBlocks.map(block => (
                        <div
                          key={`span-${block.id}-${slot}`}
                          className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-between transition-all opacity-85 ${
                            block.status === 'completed'
                              ? 'bg-[var(--fs-color-success)]/10 border-[var(--fs-color-success)]/30 text-[var(--fs-color-success)] line-through'
                              : block.status === 'in-progress'
                                ? 'bg-[var(--fs-color-brand-primary)]/15 border-[var(--fs-color-brand-primary)]/40 text-[var(--fs-color-text-primary)] shadow-sm'
                                : 'bg-[var(--fs-color-surface-secondary)] border-[var(--fs-color-surface-glass-border)] text-[var(--fs-color-text-secondary)]'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="text-[10px] font-bold text-[var(--fs-color-brand-primary)]">↳</span>
                            <span className="font-semibold truncate">{block.title}</span>
                            <span className="text-[10px] text-[var(--fs-color-text-tertiary)] italic">(Filled Slot)</span>
                          </div>
                          <span className="text-[10px] font-mono text-[var(--fs-color-text-tertiary)]">Started {block.timeSlot}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Micro Tasks */}
      <div className="card-glass space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--fs-color-brand-primary)]" />
            <h3 className="text-sm font-bold text-[var(--fs-color-text-primary)]">Micro Tasks</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[var(--fs-color-surface-tertiary)] text-[var(--fs-color-text-secondary)] border border-[var(--fs-color-surface-glass-border)]">
            {state.microTasks.filter(m => m.completed).length}/{state.microTasks.length} Done
          </span>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleAddMicro} className="grid grid-cols-1 md:grid-cols-12 gap-2">
          <div className="relative flex items-center md:col-span-6">
            <input
              type="text"
              placeholder="Add a task title..."
              value={newMicroText}
              onChange={(e) => setNewMicroText(e.target.value)}
              className="input-text w-full text-xs pr-10 py-2"
            />
            <button
              type="submit"
              disabled={!newMicroText.trim()}
              className="absolute right-1.5 p-1.5 rounded-md bg-[var(--fs-color-brand-primary)] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              title="Add Task"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <select
            value={newMicroCategory}
            onChange={(e) => setNewMicroCategory(e.target.value)}
            className="input-text text-[11px] py-1.5 px-2 cursor-pointer md:col-span-3"
          >
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Operations">Operations</option>
            <option value="Personal">Personal</option>
          </select>

          <select
            value={newMicroPriority}
            onChange={(e) => setNewMicroPriority(e.target.value)}
            className="input-text text-[11px] py-1.5 px-2 cursor-pointer md:col-span-3"
          >
            <option value="high">P1 - High Priority</option>
            <option value="medium">P2 - Medium Priority</option>
            <option value="low">P3 - Low Priority</option>
          </select>
        </form>

        {/* Task Item Rows */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {state.microTasks.length === 0 ? (
            <p className="text-xs text-[var(--fs-color-text-tertiary)] italic p-3 text-center">No micro tasks added yet.</p>
          ) : (
            state.microTasks.map((task) => (
              <div
                key={task.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${task.completed
                    ? 'bg-[var(--fs-color-surface-secondary)]/50 border-[var(--fs-color-surface-glass-border)] opacity-60'
                    : 'bg-[var(--fs-color-surface-elevated)] border-[var(--fs-color-surface-glass-border)] hover:border-[var(--fs-color-brand-primary)]/40'
                  }`}
              >
                <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                  <button onClick={() => toggleMicroTask(task.id)} className="flex-shrink-0 focus:outline-none">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--fs-color-success)]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-brand-primary)] transition-colors" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-medium truncate leading-snug ${task.completed ? 'line-through text-[var(--fs-color-text-tertiary)]' : 'text-[var(--fs-color-text-primary)]'}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] text-[var(--fs-color-text-tertiary)] font-mono">{task.category || 'General'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <span className={`badge ${task.priority === 'high' ? 'badge-priority-high' : task.priority === 'medium' ? 'badge-priority-medium' : 'badge-priority-low'
                    }`}>
                    {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Med' : 'Low'}
                  </span>

                  <button
                    onClick={() => deleteMicroTask(task.id)}
                    className="p-1 rounded-md text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-danger)] hover:bg-[var(--fs-color-surface-tertiary)] transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
