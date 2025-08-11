import { db } from "./db";
import { employees, attendance, payroll, leaves, departments } from "@shared/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

// Generate dummy attendance data for reports
export async function generateAttendanceData() {
  console.log("Generating attendance data...");
  
  const allEmployees = await db.select().from(employees);
  const attendanceData = [];
  
  // Generate 30 days of attendance data for all employees
  const startDate = new Date('2025-07-15');
  const endDate = new Date('2025-08-15');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    for (const employee of allEmployees) {
      // 90% attendance rate with some late arrivals
      const isPresent = Math.random() > 0.1;
      const isLate = isPresent && Math.random() > 0.8;
      
      if (isPresent) {
        const checkInHour = isLate ? 9 + Math.floor(Math.random() * 2) : 9;
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkOutHour = 18 + Math.floor(Math.random() * 2);
        const checkOutMinute = Math.floor(Math.random() * 60);
        
        attendanceData.push({
          employeeId: employee.id,
          date: d.toISOString().split('T')[0],
          checkIn: `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`,
          checkOut: `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}`,
          status: isLate ? 'late' : 'present',
          workingHours: (checkOutHour - checkInHour) + ((checkOutMinute - checkInMinute) / 60),
          overtimeHours: Math.max(0, (checkOutHour - 18) + ((checkOutMinute) / 60)),
          remarks: isLate ? 'Late arrival' : null
        });
      } else {
        attendanceData.push({
          employeeId: employee.id,
          date: d.toISOString().split('T')[0],
          checkIn: null,
          checkOut: null,
          status: 'absent',
          workingHours: 0,
          overtimeHours: 0,
          remarks: 'Absent'
        });
      }
    }
  }
  
  // Insert attendance data in batches
  for (let i = 0; i < attendanceData.length; i += 100) {
    const batch = attendanceData.slice(i, i + 100);
    try {
      await db.insert(attendance).values(batch);
    } catch (error) {
      console.log(`Batch ${i} already exists or error:`, error);
    }
  }
  
  console.log(`Generated ${attendanceData.length} attendance records`);
}

// Generate dummy payroll data
export async function generatePayrollData() {
  console.log("Generating payroll data...");
  
  const allEmployees = await db.select().from(employees);
  const payrollData = [];
  
  // Generate payroll for July and August 2025
  const months = [
    { month: 7, year: 2025, startDate: '2025-07-01', endDate: '2025-07-31' },
    { month: 8, year: 2025, startDate: '2025-08-01', endDate: '2025-08-31' }
  ];
  
  for (const period of months) {
    for (const employee of allEmployees) {
      const baseSalary = parseFloat(employee.baseSalary || "50000");
      const hra = baseSalary * 0.4; // 40% HRA
      const conveyance = parseFloat(employee.conveyanceAllowance || "2000");
      const medical = parseFloat(employee.medicalAllowance || "1500");
      const special = parseFloat(employee.specialAllowance || "3000");
      
      const totalAllowances = hra + conveyance + medical + special;
      const grossPay = baseSalary + totalAllowances;
      
      // Deductions
      const pfDeduction = baseSalary * 0.12; // 12% PF
      const esiDeduction = grossPay * 0.0075; // 0.75% ESI
      const tdsDeduction = grossPay > 50000 ? grossPay * 0.1 : 0; // 10% TDS if gross > 50k
      
      const totalDeductions = pfDeduction + esiDeduction + tdsDeduction;
      const netPay = grossPay - totalDeductions;
      
      // Random overtime (0-20 hours)
      const overtimeHours = Math.floor(Math.random() * 21);
      const overtimePay = overtimeHours * (baseSalary / 160) * 1.5; // 1.5x hourly rate
      
      payrollData.push({
        employeeId: employee.id,
        payPeriodStart: period.startDate,
        payPeriodEnd: period.endDate,
        month: period.month,
        year: period.year,
        baseSalary: baseSalary.toString(),
        allowances: JSON.stringify({
          hra: hra,
          conveyance: conveyance,
          medical: medical,
          special: special
        }),
        deductions: JSON.stringify({
          pf: pfDeduction,
          esi: esiDeduction,
          tds: tdsDeduction
        }),
        overtimePay: overtimePay.toString(),
        overtimeHours: overtimeHours.toString(),
        grossPay: (grossPay + overtimePay).toString(),
        taxDeductions: tdsDeduction.toString(),
        pfDeduction: pfDeduction.toString(),
        esiDeduction: esiDeduction.toString(),
        netPay: (netPay + overtimePay).toString(),
        payrollStatus: 'processed',
        processedAt: new Date().toISOString(),
        processedBy: 'system',
        paidAt: new Date().toISOString(),
        payslipGenerated: true,
        bankTransferStatus: 'completed',
        remarks: `Salary for ${period.month}/${period.year}`
      });
    }
  }
  
  // Insert payroll data
  try {
    await db.insert(payroll).values(payrollData);
    console.log(`Generated ${payrollData.length} payroll records`);
  } catch (error) {
    console.log("Payroll data already exists or error:", error);
  }
}

// Generate dummy leave data
export async function generateLeaveData() {
  console.log("Generating leave data...");
  
  const allEmployees = await db.select().from(employees);
  const leaveData = [];
  
  const leaveTypes = ['annual', 'sick', 'casual', 'maternity', 'paternity'];
  
  for (const employee of allEmployees) {
    // Generate 3-5 leave requests per employee
    const leaveCount = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < leaveCount; i++) {
      const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
      const startDate = new Date('2025-07-01');
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 45));
      
      const endDate = new Date(startDate);
      const duration = Math.ceil(Math.random() * 5); // 1-5 days
      endDate.setDate(endDate.getDate() + duration - 1);
      
      const status = ['approved', 'pending', 'rejected'][Math.floor(Math.random() * 3)];
      
      leaveData.push({
        employeeId: employee.id,
        leaveType: leaveType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalDays: duration.toString(),
        reason: `${leaveType} leave request`,
        status: status,
        appliedDate: startDate.toISOString().split('T')[0],
        approverId: employee.managerId || null,
        approvedDate: status === 'approved' ? startDate.toISOString().split('T')[0] : null,
        comments: status === 'rejected' ? 'Rejected due to workload' : null
      });
    }
  }
  
  // Insert leave data
  try {
    await db.insert(leaves).values(leaveData);
    console.log(`Generated ${leaveData.length} leave records`);
  } catch (error) {
    console.log("Leave data already exists or error:", error);
  }
}

// Main function to generate all report data
export async function generateAllReportData() {
  console.log("Starting report data generation...");
  
  try {
    await generateAttendanceData();
    await generatePayrollData();
    await generateLeaveData();
    
    console.log("All report data generated successfully!");
  } catch (error) {
    console.error("Error generating report data:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateAllReportData().then(() => {
    console.log("Report data generation completed.");
    process.exit(0);
  });
}