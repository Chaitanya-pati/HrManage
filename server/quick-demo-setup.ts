import { db } from "./db.js";
import { employees, payroll } from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function setupDemoPayroll() {
  console.log("Setting up demo payroll data for client presentation...");

  // Get all employees
  const allEmployees = await db.select().from(employees);
  console.log(`Found ${allEmployees.length} employees`);

  const currentMonth = 8; // August
  const currentYear = 2025;

  let count = 0;
  for (const employee of allEmployees) {
    try {
      const baseSalary = Number(employee.baseSalary) || 50000;
      const grossPay = baseSalary + (Number(employee.hra) || 0) + (Number(employee.conveyanceAllowance) || 0);
      const netPay = grossPay - Math.round(grossPay * 0.15); // 15% deductions

      await db.insert(payroll).values({
        employeeId: employee.id,
        payPeriodStart: `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`,
        payPeriodEnd: `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`,
        month: currentMonth,
        year: currentYear,
        baseSalary: baseSalary,
        allowances: JSON.stringify({ hra: employee.hra, conveyance: employee.conveyanceAllowance }),
        deductions: JSON.stringify({ pf: Math.round(baseSalary * 0.12), tax: Math.round(grossPay * 0.03) }),
        overtimePay: 0,
        overtimeHours: 0,
        grossPay: Math.round(grossPay),
        taxDeductions: Math.round(grossPay * 0.03),
        pfDeduction: Math.round(baseSalary * 0.12),
        esiDeduction: 0,
        netPay: Math.round(netPay),
        payrollStatus: "processed",
        processedAt: new Date().toISOString(),
        bankTransferStatus: "completed",
        payslipGenerated: true
      });
      count++;
      console.log(`✓ ${employee.firstName} ${employee.lastName} - ₹${Math.round(netPay).toLocaleString()}`);
    } catch (error) {
      console.log(`Skip ${employee.firstName} (already exists)`);
    }
  }

  console.log(`\n✅ Demo payroll ready! Processed ${count} employees for August 2025`);
}

setupDemoPayroll().catch(console.error);