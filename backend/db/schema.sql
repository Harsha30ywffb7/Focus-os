
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255) DEFAULT 'Focus Explorer',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. DAILY INTENTIONS & QUOTES
CREATE TABLE IF NOT EXISTS daily_intentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    intention TEXT,
    quote_text TEXT,
    quote_author TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_date_intention UNIQUE(user_id, date)
);

-- 3. HABITS STACK
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT false,
    icon VARCHAR(50) DEFAULT 'CheckCircle2',
    streak_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TIME BLOCKS SCHEDULE
CREATE TABLE IF NOT EXISTS time_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    time_slot VARCHAR(10) NOT NULL, -- e.g. '08:30'
    duration_minutes INT DEFAULT 60,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming', -- 'completed' | 'in-progress' | 'upcoming'
    category VARCHAR(50) DEFAULT 'General',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. QUICK CAPTURE NOTES & BRAIN DUMP
CREATE TABLE IF NOT EXISTS quick_capture_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. MICRO TASKS CHECKLIST
CREATE TABLE IF NOT EXISTS micro_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT false,
    priority VARCHAR(10) DEFAULT 'medium', -- 'high' | 'medium' | 'low'
    category VARCHAR(50) DEFAULT 'General',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SHORT-TERM GOALS (30-90 DAYS KANBAN)
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    column_name VARCHAR(20) DEFAULT 'backlog', -- 'backlog' | 'in-progress' | 'review' | 'complete'
    target_date DATE,
    progress INT DEFAULT 0, -- 0 to 100
    category VARCHAR(50) DEFAULT 'Product',
    priority VARCHAR(10) DEFAULT 'high',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. GOAL SUBTASKS (RELATION TO GOALS)
CREATE TABLE IF NOT EXISTS goal_subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    text VARCHAR(255) NOT NULL,
    done BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. LONG-TERM VISION WALL (LIFE PILLARS)
CREATE TABLE IF NOT EXISTS life_pillars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Sparkles',
    badge VARCHAR(50) DEFAULT 'General',
    vision TEXT,
    color_from VARCHAR(30) DEFAULT '#6366f1',
    color_to VARCHAR(30) DEFAULT '#8b5cf6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PILLAR ROADMAP MILESTONES (RELATION TO LIFE PILLARS)
CREATE TABLE IF NOT EXISTS pillar_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pillar_id UUID NOT NULL REFERENCES life_pillars(id) ON DELETE CASCADE,
    year_horizon VARCHAR(20) NOT NULL, -- '1 Year' | '3 Years' | '5 Years'
    quarter VARCHAR(20), -- 'Q4 2026'
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. MILESTONE MOMENTS TIMELINE
CREATE TABLE IF NOT EXISTS milestones_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_time_blocks_date ON time_blocks(date);
CREATE INDEX IF NOT EXISTS idx_micro_tasks_date ON micro_tasks(date);
CREATE INDEX IF NOT EXISTS idx_goals_column ON goals(column_name);
CREATE INDEX IF NOT EXISTS idx_goal_subtasks_goal_id ON goal_subtasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_pillar_milestones_pillar_id ON pillar_milestones(pillar_id);
