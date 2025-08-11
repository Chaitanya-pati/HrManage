import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

console.log("Initializing SQLite database connection...");
const sqlite = new Database('database.sqlite');
export const db = drizzle(sqlite, { 
  schema,
  logger: true // Enable query logging for debugging
});