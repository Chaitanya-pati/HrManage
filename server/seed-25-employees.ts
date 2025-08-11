import { db } from "./db.js";
import { employees, departments, users } from "@shared/schema";
import { randomUUID } from "crypto";

export async function seed25Employees() {
  console.log("Adding 25 employees to the database...");

  // First, get existing departments
  const existingDepartments = await db.select().from(departments);
  console.log("Existing departments:", existingDepartments.length);

  // Create additional departments if needed
  const additionalDepts = [
    { name: "Engineering", description: "Software development and technical operations" },
    { name: "Sales", description: "Revenue generation and client acquisition" },
    { name: "Marketing", description: "Brand promotion and digital marketing" },
    { name: "Finance", description: "Financial planning and accounting" },
    { name: "Operations", description: "Business operations and process management" },
    { name: "Customer Support", description: "Customer service and technical support" }
  ];

  const allDepartments = [...existingDepartments];
  
  for (const dept of additionalDepts) {
    const existing = existingDepartments.find(d => d.name === dept.name);
    if (!existing) {
      try {
        const [newDept] = await db.insert(departments).values({
          id: randomUUID(),
          name: dept.name,
          description: dept.description,
          managerId: null
        }).returning();
        allDepartments.push(newDept);
        console.log(`Created department: ${dept.name}`);
      } catch (error) {
        console.log(`Department ${dept.name} might already exist`);
      }
    }
  }

  // Employee data with realistic Indian names and varied salaries
  const employeeData = [
    // Engineering Team
    { firstName: "Rajesh", lastName: "Kumar", position: "Senior Software Engineer", department: "Engineering", salary: 95000, email: "rajesh.kumar@flexui.com", employeeId: "EMP002" },
    { firstName: "Priya", lastName: "Sharma", position: "Frontend Developer", department: "Engineering", salary: 75000, email: "priya.sharma@flexui.com", employeeId: "EMP003" },
    { firstName: "Amit", lastName: "Patel", position: "Backend Developer", department: "Engineering", salary: 82000, email: "amit.patel@flexui.com", employeeId: "EMP004" },
    { firstName: "Sneha", lastName: "Reddy", position: "DevOps Engineer", department: "Engineering", salary: 88000, email: "sneha.reddy@flexui.com", employeeId: "EMP005" },
    { firstName: "Vikash", lastName: "Singh", position: "Full Stack Developer", department: "Engineering", salary: 78000, email: "vikash.singh@flexui.com", employeeId: "EMP006" },
    
    // Sales Team
    { firstName: "Arjun", lastName: "Gupta", position: "Sales Manager", department: "Sales", salary: 85000, email: "arjun.gupta@flexui.com", employeeId: "EMP007" },
    { firstName: "Kavitha", lastName: "Nair", position: "Senior Sales Executive", department: "Sales", salary: 65000, email: "kavitha.nair@flexui.com", employeeId: "EMP008" },
    { firstName: "Rohit", lastName: "Joshi", position: "Sales Executive", department: "Sales", salary: 55000, email: "rohit.joshi@flexui.com", employeeId: "EMP009" },
    { firstName: "Anita", lastName: "Rao", position: "Business Development", department: "Sales", salary: 70000, email: "anita.rao@flexui.com", employeeId: "EMP010" },
    
    // Marketing Team
    { firstName: "Suresh", lastName: "Iyer", position: "Marketing Manager", department: "Marketing", salary: 78000, email: "suresh.iyer@flexui.com", employeeId: "EMP011" },
    { firstName: "Deepika", lastName: "Verma", position: "Digital Marketing Specialist", department: "Marketing", salary: 58000, email: "deepika.verma@flexui.com", employeeId: "EMP012" },
    { firstName: "Karthik", lastName: "Menon", position: "Content Marketing", department: "Marketing", salary: 52000, email: "karthik.menon@flexui.com", employeeId: "EMP013" },
    { firstName: "Ritu", lastName: "Agarwal", position: "Social Media Manager", department: "Marketing", salary: 48000, email: "ritu.agarwal@flexui.com", employeeId: "EMP014" },
    
    // Finance Team
    { firstName: "Manoj", lastName: "Tiwari", position: "Finance Manager", department: "Finance", salary: 92000, email: "manoj.tiwari@flexui.com", employeeId: "EMP015" },
    { firstName: "Sunita", lastName: "Bhatt", position: "Senior Accountant", department: "Finance", salary: 62000, email: "sunita.bhatt@flexui.com", employeeId: "EMP016" },
    { firstName: "Ravi", lastName: "Chandra", position: "Financial Analyst", department: "Finance", salary: 68000, email: "ravi.chandra@flexui.com", employeeId: "EMP017" },
    
    // Operations Team
    { firstName: "Geeta", lastName: "Saxena", position: "Operations Manager", department: "Operations", salary: 85000, email: "geeta.saxena@flexui.com", employeeId: "EMP018" },
    { firstName: "Sanjay", lastName: "Mishra", position: "Project Coordinator", department: "Operations", salary: 55000, email: "sanjay.mishra@flexui.com", employeeId: "EMP019" },
    { firstName: "Neha", lastName: "Chopra", position: "Business Analyst", department: "Operations", salary: 72000, email: "neha.chopra@flexui.com", employeeId: "EMP020" },
    { firstName: "Dinesh", lastName: "Yadav", position: "Process Manager", department: "Operations", salary: 68000, email: "dinesh.yadav@flexui.com", employeeId: "EMP021" },
    
    // Customer Support Team
    { firstName: "Meera", lastName: "Jain", position: "Support Manager", department: "Customer Support", salary: 65000, email: "meera.jain@flexui.com", employeeId: "EMP022" },
    { firstName: "Vivek", lastName: "Pandey", position: "Senior Support Executive", department: "Customer Support", salary: 42000, email: "vivek.pandey@flexui.com", employeeId: "EMP023" },
    { firstName: "Pooja", lastName: "Srivastava", position: "Support Executive", department: "Customer Support", salary: 38000, email: "pooja.srivastava@flexui.com", employeeId: "EMP024" },
    { firstName: "Harish", lastName: "Kulkarni", position: "Technical Support", department: "Customer Support", salary: 45000, email: "harish.kulkarni@flexui.com", employeeId: "EMP025" },
    
    // Additional HR Team
    { firstName: "Lata", lastName: "Bose", position: "HR Executive", department: "Human Resources", salary: 55000, email: "lata.bose@flexui.com", employeeId: "EMP026" }
  ];

  // Insert employees
  let successCount = 0;
  let errorCount = 0;

  for (const empData of employeeData) {
    try {
      // Find department ID
      const department = allDepartments.find(d => d.name === empData.department);
      
      if (!department) {
        console.log(`Department ${empData.department} not found for ${empData.firstName} ${empData.lastName}`);
        errorCount++;
        continue;
      }

      // Create user account first
      const userId = randomUUID();
      await db.insert(users).values({
        id: userId,
        username: empData.employeeId.toLowerCase(),
        password: "password123", // Default password
        email: empData.email,
        role: "employee"
      });

      // Calculate HRA and other allowances (common Indian payroll structure)
      const baseSalary = empData.salary;
      const hra = Math.round(baseSalary * 0.40); // 40% HRA
      const conveyanceAllowance = 2400; // Standard conveyance
      const medicalAllowance = 1250; // Standard medical
      const specialAllowance = Math.round(baseSalary * 0.15); // 15% special allowance

      // Create employee record
      await db.insert(employees).values({
        id: randomUUID(),
        userId: userId,
        employeeId: empData.employeeId,
        firstName: empData.firstName,
        lastName: empData.lastName,
        email: empData.email,
        phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        departmentId: department.id,
        position: empData.position,
        employmentType: "permanent",
        workLocation: "office",
        hireDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        status: "active",
        baseSalary: baseSalary,
        hra: hra,
        conveyanceAllowance: conveyanceAllowance,
        medicalAllowance: medicalAllowance,
        specialAllowance: specialAllowance,
        dearnessAllowance: 0,
        overtimeEligible: empData.position.includes("Executive") || empData.position.includes("Developer"),
        overtimeRate: 1.5,
        holidayOvertimeRate: 2.0,
        nightShiftOvertimeRate: 2.0,
        fieldWorkEligible: empData.department === "Sales" || empData.department === "Customer Support",
        travelAllowance: empData.department === "Sales" ? 3000 : 0,
        fieldAllowance: empData.department === "Sales" ? 2000 : 0
      });

      successCount++;
      console.log(`✓ Added employee: ${empData.firstName} ${empData.lastName} (${empData.employeeId}) - ${empData.department}`);
      
    } catch (error) {
      errorCount++;
      console.log(`✗ Error adding ${empData.firstName} ${empData.lastName}:`, error.message);
    }
  }

  console.log(`\nEmployee seeding completed:`);
  console.log(`✓ Successfully added: ${successCount} employees`);
  console.log(`✗ Errors: ${errorCount} employees`);
  
  // Get total employee count
  const totalEmployees = await db.select().from(employees);
  console.log(`📊 Total employees in database: ${totalEmployees.length}`);
  
  return { successCount, errorCount, totalEmployees: totalEmployees.length };
}