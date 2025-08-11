import { Router } from "express";
import { z } from "zod";
import { DatabaseStorage } from "./storage";

export function createPayslipRoutes(storage: DatabaseStorage) {
  const router = Router();

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
      // For demo purposes, return simple success
      res.json([]);
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
      
      // For demo purposes, just return success
      const payslip = {
        id: Math.random().toString(36).substr(2, 9),
        ...validatedData,
      };
      
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