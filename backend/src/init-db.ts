import { sql } from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

async function initDB() {
  console.log('🚀 Initializing FocusOS PostgreSQL Database Schemas...');
  try {
    const schemaPath = join(import.meta.dir || process.cwd(), '../db/schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');

    // Run schema DDL query
    await sql.unsafe(schemaSql);
    console.log('✨ All FocusOS Schemas & Relations created successfully in PostgreSQL!');

  } catch (error) {
    console.error('❌ Error executing database schemas:', error);
  } finally {
    process.exit(0);
  }
}

initDB();
