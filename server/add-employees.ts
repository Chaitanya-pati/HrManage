
import { db } from "./db";
import * as schema from "@shared/schema";
import { like } from "drizzle-orm";

async function addEmployees() {
  try {
    console.log("Adding 25 Hanamant employees...");
    
    // First, let's get the HR department ID
    const hrDept = await db.select().from(schema.departments).where(like(schema.departments.name, '%Human%')).limit(1);
    let hrDeptId = hrDept[0]?.id;
    
    if (!hrDeptId) {
      console.log("No HR department found, creating one...");
      const [newDept] = await db.insert(schema.departments).values({
        name: "Human Resources",
        description: "Handles employee relations and policies"
      }).returning();
      hrDeptId = newDept.id;
    }
    
    // Check current employee count
    const currentEmployees = await db.select().from(schema.employees);
    console.log(`Current employee count: ${currentEmployees.length}`);
    
    // Generate 25 Hanamant employees
    const employeesToAdd = [];
    const positions = [
      'Software Engineer', 'Marketing Specialist', 'Data Analyst', 'UI/UX Designer', 'DevOps Engineer',
      'Quality Assurance', 'Product Manager', 'Sales Representative', 'Business Analyst', 'Full Stack Developer',
      'Frontend Developer', 'Backend Developer', 'Mobile Developer', 'Technical Writer', 'System Administrator',
      'Database Administrator', 'Network Engineer', 'Security Analyst', 'Project Manager', 'Scrum Master',
      'Team Lead', 'Senior Developer', 'Junior Developer', 'Intern', 'Consultant'
    ];
    
    const salaries = [45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000];
    
    for (let i = 1; i <= 25; i++) {
      const empNum = String(i).padStart(3, '0'); // EMP002, EMP003, etc.
      employeesToAdd.push({
        employeeId: `EMP${String(i + 1).padStart(3, '0')}`, // Starting from EMP002 since EMP001 exists
        firstName: `Hanamant${i}`,
        lastName: `Employee`,
        email: `hanamant${i}@flexui.com`,
        phone: `+123456${String(7890 + i)}`,
        departmentId: hrDeptId,
        position: positions[(i - 1) % positions.length],
        hireDate: `2024-${String(Math.floor((i - 1) / 4) + 1).padStart(2, '0')}-${String(((i - 1) % 28) + 1).padStart(2, '0')}`,
        baseSalary: salaries[(i - 1) % salaries.length].toString(),
        employmentType: 'permanent',
        workLocation: i % 3 === 0 ? 'remote' : 'office',
        status: 'active'
      });
    }
    
    // Insert employees one by one
    for (const employee of employeesToAdd) {
      try {
        await db.insert(schema.employees).values(employee);
        console.log(`Added employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`);
      } catch (error) {
        console.log(`Skipped ${employee.employeeId} - likely already exists`);
      }
    }
    
    // Verify final count
    const finalEmployees = await db.select().from(schema.employees);
    console.log(`Final employee count: ${finalEmployees.length}`);
    
  } catch (error) {
    console.error('Error adding employees:', error);
  }
}

addEmployees();
