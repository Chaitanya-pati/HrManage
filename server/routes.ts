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
  insertActivitySchema,
  insertShiftSchema,
  insertJobOpeningSchema,
  insertJobApplicationSchema
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

  // Get single attendance record
  app.get("/api/attendance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const attendance = await storage.getAttendanceById(id);
      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance record" });
    }
  });

  // Update attendance (PUT for complete update)
  app.put("/api/attendance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertAttendanceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid attendance data", errors: result.error.errors });
      }

      const attendance = await storage.updateAttendance(id, result.data);
      if (!attendance) {
        return res.status(404).json({ message: "Attendance not found" });
      }

      await storage.createActivity({
        type: "attendance",
        title: "Attendance updated",
        description: `Attendance record updated for employee`,
        entityType: "attendance",
        entityId: attendance.id,
        userId: null,
      });

      res.json(attendance);
    } catch (error) {
      console.error("Error updating attendance:", error);
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  // Update attendance (PATCH for partial update)
  app.patch("/api/attendance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertAttendanceSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid attendance data", errors: result.error.errors });
      }

      const attendance = await storage.updateAttendance(id, result.data);
      if (!attendance) {
        return res.status(404).json({ message: "Attendance not found" });
      }

      res.json(attendance);
    } catch (error) {
      console.error("Error updating attendance:", error);
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  // Delete attendance record
  app.delete("/api/attendance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAttendance(id);
      if (!success) {
        return res.status(404).json({ message: "Attendance record not found" });
      }

      await storage.createActivity({
        type: "attendance",
        title: "Attendance deleted",
        description: `Attendance record was deleted`,
        entityType: "attendance",
        entityId: id,
        userId: null,
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting attendance:", error);
      res.status(500).json({ message: "Failed to delete attendance" });
    }
  });

  // Bulk operations for attendance
  app.post("/api/attendance/bulk", async (req, res) => {
    try {
      const { operation, attendanceIds, data } = req.body;

      if (operation === "delete") {
        const results = [];
        for (const id of attendanceIds) {
          const success = await storage.deleteAttendance(id);
          results.push({ id, success });
        }
        res.json({ message: "Bulk delete completed", results });
      } else if (operation === "update") {
        const results = [];
        for (const id of attendanceIds) {
          const attendance = await storage.updateAttendance(id, data);
          results.push({ id, attendance });
        }
        res.json({ message: "Bulk update completed", results });
      } else {
        res.status(400).json({ message: "Invalid bulk operation" });
      }
    } catch (error) {
      console.error("Error in bulk attendance operation:", error);
      res.status(500).json({ message: "Failed to perform bulk operation" });
    }
  });

  // Client Sites
  app.get("/api/client-sites", async (req, res) => {
    try {
      const clientSites = await storage.getClientSites();
      res.json(clientSites);
    } catch (error) {
      console.error("Error fetching client sites:", error);
      res.status(500).json({ message: "Failed to fetch client sites" });
    }
  });

  app.post("/api/client-sites", async (req, res) => {
    try {
      const clientSite = await storage.createClientSite(req.body);
      res.status(201).json(clientSite);
    } catch (error) {
      console.error("Error creating client site:", error);
      res.status(500).json({ message: "Failed to create client site" });
    }
  });

  // Biometric Devices
  app.get("/api/biometric-devices", async (req, res) => {
    try {
      const devices = await storage.getBiometricDevices();
      res.json(devices);
    } catch (error) {
      console.error("Error fetching biometric devices:", error);
      res.status(500).json({ message: "Failed to fetch biometric devices" });
    }
  });

  app.post("/api/biometric-devices", async (req, res) => {
    try {
      const device = await storage.createBiometricDevice(req.body);
      res.status(201).json(device);
    } catch (error) {
      console.error("Error creating biometric device:", error);
      res.status(500).json({ message: "Failed to create biometric device" });
    }
  });

  // Biometric punch data endpoint
  app.post("/api/biometric/punch", async (req, res) => {
    try {
      const { deviceId, employeeId, biometricId, punchTime, punchType } = req.body;

      // Verify biometric device
      const device = await storage.getBiometricDevice(deviceId);
      if (!device || !device.isActive) {
        return res.status(400).json({ message: "Invalid or inactive biometric device" });
      }

      // Process biometric punch
      const attendance = await storage.processBiometricPunch({
        deviceId,
        employeeId,
        biometricId,
        punchTime: new Date(punchTime),
        punchType, // IN, OUT
        location: device.location,
        clientSiteId: device.clientSiteId
      });

      res.json({ success: true, attendance });
    } catch (error) {
      console.error("Error processing biometric punch:", error);
      res.status(500).json({ message: "Failed to process biometric punch" });
    }
  });

  // Biometric device sync endpoint for external metric software
  app.post("/api/biometric/sync", async (req, res) => {
    try {
      const { deviceId, employeeData, timestamp, verificationMethod } = req.body;

      // Batch process attendance records from external biometric system
      const results = [];

      for (const record of employeeData) {
        const attendance = await storage.createAttendance({
          employeeId: record.employeeId,
          date: new Date(record.date).toISOString().split('T')[0],
          checkIn: record.checkIn ? new Date(record.checkIn) : null,
          checkOut: record.checkOut ? new Date(record.checkOut) : null,
          gateEntry: record.gateEntry ? new Date(record.gateEntry).toISOString() : null,
          gateExit: record.gateExit ? new Date(record.gateExit).toISOString() : null,
          biometricDeviceIn: deviceId,
          biometricDeviceOut: deviceId,
          biometricId: record.biometricId,
          fingerprintVerified: verificationMethod.includes('fingerprint'),
          faceRecognitionVerified: verificationMethod.includes('face'),
          status: record.status || 'present',
          hoursWorked: record.hoursWorked || "0",
          overtimeHours: record.overtimeHours || "0",
          location: record.location || 'office'
        });

        results.push(attendance);
      }

      // Update device sync time
      await storage.updateBiometricDevice(deviceId, {
        lastSyncTime: new Date().toISOString()
      });

      res.json({ 
        success: true, 
        processed: results.length,
        message: `Successfully synced ${results.length} attendance records`
      });
    } catch (error) {
      console.error("Error syncing biometric data:", error);
      res.status(500).json({ message: "Failed to sync biometric data" });
    }
  });

  // Metrix software integration endpoint
  app.post("/api/metrix/attendance", async (req, res) => {
    try {
      const { 
        employeeId, 
        biometricId, 
        deviceId, 
        timestamp, 
        punchType, 
        verificationMethod,
        location 
      } = req.body;

      console.log("Metrix attendance data received:", req.body);

      // Validate required fields
      if (!employeeId || !timestamp || !punchType) {
        return res.status(400).json({ 
          message: "Missing required fields: employeeId, timestamp, punchType" 
        });
      }

      const attendanceDate = new Date(timestamp).toISOString().split('T')[0];
      
      // Find existing attendance for the day
      const existingAttendance = await storage.getAttendance({
        employeeId,
        startDate: new Date(attendanceDate),
        endDate: new Date(attendanceDate)
      });

      let attendance;
      
      if (existingAttendance.length > 0) {
        // Update existing record
        const record = existingAttendance[0];
        const updates: any = {
          biometricId: biometricId || record.biometricId,
          fingerprintVerified: verificationMethod === 'fingerprint' || record.fingerprintVerified,
          faceRecognitionVerified: verificationMethod === 'face' || record.faceRecognitionVerified,
        };

        if (punchType === 'IN' && !record.checkIn) {
          updates.checkIn = new Date(timestamp);
          updates.gateEntry = new Date(timestamp).toISOString();
          updates.biometricDeviceIn = deviceId;
          updates.status = 'present';
        } else if (punchType === 'OUT' && record.checkIn && !record.checkOut) {
          updates.checkOut = new Date(timestamp);
          updates.gateExit = new Date(timestamp).toISOString();
          updates.biometricDeviceOut = deviceId;
          
          // Calculate hours worked
          const checkInTime = new Date(record.checkIn);
          const checkOutTime = new Date(timestamp);
          const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
          updates.hoursWorked = hoursWorked.toFixed(2);
          updates.overtimeHours = Math.max(0, hoursWorked - 8).toFixed(2);
        }

        attendance = await storage.updateAttendance(record.id, updates);
      } else {
        // Create new record
        const attendanceData = {
          employeeId,
          date: attendanceDate,
          biometricId: biometricId || `METRIX_${Date.now()}`,
          fingerprintVerified: verificationMethod === 'fingerprint',
          faceRecognitionVerified: verificationMethod === 'face',
          location: location || 'office',
          status: 'present'
        };

        if (punchType === 'IN') {
          attendanceData.checkIn = new Date(timestamp);
          attendanceData.gateEntry = new Date(timestamp).toISOString();
          attendanceData.biometricDeviceIn = deviceId;
        }

        attendance = await storage.createAttendance(attendanceData);
      }

      // Log activity
      await storage.createActivity({
        type: "attendance",
        title: "Biometric attendance recorded",
        description: `Attendance ${punchType} recorded via Metrix software`,
        entityType: "attendance",
        entityId: attendance?.id || "unknown",
        userId: null,
      });

      res.json({ 
        success: true, 
        attendance,
        message: `${punchType} recorded successfully`
      });

    } catch (error) {
      console.error("Error processing Metrix attendance:", error);
      res.status(500).json({ 
        message: "Failed to process attendance", 
        error: error.message 
      });
    }
  });

  // Overtime Requests
  app.get("/api/overtime-requests", async (req, res) => {
    try {
      const { employeeId, status } = req.query;
      const filters: any = {};

      if (employeeId) filters.employeeId = employeeId as string;
      if (status) filters.status = status as string;

      const overtimeRequests = await storage.getOvertimeRequests(filters);
      res.json(overtimeRequests);
    } catch (error) {
      console.error("Error fetching overtime requests:", error);
      res.status(500).json({ message: "Failed to fetch overtime requests" });
    }
  });

  app.post("/api/overtime-requests", async (req, res) => {
    try {
      const overtimeRequest = await storage.createOvertimeRequest(req.body);
      res.status(201).json(overtimeRequest);
    } catch (error) {
      console.error("Error creating overtime request:", error);
      res.status(500).json({ message: "Failed to create overtime request" });
    }
  });

  app.patch("/api/overtime-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, approvedBy, rejectionReason } = req.body;

      const overtimeRequest = await storage.updateOvertimeRequest(id, {
        status,
        approvedBy,
        rejectionReason,
        approvedAt: status === 'approved' ? new Date() : null
      });

      if (!overtimeRequest) {
        return res.status(404).json({ message: "Overtime request not found" });
      }

      res.json(overtimeRequest);
    } catch (error) {
      console.error("Error updating overtime request:", error);
      res.status(500).json({ message: "Failed to update overtime request" });
    }
  });

  // Shifts
  app.get("/api/shifts", async (req, res) => {
    try {
      const shifts = await storage.getShifts();
      console.log("Fetched shifts:", shifts); // Debug log
      res.json(shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  app.post("/api/shifts", async (req, res) => {
    try {
      const result = insertShiftSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid shift data", errors: result.error.errors });
      }

      const shift = await storage.createShift(result.data);

      await storage.createActivity({
        type: "shift",
        title: "New shift created",
        description: `${shift.name} shift was created`,
        entityType: "shift",
        entityId: shift.id,
        userId: null,
      });

      res.status(201).json(shift);
    } catch (error) {
      console.error("Error creating shift:", error);
      res.status(500).json({ message: "Failed to create shift" });
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

  // Job Openings API endpoints
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobOpenings();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      console.log("Received job creation request:", req.body);
      const result = insertJobOpeningSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Job validation failed:", result.error.errors);
        return res.status(400).json({ message: "Invalid job data", errors: result.error.errors });
      }

      const job = await storage.createJobOpening(result.data);
      console.log("Job created successfully:", job.id);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job", error: error.message });
    }
  });

  app.put("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertJobOpeningSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid job data", errors: result.error.errors });
      }

      const job = await storage.updateJobOpening(id, result.data);
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteJobOpening(id);
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Job Applications API endpoints
  app.get("/api/jobs/:jobId/applications", async (req, res) => {
    try {
      const { jobId } = req.params;
      const applications = await storage.getJobApplications(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch job applications" });
    }
  });

  app.post("/api/jobs/:jobId/applications", async (req, res) => {
    try {
      const { jobId } = req.params;
      const result = insertJobApplicationSchema.safeParse({ ...req.body, jobId });
      if (!result.success) {
        return res.status(400).json({ message: "Invalid application data", errors: result.error.errors });
      }

      const application = await storage.createJobApplication(result.data);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating job application:", error);
      res.status(500).json({ message: "Failed to create job application" });
    }
  });

  app.put("/api/applications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const application = await storage.updateJobApplication(id, req.body);
      res.json(application);
    } catch (error) {
      console.error("Error updating job application:", error);
      res.status(500).json({ message: "Failed to update job application" });
    }
  });

  // Performance review update endpoint
  app.put("/api/performance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertPerformanceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid performance data", errors: result.error.errors });
      }

      const performance = await storage.updatePerformance(id, result.data);
      res.json(performance);
    } catch (error) {
      console.error("Error updating performance:", error);
      res.status(500).json({ message: "Failed to update performance" });
    }
  });

  app.delete("/api/performance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePerformance(id);
      res.json({ message: "Performance review deleted successfully" });
    } catch (error) {
      console.error("Error deleting performance:", error);
      res.status(500).json({ message: "Failed to delete performance" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}