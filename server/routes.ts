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
  insertActivitySchema
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
      const employees = await storage.getEmployees();
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
      
      // Check if email already exists
      const existingEmployee = await storage.getEmployeeByEmail(result.data.email);
      if (existingEmployee) {
        return res.status(400).json({ message: "Employee with this email already exists" });
      }
      
      const employee = await storage.createEmployee(result.data);
      
      await storage.createActivity({
        type: "employee",
        title: "New employee added",
        description: `${employee.firstName} ${employee.lastName} joined the company`,
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

  // Attendance
  app.get("/api/attendance", async (req, res) => {
    try {
      const { employeeId, startDate, endDate } = req.query;
      const filters: any = {};
      
      if (employeeId) filters.employeeId = employeeId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      
      const attendance = await storage.getAttendance(filters);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const result = insertAttendanceSchema.safeParse(req.body);
      if (!result.success) {
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
      
      await storage.createActivity({
        type: "leave",
        title: "Leave request submitted",
        description: `Leave request for ${leave.type} leave`,
        entityType: "leave",
        entityId: leave.id,
        userId: null,
      });
      
      res.status(201).json(leave);
    } catch (error) {
      console.error("Error creating leave:", error);
      res.status(500).json({ message: "Failed to create leave" });
    }
  });

  app.put("/api/leaves/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertLeaveSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid leave data", errors: result.error.errors });
      }
      
      const leave = await storage.updateLeave(id, result.data);
      if (!leave) {
        return res.status(404).json({ message: "Leave not found" });
      }
      
      if (result.data.status && ["approved", "rejected"].includes(result.data.status)) {
        await storage.createActivity({
          type: "leave",
          title: `Leave request ${result.data.status}`,
          description: `Leave request has been ${result.data.status}`,
          entityType: "leave",
          entityId: leave.id,
          userId: null,
        });
      }
      
      res.json(leave);
    } catch (error) {
      console.error("Error updating leave:", error);
      res.status(500).json({ message: "Failed to update leave" });
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
      const result = insertPayrollSchema.safeParse(req.body);
      if (!result.success) {
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

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
