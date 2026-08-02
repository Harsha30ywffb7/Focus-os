import { sql, testConnection } from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

const PORT = parseInt(process.env.PORT || '3001');

// CORS Headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Start Bun Native HTTP Server
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;

    // Handle Preflight OPTIONS
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. HEALTH CHECK & DB CONNECTION STATUS
      if (url.pathname === '/api/health' && method === 'GET') {
        const isConnected = await testConnection();
        return jsonResponse({
          status: 'online',
          server: 'Bun HTTP Native Server',
          databaseConnected: isConnected,
          timestamp: new Date().toISOString()
        });
      }

      // 2. INIT DATABASE SCHEMAS & RELATIONS
      if (url.pathname === '/api/db/init' && method === 'POST') {
        try {
          const schemaPath = join(import.meta.dir, '../db/schema.sql');
          const schemaSql = readFileSync(schemaPath, 'utf8');
          await sql.unsafe(schemaSql);
          return jsonResponse({ message: 'Database schemas and relations initialized successfully!' });
        } catch (err: any) {
          return jsonResponse({ error: 'Failed to initialize DB schemas', details: err.message }, 500);
        }
      }

      // 3. FETCH FULL INITIAL STATE FROM POSTGRESQL (State Hydration)
      if (url.pathname === '/api/state' && method === 'GET') {
        try {
          const habits = await sql`SELECT id, text, completed, icon, streak_count as "streakCount" FROM habits ORDER BY created_at ASC`;
          const timeBlocks = await sql`SELECT id, time_slot as "timeSlot", duration_minutes as "durationMinutes", title, status, category FROM time_blocks ORDER BY time_slot ASC`;
          const microTasks = await sql`SELECT id, title, completed, priority, category FROM micro_tasks ORDER BY created_at DESC`;
          const goals = await sql`SELECT id, title, column_name as column, target_date as "targetDate", progress, category, priority FROM goals ORDER BY created_at DESC`;
          const pillars = await sql`SELECT id, name, icon, badge, vision, color_from as "colorFrom", color_to as "colorTo" FROM life_pillars`;
          
          for (const goal of goals) {
            const subtasks = await sql`SELECT id, text, done FROM goal_subtasks WHERE goal_id = ${goal.id}`;
            goal.subtasks = subtasks;
          }

          for (const pillar of pillars) {
            const milestones = await sql`SELECT id, year_horizon as year, quarter, title, completed FROM pillar_milestones WHERE pillar_id = ${pillar.id}`;
            pillar.milestones = milestones;
          }

          const timeline = await sql`SELECT id, date, title, category, note FROM milestones_timeline ORDER BY date DESC`;
          const notesResult = await sql`SELECT notes FROM quick_capture_notes ORDER BY updated_at DESC LIMIT 1`;
          const intentionResult = await sql`SELECT intention, quote_text as text, quote_author as author FROM daily_intentions ORDER BY created_at DESC LIMIT 1`;

          return jsonResponse({
            habits,
            timeBlocks,
            microTasks,
            goals,
            pillars,
            milestonesTimeline: timeline,
            quickCaptureNotes: notesResult[0]?.notes || '',
            dailyIntention: intentionResult[0]?.intention || '',
            quote: intentionResult[0]?.text ? { text: intentionResult[0].text, author: intentionResult[0].author } : undefined
          });
        } catch (err: any) {
          return jsonResponse({ error: 'Failed to fetch state', details: err.message }, 500);
        }
      }

      // =========================================================
      // DEDICATED TABLE-SPECIFIC RESTful APIS
      // =========================================================

      // A. HABITS TABLE APIs (`/api/habits`)
      if (url.pathname === '/api/habits' && method === 'GET') {
        const habits = await sql`SELECT id, text, completed, icon, streak_count as "streakCount" FROM habits ORDER BY created_at ASC`;
        return jsonResponse(habits);
      }

      if (url.pathname === '/api/habits' && method === 'POST') {
        const body = await req.json();
        const id = body.id || 'h_' + Date.now();
        const newHabit = await sql`
          INSERT INTO habits (id, text, completed, icon)
          VALUES (${id}, ${body.text}, ${body.completed || false}, ${body.icon || 'CheckCircle2'})
          RETURNING id, text, completed, icon;
        `;
        return jsonResponse(newHabit[0], 201);
      }

      const matchHabitId = url.pathname.match(/^\/api\/habits\/([a-zA-Z0-9_-]+)$/);
      if (matchHabitId) {
        const habitId = matchHabitId[1];
        if (method === 'PUT') {
          const body = await req.json();
          const updated = await sql`
            UPDATE habits
            SET completed = COALESCE(${body.completed}, completed),
                text = COALESCE(${body.text}, text)
            WHERE id = ${habitId}
            RETURNING id, text, completed, icon;
          `;
          return jsonResponse(updated[0] || { message: 'Updated' });
        }
        if (method === 'DELETE') {
          await sql`DELETE FROM habits WHERE id = ${habitId}`;
          return jsonResponse({ message: 'Habit deleted' });
        }
      }

      // B. TIME BLOCKS TABLE APIs (`/api/time-blocks`)
      if (url.pathname === '/api/time-blocks' && method === 'GET') {
        const blocks = await sql`SELECT id, time_slot as "timeSlot", duration_minutes as "durationMinutes", title, status, category FROM time_blocks ORDER BY time_slot ASC`;
        return jsonResponse(blocks);
      }

      if (url.pathname === '/api/time-blocks' && method === 'POST') {
        const body = await req.json();
        const id = body.id || 'tb_' + Date.now();
        const newBlock = await sql`
          INSERT INTO time_blocks (id, time_slot, duration_minutes, title, status, category)
          VALUES (${id}, ${body.timeSlot}, ${body.durationMinutes || 60}, ${body.title}, ${body.status || 'upcoming'}, ${body.category || 'General'})
          RETURNING id, time_slot as "timeSlot", duration_minutes as "durationMinutes", title, status, category;
        `;
        return jsonResponse(newBlock[0], 201);
      }

      const matchTimeBlockId = url.pathname.match(/^\/api\/time-blocks\/([a-zA-Z0-9_-]+)$/);
      if (matchTimeBlockId) {
        const tbId = matchTimeBlockId[1];
        if (method === 'PUT') {
          const body = await req.json();
          const updated = await sql`
            UPDATE time_blocks
            SET status = COALESCE(${body.status ?? null}, status),
                time_slot = COALESCE(${body.timeSlot ?? null}, time_slot),
                title = COALESCE(${body.title ?? null}, title)
            WHERE id = ${tbId}
            RETURNING id, time_slot as "timeSlot", duration_minutes as "durationMinutes", title, status, category;
          `;
          return jsonResponse(updated[0] || { message: 'Updated' });
        }
        if (method === 'DELETE') {
          await sql`DELETE FROM time_blocks WHERE id = ${tbId}`;
          return jsonResponse({ message: 'Time block deleted' });
        }
      }

      // C. MICRO TASKS TABLE APIs (`/api/micro-tasks`)
      if (url.pathname === '/api/micro-tasks' && method === 'GET') {
        const tasks = await sql`SELECT id, title, completed, priority, category FROM micro_tasks ORDER BY created_at DESC`;
        return jsonResponse(tasks);
      }

      if (url.pathname === '/api/micro-tasks' && method === 'POST') {
        const body = await req.json();
        const id = body.id || 'm_' + Date.now();
        const newTask = await sql`
          INSERT INTO micro_tasks (id, title, completed, priority, category)
          VALUES (${id}, ${body.title}, ${body.completed || false}, ${body.priority || 'medium'}, ${body.category || 'General'})
          RETURNING id, title, completed, priority, category;
        `;
        return jsonResponse(newTask[0], 201);
      }

      const matchMicroTaskId = url.pathname.match(/^\/api\/micro-tasks\/([a-zA-Z0-9_-]+)$/);
      if (matchMicroTaskId) {
        const taskId = matchMicroTaskId[1];
        if (method === 'PUT') {
          const body = await req.json();
          const updated = await sql`
            UPDATE micro_tasks
            SET completed = COALESCE(${body.completed ?? null}, completed),
                title = COALESCE(${body.title ?? null}, title),
                priority = COALESCE(${body.priority ?? null}, priority),
                category = COALESCE(${body.category ?? null}, category)
            WHERE id = ${taskId}
            RETURNING id, title, completed, priority, category;
          `;
          return jsonResponse(updated[0] || { message: 'Updated' });
        }
        if (method === 'DELETE') {
          await sql`DELETE FROM micro_tasks WHERE id = ${taskId}`;
          return jsonResponse({ message: 'Micro task deleted' });
        }
      }

      // D. GOALS & SUBTASKS TABLE APIs (`/api/goals`)
      if (url.pathname === '/api/goals' && method === 'GET') {
        const goals = await sql`SELECT id, title, column_name as column, target_date as "targetDate", progress, category, priority FROM goals ORDER BY created_at DESC`;
        for (const goal of goals) {
          const subtasks = await sql`SELECT id, text, done FROM goal_subtasks WHERE goal_id = ${goal.id}`;
          goal.subtasks = subtasks;
        }
        return jsonResponse(goals);
      }

      if (url.pathname === '/api/goals' && method === 'POST') {
        const body = await req.json();
        const id = body.id || 'g_' + Date.now();
        const newGoal = await sql`
          INSERT INTO goals (id, title, column_name, target_date, progress, category, priority)
          VALUES (${id}, ${body.title}, ${body.column || 'backlog'}, ${body.targetDate || null}, ${body.progress || 0}, ${body.category || 'Product'}, ${body.priority || 'high'})
          RETURNING id, title, column_name as column, target_date as "targetDate", progress, category, priority;
        `;
        return jsonResponse(newGoal[0], 201);
      }

      const matchGoalId = url.pathname.match(/^\/api\/goals\/([a-zA-Z0-9_-]+)$/);
      if (matchGoalId) {
        const goalId = matchGoalId[1];
        if (method === 'PUT') {
          const body = await req.json();
          const updated = await sql`
            UPDATE goals
            SET title = COALESCE(${body.title ?? null}, title),
                column_name = COALESCE(${body.column ?? null}, column_name),
                progress = COALESCE(${body.progress ?? null}, progress),
                category = COALESCE(${body.category ?? null}, category),
                priority = COALESCE(${body.priority ?? null}, priority)
            WHERE id = ${goalId}
            RETURNING id, title, column_name as column, target_date as "targetDate", progress, category, priority;
          `;
          return jsonResponse(updated[0] || { message: 'Updated' });
        }
        if (method === 'DELETE') {
          await sql`DELETE FROM goals WHERE id = ${goalId}`;
          return jsonResponse({ message: 'Goal deleted' });
        }
      }

      // E. LIFE PILLARS & MILESTONES TABLE APIs (`/api/pillars`)
      if (url.pathname === '/api/pillars' && method === 'GET') {
        const pillars = await sql`SELECT id, name, icon, badge, vision, color_from as "colorFrom", color_to as "colorTo" FROM life_pillars`;
        for (const p of pillars) {
          const milestones = await sql`SELECT id, year_horizon as year, quarter, title, completed FROM pillar_milestones WHERE pillar_id = ${p.id}`;
          p.milestones = milestones;
        }
        return jsonResponse(pillars);
      }

      if (url.pathname === '/api/pillars' && method === 'POST') {
        const body = await req.json();
        const id = body.id || 'p_' + Date.now();
        const newPillar = await sql`
          INSERT INTO life_pillars (id, name, icon, badge, vision, color_from, color_to)
          VALUES (${id}, ${body.name}, ${body.icon || 'Sparkles'}, ${body.badge || 'General'}, ${body.vision || ''}, ${body.colorFrom || '#6366f1'}, ${body.colorTo || '#8b5cf6'})
          RETURNING id, name, icon, badge, vision, color_from as "colorFrom", color_to as "colorTo";
        `;
        return jsonResponse(newPillar[0], 201);
      }

      // Add milestone checkpoint to pillar: POST /api/pillars/:id/milestones
      const matchPillarMilestonesPost = url.pathname.match(/^\/api\/pillars\/([a-zA-Z0-9_-]+)\/milestones$/);
      if (matchPillarMilestonesPost && method === 'POST') {
        const pillarId = matchPillarMilestonesPost[1];
        const body = await req.json();
        const milestoneId = body.id || 'm_' + Date.now();
        const newMilestone = await sql`
          INSERT INTO pillar_milestones (id, pillar_id, year_horizon, quarter, title, completed)
          VALUES (${milestoneId}, ${pillarId}, ${body.year || '1 Year'}, ${body.quarter || 'Q4 2026'}, ${body.title}, ${body.completed || false})
          RETURNING id, year_horizon as year, quarter, title, completed;
        `;
        return jsonResponse(newMilestone[0], 201);
      }

      // Update / Delete milestone: PUT or DELETE /api/pillars/milestones/:milestoneId
      const matchMilestoneId = url.pathname.match(/^\/api\/pillars\/milestones\/([a-zA-Z0-9_-]+)$/);
      if (matchMilestoneId) {
        const milestoneId = matchMilestoneId[1];
        if (method === 'PUT') {
          const body = await req.json();
          const updated = await sql`
            UPDATE pillar_milestones
            SET completed = COALESCE(${body.completed ?? null}, completed),
                title = COALESCE(${body.title ?? null}, title)
            WHERE id = ${milestoneId}
            RETURNING id, year_horizon as year, quarter, title, completed;
          `;
          return jsonResponse(updated[0] || { message: 'Updated' });
        }
        if (method === 'DELETE') {
          await sql`DELETE FROM pillar_milestones WHERE id = ${milestoneId}`;
          return jsonResponse({ message: 'Milestone deleted' });
        }
      }

      // F. QUICK CAPTURE NOTES TABLE API (`/api/notes`)
      if (url.pathname === '/api/notes' && method === 'GET') {
        const notes = await sql`SELECT notes FROM quick_capture_notes ORDER BY updated_at DESC LIMIT 1`;
        return jsonResponse({ notes: notes[0]?.notes || '' });
      }

      if (url.pathname === '/api/notes' && method === 'POST') {
        const body = await req.json();
        await sql`INSERT INTO quick_capture_notes (notes) VALUES (${body.notes})`;
        return jsonResponse({ message: 'Notes saved' });
      }

      // G. DAILY INTENTION TABLE API (`/api/intention`)
      if (url.pathname === '/api/intention' && method === 'GET') {
        const result = await sql`SELECT intention, quote_text as text, quote_author as author FROM daily_intentions ORDER BY created_at DESC LIMIT 1`;
        return jsonResponse(result[0] || { intention: '' });
      }

      if (url.pathname === '/api/intention' && method === 'POST') {
        const body = await req.json();
        await sql`
          INSERT INTO daily_intentions (intention, quote_text, quote_author)
          VALUES (${body.intention}, ${body.quote?.text || ''}, ${body.quote?.author || ''});
        `;
        return jsonResponse({ message: 'Intention saved' });
      }

      // H. MILESTONES TIMELINE TABLE API (`/api/timeline`)
      if (url.pathname === '/api/timeline' && method === 'GET') {
        const timeline = await sql`SELECT id, date, title, category, note FROM milestones_timeline ORDER BY date DESC`;
        return jsonResponse(timeline);
      }

      if (url.pathname === '/api/timeline' && method === 'POST') {
        const body = await req.json();
        const id = body.id || 'mt_' + Date.now();
        const newEntry = await sql`
          INSERT INTO milestones_timeline (id, date, title, category, note)
          VALUES (${id}, ${body.date}, ${body.title}, ${body.category || 'General'}, ${body.note || ''})
          RETURNING id, date, title, category, note;
        `;
        return jsonResponse(newEntry[0], 201);
      }

      const matchTimelineId = url.pathname.match(/^\/api\/timeline\/([a-zA-Z0-9_-]+)$/);
      if (matchTimelineId) {
        const tId = matchTimelineId[1];
        if (method === 'DELETE') {
          await sql`DELETE FROM milestones_timeline WHERE id = ${tId}`;
          return jsonResponse({ message: 'Timeline item deleted' });
        }
      }

      return jsonResponse({ error: 'Route Not Found' }, 404);

    } catch (error: any) {
      return jsonResponse({ error: 'Server Error', details: error.message }, 500);
    }
  },
});

console.log(`🚀 FocusOS Bun Native Backend running at http://localhost:${server.port}`);
testConnection();
