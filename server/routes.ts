import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertEmployeeSchema,
  insertDepartmentSchema,
  insertAttendanceSchema,
  insertLeaveSchema,
  insertPayrollSchema,
  insertPerformanceSchema,
  insertShiftSchema,
  insertJobOpeningSchema,
  insertApplicationSchema,
  insertEmployeeAllowanceSchema,
  insertEmployeeDeductionSchema,
  insertEmployeeLeaveBalanceSchema,
  insertSalaryComponentsSchema,
  insertTdsConfigurationSchema,
  insertPayslipsSchema,
  insertEmployeeLoansSchema,
  insertSalaryAdvancesSchema,
  insertComplianceReportsSchema,
  insertNotificationsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard and Analytics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Departments
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const result = insertDepartmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid department data", errors: result.error.errors });
      }

      const department = await storage.createDepartment(result.data);

      await storage.createActivity({
        type: "department",
        title: "New department created",
        description: `${department.name} department was created`,
        entityType: "department",
        entityId: department.id,
        userId: null,
      });

      res.status(201).json(department);
    } catch (error) {
      console.error("Error creating department:", error);
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  app.put("/api/departments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertDepartmentSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid department data", errors: result.error.errors });
      }

      const department = await storage.updateDepartment(id, result.data);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }

      res.json(department);
    } catch (error) {
      console.error("Error updating department:", error);
      res.status(500).json({ message: "Failed to update department" });
    }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDepartment(id);
      if (!success) {
        return res.status(404).json({ message: "Department not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  // Employees
  app.get("/api/employees", async (req, res) => {
    try {
      console.log('API Route: /api/employees called');
      const employees = await storage.getEmployees();
      console.log('API Route: storage.getEmployees returned', employees.length, 'employees');
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployee(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const result = insertEmployeeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid employee data", errors: result.error.errors });
      }

      const employee = await storage.createEmployee(result.data);

      await storage.createActivity({
        type: "employee",
        title: "New employee added",
        description: `${employee.firstName} ${employee.lastName} was added to the system`,
        entityType: "employee",
        entityId: employee.id,
        userId: null,
      });

      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertEmployeeSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid employee data", errors: result.error.errors });
      }

      const employee = await storage.updateEmployee(id, result.data);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteEmployee(id);
      if (!success) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Shifts
  app.get("/api/shifts", async (req, res) => {
    try {
      const shifts = await storage.getShifts();
      res.json(shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  app.get("/api/shifts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const shift = await storage.getShift(id);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      res.json(shift);
    } catch (error) {
      console.error("Error fetching shift:", error);
      res.status(500).json({ message: "Failed to fetch shift" });
    }
  });

  app.post("/api/shifts", async (req, res) => {
    try {
      const result = insertShiftSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid shift data", errors: result.error.errors });
      }

      const shift = await storage.createShift(result.data);
      res.status(201).json(shift);
    } catch (error) {
      console.error("Error creating shift:", error);
      res.status(500).json({ message: "Failed to create shift" });
    }
  });

  app.put("/api/shifts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertShiftSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid shift data", errors: result.error.errors });
      }

      const shift = await storage.updateShift(id, result.data);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      res.json(shift);
    } catch (error) {
      console.error("Error updating shift:", error);
      res.status(500).json({ message: "Failed to update shift" });
    }
  });

  app.delete("/api/shifts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteShift(id);
      if (!success) {
        return res.status(404).json({ message: "Shift not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting shift:", error);
      res.status(500).json({ message: "Failed to delete shift" });
    }
  });

  // Attendance
  app.get("/api/attendance", async (req, res) => {
    try {
      const { employeeId, startDate, endDate } = req.query;
      const filters: any = {};
      
      if (employeeId) filters.employeeId = employeeId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const attendanceRecords = await storage.getAttendance(filters);
      res.json(attendanceRecords);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      console.log("Received attendance data:", JSON.stringify(req.body, null, 2));
      const result = insertAttendanceSchema.safeParse(req.body);
      if (!result.success) {
        console.log("Validation errors:", result.error.errors);
        return res.status(400).json({ message: "Invalid attendance data", errors: result.error.errors });
      }

      const attendance = await storage.createAttendance(result.data);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error creating attendance:", error);
      res.status(500).json({ message: "Failed to create attendance" });
    }
  });

  // Leaves
  app.get("/api/leaves", async (req, res) => {
    try {
      const { employeeId, status } = req.query;
      const filters: any = {};
      
      if (employeeId) filters.employeeId = employeeId as string;
      if (status) filters.status = status as string;

      const leaves = await storage.getLeaves(filters);
      res.json(leaves);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      res.status(500).json({ message: "Failed to fetch leaves" });
    }
  });

  app.post("/api/leaves", async (req, res) => {
    try {
      const result = insertLeaveSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid leave data", errors: result.error.errors });
      }

      const leave = await storage.createLeave(result.data);
      res.status(201).json(leave);
    } catch (error) {
      console.error("Error creating leave:", error);
      res.status(500).json({ message: "Failed to create leave" });
    }
  });

  app.patch("/api/leaves/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertLeaveSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid leave data", errors: result.error.errors });
      }

      const leave = await storage.updateLeave(id, result.data);
      if (!leave) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      res.json(leave);
    } catch (error) {
      console.error("Error updating leave:", error);
      res.status(500).json({ message: "Failed to update leave" });
    }
  });

  app.delete("/api/leaves/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteLeave(id);
      if (!success) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting leave:", error);
      res.status(500).json({ message: "Failed to delete leave" });
    }
  });

  // Payroll
  app.get("/api/payroll", async (req, res) => {
    try {
      const { employeeId, month, year } = req.query;
      const filters: any = {};
      
      if (employeeId) filters.employeeId = employeeId as string;
      if (month) filters.month = parseInt(month as string);
      if (year) filters.year = parseInt(year as string);

      const payroll = await storage.getPayroll(filters);
      res.json(payroll);
    } catch (error) {
      console.error("Error fetching payroll:", error);
      res.status(500).json({ message: "Failed to fetch payroll" });
    }
  });

  app.post("/api/payroll", async (req, res) => {
    try {
      console.log("Received payroll data:", JSON.stringify(req.body, null, 2));
      const result = insertPayrollSchema.safeParse(req.body);
      if (!result.success) {
        console.log("Payroll validation errors:", result.error.errors);
        return res.status(400).json({ message: "Invalid payroll data", errors: result.error.errors });
      }

      const payroll = await storage.createPayroll(result.data);
      res.status(201).json(payroll);
    } catch (error) {
      console.error("Error creating payroll:", error);
      res.status(500).json({ message: "Failed to create payroll" });
    }
  });

  // Performance
  app.get("/api/performance", async (req, res) => {
    try {
      const { employeeId, year } = req.query;
      const filters: any = {};
      
      if (employeeId) filters.employeeId = employeeId as string;
      if (year) filters.year = parseInt(year as string);

      const performance = await storage.getPerformance(filters);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching performance:", error);
      res.status(500).json({ message: "Failed to fetch performance" });
    }
  });

  app.post("/api/performance", async (req, res) => {
    try {
      const result = insertPerformanceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid performance data", errors: result.error.errors });
      }

      const performance = await storage.createPerformance(result.data);
      res.status(201).json(performance);
    } catch (error) {
      console.error("Error creating performance:", error);
      res.status(500).json({ message: "Failed to create performance" });
    }
  });

  // Job Openings
  app.get("/api/job-openings", async (req, res) => {
    try {
      const jobOpenings = await storage.getJobOpenings();
      res.json(jobOpenings);
    } catch (error) {
      console.error("Error fetching job openings:", error);
      res.status(500).json({ message: "Failed to fetch job openings" });
    }
  });

  app.post("/api/job-openings", async (req, res) => {
    try {
      const result = insertJobOpeningSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid job opening data", errors: result.error.errors });
      }

      const jobOpening = await storage.createJobOpening(result.data);
      res.status(201).json(jobOpening);
    } catch (error) {
      console.error("Error creating job opening:", error);
      res.status(500).json({ message: "Failed to create job opening" });
    }
  });

  // Job Applications
  app.get("/api/job-applications", async (req, res) => {
    try {
      const { jobId } = req.query;
      const applications = await storage.getApplications(jobId as string);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch job applications" });
    }
  });

  app.post("/api/job-applications", async (req, res) => {
    try {
      const result = insertApplicationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid job application data", errors: result.error.errors });
      }

      const application = await storage.createApplication(result.data);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating job application:", error);
      res.status(500).json({ message: "Failed to create job application" });
    }
  });

  // Attendance by ID (for editing/deleting)
  app.put("/api/attendance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertAttendanceSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid attendance data", errors: result.error.errors });
      }

      const attendance = await storage.updateAttendance(id, result.data);
      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }

      res.json(attendance);
    } catch (error) {
      console.error("Error updating attendance:", error);
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  app.delete("/api/attendance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAttendance(id);
      if (!success) {
        return res.status(404).json({ message: "Attendance record not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting attendance:", error);
      res.status(500).json({ message: "Failed to delete attendance" });
    }
  });

  // Biometric devices (mock endpoint for now)
  app.get("/api/biometric-devices", async (req, res) => {
    try {
      // Mock biometric devices data
      const devices = [
        {
          id: "device-1",
          deviceName: "Main Entrance Scanner",
          deviceType: "Fingerprint + Face",
          location: "Main Entrance",
          isActive: true,
          lastSyncTime: new Date().toISOString()
        },
        {
          id: "device-2", 
          deviceName: "Admin Block Scanner",
          deviceType: "Fingerprint",
          location: "Admin Block",
          isActive: false,
          lastSyncTime: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      res.json(devices);
    } catch (error) {
      console.error("Error fetching biometric devices:", error);
      res.status(500).json({ message: "Failed to fetch biometric devices" });
    }
  });

  // Client sites (mock endpoint)
  app.get("/api/client-sites", async (req, res) => {
    try {
      const sites = [
        { id: "site-1", name: "TechCorp Bangalore", address: "Tech Park, Bangalore" },
        { id: "site-2", name: "InfoSys Chennai", address: "IT Corridor, Chennai" },
        { id: "site-3", name: "Client Site Mumbai", address: "BKC, Mumbai" }
      ];
      res.json(sites);
    } catch (error) {
      console.error("Error fetching client sites:", error);
      res.status(500).json({ message: "Failed to fetch client sites" });
    }
  });

  // Jobs endpoint (for recruitment)
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobOpenings();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const { limit } = req.query;
      const activities = await storage.getActivities(limit ? parseInt(limit as string) : 50);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Employee Allowances API
  app.get("/api/employees/:employeeId/allowances", async (req, res) => {
    try {
      const allowances = await storage.getEmployeeAllowances(req.params.employeeId);
      res.json(allowances);
    } catch (error) {
      console.error("Error fetching employee allowances:", error);
      res.status(500).json({ message: "Failed to fetch employee allowances" });
    }
  });

  app.post("/api/employees/:employeeId/allowances", async (req, res) => {
    try {
      const result = insertEmployeeAllowanceSchema.safeParse({
        ...req.body,
        employeeId: req.params.employeeId
      });
      if (!result.success) {
        return res.status(400).json({ message: "Invalid allowance data", errors: result.error.errors });
      }

      const allowance = await storage.createEmployeeAllowance(result.data);
      res.status(201).json(allowance);
    } catch (error) {
      console.error("Error creating employee allowance:", error);
      res.status(500).json({ message: "Failed to create employee allowance" });
    }
  });

  // Employee Deductions API
  app.get("/api/employees/:employeeId/deductions", async (req, res) => {
    try {
      const deductions = await storage.getEmployeeDeductions(req.params.employeeId);
      res.json(deductions);
    } catch (error) {
      console.error("Error fetching employee deductions:", error);
      res.status(500).json({ message: "Failed to fetch employee deductions" });
    }
  });

  app.post("/api/employees/:employeeId/deductions", async (req, res) => {
    try {
      const result = insertEmployeeDeductionSchema.safeParse({
        ...req.body,
        employeeId: req.params.employeeId
      });
      if (!result.success) {
        return res.status(400).json({ message: "Invalid deduction data", errors: result.error.errors });
      }

      const deduction = await storage.createEmployeeDeduction(result.data);
      res.status(201).json(deduction);
    } catch (error) {
      console.error("Error creating employee deduction:", error);
      res.status(500).json({ message: "Failed to create employee deduction" });
    }
  });

  // Employee Leave Balances API
  app.get("/api/employees/:employeeId/leave-balances", async (req, res) => {
    try {
      const balances = await storage.getEmployeeLeaveBalances(req.params.employeeId);
      res.json(balances);
    } catch (error) {
      console.error("Error fetching employee leave balances:", error);
      res.status(500).json({ message: "Failed to fetch employee leave balances" });
    }
  });

  app.post("/api/employees/:employeeId/leave-balances", async (req, res) => {
    try {
      const result = insertEmployeeLeaveBalanceSchema.safeParse({
        ...req.body,
        employeeId: req.params.employeeId
      });
      if (!result.success) {
        return res.status(400).json({ message: "Invalid leave balance data", errors: result.error.errors });
      }

      const balance = await storage.createEmployeeLeaveBalance(result.data);
      res.status(201).json(balance);
    } catch (error) {
      console.error("Error creating employee leave balance:", error);
      res.status(500).json({ message: "Failed to create employee leave balance" });
    }
  });

  // Salary Slips API
  app.get("/api/salary-slips", async (req, res) => {
    try {
      const { employeeId, payrollId } = req.query;
      const filters: any = {};
      
      if (employeeId) filters.employeeId = employeeId as string;
      if (payrollId) filters.payrollId = payrollId as string;

      const salarySlips = await storage.getSalarySlips(filters);
      res.json(salarySlips);
    } catch (error) {
      console.error("Error fetching salary slips:", error);
      res.status(500).json({ message: "Failed to fetch salary slips" });
    }
  });

  app.post("/api/salary-slips", async (req, res) => {
    try {
      const salarySlip = await storage.createSalarySlip(req.body);
      res.status(201).json(salarySlip);
    } catch (error) {
      console.error("Error creating salary slip:", error);
      res.status(500).json({ message: "Failed to create salary slip" });
    }
  });

  // Advanced Payroll Routes

  // Salary Components
  app.get("/api/salary-components/:employeeId", async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { financialYear } = req.query;
      const components = await storage.getSalaryComponents(employeeId, financialYear as string);
      res.json(components);
    } catch (error) {
      console.error("Error fetching salary components:", error);
      res.status(500).json({ message: "Failed to fetch salary components" });
    }
  });

  app.post("/api/salary-components", async (req, res) => {
    try {
      const result = insertSalaryComponentsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid salary component data", errors: result.error.errors });
      }
      const component = await storage.createSalaryComponent(result.data);
      res.status(201).json(component);
    } catch (error) {
      console.error("Error creating salary component:", error);
      res.status(500).json({ message: "Failed to create salary component" });
    }
  });

  app.put("/api/salary-components/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertSalaryComponentsSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid salary component data", errors: result.error.errors });
      }
      const component = await storage.updateSalaryComponent(id, result.data);
      res.json(component);
    } catch (error) {
      console.error("Error updating salary component:", error);
      res.status(500).json({ message: "Failed to update salary component" });
    }
  });

  // TDS Configuration
  app.get("/api/tds-configuration/:financialYear", async (req, res) => {
    try {
      const { financialYear } = req.params;
      const config = await storage.getTdsConfiguration(financialYear);
      res.json(config);
    } catch (error) {
      console.error("Error fetching TDS configuration:", error);
      res.status(500).json({ message: "Failed to fetch TDS configuration" });
    }
  });

  app.post("/api/tds-configuration", async (req, res) => {
    try {
      const result = insertTdsConfigurationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid TDS configuration data", errors: result.error.errors });
      }
      const config = await storage.createTdsConfiguration(result.data);
      res.status(201).json(config);
    } catch (error) {
      console.error("Error creating TDS configuration:", error);
      res.status(500).json({ message: "Failed to create TDS configuration" });
    }
  });

  // Payslips
  app.get("/api/payslips", async (req, res) => {
    try {
      const { employeeId, payPeriod } = req.query;
      const filters: any = {};
      if (employeeId) filters.employeeId = employeeId as string;
      if (payPeriod) filters.payPeriod = payPeriod as string;
      
      const payslips = await storage.getPayslips(filters);
      res.json(payslips);
    } catch (error) {
      console.error("Error fetching payslips:", error);
      res.status(500).json({ message: "Failed to fetch payslips" });
    }
  });

  app.post("/api/payslips", async (req, res) => {
    try {
      const result = insertPayslipsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid payslip data", errors: result.error.errors });
      }
      const payslip = await storage.createPayslip(result.data);
      res.status(201).json(payslip);
    } catch (error) {
      console.error("Error creating payslip:", error);
      res.status(500).json({ message: "Failed to create payslip" });
    }
  });

  // Employee Loans
  app.get("/api/employee-loans", async (req, res) => {
    try {
      const { employeeId } = req.query;
      const loans = await storage.getEmployeeLoans(employeeId as string);
      res.json(loans);
    } catch (error) {
      console.error("Error fetching employee loans:", error);
      res.status(500).json({ message: "Failed to fetch employee loans" });
    }
  });

  app.post("/api/employee-loans", async (req, res) => {
    try {
      const result = insertEmployeeLoansSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid loan data", errors: result.error.errors });
      }
      const loan = await storage.createEmployeeLoan(result.data);
      res.status(201).json(loan);
    } catch (error) {
      console.error("Error creating employee loan:", error);
      res.status(500).json({ message: "Failed to create employee loan" });
    }
  });

  app.put("/api/employee-loans/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertEmployeeLoansSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid loan data", errors: result.error.errors });
      }
      const loan = await storage.updateEmployeeLoan(id, result.data);
      res.json(loan);
    } catch (error) {
      console.error("Error updating employee loan:", error);
      res.status(500).json({ message: "Failed to update employee loan" });
    }
  });

  // Salary Advances
  app.get("/api/salary-advances", async (req, res) => {
    try {
      const { employeeId } = req.query;
      const advances = await storage.getSalaryAdvances(employeeId as string);
      res.json(advances);
    } catch (error) {
      console.error("Error fetching salary advances:", error);
      res.status(500).json({ message: "Failed to fetch salary advances" });
    }
  });

  app.post("/api/salary-advances", async (req, res) => {
    try {
      const result = insertSalaryAdvancesSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid advance data", errors: result.error.errors });
      }
      const advance = await storage.createSalaryAdvance(result.data);
      res.status(201).json(advance);
    } catch (error) {
      console.error("Error creating salary advance:", error);
      res.status(500).json({ message: "Failed to create salary advance" });
    }
  });

  // Compliance Reports
  app.get("/api/compliance-reports", async (req, res) => {
    try {
      const { reportType, financialYear } = req.query;
      const filters: any = {};
      if (reportType) filters.reportType = reportType as string;
      if (financialYear) filters.financialYear = financialYear as string;
      
      const reports = await storage.getComplianceReports(filters);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching compliance reports:", error);
      res.status(500).json({ message: "Failed to fetch compliance reports" });
    }
  });

  app.post("/api/compliance-reports", async (req, res) => {
    try {
      const result = insertComplianceReportsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid compliance report data", errors: result.error.errors });
      }
      const report = await storage.createComplianceReport(result.data);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating compliance report:", error);
      res.status(500).json({ message: "Failed to create compliance report" });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const { employeeId } = req.query;
      const notifications = await storage.getNotifications(employeeId as string);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const result = insertNotificationsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid notification data", errors: result.error.errors });
      }
      const notification = await storage.createNotification(result.data);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.put("/api/notifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertNotificationsSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid notification data", errors: result.error.errors });
      }
      const notification = await storage.updateNotification(id, result.data);
      res.json(notification);
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  const server = createServer(app);
  return server;
}