import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import { join } from 'path';

console.log("Initializing SQLite database connection...");
// Store database in project root for persistence
const dbPath = join(process.cwd(), 'flexui_hrms.sqlite');
console.log(`Database path: ${dbPath}`);

const sqlite = new Database(dbPath);
// Enable foreign keys and WAL mode for better performance
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { 
  schema,
  logger: true // Enable query logging for debugging
});

export { sqlite };