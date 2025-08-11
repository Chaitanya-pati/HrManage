import { db } from "./db";
import { employees, departments } from "@shared/schema";

export async function seedSimpleData() {
  console.log("Starting simple database seeding...");
  
  try {
    // Create a simple department
    const [department] = await db.insert(departments).values({
      name: "Engineering",
      description: "Software development team"
    }).returning();
    
    console.log("Created department:", department);

    // Create a simple employee
    const [employee] = await db.insert(employees).values({
      employeeId: "EMP001",
      firstName: "John",
      lastName: "Doe", 
      email: "john.doe@company.com",
      phone: "+1-555-0101",
      departmentId: department.id,
      position: "Software Engineer",
      employmentType: "Full-time",
      workLocation: "Office",
      hireDate: new Date("2023-01-15"),
      status: "active",
      baseSalary: "75000"
    }).returning();

    console.log("Created employee:", employee);
    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

// Export for use elsewhere
export default seedSimpleData;