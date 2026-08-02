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

      // 3. FETCH COMPLETE USER STATE FROM POSTGRESQL
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

          return jsonResponse({
            habits,
            timeBlocks,
            microTasks,
            goals,
            pillars,
            milestonesTimeline: timeline
          });
        } catch (err: any) {
          return jsonResponse({ error: 'Failed to fetch state', details: err.message }, 500);
        }
      }

      // 4. SYNC STATE TO POSTGRESQL (Bulk Upsert)
      if (url.pathname === '/api/sync' && method === 'POST') {
        try {
          const body = await req.json();
          
          if (body.goals && Array.isArray(body.goals)) {
            for (const goal of body.goals) {
              await sql`
                INSERT INTO goals (id, title, column_name, target_date, progress, category, priority)
                VALUES (${goal.id}, ${goal.title}, ${goal.column || 'backlog'}, ${goal.targetDate || null}, ${goal.progress || 0}, ${goal.category || 'Product'}, ${goal.priority || 'high'})
                ON CONFLICT (id) DO UPDATE SET
                  title = EXCLUDED.title,
                  column_name = EXCLUDED.column_name,
                  progress = EXCLUDED.progress;
              `;
            }
          }

          if (body.microTasks && Array.isArray(body.microTasks)) {
            for (const task of body.microTasks) {
              await sql`
                INSERT INTO micro_tasks (id, title, completed, priority, category)
                VALUES (${task.id}, ${task.title}, ${task.completed}, ${task.priority}, ${task.category})
                ON CONFLICT (id) DO UPDATE SET
                  title = EXCLUDED.title,
                  completed = EXCLUDED.completed;
              `;
            }
          }

          return jsonResponse({ message: 'State synced to PostgreSQL successfully' });
        } catch (err: any) {
          return jsonResponse({ error: 'Sync failed', details: err.message }, 500);
        }
      }

      // 5. REST API: GOALS CRUD
      if (url.pathname === '/api/goals' && method === 'GET') {
        const goals = await sql`SELECT * FROM goals ORDER BY created_at DESC`;
        return jsonResponse(goals);
      }

      if (url.pathname === '/api/goals' && method === 'POST') {
        const body = await req.json();
        const newGoal = await sql`
          INSERT INTO goals (title, column_name, target_date, category, priority)
          VALUES (${body.title}, ${body.column || 'backlog'}, ${body.targetDate || null}, ${body.category}, ${body.priority})
          RETURNING *;
        `;
        return jsonResponse(newGoal[0], 201);
      }

      const matchGoalId = url.pathname.match(/^\/api\/goals\/([a-zA-Z0-9-]+)$/);
      if (matchGoalId) {
        const goalId = matchGoalId[1];
        if (method === 'PUT') {
          const body = await req.json();
          const updated = await sql`
            UPDATE goals
            SET title = COALESCE(${body.title}, title),
                column_name = COALESCE(${body.column}, column_name),
                progress = COALESCE(${body.progress}, progress)
            WHERE id = ${goalId}
            RETURNING *;
          `;
          return jsonResponse(updated[0] || { message: 'Updated' });
        }
        if (method === 'DELETE') {
          await sql`DELETE FROM goals WHERE id = ${goalId}`;
          return jsonResponse({ message: 'Deleted' });
        }
      }

      // 6. REST API: TIME BLOCKS CRUD
      if (url.pathname === '/api/time-blocks' && method === 'GET') {
        const blocks = await sql`SELECT * FROM time_blocks ORDER BY time_slot ASC`;
        return jsonResponse(blocks);
      }

      if (url.pathname === '/api/time-blocks' && method === 'POST') {
        const body = await req.json();
        const newBlock = await sql`
          INSERT INTO time_blocks (time_slot, duration_minutes, title, status, category)
          VALUES (${body.timeSlot}, ${body.durationMinutes || 60}, ${body.title}, ${body.status || 'upcoming'}, ${body.category})
          RETURNING *;
        `;
        return jsonResponse(newBlock[0], 201);
      }

      const matchTimeBlockId = url.pathname.match(/^\/api\/time-blocks\/([a-zA-Z0-9-]+)$/);
      if (matchTimeBlockId) {
        const tbId = matchTimeBlockId[1];
        if (method === 'PUT') {
          const body = await req.json();
          const updated = await sql`
            UPDATE time_blocks
            SET status = COALESCE(${body.status}, status),
                time_slot = COALESCE(${body.timeSlot}, time_slot)
            WHERE id = ${tbId}
            RETURNING *;
          `;
          return jsonResponse(updated[0] || { message: 'Updated' });
        }
        if (method === 'DELETE') {
          await sql`DELETE FROM time_blocks WHERE id = ${tbId}`;
          return jsonResponse({ message: 'Deleted' });
        }
      }

      // 7. REST API: MICRO TASKS CRUD
      if (url.pathname === '/api/micro-tasks' && method === 'GET') {
        const tasks = await sql`SELECT * FROM micro_tasks ORDER BY created_at DESC`;
        return jsonResponse(tasks);
      }

      if (url.pathname === '/api/micro-tasks' && method === 'POST') {
        const body = await req.json();
        const newTask = await sql`
          INSERT INTO micro_tasks (title, priority, category)
          VALUES (${body.title}, ${body.priority || 'medium'}, ${body.category || 'General'})
          RETURNING *;
        `;
        return jsonResponse(newTask[0], 201);
      }

      const matchMicroTaskId = url.pathname.match(/^\/api\/micro-tasks\/([a-zA-Z0-9-]+)$/);
      if (matchMicroTaskId) {
        const taskId = matchMicroTaskId[1];
        if (method === 'PUT') {
          const body = await req.json();
          const updated = await sql`
            UPDATE micro_tasks
            SET completed = COALESCE(${body.completed}, completed),
                title = COALESCE(${body.title}, title)
            WHERE id = ${taskId}
            RETURNING *;
          `;
          return jsonResponse(updated[0] || { message: 'Updated' });
        }
        if (method === 'DELETE') {
          await sql`DELETE FROM micro_tasks WHERE id = ${taskId}`;
          return jsonResponse({ message: 'Deleted' });
        }
      }

      // 8. REST API: HABITS CRUD
      if (url.pathname === '/api/habits' && method === 'GET') {
        const habits = await sql`SELECT * FROM habits ORDER BY created_at ASC`;
        return jsonResponse(habits);
      }

      const matchHabitId = url.pathname.match(/^\/api\/habits\/([a-zA-Z0-9-]+)$/);
      if (matchHabitId) {
        const habitId = matchHabitId[1];
        if (method === 'PUT') {
          const body = await req.json();
          const updated = await sql`
            UPDATE habits
            SET completed = COALESCE(${body.completed}, completed)
            WHERE id = ${habitId}
            RETURNING *;
          `;
          return jsonResponse(updated[0] || { message: 'Updated' });
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
