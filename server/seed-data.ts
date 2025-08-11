
import { storage } from "./storage";

export async function seedDatabase() {
  console.log("Starting database seeding...");

  // Create sample departments first
  const departments = [
    { name: "Engineering", description: "Software development and technical teams" },
    { name: "Human Resources", description: "HR and people operations" },
    { name: "Sales", description: "Sales and business development" },
    { name: "Marketing", description: "Marketing and communications" }
  ];

  const createdDepartments = [];
  for (const dept of departments) {
    try {
      const department = await storage.createDepartment(dept);
      createdDepartments.push(department);
      console.log(`Created department: ${department.name}`);
    } catch (error) {
      console.log(`Department ${dept.name} may already exist`);
    }
  }

  // Get existing departments if creation failed
  const allDepartments = await storage.getDepartments();
  const engDept = allDepartments.find(d => d.name === "Engineering");
  const hrDept = allDepartments.find(d => d.name === "Human Resources");

  // Create sample employees
  const employees = [
    {
      employeeId: "EMP001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@company.com",
      phone: "+1-555-0101",
      departmentId: engDept?.id || allDepartments[0]?.id,
      position: "Software Engineer",
      employmentType: "Full-time" as const,
      workLocation: "Office" as const,
      hireDate: new Date("2023-01-15"),
      status: "active" as const,
      baseSalary: 75000
    },
    {
      employeeId: "EMP002",
      firstName: "Sarah",
      lastName: "Smith",
      email: "sarah.smith@company.com",
      phone: "+1-555-0102",
      departmentId: hrDept?.id || allDepartments[1]?.id,
      position: "HR Manager",
      employmentType: "Full-time" as const,
      workLocation: "Office" as const,
      hireDate: new Date("2022-06-10"),
      status: "active" as const,
      baseSalary: 65000
    },
    {
      employeeId: "EMP003",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@company.com",
      phone: "+1-555-0103",
      departmentId: engDept?.id || allDepartments[0]?.id,
      position: "Senior Developer",
      employmentType: "Full-time" as const,
      workLocation: "Remote" as const,
      hireDate: new Date("2021-03-20"),
      status: "active" as const,
      baseSalary: 85000
    },
    {
      employeeId: "EMP004",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@company.com",
      phone: "+1-555-0104",
      departmentId: allDepartments[2]?.id || allDepartments[0]?.id,
      position: "Sales Representative",
      employmentType: "Full-time" as const,
      workLocation: "Office" as const,
      hireDate: new Date("2023-08-01"),
      status: "active" as const,
      baseSalary: 55000
    }
  ];

  for (const emp of employees) {
    try {
      const employee = await storage.createEmployee(emp);
      console.log(`Created employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`);
    } catch (error) {
      console.log(`Employee ${emp.employeeId} may already exist`);
    }
  }

  console.log("Database seeding completed!");
}
