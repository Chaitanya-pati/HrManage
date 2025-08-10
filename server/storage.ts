import {
  type User, type InsertUser,
  type Department, type InsertDepartment,
  type Employee, type InsertEmployee, type EmployeeWithDepartment,
  type Attendance, type InsertAttendance,
  type Leave, type InsertLeave,
  type Payroll, type InsertPayroll,
  type Performance, type InsertPerformance,
  type Activity, type InsertActivity,
  type Shift, type InsertShift,
  type JobOpening, type InsertJobOpening,
  type JobApplication, type InsertJobApplication
} from "@shared/schema";
import { randomUUID } from "crypto";

// Define a basic structure for biometric devices for demonstration
interface BiometricDevice {
  id: string;
  deviceId: string; // Unique identifier for the biometric machine
  name: string;
  location: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Extend InsertAttendance to include biometric specific fields
interface InsertAttendance {
  employeeId: string;
  date: string; // ISO date string for the day
  checkIn?: Date | null;
  checkOut?: Date | null;
  hoursWorked?: string | null;
  status?: 'present' | 'absent' | 'late' | 'early_out' | 'on_leave' | 'holiday';
  notes?: string | null;
  createdAt?: Date;
  biometricId?: string; // Biometric ID from the machine
  biometricDeviceIn?: string; // Device ID for check-in
  biometricDeviceOut?: string; // Device ID for check-out
  gateEntry?: string | null;
  gateExit?: string | null;
  fingerprintVerified?: boolean | null;
  overtimeHours?: string | null;
  lateMinutes?: number | null;
  earlyDepartureMinutes?: number | null;
  location?: string | null;
  clientSiteId?: string | null;
}

// Extend Attendance to include biometric specific fields
interface Attendance {
  id: string;
  employeeId: string;
  date: string; // ISO date string for the day
  checkIn?: Date | null;
  checkOut?: Date | null;
  hoursWorked?: string | null;
  status: 'present' | 'absent' | 'late' | 'early_out' | 'on_leave' | 'holiday';
  notes?: string | null;
  createdAt: Date;
  biometricId?: string; // Biometric ID from the machine
  biometricDeviceIn?: string; // Device ID for check-in
  biometricDeviceOut?: string; // Device ID for check-out
  gateEntry?: string | null;
  gateExit?: string | null;
  fingerprintVerified?: boolean | null;
  overtimeHours?: string | null;
  lateMinutes?: number | null;
  earlyDepartureMinutes?: number | null;
  location?: string | null;
  clientSiteId?: string | null;
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Departments
  getDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: string): Promise<boolean>;

