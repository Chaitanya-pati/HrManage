import { 
  type User, type InsertUser,
  type Department, type InsertDepartment,
  type Employee, type InsertEmployee, type EmployeeWithDepartment,
  type Attendance, type InsertAttendance,
  type Leave, type InsertLeave,
  type Payroll, type InsertPayroll,
  type Performance, type InsertPerformance,
  type Activity, type InsertActivity
} from "@shared/schema";
import { randomUUID } from "crypto";

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

  // Attendance
  getAttendance(filters?: { employeeId?: string; startDate?: Date; endDate?: Date }): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance | undefined>;

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

  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

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
  private attendance: Map<string, Attendance> = new Map();
  private leaves: Map<string, Leave> = new Map();
  private payroll: Map<string, Payroll> = new Map();
  private performance: Map<string, Performance> = new Map();
  private activities: Map<string, Activity> = new Map();

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

    // Create sample attendance records
    const employees = Array.from(this.employees.values());
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
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
            date,
            checkIn,
            checkOut,
            hoursWorked: "8.00",
            status: "present",
            notes: null,
            createdAt: new Date(),
          });
        }
      });
    }

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
    const user: User = { ...insertUser, id, createdAt: new Date() };
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

  // Attendance
  async getAttendance(filters?: { employeeId?: string; startDate?: Date; endDate?: Date }): Promise<Attendance[]> {
    let attendance = Array.from(this.attendance.values());
    
    if (filters?.employeeId) {
      attendance = attendance.filter(a => a.employeeId === filters.employeeId);
    }
    
    if (filters?.startDate) {
      attendance = attendance.filter(a => a.date >= filters.startDate!);
    }
    
    if (filters?.endDate) {
      attendance = attendance.filter(a => a.date <= filters.endDate!);
    }
    
    return attendance.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const attendance: Attendance = { ...insertAttendance, id, createdAt: new Date() };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const attendance = this.attendance.get(id);
    if (!attendance) return undefined;
    
    const updated = { ...attendance, ...updates };
    this.attendance.set(id, updated);
    return updated;
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
    
    return leaves.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createLeave(insertLeave: InsertLeave): Promise<Leave> {
    const id = randomUUID();
    const leave: Leave = { ...insertLeave, id, createdAt: new Date(), approvedAt: null };
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
    
    return payroll.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createPayroll(insertPayroll: InsertPayroll): Promise<Payroll> {
    const id = randomUUID();
    const payroll: Payroll = { ...insertPayroll, id, createdAt: new Date(), processedAt: null };
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
    
    return performance.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createPerformance(insertPerformance: InsertPerformance): Promise<Performance> {
    const id = randomUUID();
    const performance: Performance = { ...insertPerformance, id, createdAt: new Date(), completedAt: null };
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
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = { ...insertActivity, id, createdAt: new Date() };
    this.activities.set(id, activity);
    return activity;
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
    today.setHours(0, 0, 0, 0);
    const todayAttendance = attendance.filter(a => {
      const attendanceDate = new Date(a.date);
      attendanceDate.setHours(0, 0, 0, 0);
      return attendanceDate.getTime() === today.getTime();
    });
    
    const activeToday = todayAttendance.length;
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
      date.setHours(0, 0, 0, 0);
      
      const dayAttendance = attendance.filter(a => {
        const attendanceDate = new Date(a.date);
        attendanceDate.setHours(0, 0, 0, 0);
        return attendanceDate.getTime() === date.getTime();
      });
      
      const rate = activeEmployees.length > 0 ? (dayAttendance.length / activeEmployees.length) * 100 : 0;
      attendanceTrend.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        rate: Math.round(rate)
      });
    }

    const attendanceRate = activeEmployees.length > 0 ? (activeToday / activeEmployees.length) * 100 : 0;

    return {
      totalEmployees,
      activeToday,
      pendingLeaves,
      openPositions: 15, // Mock data
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      departmentDistribution,
      attendanceTrend,
    };
  }
}

export const storage = new MemStorage();
