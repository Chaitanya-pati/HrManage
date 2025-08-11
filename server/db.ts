import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

console.log("Initializing database connection with HTTP driver...");
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { 
  schema,
  logger: true // Enable query logging for debugging
});