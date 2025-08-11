
import { db } from "./db";
import * as schema from "@shared/schema";

async function addEmployees() {
  try {
    console.log("Adding missing employees...");
    
    // First, let's get the HR department ID
    const hrDept = await db.select().from(schema.departments).where(schema.departments.name.like('%Human%')).limit(1);
    const hrDeptId = hrDept[0]?.id;
    
    if (!hrDeptId) {
      console.log("No HR department found, creating one...");
      const [newDept] = await db.insert(schema.departments).values({
        name: "Human Resources",
        description: "Handles employee relations and policies"
      }).returning();
      const deptId = newDept.id;
    }
    
    // Check current employee count
    const currentEmployees = await db.select().from(schema.employees);
    console.log(`Current employee count: ${currentEmployees.length}`);
    
    if (currentEmployees.length >= 10) {
      console.log("Already have 10+ employees, no need to add more");
      return;
    }
    
    // Add the missing employees (Hanamant 1-10 as mentioned in the replit.md)
    const employeesToAdd = [
      {
        employeeId: 'EMP002',
        firstName: 'Hanamant',
        lastName: '1',
        email: 'hanamant1@flexui.com',
        phone: '+1234567891',
        departmentId: hrDeptId,
        position: 'Software Engineer',
        hireDate: '2024-01-20',
        baseSalary: '65000',
        employmentType: 'permanent',
        workLocation: 'office',
        status: 'active'
      },
      {
        employeeId: 'EMP003',
        firstName: 'Hanamant',
        lastName: '2',
        email: 'hanamant2@flexui.com',
        phone: '+1234567892',
        departmentId: hrDeptId,
        position: 'Marketing Specialist',
        hireDate: '2024-02-01',
        baseSalary: '55000',
        employmentType: 'permanent',
        workLocation: 'office',
        status: 'active'
      },
      {
        employeeId: 'EMP004',
        firstName: 'Hanamant',
        lastName: '3',
        email: 'hanamant3@flexui.com',
        phone: '+1234567893',
        departmentId: hrDeptId,
        position: 'Data Analyst',
        hireDate: '2024-02-15',
        baseSalary: '60000',
        employmentType: 'permanent',
        workLocation: 'office',
        status: 'active'
      },
      {
        employeeId: 'EMP005',
        firstName: 'Hanamant',
        lastName: '4',
        email: 'hanamant4@flexui.com',
        phone: '+1234567894',
        departmentId: hrDeptId,
        position: 'UI/UX Designer',
        hireDate: '2024-03-01',
        baseSalary: '58000',
        employmentType: 'permanent',
        workLocation: 'office',
        status: 'active'
      },
      {
        employeeId: 'EMP006',
        firstName: 'Hanamant',
        lastName: '5',
        email: 'hanamant5@flexui.com',
        phone: '+1234567895',
        departmentId: hrDeptId,
        position: 'DevOps Engineer',
        hireDate: '2024-03-15',
        baseSalary: '70000',
        employmentType: 'permanent',
        workLocation: 'office',
        status: 'active'
      },
      {
        employeeId: 'EMP007',
        firstName: 'Hanamant',
        lastName: '6',
        email: 'hanamant6@flexui.com',
        phone: '+1234567896',
        departmentId: hrDeptId,
        position: 'Quality Assurance',
        hireDate: '2024-04-01',
        baseSalary: '52000',
        employmentType: 'permanent',
        workLocation: 'office',
        status: 'active'
      },
      {
        employeeId: 'EMP008',
        firstName: 'Hanamant',
        lastName: '7',
        email: 'hanamant7@flexui.com',
        phone: '+1234567897',
        departmentId: hrDeptId,
        position: 'Product Manager',
        hireDate: '2024-04-15',
        baseSalary: '80000',
        employmentType: 'permanent',
        workLocation: 'office',
        status: 'active'
      },
      {
        employeeId: 'EMP009',
        firstName: 'Hanamant',
        lastName: '8',
        email: 'hanamant8@flexui.com',
        phone: '+1234567898',
        departmentId: hrDeptId,
        position: 'Sales Representative',
        hireDate: '2024-05-01',
        baseSalary: '48000',
        employmentType: 'permanent',
        workLocation: 'office',
        status: 'active'
      },
      {
        employeeId: 'EMP010',
        firstName: 'Hanamant',
        lastName: '9',
        email: 'hanamant9@flexui.com',
        phone: '+1234567899',
        departmentId: hrDeptId,
        position: 'Business Analyst',
        hireDate: '2024-05-15',
        baseSalary: '68000',
        employmentType: 'permanent',
        workLocation: 'office',
        status: 'active'
      },
      {
        employeeId: 'EMP011',
        firstName: 'Hanamant',
        lastName: '10',
        email: 'hanamant10@flexui.com',
        phone: '+1234567900',
        departmentId: hrDeptId,
        position: 'Full Stack Developer',
        hireDate: '2024-06-01',
        baseSalary: '75000',
        employmentType: 'permanent',
        workLocation: 'office',
        status: 'active'
      }
    ];
    
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
