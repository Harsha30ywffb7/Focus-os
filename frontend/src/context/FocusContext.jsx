import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';

const FocusContext = createContext();

const STORAGE_KEY = 'focus_os_app_state_v1';

// Seed Initial Data
const defaultState = {
  theme: 'dark', // 'dark' | 'light'
  accentColor: 'indigo',
  activeView: 'today', // 'today' | 'calendar' | 'goals' | 'vision' | 'analytics' | 'settings'
  isSidebarOpen: true,
  
  // Today View Data
  dailyIntention: 'Lead with clarity, execute high-impact priorities, and maintain physical balance.',
  quote: { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  weather: { temp: 22, condition: "Partly Cloudy", city: "San Francisco", icon: "SunCloud" },
  
  habits: [
    { id: 'h1', text: 'Hydrate 2L Water', completed: true, icon: 'Droplets' },
    { id: 'h2', text: '20 Min Morning Meditation', completed: true, icon: 'Zap' },
    { id: 'h3', text: '30 Min Deep Work Reading', completed: false, icon: 'BookOpen' },
    { id: 'h4', text: 'Evening Walk & Wind Down', completed: false, icon: 'Moon' }
  ],
  
  // Time blocks from 05:00 to 23:00 (30-min slots)
  timeBlocks: [
    { id: 'tb1', timeSlot: '06:30', durationMinutes: 60, title: 'Morning Routine & Espresso', status: 'completed', category: 'Health' },
    { id: 'tb2', timeSlot: '08:30', durationMinutes: 120, title: 'Architecture Review: FocusOS Design System', status: 'in-progress', category: 'Engineering' },
    { id: 'tb3', timeSlot: '11:00', durationMinutes: 90, title: 'Q3 Product Strategy Sync with Team', status: 'upcoming', category: 'Strategy' },
    { id: 'tb4', timeSlot: '14:00', durationMinutes: 120, title: 'Deep Coding Session: Canvas Analytics & Micro-animations', status: 'upcoming', category: 'Engineering' },
    { id: 'tb5', timeSlot: '17:30', durationMinutes: 60, title: 'Gym & Strength Training Workout', status: 'upcoming', category: 'Health' }
  ],
  
  quickCaptureNotes: `# Today's Brain Dump & Scratchpad\n\n- Refine PDF export layout for high-DPI displays.\n- Explore SVG radial gradients for Vision Wall milestone checkpoints.\n- Schedule weekly progress recap with engineering team.\n- Review quarterly financial allocation strategy.`,
  
  microTasks: [
    { id: 'm1', title: 'Review PR #402 for analytics chart rendering', completed: true, priority: 'high', category: 'Code' },
    { id: 'm2', title: 'Schedule Q4 planning sync with design team', completed: false, priority: 'medium', category: 'Admin' },
    { id: 'm3', title: 'Update system architecture diagram in Figma', completed: false, priority: 'low', category: 'Design' },
    { id: 'm4', title: 'Order new ergometer desk mat and USB-C cable', completed: true, priority: 'low', category: 'Shopping' }
  ],
  
  topPriorities: [
    { id: 'tp1', title: 'Ship FocusOS Glassmorphic UI Design System', category: 'Engineering', goalId: 'g1' },
    { id: 'tp2', title: 'Finalize Q3 Product Roadmap & Milestones', category: 'Strategy', goalId: 'g2' },
    { id: 'tp3', title: 'Complete High Intensity Workout', category: 'Health', goalId: 'g3' }
  ],
  
  // Short-Term Kanban Goals (30-90 Days)
  goals: [
    { 
      id: 'g1', 
      title: 'Launch FocusOS v1.0 Desktop Dashboard', 
      column: 'in-progress', 
      targetDate: '2026-08-30', 
      progress: 80, 
      category: 'Product', 
      priority: 'high', 
      subtasks: [
        { id: 'st1', text: 'Glassmorphism UI System', done: true },
        { id: 'st2', text: 'Time Blocking & Quick Capture', done: true },
        { id: 'st3', text: '365-Day Heatmap & Analytics', done: true },
        { id: 'st4', text: 'PDF Summary Exporter', done: false }
      ] 
    },
    { 
      id: 'g2', 
      title: 'Publish Q3 Product Strategy & Roadmap', 
      column: 'in-progress', 
      targetDate: '2026-09-15', 
      progress: 45, 
      category: 'Strategy', 
      priority: 'high', 
      subtasks: [
        { id: 'st5', text: 'Market Research & Competitor Benchmark', done: true },
        { id: 'st6', text: 'Pillar Alignment Framework', done: false }
      ] 
    },
    { 
      id: 'g3', 
      title: 'Run Sub-1h45m Half Marathon', 
      column: 'backlog', 
      targetDate: '2026-10-20', 
      progress: 25, 
      category: 'Health', 
      priority: 'medium', 
      subtasks: [
        { id: 'st7', text: 'Base 10K Endurance Build', done: true },
        { id: 'st8', text: 'Weekly 15K Long Run Tempo', done: false }
      ] 
    },
    { 
      id: 'g4', 
      title: 'Complete Distributed Systems Course', 
      column: 'review', 
      targetDate: '2026-08-15', 
      progress: 90, 
      category: 'Learning', 
      priority: 'medium', 
      subtasks: [
        { id: 'st9', text: 'Distributed Locks & Vector Clocks', done: true },
        { id: 'st10', text: 'Raft Consensus Protocol Lab', done: true }
      ] 
    },
    { 
      id: 'g5', 
      title: 'Build Automated Investment Pipeline', 
      column: 'complete', 
      targetDate: '2026-07-31', 
      progress: 100, 
      category: 'Finance', 
      priority: 'high', 
      subtasks: [
        { id: 'st11', text: 'Auto-transfer brokerage setup', done: true },
        { id: 'st12', text: 'Index fund dollar-cost-averaging', done: true }
      ] 
    }
  ],
  
  // Long-Term Vision Wall (1-5 Years Life Pillars)
  pillars: [
    {
      id: 'p1',
      name: 'Career & Leadership',
      icon: 'Briefcase',
      colorFrom: '#6366f1',
      colorTo: '#4f46e5',
      badge: 'Professional',
      vision: 'Build world-class developer tools and lead engineering teams impacting millions.',
      milestones: [
        { id: 'm101', year: '1 Year', title: 'Promote to Principal System Architect', completed: false, quarter: 'Q4 2026' },
        { id: 'm102', year: '3 Years', title: 'Keynote Speaker at Tech Summits & Publish Architecture Book', completed: false, quarter: 'Q2 2028' },
        { id: 'm103', year: '5 Years', title: 'Found an AI Product Studio scaling to $10M ARR', completed: false, quarter: 'Q3 2030' }
      ]
    },
    {
      id: 'p2',
      name: 'Health & Vitality',
      icon: 'HeartPulse',
      colorFrom: '#10b981',
      colorTo: '#059669',
      badge: 'Physical',
      vision: 'Maintain peak athletic condition, sound sleep architecture, and optimal metabolic health.',
      milestones: [
        { id: 'm201', year: '1 Year', title: 'Complete Sub-4 Hour Full Marathon', completed: false, quarter: 'Q4 2026' },
        { id: 'm202', year: '3 Years', title: 'Master 100kg Bench Press & Single-leg Pistol Squats', completed: false, quarter: 'Q1 2028' },
        { id: 'm203', year: '5 Years', title: 'Sustain 12% Body Fat & VO2Max > 55 consistently', completed: false, quarter: 'Q2 2030' }
      ]
    },
    {
      id: 'p3',
      name: 'Financial Freedom',
      icon: 'Coins',
      colorFrom: '#f59e0b',
      colorTo: '#d97706',
      badge: 'Wealth',
      vision: 'Achieve financial independence with multiple passive income streams and index portfolio growth.',
      milestones: [
        { id: 'm301', year: '1 Year', title: 'Reach $250k Net Worth Portfolio Benchmark', completed: true, quarter: 'Q2 2026' },
        { id: 'm302', year: '3 Years', title: 'Acquire First Real Estate Rental Property', completed: false, quarter: 'Q3 2028' },
        { id: 'm303', year: '5 Years', title: 'Reach $1.5M Portfolio with 4% Safe Withdrawal Buffer', completed: false, quarter: 'Q4 2030' }
      ]
    },
    {
      id: 'p4',
      name: 'Mastery & Learning',
      icon: 'GraduationCap',
      colorFrom: '#8b5cf6',
      colorTo: '#7c3aed',
      badge: 'Intellectual',
      vision: 'Maintain lifelong curiosity, read 25 high-impact non-fiction books per year, and master AI & Japanese.',
      milestones: [
        { id: 'm401', year: '1 Year', title: 'Read 25 Books & Pass JLPT N4 Japanese Language Exam', completed: false, quarter: 'Q4 2026' },
        { id: 'm402', year: '3 Years', title: 'Build & Deploy 5 Open-Source AI Frameworks', completed: false, quarter: 'Q1 2028' },
        { id: 'm403', year: '5 Years', title: 'Fluency in 3 Languages & Master Piano Performance', completed: false, quarter: 'Q4 2030' }
      ]
    },
    {
      id: 'p5',
      name: 'Relationships & Life',
      icon: 'Users',
      colorFrom: '#f43f5e',
      colorTo: '#e11d48',
      badge: 'Social',
      vision: 'Nurture deep family bonds, organize yearly international retreats with close friends, and contribute to community.',
      milestones: [
        { id: 'm501', year: '1 Year', title: 'Organize Family Alpine Retreat & Reunion', completed: true, quarter: 'Q3 2026' },
        { id: 'm502', year: '3 Years', title: 'Host Quarterly Supper Clubs for Innovators & Founders', completed: false, quarter: 'Q1 2028' },
        { id: 'm503', year: '5 Years', title: 'Sponsor Local STEM Education Scholarship Foundation', completed: false, quarter: 'Q4 2030' }
      ]
    }
  ],
  
  // Analytics State
  streakCount: 14,
  longestStreak: 21,
  milestonesTimeline: [
    { id: 'mt1', date: '2026-07-31', title: 'Automated Investment Pipeline Launched', category: 'Finance', note: 'Configured automated DCA transfers into index funds.' },
    { id: 'mt2', date: '2026-06-15', title: '15K Trail Endurance Run Completed', category: 'Health', note: 'Clocked 1h 12m with elevation gain of 450m.' },
    { id: 'mt3', date: '2026-05-10', title: 'DevCon Keynote Address on System Architecture', category: 'Career', note: 'Presented to an audience of over 500 developers.' },
    { id: 'mt4', date: '2026-03-22', title: 'Completed Reading 10 Books Threshold', category: 'Learning', note: 'Finished "Atomic Habits" and "Deep Work".' }
  ]
};

export const FocusProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error parsing localStorage state:', e);
    }
    return defaultState;
  });

  // Hydrate real state from Bun backend API on mount
  useEffect(() => {
    async function loadBackendData() {
      const remoteData = await apiService.fetchState();
      if (remoteData) {
        setState(prev => ({
          ...prev,
          goals: remoteData.goals && remoteData.goals.length > 0 ? remoteData.goals : prev.goals,
          habits: remoteData.habits && remoteData.habits.length > 0 ? remoteData.habits : prev.habits,
          microTasks: remoteData.microTasks && remoteData.microTasks.length > 0 ? remoteData.microTasks : prev.microTasks,
          timeBlocks: remoteData.timeBlocks && remoteData.timeBlocks.length > 0 ? remoteData.timeBlocks : prev.timeBlocks,
          pillars: remoteData.pillars && remoteData.pillars.length > 0 ? remoteData.pillars : prev.pillars,
          milestonesTimeline: remoteData.milestonesTimeline && remoteData.milestonesTimeline.length > 0 ? remoteData.milestonesTimeline : prev.milestonesTimeline
        }));
      }
    }
    loadBackendData();
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [state]);

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
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id)
    }));
    apiService.deleteHabit(id);
  };

  // Time Block Actions
  const addTimeBlock = (block) => {
    const newBlock = { ...block, id: 'tb_' + Date.now() };
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

  const deleteTimeBlock = (id) => {
    setState(prev => ({
      ...prev,
      timeBlocks: prev.timeBlocks.filter(tb => tb.id !== id)
    }));
    apiService.deleteTimeBlock(id);
  };

  // Quick Capture & Micro Tasks
  const updateNotes = (notes) => {
    setState(prev => ({ ...prev, quickCaptureNotes: notes }));
    apiService.saveNotes(notes);
  };

  const addMicroTask = (title, category = 'General', priority = 'medium') => {
    const newTask = { id: 'm_' + Date.now(), title, category, priority, completed: false };
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
    downloadAnchor.setAttribute("download", `focusos-backup-${new Date().toISOString().slice(0,10)}.json`);
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
      quickCaptureNotes: '',
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
