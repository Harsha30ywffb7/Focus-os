import { sql } from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function initDbIfNotExists() {
  try {
    // Check if key table 'goals' already exists in postgresql
    const checkTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'goals'
      );
    `;

    const exists = checkTable[0]?.exists;
    if (exists) {
      console.log('✅ FocusOS Database tables already exist. Skipping schema creation.');
      await sql`ALTER TABLE daily_intentions DROP COLUMN IF EXISTS quote_text;`;
      await sql`ALTER TABLE daily_intentions DROP COLUMN IF EXISTS quote_author;`;
      return;
    }

    console.log('🚀 Initializing FocusOS PostgreSQL Database Schemas...');
    const schemaPath = join(process.cwd(), 'db/schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');

    // Run schema DDL query safely
    await sql.unsafe(schemaSql);
    console.log('✨ All FocusOS Schemas & Relations created successfully in PostgreSQL!');

    // Seed default Life Pillars if life_pillars is empty
    const pillarCheck = await sql`SELECT count(*) FROM life_pillars`;
    if (parseInt(pillarCheck[0]?.count || '0') === 0) {
      await sql`
        INSERT INTO life_pillars (id, name, icon, badge, vision, color_from, color_to) VALUES
        ('p1', 'Health & Energy', 'Activity', 'Vitality', 'Maintain peak physical fitness, daily strength training, and optimal nutrition.', '#10b981', '#059669'),
        ('p2', 'Career & Business', 'Briefcase', 'Professional', 'Build scalable software products, achieve engineering excellence, and lead product strategy.', '#6366f1', '#4f46e5'),
        ('p3', 'Wealth & Finance', 'DollarSign', 'Financial Freedom', 'Achieve long-term financial independence, build passive income streams, and invest wisely.', '#f59e0b', '#d97706'),
        ('p4', 'Relationships & Family', 'Heart', 'Connection', 'Cultivate deep, meaningful relationships with family and friends.', '#ec4899', '#db2777'),
        ('p5', 'Mindset & Growth', 'BookOpen', 'Wisdom', 'Read 20+ books yearly, practice mindfulness, and master new skills continuous learning.', '#8b5cf6', '#7c3aed');
      `;
      console.log('🌱 Seeded initial Life Pillars into database.');
    }

  } catch (error: any) {
    console.error('⚠️ DB Init Check Warning:', error.message);
  }
}

// Standalone execution script runner
if (process.argv[1]?.endsWith('init-db.ts')) {
  initDbIfNotExists().then(() => process.exit(0));
}
