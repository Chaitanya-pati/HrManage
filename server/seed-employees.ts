import { db } from './db';
import * as schema from '@shared/schema';

async function seedEmployees() {
  console.log('Adding 10 sample employees to the database...');
  
  try {
    // First, get the HR department ID for reference
    const departments = await db.select().from(schema.departments);
    const hrDeptId = departments[0]?.id;
    
    // Get the day shift ID for reference
    const shifts = await db.select().from(schema.shifts);
    const dayShiftId = shifts[0]?.id;
    
    const employees = [
      {
        employeeId: 'EMP002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@flexui.com',
        phone: '+1234567891',
        departmentId: hrDeptId,
        position: 'Software Engineer',
        hireDate: '2024-02-01',
        baseSalary: '85000',
        shiftId: dayShiftId
      },
      {
        employeeId: 'EMP003',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@flexui.com',
        phone: '+1234567892',
        departmentId: hrDeptId,
        position: 'Senior Developer',
        hireDate: '2024-01-20',
        baseSalary: '95000',
        shiftId: dayShiftId
      },
      {
        employeeId: 'EMP004',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@flexui.com',
        phone: '+1234567893',
        departmentId: hrDeptId,
        position: 'UI/UX Designer',
        hireDate: '2024-03-10',
        baseSalary: '70000',
        shiftId: dayShiftId
      },
      {
        employeeId: 'EMP005',
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@flexui.com',
        phone: '+1234567894',
        departmentId: hrDeptId,
        position: 'DevOps Engineer',
        hireDate: '2024-02-15',
        baseSalary: '90000',
        shiftId: dayShiftId
      },
      {
        employeeId: 'EMP006',
        firstName: 'Jessica',
        lastName: 'Taylor',
        email: 'jessica.taylor@flexui.com',
        phone: '+1234567895',
        departmentId: hrDeptId,
        position: 'Product Manager',
        hireDate: '2024-01-30',
        baseSalary: '105000',
        shiftId: dayShiftId
      },
      {
        employeeId: 'EMP007',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@flexui.com',
        phone: '+1234567896',
        departmentId: hrDeptId,
        position: 'QA Engineer',
        hireDate: '2024-03-05',
        baseSalary: '65000',
        shiftId: dayShiftId
      },
      {
        employeeId: 'EMP008',
        firstName: 'Amanda',
        lastName: 'Martinez',
        email: 'amanda.martinez@flexui.com',
        phone: '+1234567897',
        departmentId: hrDeptId,
        position: 'Data Analyst',
        hireDate: '2024-02-20',
        baseSalary: '72000',
        shiftId: dayShiftId
      },
      {
        employeeId: 'EMP009',
        firstName: 'James',
        lastName: 'Anderson',
        email: 'james.anderson@flexui.com',
        phone: '+1234567898',
        departmentId: hrDeptId,
        position: 'Tech Lead',
        hireDate: '2024-01-10',
        baseSalary: '110000',
        shiftId: dayShiftId
      },
      {
        employeeId: 'EMP010',
        firstName: 'Lisa',
        lastName: 'Thompson',
        email: 'lisa.thompson@flexui.com',
        phone: '+1234567899',
        departmentId: hrDeptId,
        position: 'Business Analyst',
        hireDate: '2024-03-15',
        baseSalary: '68000',
        shiftId: dayShiftId
      },
      {
        employeeId: 'EMP011',
        firstName: 'Kevin',
        lastName: 'Garcia',
        email: 'kevin.garcia@flexui.com',
        phone: '+1234567800',
        departmentId: hrDeptId,
        position: 'Full Stack Developer',
        hireDate: '2024-02-10',
        baseSalary: '88000',
        shiftId: dayShiftId
      }
    ];
    
    // Insert employees one by one
    for (const employee of employees) {
      await db.insert(schema.employees).values(employee);
      console.log(`Added employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`);
    }
    
    console.log('Successfully added 10 employees to the database!');
    
    // Verify the total count
    const totalEmployees = await db.select().from(schema.employees);
    console.log(`Total employees in database: ${totalEmployees.length}`);
    
  } catch (error) {
    console.error('Error adding employees:', error);
    throw error;
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedEmployees()
    .then(() => {
      console.log('Employee seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Employee seeding failed:', error);
      process.exit(1);
    });
}

export { seedEmployees };