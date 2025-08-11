import {
  type User, type InsertUser,
  type Department, type InsertDepartment,
  type Employee, type InsertEmployee,
  type Attendance, type InsertAttendance,
  type Leave, type InsertLeave,
  type Payroll, type InsertPayroll,
  type Performance, type InsertPerformance,
  type Shift, type InsertShift,
  type JobOpening, type InsertJobOpening,
  type Application, type InsertApplication,
  type EmployeeAllowance, type InsertEmployeeAllowance,
  type EmployeeDeduction, type InsertEmployeeDeduction,
  type EmployeeLeaveBalance, type InsertEmployeeLeaveBalance,
  users, departments, employees, leaves, attendance, payroll, performance, shifts, jobOpenings, applications,
  employeeAllowances, employeeDeductions, employeeLeaveBalances, salarySlips
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";

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
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
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
  deleteLeave(id: string): Promise<boolean>;

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

  // Applications
  getApplications(jobId?: string): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application | undefined>;
  deleteApplication(id: string): Promise<boolean>;

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

  // Activities
  getActivities(limit?: number): Promise<any[]>;
  createActivity(activity: any): Promise<any>;

  // Employee Allowances
  getEmployeeAllowances(employeeId: string): Promise<EmployeeAllowance[]>;
  createEmployeeAllowance(allowance: InsertEmployeeAllowance): Promise<EmployeeAllowance>;
  updateEmployeeAllowance(id: string, allowance: Partial<InsertEmployeeAllowance>): Promise<EmployeeAllowance | undefined>;
  deleteEmployeeAllowance(id: string): Promise<boolean>;

  // Employee Deductions
  getEmployeeDeductions(employeeId: string): Promise<EmployeeDeduction[]>;
  createEmployeeDeduction(deduction: InsertEmployeeDeduction): Promise<EmployeeDeduction>;
  updateEmployeeDeduction(id: string, deduction: Partial<InsertEmployeeDeduction>): Promise<EmployeeDeduction | undefined>;
  deleteEmployeeDeduction(id: string): Promise<boolean>;

  // Employee Leave Balances
  getEmployeeLeaveBalances(employeeId: string): Promise<EmployeeLeaveBalance[]>;
  createEmployeeLeaveBalance(balance: InsertEmployeeLeaveBalance): Promise<EmployeeLeaveBalance>;
  updateEmployeeLeaveBalance(id: string, balance: Partial<InsertEmployeeLeaveBalance>): Promise<EmployeeLeaveBalance | undefined>;
  deleteEmployeeLeaveBalance(id: string): Promise<boolean>;

  // Salary Slips
  getSalarySlips(filters?: any): Promise<any[]>;
  createSalarySlip(data: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  private db = db; // Instance of the database connection

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const result = await this.db.insert(users).values({ ...user, id }).returning();
    return result[0];
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return await this.db.select().from(departments).orderBy(departments.name);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const result = await this.db.select().from(departments).where(eq(departments.id, id)).limit(1);
    return result[0];
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const id = randomUUID();
    const result = await this.db.insert(departments).values({ ...department, id }).returning();
    return result[0];
  }

  async updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department | undefined> {
    const result = await this.db.update(departments).set(department).where(eq(departments.id, id)).returning();
    return result[0];
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await this.db.delete(departments).where(eq(departments.id, id));
    return result.changes > 0;
  }

  // Employees
  async getEmployees(): Promise<Employee[]> {
    console.log('DatabaseStorage: getEmployees called');
    const result = await this.db.select().from(employees).orderBy(employees.firstName, employees.lastName);
    console.log('DatabaseStorage: getEmployees result count:', result.length);
    console.log('DatabaseStorage: First 3 employees:', result.slice(0, 3).map(e => ({ id: e.id, employeeId: e.employeeId, firstName: e.firstName, lastName: e.lastName })));
    return result;
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const result = await this.db.select().from(employees).where(eq(employees.id, id)).limit(1);
    return result[0];
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const result = await this.db.select().from(employees).where(eq(employees.email, email)).limit(1);
    return result[0];
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employeeData = {
      ...employee,
      id,
      hireDate: employee.hireDate ? Math.floor(new Date(employee.hireDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
      dateOfBirth: employee.dateOfBirth ? Math.floor(new Date(employee.dateOfBirth).getTime() / 1000) : undefined,
      probationEndDate: employee.probationEndDate ? Math.floor(new Date(employee.probationEndDate).getTime() / 1000) : undefined,
      confirmationDate: employee.confirmationDate ? Math.floor(new Date(employee.confirmationDate).getTime() / 1000) : undefined,
    };
    const result = await this.db.insert(employees).values(employeeData as any).returning();
    return result[0];
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const result = await this.db.update(employees).set(employee).where(eq(employees.id, id)).returning();
    return result[0];
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const result = await this.db.delete(employees).where(eq(employees.id, id));
    return result.changes > 0;
  }

  // Shifts
  async getShifts(): Promise<Shift[]> {
    return await this.db.select().from(shifts).orderBy(shifts.name);
  }

  async getShift(id: string): Promise<Shift | undefined> {
    const result = await this.db.select().from(shifts).where(eq(shifts.id, id)).limit(1);
    return result[0];
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const id = randomUUID();
    const result = await this.db.insert(shifts).values({ ...shift, id }).returning();
    return result[0];
  }

  async updateShift(id: string, shift: Partial<InsertShift>): Promise<Shift | undefined> {
    const result = await this.db.update(shifts).set(shift).where(eq(shifts.id, id)).returning();
    return result[0];
  }

  async deleteShift(id: string): Promise<boolean> {
    const result = await this.db.delete(shifts).where(eq(shifts.id, id));
    return result.changes > 0;
  }

  // Attendance
  async getAttendance(filters?: { employeeId?: string; startDate?: Date; endDate?: Date }): Promise<Attendance[]> {
    const conditions = [];

    if (filters?.employeeId) {
      conditions.push(eq(attendance.employeeId, filters.employeeId));
    }

    if (filters?.startDate) {
      conditions.push(sql`${attendance.date} >= ${Math.floor(filters.startDate.getTime() / 1000)}`);
    }

    if (filters?.endDate) {
      conditions.push(sql`${attendance.date} <= ${Math.floor(filters.endDate.getTime() / 1000)}`);
    }

    if (conditions.length > 0) {
      return await this.db.select().from(attendance).where(and(...conditions)).orderBy(desc(attendance.date));
    } else {
      return await this.db.select().from(attendance).orderBy(desc(attendance.date));
    }
  }

  async getAttendanceById(id: string): Promise<Attendance | undefined> {
    const result = await this.db.select().from(attendance).where(eq(attendance.id, id)).limit(1);
    return result[0];
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const result = await this.db.insert(attendance).values({ ...attendanceData, id }).returning();
    return result[0];
  }

  async updateAttendance(id: string, attendanceData: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const result = await this.db.update(attendance).set(attendanceData).where(eq(attendance.id, id)).returning();
    return result[0];
  }

  async deleteAttendance(id: string): Promise<boolean> {
    const result = await this.db.delete(attendance).where(eq(attendance.id, id));
    return result.changes > 0;
  }

  // Leaves
  async getLeaves(filters?: { employeeId?: string; status?: string }): Promise<Leave[]> {
    const conditions = [];

    if (filters?.employeeId) {
      conditions.push(eq(leaves.employeeId, filters.employeeId));
    }

    if (filters?.status) {
      conditions.push(eq(leaves.status, filters.status));
    }

    let result;
    if (conditions.length > 0) {
      result = await this.db.select().from(leaves).where(and(...conditions)).orderBy(desc(leaves.createdAt));
    } else {
      result = await this.db.select().from(leaves).orderBy(desc(leaves.createdAt));
    }

    // Convert Unix timestamps back to Date objects for frontend
    return result.map(leave => ({
      ...leave,
      startDate: new Date((leave.startDate as number) * 1000),
      endDate: new Date((leave.endDate as number) * 1000),
      createdAt: leave.createdAt ? new Date((leave.createdAt as number) * 1000) : new Date(),
      approvedAt: leave.approvedAt ? new Date((leave.approvedAt as number) * 1000) : null
    }));
  }

  async createLeave(leave: InsertLeave): Promise<Leave> {
    const id = randomUUID();

    // Convert dates to Unix timestamps for SQLite integer storage
    const leaveData = {
      ...leave,
      id,
      startDate: Math.floor(new Date(leave.startDate).getTime() / 1000),
      endDate: Math.floor(new Date(leave.endDate).getTime() / 1000),
      createdAt: Math.floor(Date.now() / 1000)
    };

    const result = await this.db.insert(leaves).values(leaveData as any).returning();

    // Convert back to Date objects for frontend
    return {
      ...result[0],
      startDate: new Date((result[0].startDate as number) * 1000),
      endDate: new Date((result[0].endDate as number) * 1000),
      createdAt: result[0].createdAt ? new Date((result[0].createdAt as number) * 1000) : new Date(),
      approvedAt: result[0].approvedAt ? new Date((result[0].approvedAt as number) * 1000) : null
    };
  }

  async updateLeave(id: string, leave: Partial<InsertLeave>): Promise<Leave | undefined> {
    // Convert date fields to timestamps if they exist
    const updateData: any = { ...leave };
    if (leave.startDate) {
      updateData.startDate = Math.floor(new Date(leave.startDate).getTime() / 1000);
    }
    if (leave.endDate) {
      updateData.endDate = Math.floor(new Date(leave.endDate).getTime() / 1000);
    }

    const result = await this.db.update(leaves).set(updateData).where(eq(leaves.id, id)).returning();
    if (result[0]) {
      return {
        ...result[0],
        startDate: new Date((result[0].startDate as number) * 1000),
        endDate: new Date((result[0].endDate as number) * 1000),
        createdAt: result[0].createdAt ? new Date((result[0].createdAt as number) * 1000) : new Date(),
        approvedAt: result[0].approvedAt ? new Date((result[0].approvedAt as number) * 1000) : null
      };
    }
    return undefined;
  }

  async deleteLeave(id: string): Promise<boolean> {
    const result = await this.db.delete(leaves).where(eq(leaves.id, id));
    return result.changes > 0;
  }

  // Payroll
  async getPayroll(filters?: { employeeId?: string; month?: number; year?: number }): Promise<Payroll[]> {
    const conditions = [];

    if (filters?.employeeId) {
      conditions.push(eq(payroll.employeeId, filters.employeeId));
    }

    if (filters?.month) {
      conditions.push(eq(payroll.month, filters.month));
    }

    if (filters?.year) {
      conditions.push(eq(payroll.year, filters.year));
    }

    if (conditions.length > 0) {
      return await this.db.select().from(payroll).where(and(...conditions)).orderBy(desc(payroll.year), desc(payroll.month));
    }

    return await this.db.select().from(payroll).orderBy(desc(payroll.year), desc(payroll.month));
  }

  async createPayroll(payrollData: InsertPayroll): Promise<Payroll> {
    const id = randomUUID();
    const result = await this.db.insert(payroll).values({ ...payrollData, id }).returning();
    return result[0];
  }

  async updatePayroll(id: string, payrollData: Partial<InsertPayroll>): Promise<Payroll | undefined> {
    const result = await this.db.update(payroll).set(payrollData).where(eq(payroll.id, id)).returning();
    return result[0];
  }

  // Performance
  async getPerformance(filters?: { employeeId?: string; year?: number }): Promise<Performance[]> {
    const conditions = [];

    if (filters?.employeeId) {
      conditions.push(eq(performance.employeeId, filters.employeeId));
    }

    if (conditions.length > 0) {
      return await this.db.select().from(performance).where(and(...conditions)).orderBy(desc(performance.createdAt));
    }

    return await this.db.select().from(performance).orderBy(desc(performance.createdAt));
  }

  async createPerformance(performanceData: InsertPerformance): Promise<Performance> {
    const id = randomUUID();
    const result = await this.db.insert(performance).values({ ...performanceData, id }).returning();
    return result[0];
  }

  async updatePerformance(id: string, performanceData: Partial<InsertPerformance>): Promise<Performance | undefined> {
    const result = await this.db.update(performance).set(performanceData).where(eq(performance.id, id)).returning();
    return result[0];
  }

  async deletePerformance(id: string): Promise<boolean> {
    const result = await this.db.delete(performance).where(eq(performance.id, id));
    return result.changes > 0;
  }

  // Job Openings
  async getJobOpenings(): Promise<JobOpening[]> {
    return await this.db.select().from(jobOpenings).orderBy(desc(jobOpenings.createdAt));
  }

  async getJobOpening(id: string): Promise<JobOpening | undefined> {
    const result = await this.db.select().from(jobOpenings).where(eq(jobOpenings.id, id)).limit(1);
    return result[0];
  }

  async createJobOpening(jobOpening: InsertJobOpening): Promise<JobOpening> {
    const id = randomUUID();
    const result = await this.db.insert(jobOpenings).values({ ...jobOpening, id }).returning();
    return result[0];
  }

  async updateJobOpening(id: string, jobOpening: Partial<InsertJobOpening>): Promise<JobOpening | undefined> {
    const result = await this.db.update(jobOpenings).set(jobOpening).where(eq(jobOpenings.id, id)).returning();
    return result[0];
  }

  async deleteJobOpening(id: string): Promise<boolean> {
    const result = await this.db.delete(jobOpenings).where(eq(jobOpenings.id, id));
    return result.changes > 0;
  }

  // Applications
  async getApplications(jobId?: string): Promise<Application[]> {
    if (jobId) {
      return await this.db.select().from(applications).where(eq(applications.jobId, jobId)).orderBy(desc(applications.submittedAt));
    }

    return await this.db.select().from(applications).orderBy(desc(applications.submittedAt));
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const result = await this.db.select().from(applications).where(eq(applications.id, id)).limit(1);
    return result[0];
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const id = randomUUID();
    const result = await this.db.insert(applications).values({ ...application, id }).returning();
    return result[0];
  }

  async updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application | undefined> {
    const result = await this.db.update(applications).set(application).where(eq(applications.id, id)).returning();
    return result[0];
  }

  async deleteApplication(id: string): Promise<boolean> {
    const result = await this.db.delete(applications).where(eq(applications.id, id));
    return result.changes > 0;
  }

  // Analytics
  async getDashboardMetrics(): Promise<{
    totalEmployees: number;
    activeToday: number;
    pendingLeaves: number;
    openPositions: number;
    attendanceRate: number;
    departmentDistribution: { name: string; count: number }[];
    attendanceTrend: { date: string; rate: number }[];
  }> {
    const employeesCount = await this.db.select({ count: sql<number>`count(*)` }).from(employees);
    const pendingLeavesCount = await this.db.select({ count: sql<number>`count(*)` }).from(leaves).where(eq(leaves.status, 'pending'));
    const openPositionsCount = await this.db.select({ count: sql<number>`count(*)` }).from(jobOpenings).where(eq(jobOpenings.status, 'active'));

    return {
      totalEmployees: employeesCount[0]?.count || 0,
      activeToday: 0, // Would need actual attendance logic
      pendingLeaves: pendingLeavesCount[0]?.count || 0,
      openPositions: openPositionsCount[0]?.count || 0,
      attendanceRate: 0.85, // Mock data for now
      departmentDistribution: [], // Would need aggregation
      attendanceTrend: [] // Would need historical data
    };
  }

  // Activities
  async getActivities(limit: number = 50): Promise<any[]> {
    // Return empty array for now - activities table would need to be implemented
    return [];
  }

  async createActivity(activity: any): Promise<any> {
    // Return the activity as-is for now - activities table would need to be implemented
    return activity;
  }

  // Employee Allowances
  async getEmployeeAllowances(employeeId: string): Promise<EmployeeAllowance[]> {
    const result = await this.db.select().from(employeeAllowances)
      .where(and(eq(employeeAllowances.employeeId, employeeId), eq(employeeAllowances.isActive, true)));
    return result;
  }

  async createEmployeeAllowance(allowance: InsertEmployeeAllowance): Promise<EmployeeAllowance> {
    const result = await this.db.insert(employeeAllowances).values(allowance).returning();
    return result[0];
  }

  async updateEmployeeAllowance(id: string, allowance: Partial<InsertEmployeeAllowance>): Promise<EmployeeAllowance | undefined> {
    const result = await this.db.update(employeeAllowances)
      .set({ ...allowance, updatedAt: new Date() })
      .where(eq(employeeAllowances.id, id))
      .returning();
    return result[0];
  }

  async deleteEmployeeAllowance(id: string): Promise<boolean> {
    const result = await this.db.update(employeeAllowances)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(employeeAllowances.id, id));
    return result.changes > 0;
  }

  // Employee Deductions
  async getEmployeeDeductions(employeeId: string): Promise<EmployeeDeduction[]> {
    const result = await this.db.select().from(employeeDeductions)
      .where(and(eq(employeeDeductions.employeeId, employeeId), eq(employeeDeductions.isActive, true)));
    return result;
  }

  async createEmployeeDeduction(deduction: InsertEmployeeDeduction): Promise<EmployeeDeduction> {
    const result = await this.db.insert(employeeDeductions).values(deduction).returning();
    return result[0];
  }

  async updateEmployeeDeduction(id: string, deduction: Partial<InsertEmployeeDeduction>): Promise<EmployeeDeduction | undefined> {
    const result = await this.db.update(employeeDeductions)
      .set({ ...deduction, updatedAt: new Date() })
      .where(eq(employeeDeductions.id, id))
      .returning();
    return result[0];
  }

  async deleteEmployeeDeduction(id: string): Promise<boolean> {
    const result = await this.db.update(employeeDeductions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(employeeDeductions.id, id));
    return result.changes > 0;
  }

  // Employee Leave Balances
  async getEmployeeLeaveBalances(employeeId: string): Promise<EmployeeLeaveBalance[]> {
    const result = await this.db.select().from(employeeLeaveBalances)
      .where(and(eq(employeeLeaveBalances.employeeId, employeeId), eq(employeeLeaveBalances.isActive, true)));
    return result;
  }

  async createEmployeeLeaveBalance(data: InsertEmployeeLeaveBalance): Promise<EmployeeLeaveBalance> {
    const [balance] = await this.db.insert(employeeLeaveBalances).values(data).returning();
    return balance;
  }

  async updateEmployeeLeaveBalance(id: string, balance: Partial<InsertEmployeeLeaveBalance>): Promise<EmployeeLeaveBalance | undefined> {
    const result = await this.db.update(employeeLeaveBalances)
      .set({ ...balance, updatedAt: new Date() })
      .where(eq(employeeLeaveBalances.id, id))
      .returning();
    return result[0];
  }

  async deleteEmployeeLeaveBalance(id: string): Promise<boolean> {
    const result = await this.db.update(employeeLeaveBalances)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(employeeLeaveBalances.id, id));
    return result.changes > 0;
  }

  // Salary Slips methods
  async getSalarySlips(filters: any = {}): Promise<any[]> {
    try {
      let query = this.db.select().from(salarySlips);

      if (filters.employeeId) {
        query = query.where(eq(salarySlips.employeeId, filters.employeeId));
      }

      if (filters.payrollId) {
        query = query.where(eq(salarySlips.payrollId, filters.payrollId));
      }

      const result = await query;
      return result;
    } catch (error) {
      console.error('DatabaseStorage: getSalarySlips error:', error);
      throw error;
    }
  }

  async createSalarySlip(data: any): Promise<any> {
    try {
      const [salarySlip] = await this.db.insert(salarySlips).values(data).returning();
      return salarySlip;
    } catch (error) {
      console.error('DatabaseStorage: createSalarySlip error:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();