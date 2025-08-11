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
  type JobApplication, type InsertJobApplication,
  users, departments, employees, leaves, attendance, payroll, performance, activities, shifts, jobOpenings, jobApplications
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

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments).orderBy(departments.name);
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    const result = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
    return result[0];
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const result = await db.insert(departments).values(department).returning();
    return result[0];
  }

  async updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department | undefined> {
    const result = await db.update(departments).set(department).where(eq(departments.id, id)).returning();
    return result[0];
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await db.delete(departments).where(eq(departments.id, id));
    return (result as any).rowCount > 0;
  }

  // Employees
  async getEmployees(): Promise<EmployeeWithDepartment[]> {
    const result = await db.select({
      id: employees.id,
      userId: employees.userId,
      employeeId: employees.employeeId,
      firstName: employees.firstName,
      middleName: employees.middleName,
      lastName: employees.lastName,
      email: employees.email,
      personalEmail: employees.personalEmail,
      phone: employees.phone,
      personalPhone: employees.personalPhone,
      dateOfBirth: employees.dateOfBirth,
      gender: employees.gender,
      maritalStatus: employees.maritalStatus,
      profileImage: employees.profileImage,
      currentAddress: employees.currentAddress,
      permanentAddress: employees.permanentAddress,
      emergencyContact: employees.emergencyContact,
      departmentId: employees.departmentId,
      position: employees.position,
      managerId: employees.managerId,
      employmentType: employees.employmentType,
      workLocation: employees.workLocation,
      employeeGrade: employees.employeeGrade,
      hireDate: employees.hireDate,
      probationEndDate: employees.probationEndDate,
      confirmationDate: employees.confirmationDate,
      status: employees.status,
      shiftId: employees.shiftId,
      baseSalary: employees.baseSalary,
      hra: employees.hra,
      conveyanceAllowance: employees.conveyanceAllowance,
      medicalAllowance: employees.medicalAllowance,
      specialAllowance: employees.specialAllowance,
      dearnessAllowance: employees.dearnessAllowance,
      overtimeEligible: employees.overtimeEligible,
      overtimeCategory: employees.overtimeCategory,
      maxOvertimeHours: employees.maxOvertimeHours,
      overtimeRate: employees.overtimeRate,
      holidayOvertimeRate: employees.holidayOvertimeRate,
      nightShiftOvertimeRate: employees.nightShiftOvertimeRate,
      education: employees.education,
      skills: employees.skills,
      experience: employees.experience,
      languages: employees.languages,
      panNumber: employees.panNumber,
      aadharNumber: employees.aadharNumber,
      passportNumber: employees.passportNumber,
      pfAccountNumber: employees.pfAccountNumber,
      esiNumber: employees.esiNumber,
      uanNumber: employees.uanNumber,
      previousPfDetails: employees.previousPfDetails,
      bankDetails: employees.bankDetails,
      medicalFitnessCertificate: employees.medicalFitnessCertificate,
      safetyTrainingCompleted: employees.safetyTrainingCompleted,
      safetyEquipmentSizes: employees.safetyEquipmentSizes,
      specialLicenses: employees.specialLicenses,
      policeVerification: employees.policeVerification,
      fieldWorkEligible: employees.fieldWorkEligible,
      clientSiteAccess: employees.clientSiteAccess,
      travelAllowance: employees.travelAllowance,
      fieldAllowance: employees.fieldAllowance,
      createdAt: employees.createdAt,
      updatedAt: employees.updatedAt,
      department: departments
    })
    .from(employees)
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .orderBy(employees.firstName, employees.lastName);

    return result.map(r => ({ ...r, department: r.department || undefined }));
  }

  async getEmployee(id: string): Promise<EmployeeWithDepartment | undefined> {
    const result = await db.select({
      id: employees.id,
      userId: employees.userId,
      employeeId: employees.employeeId,
      firstName: employees.firstName,
      middleName: employees.middleName,
      lastName: employees.lastName,
      email: employees.email,
      personalEmail: employees.personalEmail,
      phone: employees.phone,
      personalPhone: employees.personalPhone,
      dateOfBirth: employees.dateOfBirth,
      gender: employees.gender,
      maritalStatus: employees.maritalStatus,
      profileImage: employees.profileImage,
      currentAddress: employees.currentAddress,
      permanentAddress: employees.permanentAddress,
      emergencyContact: employees.emergencyContact,
      departmentId: employees.departmentId,
      position: employees.position,
      managerId: employees.managerId,
      employmentType: employees.employmentType,
      workLocation: employees.workLocation,
      employeeGrade: employees.employeeGrade,
      hireDate: employees.hireDate,
      probationEndDate: employees.probationEndDate,
      confirmationDate: employees.confirmationDate,
      status: employees.status,
      shiftId: employees.shiftId,
      baseSalary: employees.baseSalary,
      hra: employees.hra,
      conveyanceAllowance: employees.conveyanceAllowance,
      medicalAllowance: employees.medicalAllowance,
      specialAllowance: employees.specialAllowance,
      dearnessAllowance: employees.dearnessAllowance,
      overtimeEligible: employees.overtimeEligible,
      overtimeCategory: employees.overtimeCategory,
      maxOvertimeHours: employees.maxOvertimeHours,
      overtimeRate: employees.overtimeRate,
      holidayOvertimeRate: employees.holidayOvertimeRate,
      nightShiftOvertimeRate: employees.nightShiftOvertimeRate,
      education: employees.education,
      skills: employees.skills,
      experience: employees.experience,
      languages: employees.languages,
      panNumber: employees.panNumber,
      aadharNumber: employees.aadharNumber,
      passportNumber: employees.passportNumber,
      pfAccountNumber: employees.pfAccountNumber,
      esiNumber: employees.esiNumber,
      uanNumber: employees.uanNumber,
      previousPfDetails: employees.previousPfDetails,
      bankDetails: employees.bankDetails,
      medicalFitnessCertificate: employees.medicalFitnessCertificate,
      safetyTrainingCompleted: employees.safetyTrainingCompleted,
      safetyEquipmentSizes: employees.safetyEquipmentSizes,
      specialLicenses: employees.specialLicenses,
      policeVerification: employees.policeVerification,
      fieldWorkEligible: employees.fieldWorkEligible,
      clientSiteAccess: employees.clientSiteAccess,
      travelAllowance: employees.travelAllowance,
      fieldAllowance: employees.fieldAllowance,
      createdAt: employees.createdAt,
      updatedAt: employees.updatedAt,
      department: departments
    })
    .from(employees)
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .where(eq(employees.id, id))
    .limit(1);

    return result[0] ? { ...result[0], department: result[0].department || undefined } : undefined;
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const result = await db.select().from(employees).where(eq(employees.email, email)).limit(1);
    return result[0];
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const result = await db.insert(employees).values(employee).returning();
    return result[0];
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const result = await db.update(employees).set(employee).where(eq(employees.id, id)).returning();
    return result[0];
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return (result as any).rowCount > 0;
  }

  // Shifts
  async getShifts(): Promise<Shift[]> {
    return await db.select().from(shifts).orderBy(shifts.name);
  }

  async getShift(id: string): Promise<Shift | undefined> {
    const result = await db.select().from(shifts).where(eq(shifts.id, id)).limit(1);
    return result[0];
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const result = await db.insert(shifts).values(shift).returning();
    return result[0];
  }

  async updateShift(id: string, shift: Partial<InsertShift>): Promise<Shift | undefined> {
    const result = await db.update(shifts).set(shift).where(eq(shifts.id, id)).returning();
    return result[0];
  }

  async deleteShift(id: string): Promise<boolean> {
    const result = await db.delete(shifts).where(eq(shifts.id, id));
    return (result as any).rowCount > 0;
  }

  // Attendance
  async getAttendance(filters?: { employeeId?: string; startDate?: Date; endDate?: Date }): Promise<Attendance[]> {
    let query = db.select().from(attendance);
    
    if (filters?.employeeId || filters?.startDate || filters?.endDate) {
      const conditions = [];
      if (filters.employeeId) conditions.push(eq(attendance.employeeId, filters.employeeId));
      if (filters.startDate) conditions.push(sql`${attendance.date} >= ${filters.startDate}`);
      if (filters.endDate) conditions.push(sql`${attendance.date} <= ${filters.endDate}`);
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(attendance.date));
  }

  async getAttendanceById(id: string): Promise<Attendance | undefined> {
    const result = await db.select().from(attendance).where(eq(attendance.id, id)).limit(1);
    return result[0];
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const result = await db.insert(attendance).values(attendanceData).returning();
    return result[0];
  }

  async updateAttendance(id: string, attendanceData: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const result = await db.update(attendance).set(attendanceData).where(eq(attendance.id, id)).returning();
    return result[0];
  }

  async deleteAttendance(id: string): Promise<boolean> {
    const result = await db.delete(attendance).where(eq(attendance.id, id));
    return (result as any).rowCount > 0;
  }

  // Leaves
  async getLeaves(filters?: { employeeId?: string; status?: string }): Promise<Leave[]> {
    let query = db.select().from(leaves);
    
    if (filters?.employeeId || filters?.status) {
      const conditions = [];
      if (filters.employeeId) conditions.push(eq(leaves.employeeId, filters.employeeId));
      if (filters.status) conditions.push(eq(leaves.status, filters.status));
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(leaves.createdAt));
  }

  async createLeave(leave: InsertLeave): Promise<Leave> {
    const result = await db.insert(leaves).values(leave).returning();
    return result[0];
  }

  async updateLeave(id: string, leave: Partial<InsertLeave>): Promise<Leave | undefined> {
    const result = await db.update(leaves).set(leave).where(eq(leaves.id, id)).returning();
    return result[0];
  }

  // Payroll
  async getPayroll(filters?: { employeeId?: string; month?: number; year?: number }): Promise<Payroll[]> {
    let query = db.select().from(payroll);
    
    if (filters?.employeeId || filters?.month || filters?.year) {
      const conditions = [];
      if (filters.employeeId) conditions.push(eq(payroll.employeeId, filters.employeeId));
      if (filters.month) conditions.push(eq(payroll.month, filters.month));
      if (filters.year) conditions.push(eq(payroll.year, filters.year));
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(payroll.year), desc(payroll.month));
  }

  async createPayroll(payrollData: InsertPayroll): Promise<Payroll> {
    const result = await db.insert(payroll).values(payrollData).returning();
    return result[0];
  }

  async updatePayroll(id: string, payrollData: Partial<InsertPayroll>): Promise<Payroll | undefined> {
    const result = await db.update(payroll).set(payrollData).where(eq(payroll.id, id)).returning();
    return result[0];
  }

  // Performance
  async getPerformance(filters?: { employeeId?: string; year?: number }): Promise<Performance[]> {
    let query = db.select().from(performance);
    
    if (filters?.employeeId || filters?.year) {
      const conditions = [];
      if (filters.employeeId) conditions.push(eq(performance.employeeId, filters.employeeId));
      if (filters.year) conditions.push(eq(performance.year, filters.year));
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(performance.year));
  }

  async createPerformance(performanceData: InsertPerformance): Promise<Performance> {
    const result = await db.insert(performance).values(performanceData).returning();
    return result[0];
  }

  async updatePerformance(id: string, performanceData: Partial<InsertPerformance>): Promise<Performance | undefined> {
    const result = await db.update(performance).set(performanceData).where(eq(performance.id, id)).returning();
    return result[0];
  }

  async deletePerformance(id: string): Promise<boolean> {
    const result = await db.delete(performance).where(eq(performance.id, id));
    return (result as any).rowCount > 0;
  }

  // Job Openings
  async getJobOpenings(): Promise<JobOpening[]> {
    return await db.select().from(jobOpenings).orderBy(desc(jobOpenings.createdAt));
  }

  async getJobOpening(id: string): Promise<JobOpening | undefined> {
    const result = await db.select().from(jobOpenings).where(eq(jobOpenings.id, id)).limit(1);
    return result[0];
  }

  async createJobOpening(jobOpening: InsertJobOpening): Promise<JobOpening> {
    const result = await db.insert(jobOpenings).values(jobOpening).returning();
    return result[0];
  }

  async updateJobOpening(id: string, jobOpening: Partial<InsertJobOpening>): Promise<JobOpening | undefined> {
    const result = await db.update(jobOpenings).set(jobOpening).where(eq(jobOpenings.id, id)).returning();
    return result[0];
  }

  async deleteJobOpening(id: string): Promise<boolean> {
    const result = await db.delete(jobOpenings).where(eq(jobOpenings.id, id));
    return (result as any).rowCount > 0;
  }

  // Job Applications
  async getJobApplications(jobId?: string): Promise<JobApplication[]> {
    let query = db.select().from(jobApplications);
    
    if (jobId) {
      query = query.where(eq(jobApplications.jobId, jobId));
    }
    
    return await query.orderBy(desc(jobApplications.appliedAt));
  }

  async getJobApplication(id: string): Promise<JobApplication | undefined> {
    const result = await db.select().from(jobApplications).where(eq(jobApplications.id, id)).limit(1);
    return result[0];
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const result = await db.insert(jobApplications).values(application).returning();
    return result[0];
  }

  async updateJobApplication(id: string, application: Partial<InsertJobApplication>): Promise<JobApplication | undefined> {
    const result = await db.update(jobApplications).set(application).where(eq(jobApplications.id, id)).returning();
    return result[0];
  }

  async deleteJobApplication(id: string): Promise<boolean> {
    const result = await db.delete(jobApplications).where(eq(jobApplications.id, id));
    return (result as any).rowCount > 0;
  }

  // Activities
  async getActivities(limit: number = 50): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt)).limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(activity).returning();
    return result[0];
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
    // Get total employees count
    const totalEmployeesResult = await db.select({ count: sql<number>`count(*)` }).from(employees);
    const totalEmployees = totalEmployeesResult[0]?.count || 0;

    // Get active today (employees who checked in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeTodayResult = await db.select({ count: sql<number>`count(distinct ${attendance.employeeId})` })
      .from(attendance)
      .where(sql`date >= ${today}`);
    const activeToday = activeTodayResult[0]?.count || 0;

    // Get pending leaves count
    const pendingLeavesResult = await db.select({ count: sql<number>`count(*)` })
      .from(leaves)
      .where(eq(leaves.status, 'pending'));
    const pendingLeaves = pendingLeavesResult[0]?.count || 0;

    // Get open positions count
    const openPositionsResult = await db.select({ count: sql<number>`count(*)` })
      .from(jobOpenings)
      .where(eq(jobOpenings.status, 'open'));
    const openPositions = openPositionsResult[0]?.count || 0;

    // Calculate attendance rate (simplified - present employees today / total employees)
    const attendanceRate = totalEmployees > 0 ? (activeToday / totalEmployees) * 100 : 0;

    // Get department distribution
    const departmentDistributionResult = await db.select({
      name: departments.name,
      count: sql<number>`count(${employees.id})`
    })
    .from(departments)
    .leftJoin(employees, eq(departments.id, employees.departmentId))
    .groupBy(departments.id, departments.name);

    const departmentDistribution = departmentDistributionResult.map(d => ({
      name: d.name,
      count: d.count || 0
    }));

    // Simplified attendance trend (last 7 days)
    const attendanceTrend: { date: string; rate: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayAttendanceResult = await db.select({ count: sql<number>`count(distinct ${attendance.employeeId})` })
        .from(attendance)
        .where(sql`date >= ${date} AND date < ${new Date(date.getTime() + 24 * 60 * 60 * 1000)}`);
      
      const dayActiveCount = dayAttendanceResult[0]?.count || 0;
      const dayRate = totalEmployees > 0 ? (dayActiveCount / totalEmployees) * 100 : 0;
      
      attendanceTrend.push({
        date: date.toISOString().split('T')[0],
        rate: dayRate
      });
    }

    return {
      totalEmployees,
      activeToday,
      pendingLeaves,
      openPositions,
      attendanceRate,
      departmentDistribution,
      attendanceTrend
    };
  }
}

// Export storage instance
export const storage = new DatabaseStorage();