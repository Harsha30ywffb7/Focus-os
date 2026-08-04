import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';

const FocusContext = createContext();

const THEME_STORAGE_KEY = 'focus_os_theme';

// Seed Initial Data
const defaultState = {
  theme: 'dark', // 'dark' | 'light'
  accentColor: 'indigo',
  activeView: 'today', // 'today' | 'calendar' | 'goals' | 'vision' | 'analytics' | 'settings'
  isSidebarOpen: true,
  selectedDate: new Date().toISOString().split('T')[0],

  // Today View Data
  dailyIntention: 'Lead with clarity, execute high-impact priorities, and maintain physical balance.',
  weather: { temp: 22, condition: "Partly Cloudy", city: "San Francisco", icon: "SunCloud" },

  habits: [],
  timeBlocks: [],

  microTasks: [],
  topPriorities: [],
  goals: [],
  pillars: [],
  streakCount: 14,
  longestStreak: 21,
  milestonesTimeline: []
};

export const FocusProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    let savedTheme = 'dark';
    try {
      // Clear legacy app state from local storage so only theme is persisted
      localStorage.removeItem('focus_os_app_state_v1');
      savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    } catch (e) {
      console.error('Error reading localStorage theme:', e);
    }
    return {
      ...defaultState,
      theme: savedTheme,
      selectedDate: new Date().toISOString().split('T')[0]
    };
  });

  // Hydrate real state from Bun backend API on mount
  useEffect(() => {
    async function loadBackendData() {
      const todayDate = state.selectedDate || new Date().toISOString().split('T')[0];
      const remoteData = await apiService.fetchState(todayDate);
      if (remoteData) {
        setState(prev => ({
          ...prev,
          goals: remoteData.goals || [],
          habits: remoteData.habits || [],
          microTasks: remoteData.microTasks || [],
          timeBlocks: remoteData.timeBlocks || [],
          pillars: remoteData.pillars || [],
          milestonesTimeline: remoteData.milestonesTimeline || []
        }));
      }
    }
    loadBackendData();
  }, []);

  // Save ONLY theme to localStorage (no other app state in local storage)
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, state.theme);
    } catch (e) {
      console.error('Error saving theme to localStorage:', e);
    }
  }, [state.theme]);

  // Apply root HTML dark/light class
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [state.theme]);

  // Helper trigger confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899']
    });
  };

  // Actions
  const setActiveView = (view) => setState(prev => ({ ...prev, activeView: view }));

  const toggleTheme = () => setState(prev => ({
    ...prev,
    theme: prev.theme === 'dark' ? 'light' : 'dark'
  }));

  const toggleSidebar = () => setState(prev => ({
    ...prev,
    isSidebarOpen: !prev.isSidebarOpen
  }));

  const changeSelectedDate = async (newDate) => {
    setState(prev => ({ ...prev, selectedDate: newDate }));
    const [blocks, tasks] = await Promise.all([
      apiService.getTimeBlocks(newDate),
      apiService.getMicroTasks(newDate)
    ]);
    setState(prev => ({
      ...prev,
      timeBlocks: Array.isArray(blocks) ? blocks : [],
      microTasks: Array.isArray(tasks) ? tasks : []
    }));
  };

  const updateDailyIntention = (intention) => setState(prev => ({ ...prev, dailyIntention: intention }));

  const toggleHabit = (id) => {
    let isCompleted = false;
    setState(prev => {
      const updated = prev.habits.map(h => {
        if (h.id === id) {
          const next = !h.completed;
          isCompleted = next;
          if (next) triggerConfetti();
          return { ...h, completed: next };
        }
        return h;
      });
      return { ...prev, habits: updated };
    });
    apiService.updateHabit(id, { completed: isCompleted });
  };

  const addHabit = (text) => {
    const newHabit = { id: 'h_' + Date.now(), text, completed: false, icon: 'CheckCircle2' };
    setState(prev => ({
      ...prev,
      habits: [...prev.habits, newHabit]
    }));
    apiService.addHabit(newHabit);
  };

  const deleteHabit = (id) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id)
    }));
    apiService.deleteHabit(id);
  };

  // Time Block Actions
  const addTimeBlock = (block) => {
    const targetDate = block.date || state.selectedDate || new Date().toISOString().split('T')[0];
    const newBlock = { ...block, id: 'tb_' + Date.now(), date: targetDate };
    setState(prev => ({
      ...prev,
      timeBlocks: [...prev.timeBlocks, newBlock]
    }));
    apiService.addTimeBlock(newBlock);
  };

  const updateTimeBlockStatus = (id, status) => {
    if (status === 'completed') triggerConfetti();
    setState(prev => ({
      ...prev,
      timeBlocks: prev.timeBlocks.map(tb => tb.id === id ? { ...tb, status } : tb)
    }));
    apiService.updateTimeBlock(id, { status });
  };

  const updateTimeBlock = (id, data) => {
    if (data.status === 'completed') triggerConfetti();
    setState(prev => ({
      ...prev,
      timeBlocks: prev.timeBlocks.map(tb => tb.id === id ? { ...tb, ...data } : tb)
    }));
    apiService.updateTimeBlock(id, data);
  };

  const deleteTimeBlock = (id) => {
    if (!window.confirm('Are you sure you want to delete this time block?')) return;
    setState(prev => ({
      ...prev,
      timeBlocks: prev.timeBlocks.filter(tb => tb.id !== id)
    }));
    apiService.deleteTimeBlock(id);
  };

  // Micro Tasks
  const addMicroTask = (title, category = 'General', priority = 'medium', date = null) => {
    const targetDate = date || state.selectedDate || new Date().toISOString().split('T')[0];
    const newTask = { id: 'm_' + Date.now(), title, category, priority, completed: false, date: targetDate };
    setState(prev => ({
      ...prev,
      microTasks: [newTask, ...prev.microTasks]
    }));
    apiService.addMicroTask(newTask);
  };

  const toggleMicroTask = (id) => {
    let isNowCompleted = false;
    setState(prev => {
      const updated = prev.microTasks.map(m => {
        if (m.id === id) {
          const next = !m.completed;
          isNowCompleted = next;
          if (next) triggerConfetti();
          return { ...m, completed: next };
        }
        return m;
      });
      return { ...prev, microTasks: updated };
    });
    apiService.updateMicroTask(id, { completed: isNowCompleted });
  };

  const deleteMicroTask = (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setState(prev => ({
      ...prev,
      microTasks: prev.microTasks.filter(m => m.id !== id)
    }));
    apiService.deleteMicroTask(id);
  };

  // Goals Kanban Actions
  const addGoal = (goal) => {
    const newGoal = {
      id: 'g_' + Date.now(),
      column: 'backlog',
      progress: 0,
      subtasks: [],
      ...goal
    };
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
    apiService.addGoal(newGoal);
  };

  const updateGoalColumn = (goalId, newColumn) => {
    if (newColumn === 'complete') triggerConfetti();
    const newProgress = newColumn === 'complete' ? 100 : undefined;
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === goalId ? {
        ...g,
        column: newColumn,
        progress: newColumn === 'complete' ? 100 : g.progress
      } : g)
    }));
    apiService.updateGoal(goalId, { column: newColumn, progress: newProgress });
  };

  const updateGoalProgress = (goalId, progress) => {
    if (progress === 100) triggerConfetti();
    const newColumn = progress === 100 ? 'complete' : undefined;
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === goalId ? {
        ...g,
        progress,
        column: progress === 100 ? 'complete' : g.column
      } : g)
    }));
    apiService.updateGoal(goalId, { progress, column: newColumn });
  };

  const deleteGoal = (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    setState(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== goalId)
    }));
    apiService.deleteGoal(goalId);
  };

  // Vision Milestones Actions
  const toggleMilestone = (pillarId, milestoneId) => {
    let isNextCompleted = false;
    setState(prev => {
      const updatedPillars = prev.pillars.map(p => {
        if (p.id === pillarId) {
          const updatedM = p.milestones.map(m => {
            if (m.id === milestoneId) {
              const next = !m.completed;
              isNextCompleted = next;
              if (next) triggerConfetti();
              return { ...m, completed: next };
            }
            return m;
          });
          return { ...p, milestones: updatedM };
        }
        return p;
      });
      return { ...prev, pillars: updatedPillars };
    });
    apiService.updatePillarMilestone(milestoneId, { completed: isNextCompleted });
  };

  const addMilestone = (pillarId, milestone) => {
    const newMilestone = {
      id: milestone.id || 'm_' + Date.now(),
      year: milestone.year || '1 Year',
      quarter: milestone.quarter || 'Q4 2026',
      title: milestone.title,
      completed: false
    };
    setState(prev => ({
      ...prev,
      pillars: prev.pillars.map(p => p.id === pillarId ? {
        ...p,
        milestones: [...p.milestones, newMilestone]
      } : p)
    }));
    apiService.addPillarMilestone(pillarId, newMilestone);
  };

  const deleteMilestone = (pillarId, milestoneId) => {
    if (!window.confirm('Are you sure you want to delete this milestone checkpoint?')) return;
    setState(prev => ({
      ...prev,
      pillars: prev.pillars.map(p => p.id === pillarId ? {
        ...p,
        milestones: p.milestones.filter(m => m.id !== milestoneId)
      } : p)
    }));
    apiService.deletePillarMilestone(milestoneId);
  };

  // Timeline Actions
  const addTimelineItem = (item) => {
    const newEntry = {
      id: 'mt_' + Date.now(),
      date: item.date || new Date().toISOString().slice(0, 10),
      title: item.title,
      category: item.category || 'General',
      note: item.note || ''
    };
    setState(prev => ({
      ...prev,
      milestonesTimeline: [newEntry, ...prev.milestonesTimeline]
    }));
    apiService.addTimelineItem(newEntry);
  };

  const deleteTimelineItem = (id) => {
    if (!window.confirm('Are you sure you want to delete this breakthrough moment?')) return;
    setState(prev => ({
      ...prev,
      milestonesTimeline: prev.milestonesTimeline.filter(mt => mt.id !== id)
    }));
    apiService.deleteTimelineItem(id);
  };

  // Data Persistence Management
  const loadSampleData = () => {
    setState(defaultState);
    triggerConfetti();
  };

  const exportDataJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `focusos-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      setState(parsed);
      triggerConfetti();
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  };

  const resetAllData = () => {
    const emptyState = {
      ...defaultState,
      dailyIntention: '',
      habits: [],
      timeBlocks: [],
      microTasks: [],
      topPriorities: [],
      goals: [],
      milestonesTimeline: []
    };
    setState(emptyState);
  };

  return (
    <FocusContext.Provider value={{
      state,
      setActiveView,
      toggleTheme,
      toggleSidebar,
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
      addGoal,
      updateGoalColumn,
      updateGoalProgress,
      deleteGoal,
      toggleMilestone,
      addMilestone,
      deleteMilestone,
      addTimelineItem,
      deleteTimelineItem,
      triggerConfetti,
      loadSampleData,
      exportDataJSON,
      importDataJSON,
      resetAllData
    }}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
