import { db } from "./db";
import { employees } from "@shared/schema";
import { sql } from "drizzle-orm";

async function testConnection() {
  try {
    console.log("Testing database connection...");
    
    // Test raw SQL
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("Raw query result:", result);
    
    // Test schema query
    console.log("Testing employees table query...");
    const employeesResult = await db.select().from(employees).limit(5);
    console.log("Employees query result:", employeesResult);
    
    console.log("Database connection test successful!");
    
  } catch (error) {
    console.error("Database connection test failed:", error);
    console.error("Error details:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
  }
}

export default testConnection;