  // Employees
  getEmployees(): Promise<EmployeeWithDepartment[]>;
  getEmployee(id: string): Promise<EmployeeWithDepartment | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  // Shifts
  getShifts(): Promise<Shift[]>;
  getShift(id: string): Promise<Shift | undefined>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: string, shift: Partial<InsertShift>): Promise<Shift | undefined>;
  deleteShift(id: string): Promise<boolean>;

  // Attendance
  getAttendance(filters?: { employeeId?: string; startDate?: Date; endDate?: Date }): Promise<Attendance[]>;
  getAttendanceById(id: string): Promise<Attendance | undefined>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: string): Promise<boolean>;

  // Leaves
  getLeaves(filters?: { employeeId?: string; status?: string }): Promise<Leave[]>;
  createLeave(leave: InsertLeave): Promise<Leave>;
  updateLeave(id: string, leave: Partial<InsertLeave>): Promise<Leave | undefined>;

  // Payroll
  getPayroll(filters?: { employeeId?: string; month?: number; year?: number }): Promise<Payroll[]>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: string, payroll: Partial<InsertPayroll>): Promise<Payroll | undefined>;

  // Performance
  getPerformance(filters?: { employeeId?: string; year?: number }): Promise<Performance[]>;
  createPerformance(performance: InsertPerformance): Promise<Performance>;
  updatePerformance(id: string, performance: Partial<InsertPerformance>): Promise<Performance | undefined>;
  deletePerformance(id: string): Promise<boolean>;

  // Job Openings
  getJobOpenings(): Promise<JobOpening[]>;
  getJobOpening(id: string): Promise<JobOpening | undefined>;
  createJobOpening(jobOpening: InsertJobOpening): Promise<JobOpening>;
  updateJobOpening(id: string, jobOpening: Partial<InsertJobOpening>): Promise<JobOpening | undefined>;
  deleteJobOpening(id: string): Promise<boolean>;

  // Job Applications
  getJobApplications(jobId?: string): Promise<JobApplication[]>;
  getJobApplication(id: string): Promise<JobApplication | undefined>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateJobApplication(id: string, application: Partial<InsertJobApplication>): Promise<JobApplication | undefined>;
  deleteJobApplication(id: string): Promise<boolean>;

  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Biometric Devices
  getBiometricDevices(): Promise<BiometricDevice[]>;
  getBiometricDevice(deviceId: string): Promise<BiometricDevice | undefined>;
  createBiometricDevice(deviceData: Omit<Insert<BiometricDevice>, 'id' | 'createdAt' | 'updatedAt'>): Promise<BiometricDevice>;
  updateBiometricDevice(deviceId: string, updates: Partial<Omit<Insert<BiometricDevice>, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BiometricDevice | undefined>;
  deleteBiometricDevice(deviceId: string): Promise<boolean>;

  // Process Biometric Punches
  processBiometricPunch(punchData: {
    deviceId: string;
    employeeId: string;
    biometricId: string; // The ID from the biometric machine
    punchTime: Date;
    punchType: 'IN' | 'OUT'; // 'IN' for check-in, 'OUT' for check-out
    location?: string;
    clientSiteId?: string;
  }): Promise<Attendance | undefined>;

  // Analytics
  getDashboardMetrics(): Promise<{
    totalEmployees: number;
    activeToday: number;
    pendingLeaves: number;
    openPositions: number;
    attendanceRate: number;
    departmentDistribution: { name: string; count: number }[];
    attendanceTrend: { date: string; rate: number }[];
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private departments: Map<string, Department> = new Map();
  private employees: Map<string, Employee> = new Map();
  private shifts: Map<string, Shift> = new Map();
  private attendance: Map<string, Attendance> = new Map();
  private leaves: Map<string, Leave> = new Map();
  private payroll: Map<string, Payroll> = new Map();
  private performance: Map<string, Performance> = new Map();
  private activities: Map<string, Activity> = new Map();
  private jobOpenings: Map<string, JobOpening> = new Map();
  private jobApplications: Map<string, JobApplication> = new Map();
  private biometricDevices: Map<string, BiometricDevice> = new Map(); // New map for biometric devices

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample departments
    const departments = [
      { name: "Engineering", description: "Software development and technical operations" },
      { name: "Marketing", description: "Brand marketing and customer acquisition" },
      { name: "Sales", description: "Business development and client relations" },
      { name: "Human Resources", description: "Employee management and organizational development" },
      { name: "Finance", description: "Financial planning and accounting" },
      { name: "Operations", description: "Business operations and process management" },
    ];

    departments.forEach(dept => {
      const id = randomUUID();
      this.departments.set(id, {
        id,
        name: dept.name,
        description: dept.description,
        managerId: null,
        createdAt: new Date(),
      });
    });

    // Create sample employees
    const employeeData = [
      { firstName: "John", lastName: "Anderson", email: "john.anderson@company.com", position: "HR Manager", department: "Human Resources" },
      { firstName: "Sarah", lastName: "Johnson", email: "sarah.johnson@company.com", position: "Senior Developer", department: "Engineering" },
      { firstName: "Mike", lastName: "Chen", email: "mike.chen@company.com", position: "Marketing Manager", department: "Marketing" },
      { firstName: "Emily", lastName: "Davis", email: "emily.davis@company.com", position: "HR Specialist", department: "Human Resources" },
      { firstName: "David", lastName: "Rodriguez", email: "david.rodriguez@company.com", position: "Finance Manager", department: "Finance" },
    ];

    const departmentArray = Array.from(this.departments.values());

    employeeData.forEach((emp, index) => {
      const dept = departmentArray.find(d => d.name === emp.department);
      const id = randomUUID();
      this.employees.set(id, {
        id,
        userId: null,
        employeeId: `EMP${String(index + 1).padStart(3, '0')}`,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: null,
        departmentId: dept?.id || null,
        position: emp.position,
        managerId: null,
        hireDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        status: index === 1 ? "on_leave" : "active",
        salary: "75000.00",
        profileImage: null,
        address: null,
        personalInfo: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Create sample shifts
    const shiftData = [
      {
        name: "Day Shift",
        startTime: "09:00",
        endTime: "17:00",
        breakDuration: 60,
        standardHours: "8.0",
        graceTime: 10,
        isFlexible: false,
        isRotating: false,
        isNightShift: false
      },
      {
        name: "Night Shift",
        startTime: "22:00",
        endTime: "06:00",
        breakDuration: 60,
        standardHours: "8.0",
        graceTime: 10,
        isFlexible: false,
        isRotating: false,
        isNightShift: true,
        nightShiftAllowance: "500"
      },
      {
        name: "Morning Shift",
        startTime: "06:00",
        endTime: "14:00",
        breakDuration: 60,
        standardHours: "8.0",
        graceTime: 10,
        isFlexible: false,
        isRotating: false,
        isNightShift: false
      },
    ];

    shiftData.forEach((shift, index) => {
      const id = randomUUID();
      this.shifts.set(id, {
        id,
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breakDuration: shift.breakDuration,
        standardHours: shift.standardHours,
        graceTime: shift.graceTime,
        lateArrivalPenalty: "0",
        earlyDeparturePenalty: "0",
        halfDayThreshold: "4.0",
        isFlexible: shift.isFlexible,
        isRotating: shift.isRotating,
        isNightShift: shift.isNightShift,
        nightShiftAllowance: shift.nightShiftAllowance || "0",
        overtimeThreshold: "8.0",
        maxOvertimePerDay: "4.0",
        weeklyOffPattern: "saturday,sunday",
        workingDaysPerWeek: 5,
        holidayWorkingRate: "2.0",
        createdAt: new Date(),
      });
    });

    // Create sample attendance records
    const employees = Array.from(this.employees.values());
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0); // Normalize date to start of day

      employees.forEach(emp => {
        if (Math.random() > 0.1) { // 90% attendance rate
          const id = randomUUID();
          const checkIn = new Date(date);
          checkIn.setHours(9, Math.floor(Math.random() * 30));

          const checkOut = new Date(checkIn);
          checkOut.setHours(17, Math.floor(Math.random() * 60));

          this.attendance.set(id, {
            id,
            employeeId: emp.id,
            date: date.toISOString().split('T')[0], // Store date as ISO string
            checkIn,
            checkOut,
            hoursWorked: "8.00",
            status: "present",
            notes: null,
            createdAt: new Date(),
            biometricId: `BIO${Math.floor(Math.random() * 1000)}`,
            biometricDeviceIn: `DEV${String(Math.floor(Math.random() * 3) + 1)}`,
            biometricDeviceOut: `DEV${String(Math.floor(Math.random() * 3) + 1)}`,
            fingerprintVerified: true,
            lateMinutes: Math.floor(Math.random() * 10),
            earlyDepartureMinutes: Math.floor(Math.random() * 15),
          });
        }
      });
    }

    // Create sample biometric devices
    const biometricDeviceData = [
      { deviceId: "BIO_DEV_001", name: "Main Entrance Scanner", location: "Lobby", status: 'active' },
      { deviceId: "BIO_DEV_002", name: "Floor 1 Scanner", location: "Engineering Floor", status: 'active' },
      { deviceId: "BIO_DEV_003", name: "Warehouse Scanner", location: "Warehouse", status: 'inactive' },
    ];

    biometricDeviceData.forEach(device => {
      const id = randomUUID();
      this.biometricDevices.set(id, {
        ...device,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });


    // Create sample activities
    const activities = [
      { type: "employee", title: "New employee onboarded", description: "Sarah Johnson joined Marketing" },
      { type: "leave", title: "Leave request approved", description: "Mike Chen - Annual leave" },
      { type: "performance", title: "Performance review due", description: "15 employees pending" },
      { type: "payroll", title: "Payroll processing alert", description: "Monthly payroll due tomorrow" },
    ];

    activities.forEach((activity, index) => {
      const id = randomUUID();
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - (index + 1) * 2);

      this.activities.set(id, {
        id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        entityType: null,
        entityId: null,
        userId: null,
        createdAt,
      });
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role ?? "employee",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const id = randomUUID();
    const department: Department = { ...insertDepartment, id, createdAt: new Date() };
    this.departments.set(id, department);
    return department;
  }

  async updateDepartment(id: string, updates: Partial<InsertDepartment>): Promise<Department | undefined> {
    const department = this.departments.get(id);
    if (!department) return undefined;

    const updated = { ...department, ...updates };
    this.departments.set(id, updated);
    return updated;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return this.departments.delete(id);
  }

  // Employees
  async getEmployees(): Promise<EmployeeWithDepartment[]> {
    const employees = Array.from(this.employees.values());
    return employees.map(emp => ({
      ...emp,
      department: emp.departmentId ? this.departments.get(emp.departmentId) : undefined,
      manager: emp.managerId ? this.employees.get(emp.managerId) : undefined,
    }));
  }

  async getEmployee(id: string): Promise<EmployeeWithDepartment | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;

    return {
      ...employee,
      department: employee.departmentId ? this.departments.get(employee.departmentId) : undefined,
      manager: employee.managerId ? this.employees.get(employee.managerId) : undefined,
    };
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.email === email);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = {
      ...insertEmployee,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: string, updates: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;

    const updated = { ...employee, ...updates, updatedAt: new Date() };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Shifts
  async getShifts(): Promise<Shift[]> {
    return Array.from(this.shifts.values());
  }

  async getShift(id: string): Promise<Shift | undefined> {
    return this.shifts.get(id);
  }

  async createShift(insertShift: InsertShift): Promise<Shift> {
    const id = randomUUID();
    const shift: Shift = {
      ...insertShift,
      id,
      createdAt: new Date()
    };
    this.shifts.set(id, shift);
    return shift;
  }

  async updateShift(id: string, updates: Partial<InsertShift>): Promise<Shift | undefined> {
    const shift = this.shifts.get(id);
    if (!shift) return undefined;

    const updated = { ...shift, ...updates };
    this.shifts.set(id, updated);
    return updated;
  }

  async deleteShift(id: string): Promise<boolean> {
    return this.shifts.delete(id);
  }

  // Attendance
  async getAttendance(filters?: { employeeId?: string; startDate?: Date; endDate?: Date }): Promise<Attendance[]> {
    let attendance = Array.from(this.attendance.values());

    if (filters?.employeeId) {
      attendance = attendance.filter(a => a.employeeId === filters.employeeId);
    }

    if (filters?.startDate) {
      // Ensure comparison is done on normalized dates
      const startDateNormalized = filters.startDate.toISOString().split('T')[0];
      attendance = attendance.filter(a => a.date >= startDateNormalized);
    }

    if (filters?.endDate) {
      // Ensure comparison is done on normalized dates
      const endDateNormalized = filters.endDate.toISOString().split('T')[0];
      attendance = attendance.filter(a => a.date <= endDateNormalized);
    }

    return attendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendance: Attendance = {
      ...insertAttendance,
      id,
      status: insertAttendance.status ?? "present",
      createdAt: new Date(),
      date: insertAttendance.date || new Date().toISOString().split('T')[0], // Ensure date is set
    };
    this.attendance.set(id, attendance);
    return attendance;
  }

  // Get single attendance record by ID
  async getAttendanceById(id: string): Promise<Attendance | undefined> {
    return this.attendance.get(id);
  }

  async updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const attendance = this.attendance.get(id);
    if (!attendance) return undefined;

    const updated = { ...attendance, ...updates };
    this.attendance.set(id, updated);
    return updated;
  }

  // Delete attendance record
  async deleteAttendance(id: string): Promise<boolean> {
    return this.attendance.delete(id);
  }

  // Leaves
  async getLeaves(filters?: { employeeId?: string; status?: string }): Promise<Leave[]> {
    let leaves = Array.from(this.leaves.values());

    if (filters?.employeeId) {
      leaves = leaves.filter(l => l.employeeId === filters.employeeId);
    }

    if (filters?.status) {
      leaves = leaves.filter(l => l.status === filters.status);
    }

    return leaves.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createLeave(insertLeave: InsertLeave): Promise<Leave> {
    const id = randomUUID();
    const leave: Leave = {
      ...insertLeave,
      id,
      status: insertLeave.status ?? "pending",
      createdAt: new Date(),
      approvedAt: null
    };
    this.leaves.set(id, leave);
    return leave;
  }

  async updateLeave(id: string, updates: Partial<InsertLeave>): Promise<Leave | undefined> {
    const leave = this.leaves.get(id);
    if (!leave) return undefined;

    const updated = { ...leave, ...updates };
    if (updates.status === "approved" && !updated.approvedAt) {
      updated.approvedAt = new Date();
    }
    this.leaves.set(id, updated);
    return updated;
  }

  // Payroll
  async getPayroll(filters?: { employeeId?: string; month?: number; year?: number }): Promise<Payroll[]> {
    let payroll = Array.from(this.payroll.values());

    if (filters?.employeeId) {
      payroll = payroll.filter(p => p.employeeId === filters.employeeId);
    }

    if (filters?.month) {
      payroll = payroll.filter(p => p.month === filters.month);
    }

    if (filters?.year) {
      payroll = payroll.filter(p => p.year === filters.year);
    }

    return payroll.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createPayroll(insertPayroll: InsertPayroll): Promise<Payroll> {
    const id = randomUUID();
    const payroll: Payroll = {
      ...insertPayroll,
      id,
      status: insertPayroll.status ?? "pending",
      createdAt: new Date(),
      processedAt: null
    };
    this.payroll.set(id, payroll);
    return payroll;
  }

  async updatePayroll(id: string, updates: Partial<InsertPayroll>): Promise<Payroll | undefined> {
    const payroll = this.payroll.get(id);
    if (!payroll) return undefined;

    const updated = { ...payroll, ...updates };
    if (updates.status === "processed" && !updated.processedAt) {
      updated.processedAt = new Date();
    }
    this.payroll.set(id, updated);
    return updated;
  }

  // Performance
  async getPerformance(filters?: { employeeId?: string; year?: number }): Promise<Performance[]> {
    let performance = Array.from(this.performance.values());

    if (filters?.employeeId) {
      performance = performance.filter(p => p.employeeId === filters.employeeId);
    }

    if (filters?.year) {
      performance = performance.filter(p => p.year === filters.year);
    }

    return performance.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createPerformance(insertPerformance: InsertPerformance): Promise<Performance> {
    const id = randomUUID();
    const performance: Performance = {
      ...insertPerformance,
      id,
      status: insertPerformance.status ?? "pending",
      createdAt: new Date(),
      completedAt: null
    };
    this.performance.set(id, performance);
    return performance;
  }

  async updatePerformance(id: string, updates: Partial<InsertPerformance>): Promise<Performance | undefined> {
    const performance = this.performance.get(id);
    if (!performance) return undefined;

    const updated = { ...performance, ...updates };
    if (updates.status === "completed" && !updated.completedAt) {
      updated.completedAt = new Date();
    }
    this.performance.set(id, updated);
    return updated;
  }

  // Activities
  async getActivities(limit = 10): Promise<Activity[]> {
    const activities = Array.from(this.activities.values());
    return activities
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = {
      ...insertActivity,
      id,
      description: insertActivity.description ?? null,
      createdAt: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Biometric Devices
  async getBiometricDevices(): Promise<BiometricDevice[]> {
    return Array.from(this.biometricDevices.values());
  }

  async getBiometricDevice(deviceId: string): Promise<BiometricDevice | undefined> {
    return Array.from(this.biometricDevices.values()).find(device => device.deviceId === deviceId);
  }

  async createBiometricDevice(deviceData: Omit<Insert<BiometricDevice>, 'id' | 'createdAt' | 'updatedAt'>): Promise<BiometricDevice> {
    const id = randomUUID();
    const device: BiometricDevice = {
      ...deviceData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.biometricDevices.set(id, device);
    return device;
  }

  async updateBiometricDevice(deviceId: string, updates: Partial<Omit<Insert<BiometricDevice>, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BiometricDevice | undefined> {
    const device = Array.from(this.biometricDevices.values()).find(d => d.deviceId === deviceId);
    if (!device) return undefined;

    const updatedDevice = {
      ...device,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.biometricDevices.set(device.id, updatedDevice); // Use the internal ID to update
    return updatedDevice;
  }

  async deleteBiometricDevice(deviceId: string): Promise<boolean> {
    const deviceToRemove = Array.from(this.biometricDevices.values()).find(d => d.deviceId === deviceId);
    if (deviceToRemove) {
      return this.biometricDevices.delete(deviceToRemove.id);
    }
    return false;
  }

  // Process Biometric Punches
  async processBiometricPunch(punchData: {
    deviceId: string;
    employeeId: string;
    biometricId: string; // The ID from the biometric machine
    punchTime: Date;
    punchType: 'IN' | 'OUT'; // 'IN' for check-in, 'OUT' for check-out
    location?: string;
    clientSiteId?: string;
  }): Promise<Attendance | undefined> {
    const { deviceId, employeeId, biometricId, punchTime, punchType, location, clientSiteId } = punchData;
    const attendanceDate = punchTime.toISOString().split('T')[0];

    // Find existing attendance for the day
    let attendanceRecord = Array.from(this.attendance.values()).find(att =>
      att.employeeId === employeeId &&
      att.date === attendanceDate
    );

    if (!attendanceRecord) {
      // If no record exists for the day, create one
      attendanceRecord = await this.createAttendance({
        employeeId,
        date: attendanceDate,
        biometricId,
        biometricDeviceIn: punchType === 'IN' ? deviceId : undefined,
        biometricDeviceOut: punchType === 'OUT' ? deviceId : undefined,
        location: location || null,
        clientSiteId: clientSiteId || null,
        status: 'present', // Default status
        checkIn: punchType === 'IN' ? punchTime : undefined,
        checkOut: punchType === 'OUT' ? punchTime : undefined,
        fingerprintVerified: true,
      });
    } else {
      // If record exists, update it
      const updates: Partial<InsertAttendance> = {};
      if (punchType === 'IN') {
        // Only update check-in if it's not already set or if this punch is earlier (e.g., shift change)
        if (!attendanceRecord.checkIn || punchTime < attendanceRecord.checkIn) {
          updates.checkIn = punchTime;
          updates.biometricDeviceIn = deviceId;
          updates.fingerprintVerified = true;
        }
      } else if (punchType === 'OUT') {
        // Only update check-out if it's not already set or if this punch is later
        if (!attendanceRecord.checkOut || punchTime > attendanceRecord.checkOut) {
          updates.checkOut = punchTime;
          updates.biometricDeviceOut = deviceId;
        }
      }

      // Calculate hours worked if both check-in and check-out are available
      if (updates.checkIn || attendanceRecord.checkIn) {
        const effectiveCheckIn = updates.checkIn || attendanceRecord.checkIn;
        const effectiveCheckOut = updates.checkOut || attendanceRecord.checkOut;

        if (effectiveCheckIn && effectiveCheckOut) {
          const checkInTime = new Date(effectiveCheckIn);
          const checkOutTime = new Date(effectiveCheckOut);
          const hoursWorkedMs = checkOutTime.getTime() - checkInTime.getTime();
          const hoursWorked = hoursWorkedMs / (1000 * 60 * 60);

          updates.hoursWorked = hoursWorked.toFixed(2);
          // Assuming standard 8-hour workday for overtime calculation
          updates.overtimeHours = Math.max(0, hoursWorked - 8).toFixed(2);

          // Update lateMinutes and earlyDepartureMinutes if not already set or if this punch provides more accurate data
          const standardShiftStart = new Date(attendanceDate + "T09:00:00"); // Assuming 9 AM start
          const standardShiftEnd = new Date(attendanceDate + "T17:00:00"); // Assuming 5 PM end

          if (effectiveCheckIn > standardShiftStart) {
            const lateMinutes = Math.floor((effectiveCheckIn.getTime() - standardShiftStart.getTime()) / (1000 * 60));
            if (updates.lateMinutes === undefined || lateMinutes < updates.lateMinutes) {
              updates.lateMinutes = lateMinutes;
            }
          }
          if (effectiveCheckOut < standardShiftEnd) {
            const earlyDepartureMinutes = Math.floor((standardShiftEnd.getTime() - effectiveCheckOut.getTime()) / (1000 * 60));
            if (updates.earlyDepartureMinutes === undefined || earlyDepartureMinutes < updates.earlyDepartureMinutes) {
              updates.earlyDepartureMinutes = earlyDepartureMinutes;
            }
          }
        }
      }

      // If there are any updates to apply, call updateAttendance
      if (Object.keys(updates).length > 0) {
        return await this.updateAttendance(attendanceRecord.id, updates);
      } else {
        return attendanceRecord; // No changes needed, return the existing record
      }
    }
    return attendanceRecord; // Return the newly created record if applicable
  }

  // Analytics
  async getDashboardMetrics() {
    const employees = Array.from(this.employees.values());
    const attendance = Array.from(this.attendance.values());
    const leaves = Array.from(this.leaves.values());
    const departments = Array.from(this.departments.values());

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === "active");

    // Calculate today's attendance
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const todayAttendanceRecords = attendance.filter(a => a.date === todayString);

    const activeToday = todayAttendanceRecords.length;
    const pendingLeaves = leaves.filter(l => l.status === "pending").length;

    // Department distribution
    const departmentDistribution = departments.map(dept => ({
      name: dept.name,
      count: employees.filter(emp => emp.departmentId === dept.id).length
    }));

    // Attendance trend for last 7 days
    const attendanceTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const trendDateString = date.toISOString().split('T')[0];

      const dayAttendance = attendance.filter(a => a.date === trendDateString);

      const rate = activeEmployees.length > 0 ? (dayAttendance.length / activeEmployees.length) * 100 : 0;
      attendanceTrend.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        rate: Math.round(rate)
      });
    }

    const attendanceRate = activeEmployees.length > 0 ? (activeToday / activeEmployees.length) * 100 : 0;

    const openPositions = Array.from(this.jobOpenings.values()).filter(j => j.status === 'active').length;

    return {
      totalEmployees,
      activeToday,
      pendingLeaves,
      openPositions,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      departmentDistribution,
      attendanceTrend,
    };
  }

  // Performance delete method
  async deletePerformance(id: string): Promise<boolean> {
    return this.performance.delete(id);
  }

  // Job Opening methods
  async getJobOpenings(): Promise<JobOpening[]> {
    return Array.from(this.jobOpenings.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getJobOpening(id: string): Promise<JobOpening | undefined> {
    return this.jobOpenings.get(id);
  }

  async createJobOpening(insertJobOpening: InsertJobOpening): Promise<JobOpening> {
    const id = randomUUID();
    const jobOpening: JobOpening = {
      ...insertJobOpening,
      id,
      applicantCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      postedBy: null, // Ensure this field is set
    };
    this.jobOpenings.set(id, jobOpening);
    return jobOpening;
  }

  async updateJobOpening(id: string, updates: Partial<InsertJobOpening>): Promise<JobOpening | undefined> {
    const jobOpening = this.jobOpenings.get(id);
    if (!jobOpening) return undefined;

    const updated = {
      ...jobOpening,
      ...updates,
      updatedAt: new Date()
    };
    this.jobOpenings.set(id, updated);
    return updated;
  }

  async deleteJobOpening(id: string): Promise<boolean> {
    // Also delete related applications
    const applications = Array.from(this.jobApplications.values())
      .filter(app => app.jobId === id);
    applications.forEach(app => this.jobApplications.delete(app.id));

    return this.jobOpenings.delete(id);
  }

  // Job Application methods
  async getJobApplications(jobId?: string): Promise<JobApplication[]> {
    let applications = Array.from(this.jobApplications.values());

    if (jobId) {
      applications = applications.filter(app => app.jobId === jobId);
    }

    return applications.sort((a, b) => (b.appliedAt?.getTime() || 0) - (a.appliedAt?.getTime() || 0));
  }

  async getJobApplication(id: string): Promise<JobApplication | undefined> {
    return this.jobApplications.get(id);
  }

  async createJobApplication(insertApplication: InsertJobApplication): Promise<JobApplication> {
    const id = randomUUID();
    const application: JobApplication = {
      ...insertApplication,
      id,
      appliedAt: new Date(),
      reviewedAt: null
    };
    this.jobApplications.set(id, application);

    // Update job opening applicant count
    const jobOpening = this.jobOpenings.get(insertApplication.jobId);
    if (jobOpening) {
      jobOpening.applicantCount = (jobOpening.applicantCount || 0) + 1;
      this.jobOpenings.set(jobOpening.id, jobOpening);
    }

    return application;
  }

  async updateJobApplication(id: string, updates: Partial<InsertJobApplication>): Promise<JobApplication | undefined> {
    const application = this.jobApplications.get(id);
    if (!application) return undefined;

    const updated = {
      ...application,
      ...updates,
      reviewedAt: updates.status && updates.status !== 'pending' ? new Date() : application.reviewedAt
    };
    this.jobApplications.set(id, updated);
    return updated;
  }

  async deleteJobApplication(id: string): Promise<boolean> {
    const application = this.jobApplications.get(id);
    if (application) {
      // Update job opening applicant count
      const jobOpening = this.jobOpenings.get(application.jobId);
      if (jobOpening && jobOpening.applicantCount && jobOpening.applicantCount > 0) {
        jobOpening.applicantCount = jobOpening.applicantCount - 1;
        this.jobOpenings.set(jobOpening.id, jobOpening);
      }
    }

    return this.jobApplications.delete(id);
  }
}

export const storage = new MemStorage();