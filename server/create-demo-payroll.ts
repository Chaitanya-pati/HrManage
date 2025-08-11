import { db } from "./db.js";
import { employees, payroll, salaryComponents, payslips } from "@shared/schema";
import { randomUUID } from "crypto";

export async function createDemoPayrollData() {
  console.log("Creating demo payroll data for client presentation...");

  // Get all employees
  const allEmployees = await db.select().from(employees);
  console.log(`Found ${allEmployees.length} employees for payroll processing`);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-based month
  const currentYear = currentDate.getFullYear();

  let processedCount = 0;

  for (const employee of allEmployees) {
    try {
      // Check if payroll already exists for this month
      const existingPayroll = await db.select().from(payroll)
        .where(sql`employee_id = ${employee.id} AND month = ${currentMonth} AND year = ${currentYear}`);

      if (existingPayroll.length > 0) {
        console.log(`Payroll already exists for ${employee.firstName} ${employee.lastName}`);
        continue;
      }

      // Calculate payroll components
      const baseSalary = Number(employee.baseSalary) || 50000;
      const hra = Number(employee.hra) || Math.round(baseSalary * 0.40);
      const conveyanceAllowance = Number(employee.conveyanceAllowance) || 2400;
      const medicalAllowance = Number(employee.medicalAllowance) || 1250;
      const specialAllowance = Number(employee.specialAllowance) || Math.round(baseSalary * 0.15);

      // Calculate overtime (random for demo)
      const overtimeHours = Math.random() > 0.7 ? Math.floor(Math.random() * 20) : 0;
      const overtimeRate = 1.5;
      const hourlyRate = baseSalary / (22 * 8); // 22 working days, 8 hours per day
      const overtimePay = overtimeHours * hourlyRate * overtimeRate;

      // Calculate gross pay
      const grossPay = baseSalary + hra + conveyanceAllowance + medicalAllowance + specialAllowance + overtimePay;

      // Calculate deductions
      const pfDeduction = Math.round(baseSalary * 0.12); // 12% PF
      const esiDeduction = grossPay <= 21000 ? Math.round(grossPay * 0.0075) : 0; // 0.75% ESI if gross <= 21k
      const taxDeductions = grossPay > 20000 ? Math.round((grossPay - 20000) * 0.1) : 0; // Simple tax calculation

      const totalDeductions = pfDeduction + esiDeduction + taxDeductions;
      const netPay = grossPay - totalDeductions;

      // Create allowances JSON
      const allowancesData = {
        hra: hra,
        conveyance: conveyanceAllowance,
        medical: medicalAllowance,
        special: specialAllowance,
        overtime: Math.round(overtimePay)
      };

      // Create deductions JSON
      const deductionsData = {
        pf: pfDeduction,
        esi: esiDeduction,
        tax: taxDeductions
      };

      // Insert payroll record
      await db.insert(payroll).values({
        id: randomUUID(),
        employeeId: employee.id,
        payPeriodStart: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
        payPeriodEnd: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()}`,
        month: currentMonth,
        year: currentYear,
        baseSalary: baseSalary,
        allowances: JSON.stringify(allowancesData),
        deductions: JSON.stringify(deductionsData),
        overtimePay: Math.round(overtimePay),
        overtimeHours: overtimeHours,
        grossPay: Math.round(grossPay),
        taxDeductions: taxDeductions,
        pfDeduction: pfDeduction,
        esiDeduction: esiDeduction,
        netPay: Math.round(netPay),
        payrollStatus: "processed",
        processedAt: new Date().toISOString(),
        processedBy: "system",
        bankTransferStatus: "completed",
        payslipGenerated: true
      });

      processedCount++;
      console.log(`✓ Created payroll for ${employee.firstName} ${employee.lastName} - Net Pay: ₹${Math.round(netPay).toLocaleString()}`);

    } catch (error) {
      console.log(`✗ Error creating payroll for ${employee.firstName} ${employee.lastName}:`, error.message);
    }
  }

  console.log(`\nDemo payroll data creation completed:`);
  console.log(`✓ Successfully processed: ${processedCount} employees`);
  console.log(`📊 Month: ${currentMonth}/${currentYear}`);
  
  return { processedCount, month: currentMonth, year: currentYear };
}

// Import sql from drizzle
import { sql } from "drizzle-orm";