import { Router } from "express";
import { z } from "zod";
import { DatabaseStorage } from "./storage";

export function createPayslipRoutes(storage: DatabaseStorage) {
  const router = Router();

  // Generate payslip for employee
  router.post("/payslips/generate", async (req, res) => {
    try {
      const { employeeId, month, year } = req.body;
      console.log(`Generating payslip for employee ${employeeId}, month: ${month}, year: ${year}`);

      // Get employee data
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Calculate payslip data
      const baseSalary = parseFloat(employee.baseSalary) || 50000;
      const hra = baseSalary * 0.4; // 40% HRA
      const conveyanceAllowance = 2000;
      const medicalAllowance = 1500;
      const specialAllowance = baseSalary * 0.1;
      
      const grossPay = baseSalary + hra + conveyanceAllowance + medicalAllowance + specialAllowance;
      
      // Calculate deductions
      const pfDeduction = Math.min(baseSalary * 0.12, 1800);
      const esiDeduction = grossPay <= 25000 ? grossPay * 0.0175 : 0;
      const professionalTax = grossPay > 15000 ? (grossPay > 25000 ? 200 : 150) : 0;
      const tdsDeduction = Math.max(0, (grossPay * 12 - 300000) * 0.1 / 12);
      
      const totalDeductions = pfDeduction + esiDeduction + professionalTax + tdsDeduction;
      const netPay = grossPay - totalDeductions;

      const payPeriod = `${year}-${month.toString().padStart(2, '0')}`;

      // Create payslip data
      const payslipData = {
        employeeId,
        payPeriod,
        basicSalary: baseSalary.toString(),
        hra: Math.round(hra).toString(),
        conveyanceAllowance: conveyanceAllowance.toString(),
        medicalAllowance: medicalAllowance.toString(),
        specialAllowance: Math.round(specialAllowance).toString(),
        overtimePay: "0",
        bonus: "0",
        grossPay: Math.round(grossPay).toString(),
        pfDeduction: Math.round(pfDeduction).toString(),
        esiDeduction: Math.round(esiDeduction).toString(),
        tdsDeduction: Math.round(tdsDeduction).toString(),
        totalDeductions: Math.round(totalDeductions).toString(),
        netPay: Math.round(netPay).toString(),
        workingDays: 30,
        presentDays: 26,
        status: "generated"
      };

      // Save to database
      const savedPayslip = await storage.createPayslip({
        ...payslipData,
        generatedAt: new Date().toISOString()
      });

      // Return payslip with employee details
      const response = {
        ...savedPayslip,
        employee: {
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId,
          position: employee.position,
          email: employee.email
        }
      };

      console.log("Payslip generated successfully:", response);
      res.status(201).json(response);
    } catch (error) {
      console.error("Error generating payslip:", error);
      res.status(500).json({ message: "Failed to generate payslip" });
    }
  });

  // Simple payslip schema for real-time generation
  const payslipSchema = z.object({
    employeeId: z.string(),
    payPeriod: z.string(),
    basicSalary: z.string(),
    hra: z.string(),
    conveyanceAllowance: z.string(),
    medicalAllowance: z.string(),
    specialAllowance: z.string(),
    overtimePay: z.string().default("0"),
    bonus: z.string().default("0"),
    grossPay: z.string(),
    pfDeduction: z.string(),
    esiDeduction: z.string().default("0"),
    tdsDeduction: z.string(),
    totalDeductions: z.string(),
    netPay: z.string(),
    workingDays: z.number(),
    presentDays: z.number(),
    status: z.string().default("generated"),
    generatedAt: z.string(),
  });

  // Get payslips
  router.get("/payslips", async (req, res) => {
    try {
      console.log("Fetching payslips...");
      const { employeeId, payPeriod } = req.query;
      
      const filters: any = {};
      if (employeeId) filters.employeeId = employeeId;
      if (payPeriod) filters.payPeriod = payPeriod;
      
      const payslips = await storage.getPayslips(filters);
      console.log(`Found ${payslips.length} payslips`);
      res.json(payslips);
    } catch (error) {
      console.error("Error fetching payslips:", error);
      res.status(500).json({ message: "Failed to fetch payslips" });
    }
  });

  // Create payslip
  router.post("/payslips", async (req, res) => {
    try {
      console.log("Received payslip data:", req.body);
      
      // Validate the payslip data
      const validatedData = payslipSchema.parse(req.body);
      
      // Save to database  
      const payslip = await storage.createPayslip({
        ...validatedData,
        generatedAt: new Date().toISOString()
      });
      
      console.log("Generated payslip:", payslip);
      res.status(201).json(payslip);
    } catch (error) {
      console.error("Error creating payslip:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid payslip data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create payslip" });
      }
    }
  });

  return router;
}