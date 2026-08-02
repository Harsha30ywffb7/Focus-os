import React, { useState, useEffect } from 'react';
import { useFocus } from '../context/FocusContext';
import { 
  Target, 
  Compass, 
  Calendar, 
  Trash2, 
  ChevronRight, 
  Sparkles, 
  Briefcase,
  HeartPulse,
  Coins,
  GraduationCap,
  Users,
  X,
  CheckCircle2,
  Circle
} from 'lucide-react';

export const GoalsView = () => {
  const { state, updateGoalColumn, updateGoalProgress, deleteGoal, toggleMilestone, addMilestone, deleteMilestone } = useFocus();
  const [activeTab, setActiveTab] = useState(state.activeView === 'vision' ? 'vision' : 'kanban');
  const [selectedPillar, setSelectedPillar] = useState(null);

  useEffect(() => {
    if (state.activeView === 'vision') {
      setActiveTab('vision');
    } else if (state.activeView === 'goals') {
      setActiveTab('kanban');
    }
  }, [state.activeView]);

  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneYear, setNewMilestoneYear] = useState('1 Year');
  const [newMilestoneQuarter, setNewMilestoneQuarter] = useState('Q4 2026');

  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'border-slate-500/40 text-slate-300' },
    { id: 'in-progress', title: 'In Progress', color: 'border-indigo-500/40 text-indigo-300' },
    { id: 'review', title: 'Review', color: 'border-amber-500/40 text-amber-300' },
    { id: 'complete', title: 'Done', color: 'border-emerald-500/40 text-emerald-300' }
  ];

  const getPillarIcon = (iconName) => {
    switch (iconName) {
      case 'Briefcase': return Briefcase;
      case 'HeartPulse': return HeartPulse;
      case 'Coins': return Coins;
      case 'GraduationCap': return GraduationCap;
      case 'Users': return Users;
      default: return Sparkles;
    }
  };

  const getCategoryColor = (cat) => {
    switch(cat?.toLowerCase()) {
      case 'career': return 'var(--fs-color-category-career)';
      case 'health': return 'var(--fs-color-category-health)';
      case 'finance': return 'var(--fs-color-category-finance)';
      case 'learning': return 'var(--fs-color-category-learning)';
      case 'relationships': return 'var(--fs-color-category-relations)';
      default: return 'var(--fs-color-brand-primary)';
    }
  };

  const ProgressRing = ({ progress, size = 44, strokeWidth = 4 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="progress-ring relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="progress-ring-bg"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="progress-ring-fill"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-[10px] font-bold text-[var(--fs-color-text-primary)]">
          {progress}%
        </span>
      </div>
    );
  };

  const handleAddMilestoneSubmit = (e) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !selectedPillar) return;
    addMilestone(selectedPillar.id, {
      title: newMilestoneTitle,
      year: newMilestoneYear,
      quarter: newMilestoneQuarter
    });
    setNewMilestoneTitle('');
    setSelectedPillar(prev => ({
      ...prev,
      milestones: [...prev.milestones, { id: 'm_' + Date.now(), title: newMilestoneTitle, year: newMilestoneYear, quarter: newMilestoneQuarter, completed: false }]
    }));
  };

  return (
    <div className="space-y-6 page-enter">
      
      {/* Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-glass">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fs-color-text-primary)] tracking-tight flex items-center space-x-2">
            <Target className="w-6 h-6 text-[var(--fs-color-brand-primary)]" />
            <span>Goals Architecture & Vision Wall</span>
          </h1>
          <p className="text-xs text-[var(--fs-color-text-secondary)] mt-1">
            Bridge daily execution with 30-90 day tactical goals and 1-5 year life pillars.
          </p>
        </div>

        <div className="flex items-center space-x-2 p-1.5 rounded-xl bg-[var(--fs-color-surface-secondary)] border border-[var(--fs-color-surface-glass-border)]">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`btn-primary py-1.5 px-4 min-h-[36px] text-xs ${
              activeTab === 'kanban' ? '' : 'btn-ghost'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Short-Term Kanban (30-90d)</span>
          </button>
          <button
            onClick={() => setActiveTab('vision')}
            className={`btn-primary py-1.5 px-4 min-h-[36px] text-xs ${
              activeTab === 'vision' ? '' : 'btn-ghost'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Vision Wall (1-5yr)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KANBAN BOARD */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((col) => {
            const colGoals = state.goals.filter(g => g.column === col.id);

            return (
              <div key={col.id} className="space-y-4">
                
                <div className={`p-3 rounded-xl border ${col.color} bg-[var(--fs-color-surface-elevated)] flex items-center justify-between`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider">{col.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--fs-color-surface-tertiary)] text-[var(--fs-color-text-primary)]">
                      {colGoals.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 min-h-[500px] p-2 rounded-2xl bg-[var(--fs-color-surface-secondary)] border border-[var(--fs-color-surface-glass-border)]">
                  {colGoals.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--fs-color-text-tertiary)] italic">
                      No goals in {col.title}
                    </div>
                  ) : (
                    colGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="card-goal space-y-3"
                        style={{ borderLeftColor: getCategoryColor(goal.category) }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-bold text-[var(--fs-color-text-primary)] leading-snug">
                            {goal.title}
                          </h3>
                          <ProgressRing progress={goal.progress} size={40} />
                        </div>

                        <div className="flex items-center space-x-2 text-[10px]">
                          <span className="badge badge-category">
                            {goal.category}
                          </span>
                          <span className={`badge ${
                            goal.priority === 'high' ? 'badge-priority-high' : goal.priority === 'medium' ? 'badge-priority-medium' : 'badge-priority-low'
                          }`}>
                            {goal.priority.toUpperCase()}
                          </span>
                          <span className="text-[var(--fs-color-text-tertiary)] flex items-center space-x-1 ml-auto">
                            <Calendar className="w-3 h-3" />
                            <span>{goal.targetDate}</span>
                          </span>
                        </div>

                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] text-[var(--fs-color-text-tertiary)] font-medium">
                            <span>Progress</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={goal.progress}
                            onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                            className="w-full h-1.5 bg-[var(--fs-color-surface-tertiary)] rounded-lg appearance-none cursor-pointer accent-[var(--fs-color-brand-primary)]"
                          />
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-[var(--fs-color-surface-glass-border)] text-[10px]">
                          <div className="flex space-x-1">
                            {columns.map(c => (
                              <button
                                key={c.id}
                                onClick={() => updateGoalColumn(goal.id, c.id)}
                                disabled={goal.column === c.id}
                                className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                                  goal.column === c.id 
                                    ? 'bg-[var(--fs-color-brand-primary)] text-white font-bold' 
                                    : 'text-[var(--fs-color-text-tertiary)] hover:bg-[var(--fs-color-surface-tertiary)]'
                                }`}
                              >
                                {c.title[0]}
                              </button>
                            ))}
                          </div>

                          <button onClick={() => deleteGoal(goal.id)} className="p-1 text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-danger)]">
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
      )}

      {/* TAB 2: LONG-TERM VISION WALL */}
      {activeTab === 'vision' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.pillars.map((pillar) => {
            const Icon = getPillarIcon(pillar.icon);
            const completedCount = pillar.milestones.filter(m => m.completed).length;

            return (
              <div
                key={pillar.id}
                onClick={() => setSelectedPillar(pillar)}
                className="card-glass space-y-4 cursor-pointer hover:scale-[1.01] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-[var(--fs-color-surface-secondary)] text-[var(--fs-color-brand-primary)]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="badge badge-category">
                    {pillar.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[var(--fs-color-text-primary)] group-hover:text-[var(--fs-color-brand-primary)] transition-colors">
                    {pillar.name}
                  </h3>
                  <p className="text-xs text-[var(--fs-color-text-secondary)] mt-2 leading-relaxed">
                    "{pillar.vision}"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] flex items-center justify-between text-xs">
                  <span className="text-[var(--fs-color-text-secondary)] font-medium">Milestones Achieved</span>
                  <span className="font-bold text-[var(--fs-color-brand-primary)]">
                    {completedCount} / {pillar.milestones.length}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--fs-color-surface-glass-border)]">
                  {pillar.milestones.slice(0, 3).map((m) => (
                    <div key={m.id} className="flex items-center space-x-2 text-xs text-[var(--fs-color-text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--fs-color-brand-primary)] flex-shrink-0" />
                      <span className="font-semibold text-[11px]">{m.year}:</span>
                      <span className="truncate">{m.title}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center text-xs text-[var(--fs-color-brand-primary)] font-semibold">
                  <span>View Milestone Timeline</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PILLAR ROADMAP MODAL */}
      {selectedPillar && (
        <div className="modal-overlay" onClick={() => setSelectedPillar(null)}>
          <div className="modal-content max-w-3xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-[var(--fs-color-surface-glass-border)]">
              <div>
                <h2 className="text-xl font-bold text-[var(--fs-color-text-primary)]">{selectedPillar.name}</h2>
                <p className="text-xs text-[var(--fs-color-text-secondary)] mt-1">"{selectedPillar.vision}"</p>
              </div>
              <button onClick={() => setSelectedPillar(null)} className="btn-icon">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <h3 className="text-xs font-bold text-[var(--fs-color-text-secondary)] uppercase tracking-wider">
                1-5 Year Roadmap Checkpoints
              </h3>

              <div className="space-y-4">
                {selectedPillar.milestones.map((m) => (
                  <div
                    key={m.id}
                    className={`timeline-item ${m.completed ? 'opacity-80' : ''}`}
                  >
                    <div className="timeline-dot flex items-center justify-center">
                      {m.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : null}
                    </div>
                    <div className="timeline-content p-3 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="badge badge-category">{m.year}</span>
                          <span className="text-xs font-mono text-[var(--fs-color-text-secondary)]">{m.quarter}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              toggleMilestone(selectedPillar.id, m.id);
                              setSelectedPillar(prev => ({
                                ...prev,
                                milestones: prev.milestones.map(item => item.id === m.id ? { ...item, completed: !item.completed } : item)
                              }));
                            }}
                            className="text-xs font-semibold text-[var(--fs-color-brand-primary)]"
                          >
                            {m.completed ? 'Achieved ✓' : 'Mark Complete'}
                          </button>
                          <button
                            onClick={() => {
                              deleteMilestone(selectedPillar.id, m.id);
                              setSelectedPillar(prev => ({
                                ...prev,
                                milestones: prev.milestones.filter(item => item.id !== m.id)
                              }));
                            }}
                            className="p-1 rounded text-[var(--fs-color-text-tertiary)] hover:text-[var(--fs-color-danger)] transition-colors ml-1"
                            title="Delete milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className={`text-sm font-semibold mt-2 ${m.completed ? 'line-through' : ''}`}>
                        {m.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddMilestoneSubmit} className="p-4 rounded-xl bg-[var(--fs-color-surface-secondary)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--fs-color-brand-primary)] uppercase tracking-wider">Add Roadmap Checkpoint</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Milestone Title"
                    value={newMilestoneTitle}
                    onChange={e => setNewMilestoneTitle(e.target.value)}
                    className="input-text sm:col-span-2 text-xs"
                  />
                  <select
                    value={newMilestoneYear}
                    onChange={e => setNewMilestoneYear(e.target.value)}
                    className="input-text text-xs"
                  >
                    <option value="1 Year">1 Year</option>
                    <option value="3 Years">3 Years</option>
                    <option value="5 Years">5 Years</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full text-xs min-h-[38px]">
                  Add Checkpoint
                </button>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
