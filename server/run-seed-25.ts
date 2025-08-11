import { seed25Employees } from "./seed-25-employees.js";

async function runSeed() {
  try {
    console.log("Starting to add 25 employees...");
    const result = await seed25Employees();
    console.log("Seeding completed successfully:", result);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

runSeed();