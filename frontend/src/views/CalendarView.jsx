import React, { useState, useEffect } from 'react';
import { useFocus } from '../context/FocusContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Target,
  CheckCircle2
} from 'lucide-react';
import { apiService } from '../services/api';

export const CalendarView = () => {
  const { state, changeSelectedDate } = useFocus();

  const today = new Date();
  const getFormatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDateStr = getFormatDate(today);

  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateStr, setSelectedDateStr] = useState(state.selectedDate || todayDateStr);
  const [dayTimeBlocks, setDayTimeBlocks] = useState([]);
  const [dayMicroTasks, setDayMicroTasks] = useState([]);

  // Fetch detailed log for selected date
  useEffect(() => {
    let isMounted = true;
    async function loadDayDetails() {
      const [blocks, tasks] = await Promise.all([
        apiService.getTimeBlocks(selectedDateStr),
        apiService.getMicroTasks(selectedDateStr)
      ]);
      if (isMounted) {
        setDayTimeBlocks(Array.isArray(blocks) ? blocks : []);
        setDayMicroTasks(Array.isArray(tasks) ? tasks : []);
      }
    }
    loadDayDetails();
    return () => { isMounted = false; };
  }, [selectedDateStr]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

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

  const handleTodayClick = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateStr(todayDateStr);
    changeSelectedDate(todayDateStr);
  };

  const handleSelectDay = (dateStr) => {
    setSelectedDateStr(dateStr);
    changeSelectedDate(dateStr);
  };

  const daysArray = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

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
              {monthNames[month]} {year}
            </h1>
            <p className="text-xs text-[var(--fs-color-text-secondary)] mt-1">
              Synced monthly calendar. Click any day to view detailed tasks and schedule.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevMonth} className="btn-icon" title="Previous Month">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleTodayClick} 
            className="badge badge-category px-3 py-1.5 font-semibold text-xs hover:bg-[var(--fs-color-brand-primary)] hover:text-white transition-colors cursor-pointer"
          >
            Today ({today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
          </button>
          <button onClick={handleNextMonth} className="btn-icon" title="Next Month">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Grid (8 Cols) */}
        <div className="lg:col-span-8 card-glass space-y-4 overflow-hidden">
          
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[600px] space-y-4">
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
                    return <div key={`empty-${index}`} className="h-28 rounded-xl bg-[var(--fs-color-surface-secondary)]/30" />;
                  }

                  const dayDate = new Date(year, month, dayNum);
                  const dateStr = getFormatDate(dayDate);
                  const isSelected = selectedDateStr === dateStr;
                  const isToday = dateStr === todayDateStr;

                  // Tasks for this day box
                  const cellTasks = state.microTasks.filter(m => m.date === dateStr || (isToday && !m.date));
                  const cellBlocks = state.timeBlocks.filter(tb => tb.date === dateStr || (isToday && !tb.date));
                  const cellGoals = state.goals.filter(g => g.targetDate === dateStr);

                  const pendingTaskCount = cellTasks.filter(m => !m.completed).length;
                  const completedTaskCount = cellTasks.filter(m => m.completed).length;

                  return (
                    <div
                      key={dayNum}
                      onClick={() => handleSelectDay(dateStr)}
                      className={`h-28 p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                        isSelected
                          ? 'bg-[var(--fs-color-brand-primary)]/20 border-[var(--fs-color-brand-primary)] shadow-md shadow-indigo-500/20 ring-1 ring-[var(--fs-color-brand-primary)]'
                          : isToday
                          ? 'bg-amber-500/10 border-amber-500/50'
                          : 'bg-[var(--fs-color-surface-elevated)] border-[var(--fs-color-surface-glass-border)] hover:border-[var(--fs-color-brand-primary)]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          isToday ? 'w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px]' : 'text-[var(--fs-color-text-primary)]'
                        }`}>
                          {dayNum}
                        </span>
                        {cellGoals.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title={`${cellGoals.length} Goal Target`} />
                        )}
                      </div>

                      {/* Plainly render month tasks inside the day box */}
                      <div className="space-y-1 my-1 overflow-hidden">
                        {cellTasks.slice(0, 2).map((t, idx) => (
                          <div 
                            key={t.id || idx} 
                            className={`text-[9px] font-medium truncate px-1 rounded ${
                              t.completed ? 'line-through opacity-60 bg-[var(--fs-color-success)]/10 text-[var(--fs-color-success)]' : 'bg-[var(--fs-color-surface-tertiary)] text-[var(--fs-color-text-primary)]'
                            }`}
                            title={t.title}
                          >
                            • {t.title}
                          </div>
                        ))}
                      </div>

                      {/* Badges / Counters */}
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        {cellBlocks.length > 0 && (
                          <span className="px-1 py-0.5 rounded bg-[var(--fs-color-brand-primary)]/15 text-[var(--fs-color-brand-primary)] text-[8px] font-bold">
                            {cellBlocks.length} Blocks
                          </span>
                        )}
                        {pendingTaskCount > 0 && (
                          <span className="px-1 py-0.5 rounded bg-orange-500/20 text-orange-500 text-[8px] font-bold">
                            {pendingTaskCount} Pending
                          </span>
                        )}
                        {completedTaskCount > 0 && pendingTaskCount === 0 && cellTasks.length > 0 && (
                          <span className="px-1 py-0.5 rounded bg-[var(--fs-color-success)]/20 text-[var(--fs-color-success)] text-[8px] font-bold">
                            ✓ Done
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Day Agenda & Achievement History Details (4 Cols) */}
        <div className="lg:col-span-4 card-glass space-y-6">
          <div className="border-b border-[var(--fs-color-surface-glass-border)] pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--fs-color-text-primary)]">
                Daily Detailed Log
              </h3>
              <span className="badge badge-category font-mono text-[10px]">
                {selectedDateStr}
              </span>
            </div>
            <p className="text-xs text-[var(--fs-color-text-secondary)] mt-1">
              Detailed breakdown of schedule, micro tasks, and goals for selected date.
            </p>
          </div>

          {/* 1. Executed Time Blocks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--fs-color-brand-primary)]" />
              <span>Scheduled Time Blocks ({dayTimeBlocks.length})</span>
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {dayTimeBlocks.length === 0 ? (
                <p className="text-xs text-[var(--fs-color-text-tertiary)] italic">No time blocks scheduled on {selectedDateStr}.</p>
              ) : (
                dayTimeBlocks.map(tb => (
                  <div key={tb.id} className="p-2.5 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-[var(--fs-color-brand-primary)] font-bold mr-2">{tb.timeSlot}</span>
                      <span className="text-[var(--fs-color-text-primary)] font-medium">{tb.title}</span>
                    </div>
                    <span className="badge badge-category text-[10px]">
                      {tb.category || 'General'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Micro Tasks Executed */}
          <div className="space-y-3 pt-4 border-t border-[var(--fs-color-surface-glass-border)]">
            <h4 className="text-xs font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--fs-color-success)]" />
              <span>Micro Tasks ({dayMicroTasks.length})</span>
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {dayMicroTasks.length === 0 ? (
                <p className="text-xs text-[var(--fs-color-text-tertiary)] italic">No micro tasks for {selectedDateStr}.</p>
              ) : (
                dayMicroTasks.map(m => (
                  <div key={m.id} className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                    m.completed ? 'bg-[var(--fs-color-success)]/10 border-[var(--fs-color-success)]/30 text-[var(--fs-color-success)] font-medium' : 'bg-[var(--fs-color-surface-elevated)] border-[var(--fs-color-surface-glass-border)] text-[var(--fs-color-text-primary)]'
                  }`}>
                    <span className={`truncate ${m.completed ? 'line-through' : ''}`}>{m.title}</span>
                    <span className="text-[10px] font-mono opacity-80">{m.completed ? 'Done ✓' : 'Pending'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Goal Targets */}
          <div className="space-y-3 pt-4 border-t border-[var(--fs-color-surface-glass-border)]">
            <h4 className="text-xs font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Goal Deadlines & Progress</span>
            </h4>

            {dayGoals.length === 0 ? (
              <p className="text-xs text-[var(--fs-color-text-tertiary)] italic">No goal deadlines set for this day.</p>
            ) : (
              dayGoals.map(g => (
                <div key={g.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-300 font-semibold flex items-center justify-between">
                  <span>{g.title}</span>
                  <span>{g.progress}%</span>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
