import React, { useState } from 'react';
import { useFocus } from '../context/FocusContext';
import { 
  Sun, 
  CloudSun, 
  Quote, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  FileText, 
  Zap, 
  Flame
} from 'lucide-react';

export const TodayView = () => {
  const { 
    state, 
    updateDailyIntention, 
    toggleHabit, 
    addHabit,
    deleteHabit,
    addTimeBlock,
    updateTimeBlockStatus, 
    deleteTimeBlock,
    updateNotes, 
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

  // Dynamically derive Top 3 Priorities from real DB tasks & goals
  const topPrioritiesList = [
    ...state.microTasks
      .filter(m => !m.completed)
      .map(m => ({ id: m.id, title: m.title, category: m.category || 'Task', isTask: true, priority: m.priority })),
    ...state.goals
      .filter(g => g.column !== 'complete')
      .map(g => ({ id: g.id, title: g.title, category: g.category || 'Goal', isTask: false, priority: g.priority }))
  ]
  .sort((a, b) => (a.priority === 'high' ? -1 : 1))
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

  return (
    <div className="space-y-6 page-enter">
      


      {/* Three Column Grid (Specification 10.2: 1fr 1.6fr 1fr with 24px gaps) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Morning Brief Card (3 Cols on Desktop = ~1fr) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card-glass space-y-4 border-t-2 border-t-[var(--fs-color-brand-primary)]">
            
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

              <div className="space-y-2">
                {topPrioritiesList.length === 0 ? (
                  <p className="text-xs text-[var(--fs-color-text-tertiary)] italic p-2">No active priorities. Add a task or goal!</p>
                ) : (
                  topPrioritiesList.map((item, idx) => (
                    <div key={item.id} className="p-3 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[var(--fs-color-brand-primary)]/20 text-[var(--fs-color-brand-primary)] font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[var(--fs-color-text-primary)] truncate">{item.title}</p>
                          <span className="text-[10px] text-[var(--fs-color-text-tertiary)] inline-block">{item.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                        <button
                          onClick={() => {
                            if (item.isTask) toggleMicroTask(item.id);
                            else updateGoalColumn(item.id, 'complete');
                          }}
                          className="p-1 rounded text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-success)] transition-colors"
                          title="Mark Complete"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (item.isTask) deleteMicroTask(item.id);
                            else deleteGoal(item.id);
                          }}
                          className="p-1 rounded text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-danger)] transition-colors"
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

            {/* Habits Checklist */}
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
                  className="input-text flex-1 text-xs py-1 px-2.5 min-h-[34px]"
                />
                <button type="submit" className="btn-primary py-1 px-2.5 min-h-[34px] text-xs shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {state.habits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      habit.completed
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
        </div>

        {/* CENTER COLUMN: Time-Blocked Schedule (6 Cols on Desktop = ~1.6fr) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card-glass flex flex-col h-[700px]">
            
            <div className="flex items-center justify-between pb-4 border-b border-[var(--fs-color-surface-glass-border)]">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[var(--fs-color-brand-primary)]" />
                <div>
                  <h2 className="text-sm font-bold text-[var(--fs-color-text-primary)]">Time-Blocked Schedule</h2>
                  <p className="text-[11px] text-[var(--fs-color-text-secondary)]">05:00 – 23:00 • 30-min increments</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-[10px] font-semibold">
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

            {/* Time Slot Timeline Grid (Each slot 48px height per Section 10.2) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-4">
              {timeSlots.map((slot) => {
                const assignedBlocks = state.timeBlocks.filter(tb => tb.timeSlot === slot);

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

                    <div className="flex-1 min-h-[48px] rounded-xl border border-dashed border-[var(--fs-color-surface-glass-border)] p-2 flex flex-col justify-center bg-[var(--fs-color-surface-elevated)]">
                      {assignedBlocks.length === 0 ? (
                        <div className="text-[11px] text-[var(--fs-color-text-tertiary)] italic flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <span>Click or drag task to assign slot</span>
                          <Plus className="w-3.5 h-3.5 text-[var(--fs-color-brand-primary)]" />
                        </div>
                      ) : (
                        assignedBlocks.map(block => (
                          <div
                            key={block.id}
                            draggable
                            onDragStart={() => handleDragStart(block)}
                            className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between cursor-grab transition-all ${
                              block.status === 'completed'
                                ? 'bg-[var(--fs-color-success)]/15 border-[var(--fs-color-success)]/40 text-[var(--fs-color-success)] line-through'
                                : block.status === 'in-progress'
                                ? 'bg-[var(--fs-color-brand-primary)]/20 border-[var(--fs-color-brand-primary)] text-[var(--fs-color-text-primary)] shadow-md shadow-indigo-500/20'
                                : 'bg-[var(--fs-color-surface-secondary)] border-[var(--fs-color-surface-glass-border)] text-[var(--fs-color-text-primary)]'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--fs-color-surface-tertiary)] text-[var(--fs-color-text-brand)]">
                                {block.durationMinutes}m
                              </span>
                              <span className="font-semibold truncate">{block.title}</span>
                            </div>

                            <div className="flex items-center space-x-1.5 ml-2">
                              <button
                                onClick={() => updateTimeBlockStatus(block.id, block.status === 'completed' ? 'upcoming' : 'completed')}
                                className="p-1 rounded hover:text-[var(--fs-color-success)]"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => updateTimeBlockStatus(block.id, block.status === 'in-progress' ? 'upcoming' : 'in-progress')}
                                className="p-1 rounded hover:text-[var(--fs-color-brand-primary)]"
                              >
                                <Zap className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteTimeBlock(block.id)}
                                className="p-1 rounded hover:text-[var(--fs-color-danger)]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Quick Capture & Micro Tasks (3 Cols on Desktop = ~1fr) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Quick Capture Textarea */}
          <div className="card-glass space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[var(--fs-color-brand-primary)]" />
                <h3 className="text-sm font-bold text-[var(--fs-color-text-primary)]">Quick Capture Notes</h3>
              </div>
              <span className="text-[10px] text-[var(--fs-color-text-tertiary)]">Auto-saved</span>
            </div>

            <textarea
              value={state.quickCaptureNotes}
              onChange={(e) => updateNotes(e.target.value)}
              placeholder="Brain dump notes, ideas, scratchpad..."
              className="textarea w-full"
            />
          </div>

          {/* Micro Tasks */}
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

            {/* Quick Add Form - Shadcn Input Group */}
            <form onSubmit={handleAddMicro} className="space-y-2">
              <div className="relative flex items-center">
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
              
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newMicroCategory}
                  onChange={(e) => setNewMicroCategory(e.target.value)}
                  className="input-text text-[11px] py-1.5 px-2 cursor-pointer w-full"
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
                  className="input-text text-[11px] py-1.5 px-2 cursor-pointer w-full"
                >
                  <option value="high">P1 - High Priority</option>
                  <option value="medium">P2 - Medium Priority</option>
                  <option value="low">P3 - Low Priority</option>
                </select>
              </div>
            </form>

            {/* Task Item Rows */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {state.microTasks.length === 0 ? (
                <p className="text-xs text-[var(--fs-color-text-tertiary)] italic p-3 text-center">No micro tasks added yet.</p>
              ) : (
                state.microTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                      task.completed
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
                      <span className={`badge ${
                        task.priority === 'high' ? 'badge-priority-high' : task.priority === 'medium' ? 'badge-priority-medium' : 'badge-priority-low'
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

      </div>
    </div>
  );
};
