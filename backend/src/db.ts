import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/focusos_db';

// Check if using Supabase Pooler or SSL
const isSupabase = connectionString.includes('supabase');

// Initialize postgres client pool with Pooler & SSL compatibility
export const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: isSupabase ? false : true, // Disable prepared statements for Supabase PgBouncer / Session Pooler
  ssl: isSupabase || process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Helper check database connection health
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time, current_database() as db_name`;
    console.log(`✅ Database Connected to ${result[0].db_name} at ${result[0].current_time}`);
    return true;
  } catch (error: any) {
    console.warn(`⚠️ PostgreSQL Connection Note: Unable to connect (${error.message}). Ensure Supabase DATABASE_URL is active.`);
    return false;
  }
}
