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
    addTimeBlock,
    updateTimeBlockStatus, 
    deleteTimeBlock,
    updateNotes, 
    addMicroTask, 
    toggleMicroTask, 
    deleteMicroTask 
  } = useFocus();

  const [newMicroText, setNewMicroText] = useState('');
  const [newMicroCategory, setNewMicroCategory] = useState('Engineering');
  const [newMicroPriority, setNewMicroPriority] = useState('medium');
  const [draggedTimeBlock, setDraggedTimeBlock] = useState(null);

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
                <CloudSun className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-bold text-[var(--fs-color-text-primary)]">Morning Brief</span>
              </div>
              <span className="text-xs text-[var(--fs-color-text-tertiary)]">{state.weather.city}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--fs-color-surface-secondary)] border border-[var(--fs-color-surface-glass-border)]">
              <div>
                <div className="text-2xl font-bold text-[var(--fs-color-text-primary)]">{state.weather.temp}°C</div>
                <div className="text-xs text-[var(--fs-color-text-secondary)] font-medium">{state.weather.condition}</div>
              </div>
              <span className="badge badge-category">Optimal Focus ☀️</span>
            </div>

            {/* Top 3 Priorities */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider">Top 3 Priorities</h3>
                <span className="text-[10px] text-[var(--fs-color-brand-primary)]">Anchor Tasks</span>
              </div>

              <div className="space-y-2">
                {state.topPriorities.map((item, idx) => (
                  <div key={item.id} className="p-3 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] flex items-start space-x-3">
                    <span className="w-5 h-5 rounded-full bg-[var(--fs-color-brand-primary)]/20 text-[var(--fs-color-brand-primary)] font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-[var(--fs-color-text-primary)] leading-snug">{item.title}</p>
                      <span className="text-[10px] text-[var(--fs-color-text-tertiary)] mt-0.5 inline-block">{item.category}</span>
                    </div>
                  </div>
                ))}
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

              <div className="space-y-2">
                {state.habits.map((habit) => (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      habit.completed
                        ? 'bg-[var(--fs-color-success)]/10 border-[var(--fs-color-success)]/30 text-[var(--fs-color-success)]'
                        : 'bg-[var(--fs-color-surface-elevated)] border-[var(--fs-color-surface-glass-border)] text-[var(--fs-color-text-primary)]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {habit.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--fs-color-success)] flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[var(--fs-color-text-tertiary)] flex-shrink-0" />
                      )}
                      <span className={`text-xs font-medium ${habit.completed ? 'line-through opacity-70' : ''}`}>
                        {habit.text}
                      </span>
                    </div>
                  </button>
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
              <h3 className="text-sm font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--fs-color-success)]" />
                <span>Micro Tasks</span>
              </h3>
              <span className="badge badge-category">
                {state.microTasks.filter(m => m.completed).length}/{state.microTasks.length} Completed
              </span>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddMicro} className="space-y-2">
              <input
                type="text"
                placeholder="Add new micro task..."
                value={newMicroText}
                onChange={(e) => setNewMicroText(e.target.value)}
                className="input-text w-full text-xs"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newMicroCategory}
                  onChange={(e) => setNewMicroCategory(e.target.value)}
                  className="input-text text-[11px] py-1.5 px-2 cursor-pointer w-full"
                >
                  <option value="Engineering">Code</option>
                  <option value="Admin">Admin</option>
                  <option value="Design">Design</option>
                  <option value="Personal">Personal</option>
                </select>

                <select
                  value={newMicroPriority}
                  onChange={(e) => setNewMicroPriority(e.target.value)}
                  className="input-text text-[11px] py-1.5 px-2 cursor-pointer w-full"
                >
                  <option value="high">High 🔴</option>
                  <option value="medium">Med 🟡</option>
                  <option value="low">Low 🟢</option>
                </select>
              </div>

              <button type="submit" className="btn-primary w-full py-2 min-h-[36px] text-xs font-bold flex items-center justify-center space-x-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Micro Task</span>
              </button>
            </form>

            {/* Task Item Rows */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {state.microTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    task.completed
                      ? 'bg-[var(--fs-color-success)]/10 border-[var(--fs-color-success)]/30 text-[var(--fs-color-success)] opacity-80'
                      : 'bg-[var(--fs-color-surface-elevated)] border-[var(--fs-color-surface-glass-border)] text-[var(--fs-color-text-primary)]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                    <button onClick={() => toggleMicroTask(task.id)} className="flex-shrink-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-[var(--fs-color-success)]" />
                      ) : (
                        <Circle className="w-4.5 h-4.5 text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-brand-primary)]" />
                      )}
                    </button>
                    <span className={`text-xs font-semibold truncate ${task.completed ? 'line-through opacity-70' : ''}`}>
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span className={`badge ${
                      task.priority === 'high' ? 'badge-priority-high' : task.priority === 'medium' ? 'badge-priority-medium' : 'badge-priority-low'
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>
                    <button
                      onClick={() => deleteMicroTask(task.id)}
                      className="p-1 rounded-md text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-danger)] hover:bg-[var(--fs-color-surface-tertiary)] transition-colors"
                      title="Delete Micro Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
