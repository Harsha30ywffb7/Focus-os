import React, { useState } from 'react';
import { useFocus } from '../context/FocusContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Target 
} from 'lucide-react';

export const CalendarView = () => {
  const { state } = useFocus();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1));
  const [selectedDay, setSelectedDay] = useState(2);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const daysArray = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const selectedDateStr = `2026-08-${selectedDay.toString().padStart(2, '0')}`;
  const dayTimeBlocks = state.timeBlocks;
  const dayGoals = state.goals.filter(g => g.targetDate === selectedDateStr);

  return (
    <div className="space-y-6 page-enter">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-glass">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-[var(--fs-color-brand-primary)]/15 text-[var(--fs-color-brand-primary)]">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--fs-color-text-primary)] tracking-tight">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h1>
            <p className="text-xs text-[var(--fs-color-text-secondary)] mt-1">
              Synced schedule across time blocks, goal deadlines, and routines.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevMonth} className="btn-icon">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="badge badge-category px-3 py-1.5 font-semibold text-xs">
            Today (Aug 2)
          </span>
          <button onClick={handleNextMonth} className="btn-icon">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Grid (8 Cols) */}
        <div className="lg:col-span-8 card-glass space-y-4">
          
          <div className="grid grid-cols-7 text-center text-xs font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider pb-2 border-b border-[var(--fs-color-surface-glass-border)]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysArray.map((dayNum, index) => {
              if (dayNum === null) {
                return <div key={`empty-${index}`} className="h-24 rounded-xl bg-[var(--fs-color-surface-secondary)]/30" />;
              }

              const isSelected = selectedDay === dayNum;
              const isToday = dayNum === 2 && currentMonth.getMonth() === 7;
              const dateStr = `2026-08-${dayNum.toString().padStart(2, '0')}`;
              const goalCount = state.goals.filter(g => g.targetDate === dateStr).length;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-24 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--fs-color-brand-primary)]/20 border-[var(--fs-color-brand-primary)] shadow-md shadow-indigo-500/20'
                      : isToday
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-[var(--fs-color-surface-elevated)] border-[var(--fs-color-surface-glass-border)] hover:border-[var(--fs-color-brand-primary)]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      isToday ? 'w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center' : 'text-[var(--fs-color-text-primary)]'
                    }`}>
                      {dayNum}
                    </span>
                    {goalCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[var(--fs-color-brand-primary)]" title={`${goalCount} Goal Target`} />
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayNum === 2 && (
                      <div className="badge badge-category text-[9px] font-bold truncate">
                        {state.timeBlocks.length} Blocks
                      </div>
                    )}
                    {goalCount > 0 && (
                      <div className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[9px] font-bold truncate">
                        Goal Deadline
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Day Agenda Details (4 Cols) */}
        <div className="lg:col-span-4 card-glass space-y-6">
          <div className="border-b border-[var(--fs-color-surface-glass-border)] pb-4">
            <h3 className="text-base font-bold text-[var(--fs-color-text-primary)]">
              Agenda for August {selectedDay}, 2026
            </h3>
            <p className="text-xs text-[var(--fs-color-text-secondary)] mt-1">
              Time blocks and active deadlines
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--fs-color-brand-primary)]" />
              <span>Time Blocks ({dayTimeBlocks.length})</span>
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {dayTimeBlocks.map(tb => (
                <div key={tb.id} className="p-3 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-[var(--fs-color-brand-primary)] font-bold mr-2">{tb.timeSlot}</span>
                    <span className="text-[var(--fs-color-text-primary)] font-medium">{tb.title}</span>
                  </div>
                  <span className="badge badge-category text-[10px]">
                    {tb.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[var(--fs-color-surface-glass-border)]">
            <h4 className="text-xs font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Goal Target Dates ({dayGoals.length})</span>
            </h4>

            {dayGoals.length === 0 ? (
              <p className="text-xs text-[var(--fs-color-text-tertiary)] italic">No goal deadlines set for this day.</p>
            ) : (
              dayGoals.map(g => (
                <div key={g.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-300 font-semibold">
                  {g.title} ({g.progress}%)
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
