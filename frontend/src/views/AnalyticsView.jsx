import React from 'react';
import { useFocus } from '../context/FocusContext';
import { 
  BarChart3, 
  Flame, 
  TrendingUp, 
  PieChart, 
  Award, 
  Download, 
  Calendar, 
  Sparkles 
} from 'lucide-react';

export const AnalyticsView = () => {
  const { state } = useFocus();

  // Specification 11.2: 53 weeks x 7 days = 371 squares
  const generateHeatmapDays = () => {
    const days = [];
    const startDate = new Date(2026, 0, 1);
    
    for (let i = 0; i < 371; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayOfWeek = date.getDay();
      let level = 0;
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const seed = (i * 37) % 100;
        if (seed > 80) level = 4;
        else if (seed > 50) level = 3;
        else if (seed > 20) level = 2;
        else level = 1;
      } else {
        level = (i % 2 === 0) ? 1 : 2;
      }

      days.push({
        date: date.toISOString().slice(0, 10),
        level,
        count: level * 3 + (i % 3)
      });
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays();

  // Heatmap Level Color Tokens (Section 2.6)
  const getHeatmapColorStyle = (level) => {
    switch (level) {
      case 0: return { backgroundColor: 'var(--fs-heatmap-l0)' };
      case 1: return { backgroundColor: 'var(--fs-heatmap-l1)' };
      case 2: return { backgroundColor: 'var(--fs-heatmap-l2)' };
      case 3: return { backgroundColor: 'var(--fs-heatmap-l3)' };
      case 4: return { backgroundColor: 'var(--fs-heatmap-l4)' };
      default: return { backgroundColor: 'var(--fs-heatmap-l0)' };
    }
  };

  const monthlyData = [
    { month: 'Jan', rate: 78 },
    { month: 'Feb', rate: 82 },
    { month: 'Mar', rate: 85 },
    { month: 'Apr', rate: 88 },
    { month: 'May', rate: 91 },
    { month: 'Jun', rate: 86 },
    { month: 'Jul', rate: 94 },
    { month: 'Aug', rate: 89 },
    { month: 'Sep', rate: 92 },
    { month: 'Oct', rate: 95 },
    { month: 'Nov', rate: 90 },
    { month: 'Dec', rate: 96 }
  ];

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
            Quantify execution velocity, life balance across pillars, and daily consistency.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30 animate-pulse" />
            <span>{state.streakCount} Day Active Streak</span>
          </div>

          <button onClick={() => window.print()} className="btn-primary py-2 px-4 text-xs font-semibold">
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* HEATMAP SECTION (Specification 11.2: 12px cells, 3px gap, 2px radius) */}
      <div className="card-glass space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[var(--fs-color-brand-primary)]" />
              <span>365-Day Productivity Heatmap (2026)</span>
            </h2>
            <p className="text-xs text-[var(--fs-color-text-secondary)]">53 weeks × 7 days (371 activity cells)</p>
          </div>

          <div className="flex items-center space-x-1 text-[10px] text-[var(--fs-color-text-tertiary)]">
            <span>Less</span>
            <span className="w-3 h-3 rounded-[2px]" style={getHeatmapColorStyle(0)} />
            <span className="w-3 h-3 rounded-[2px]" style={getHeatmapColorStyle(1)} />
            <span className="w-3 h-3 rounded-[2px]" style={getHeatmapColorStyle(2)} />
            <span className="w-3 h-3 rounded-[2px]" style={getHeatmapColorStyle(3)} />
            <span className="w-3 h-3 rounded-[2px]" style={getHeatmapColorStyle(4)} />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-rows-7 grid-flow-col gap-[3px] min-w-[780px]">
            {heatmapDays.map((d, idx) => (
              <div
                key={idx}
                className="w-3 h-3 rounded-[2px] transition-transform hover:scale-125 cursor-pointer"
                style={getHeatmapColorStyle(d.level)}
                title={`${d.date}: ${d.count} tasks executed`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Line Chart */}
        <div className="lg:col-span-7 chart-container space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[var(--fs-color-brand-primary)]" />
              <span>Monthly Goal Completion Rate (%)</span>
            </h2>
            <span className="text-xs font-bold text-[var(--fs-color-brand-primary)]">Avg: 89%</span>
          </div>

          <div className="h-64 w-full relative pt-4">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <line x1="0" y1="40" x2="500" y2="40" className="chart-grid" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" className="chart-grid" strokeDasharray="4 4" />
              <line x1="0" y1="160" x2="500" y2="160" className="chart-grid" strokeDasharray="4 4" />

              <defs>
                <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--fs-color-brand-primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--fs-color-brand-secondary)" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d="M 0 160 L 0 88 C 40 80, 80 72, 125 60 C 170 48, 210 36, 250 20 C 290 32, 330 16, 375 28 C 420 12, 460 20, 500 8 L 500 160 Z"
                className="chart-area-fill"
              />

              <path
                d="M 0 88 C 40 80, 80 72, 125 60 C 170 48, 210 36, 250 20 C 290 32, 330 16, 375 28 C 420 12, 460 20, 500 8"
                className="chart-line"
              />

              {monthlyData.map((d, i) => {
                const x = (i / 11) * 500;
                const y = 200 - (d.rate / 100) * 180;
                return (
                  <g key={i} className="group cursor-pointer">
                    <circle cx={x} cy={y} r="5" fill="var(--fs-color-brand-primary)" stroke="#ffffff" strokeWidth="2" />
                    <text x={x} y={195} textAnchor="middle" className="chart-axis-text" fontWeight="600">
                      {d.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="lg:col-span-5 chart-container space-y-4">
          <h2 className="text-sm font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-[var(--fs-color-category-relations)]" />
            <span>Life Balance Radar Across Pillars</span>
          </h2>

          <div className="h-64 w-full flex items-center justify-center relative">
            <svg viewBox="0 0 200 200" className="w-48 h-48">
              <polygon points="100,20 176,75 147,165 53,165 24,75" fill="none" stroke="var(--fs-color-surface-glass-border)" strokeWidth="1" />
              <polygon points="100,45 152,86 133,148 67,148 48,86" fill="none" stroke="var(--fs-color-surface-glass-border)" strokeWidth="1" />

              <polygon
                points="100,32 165,78 135,152 62,158 35,80"
                fill="rgba(99, 102, 241, 0.25)"
                stroke="var(--fs-color-brand-primary)"
                strokeWidth="2"
              />

              <text x="100" y="14" textAnchor="middle" className="chart-axis-text" fontWeight="bold">Career (85)</text>
              <text x="185" y="75" textAnchor="start" className="chart-axis-text" fontWeight="bold">Health (90)</text>
              <text x="155" y="180" textAnchor="middle" className="chart-axis-text" fontWeight="bold">Finance (75)</text>
              <text x="45" y="180" textAnchor="middle" className="chart-axis-text" fontWeight="bold">Learning (88)</text>
              <text x="15" y="75" textAnchor="end" className="chart-axis-text" fontWeight="bold">Social (80)</text>
            </svg>
          </div>
        </div>

      </div>

      {/* MILESTONES TIMELINE */}
      <div className="card-glass space-y-4">
        <h2 className="text-sm font-bold text-[var(--fs-color-text-primary)] flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Milestone Moments & Breakthroughs</span>
        </h2>

        <div className="space-y-3">
          {state.milestonesTimeline.map((item) => (
            <div key={item.id} className="timeline-item p-3 rounded-xl bg-[var(--fs-color-surface-elevated)] border border-[var(--fs-color-surface-glass-border)] flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[var(--fs-color-text-primary)]">{item.title}</span>
                    <span className="badge badge-category">{item.category}</span>
                  </div>
                  <p className="text-xs text-[var(--fs-color-text-secondary)] mt-1">{item.note}</p>
                </div>
              </div>

              <span className="text-xs font-mono text-[var(--fs-color-text-tertiary)]">
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
