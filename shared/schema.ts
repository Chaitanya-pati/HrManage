import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("employee"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  managerId: varchar("manager_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  employeeId: text("employee_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  personalEmail: text("personal_email"),
  phone: text("phone"),
  personalPhone: text("personal_phone"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  maritalStatus: text("marital_status"),
  profileImage: text("profile_image"),
  
  // Address Information
  currentAddress: jsonb("current_address"),
  permanentAddress: jsonb("permanent_address"),
  
  // Emergency Contact
  emergencyContact: jsonb("emergency_contact"),
  
  // Professional Information
  departmentId: varchar("department_id"),
  position: text("position").notNull(),
  managerId: varchar("manager_id"),
  employmentType: text("employment_type").notNull().default("permanent"), // permanent, contract, temporary, intern
  workLocation: text("work_location").notNull().default("office"), // office, field, client_site, remote, hybrid
  employeeGrade: text("employee_grade"),
  hireDate: timestamp("hire_date").notNull(),
  probationEndDate: timestamp("probation_end_date"),
  confirmationDate: timestamp("confirmation_date"),
  status: text("status").notNull().default("active"),
  
  // Salary & Shift Information
  shiftId: varchar("shift_id").references(() => shifts.id),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }),
  hra: decimal("hra", { precision: 10, scale: 2 }).default("0"),
  conveyanceAllowance: decimal("conveyance_allowance", { precision: 10, scale: 2 }).default("0"),
  medicalAllowance: decimal("medical_allowance", { precision: 10, scale: 2 }).default("0"),
  specialAllowance: decimal("special_allowance", { precision: 10, scale: 2 }).default("0"),
  dearnessAllowance: decimal("dearness_allowance", { precision: 10, scale: 2 }).default("0"),
  
  // Overtime Configuration
  overtimeEligible: boolean("overtime_eligible").default(false),
  overtimeCategory: text("overtime_category"), // workmen, staff, management
  maxOvertimeHours: decimal("max_overtime_hours", { precision: 4, scale: 2 }).default("0"),
  overtimeRate: decimal("overtime_rate", { precision: 4, scale: 2 }).default("1.5"), // multiplier
  holidayOvertimeRate: decimal("holiday_overtime_rate", { precision: 4, scale: 2 }).default("2.0"),
  nightShiftOvertimeRate: decimal("night_shift_overtime_rate", { precision: 4, scale: 2 }).default("2.0"),
  
  // Educational Information
  education: jsonb("education"), // Array of educational qualifications
  skills: jsonb("skills"), // Array of skills and certifications
  experience: jsonb("experience"), // Previous work experience
  languages: jsonb("languages"), // Languages known
  
  // Statutory Information
  panNumber: text("pan_number"),
  aadharNumber: text("aadhar_number"),
  passportNumber: text("passport_number"),
  pfAccountNumber: text("pf_account_number"),
  esiNumber: text("esi_number"),
  uanNumber: text("uan_number"),
  previousPfDetails: jsonb("previous_pf_details"),
  
  // Banking Information
  bankDetails: jsonb("bank_details"),
  
  // Safety & Compliance (for field/industrial work)
  medicalFitnessCertificate: text("medical_fitness_certificate"),
  safetyTrainingCompleted: boolean("safety_training_completed").default(false),
  safetyEquipmentSizes: jsonb("safety_equipment_sizes"),
  specialLicenses: jsonb("special_licenses"),
  policeVerification: text("police_verification_status"),
  
  // Field Work Configuration
  fieldWorkEligible: boolean("field_work_eligible").default(false),
  clientSiteAccess: jsonb("client_site_access"), // Array of allowed client sites
  travelAllowance: decimal("travel_allowance", { precision: 10, scale: 2 }).default("0"),
  fieldAllowance: decimal("field_allowance", { precision: 10, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shifts = pgTable("shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  startTime: text("start_time").notNull(), // Format: "09:00"
  endTime: text("end_time").notNull(), // Format: "17:00"
  breakDuration: integer("break_duration").default(60), // minutes
  standardHours: decimal("standard_hours", { precision: 4, scale: 2 }).default("8.0"),
  graceTime: integer("grace_time").default(10), // minutes
  lateArrivalPenalty: decimal("late_arrival_penalty", { precision: 10, scale: 2 }).default("0"),
  earlyDeparturePenalty: decimal("early_departure_penalty", { precision: 10, scale: 2 }).default("0"),
  halfDayThreshold: decimal("half_day_threshold", { precision: 4, scale: 2 }).default("4.0"), // hours
  isFlexible: boolean("is_flexible").default(false),
  isRotating: boolean("is_rotating").default(false),
  isNightShift: boolean("is_night_shift").default(false),
  nightShiftAllowance: decimal("night_shift_allowance", { precision: 10, scale: 2 }).default("0"),
  overtimeThreshold: decimal("overtime_threshold", { precision: 4, scale: 2 }).default("8.0"), // hours
  maxOvertimePerDay: decimal("max_overtime_per_day", { precision: 4, scale: 2 }).default("4.0"),
  weeklyOffPattern: text("weekly_off_pattern").default("saturday,sunday"), // comma separated days
  workingDaysPerWeek: integer("working_days_per_week").default(5),
  holidayWorkingRate: decimal("holiday_working_rate", { precision: 4, scale: 2 }).default("2.0"),
  departmentId: varchar("department_id").references(() => departments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  shiftId: varchar("shift_id").references(() => shifts.id),
  date: timestamp("date").notNull(),
  
  // Time tracking with biometric integration
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  breakStart: timestamp("break_start"),
  breakEnd: timestamp("break_end"),
  actualBreakDuration: integer("actual_break_duration"), // minutes
  
  // Biometric tracking
  gateEntry: timestamp("gate_entry"), // Biometric gate entry time
  gateExit: timestamp("gate_exit"), // Biometric gate exit time
  biometricDeviceIn: text("biometric_device_in"), // Entry device ID
  biometricDeviceOut: text("biometric_device_out"), // Exit device ID
  biometricId: text("biometric_id"), // Employee biometric template ID
  fingerprintVerified: boolean("fingerprint_verified").default(false),
  faceRecognitionVerified: boolean("face_recognition_verified").default(false),
  
  // Work location tracking
  workLocation: text("work_location").notNull().default("office"), // office, field, client_site, remote, home
  isRemote: boolean("is_remote").default(false),
  isFieldWork: boolean("is_field_work").default(false),
  clientSite: text("client_site"), // Client site name/code
  clientLocation: jsonb("client_location"), // Client site address and GPS
  remoteLocation: jsonb("remote_location"), // GPS coordinates for remote/field work
  geoFenceStatus: text("geo_fence_status"), // inside, outside, unknown
  
  // Hours calculation
  regularHours: decimal("regular_hours", { precision: 4, scale: 2 }).default("0"),
  overtimeHours: decimal("overtime_hours", { precision: 4, scale: 2 }).default("0"),
  nightShiftHours: decimal("night_shift_hours", { precision: 4, scale: 2 }).default("0"),
  holidayHours: decimal("holiday_hours", { precision: 4, scale: 2 }).default("0"),
  fieldWorkHours: decimal("field_work_hours", { precision: 4, scale: 2 }).default("0"),
  hoursWorked: decimal("hours_worked", { precision: 4, scale: 2 }),
  
  // Overtime breakdown
  preShiftOvertime: decimal("pre_shift_overtime", { precision: 4, scale: 2 }).default("0"),
  postShiftOvertime: decimal("post_shift_overtime", { precision: 4, scale: 2 }).default("0"),
  weekendOvertime: decimal("weekend_overtime", { precision: 4, scale: 2 }).default("0"),
  holidayOvertime: decimal("holiday_overtime", { precision: 4, scale: 2 }).default("0"),
  
  // Status and approvals
  status: text("status").notNull().default("present"), // present, absent, late, early_leave, half_day
  lateArrival: boolean("late_arrival").default(false),
  earlyDeparture: boolean("early_departure").default(false),
  lateArrivalMinutes: integer("late_arrival_minutes").default(0),
  earlyDepartureMinutes: integer("early_departure_minutes").default(0),
  
  // Approval workflow for field work and overtime
  overtimeApproved: boolean("overtime_approved").default(false),
  overtimeApprovedBy: varchar("overtime_approved_by").references(() => employees.id),
  overtimeApprovedAt: timestamp("overtime_approved_at"),
  fieldWorkApproved: boolean("field_work_approved").default(false),
  fieldWorkApprovedBy: varchar("field_work_approved_by").references(() => employees.id),
  
  // Travel and expenses for field work
  travelDistance: decimal("travel_distance", { precision: 8, scale: 2 }), // kilometers
  travelMode: text("travel_mode"), // car, train, bus, flight
  travelExpenses: decimal("travel_expenses", { precision: 10, scale: 2 }).default("0"),
  fieldExpenses: decimal("field_expenses", { precision: 10, scale: 2 }).default("0"),
  
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leaves = pgTable("leaves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  type: text("type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  approvedBy: varchar("approved_by").references(() => employees.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payroll = pgTable("payroll", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  
  // Attendance Summary
  totalWorkingDays: integer("total_working_days").notNull(),
  daysPresent: integer("days_present").default(0),
  daysAbsent: integer("days_absent").default(0),
  halfDays: integer("half_days").default(0),
  lateArrivals: integer("late_arrivals").default(0),
  earlyDepartures: integer("early_departures").default(0),
  
  // Hours Summary
  regularHours: decimal("regular_hours", { precision: 5, scale: 2 }).default("0"),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }).default("0"),
  nightShiftHours: decimal("night_shift_hours", { precision: 5, scale: 2 }).default("0"),
  holidayHours: decimal("holiday_hours", { precision: 5, scale: 2 }).default("0"),
  fieldWorkHours: decimal("field_work_hours", { precision: 5, scale: 2 }).default("0"),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }).default("0"),
  
  // Basic Salary Components
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  hra: decimal("hra", { precision: 10, scale: 2 }).default("0"),
  conveyanceAllowance: decimal("conveyance_allowance", { precision: 10, scale: 2 }).default("0"),
  medicalAllowance: decimal("medical_allowance", { precision: 10, scale: 2 }).default("0"),
  specialAllowance: decimal("special_allowance", { precision: 10, scale: 2 }).default("0"),
  dearnessAllowance: decimal("dearness_allowance", { precision: 10, scale: 2 }).default("0"),
  
  // Variable Pay Components
  overtimePay: decimal("overtime_pay", { precision: 10, scale: 2 }).default("0"),
  nightShiftAllowance: decimal("night_shift_allowance", { precision: 10, scale: 2 }).default("0"),
  holidayWorkingPay: decimal("holiday_working_pay", { precision: 10, scale: 2 }).default("0"),
  fieldAllowance: decimal("field_allowance", { precision: 10, scale: 2 }).default("0"),
  travelAllowance: decimal("travel_allowance", { precision: 10, scale: 2 }).default("0"),
  performanceBonus: decimal("performance_bonus", { precision: 10, scale: 2 }).default("0"),
  incentives: decimal("incentives", { precision: 10, scale: 2 }).default("0"),
  
  // Attendance-based Deductions
  lossOfPayDeduction: decimal("loss_of_pay_deduction", { precision: 10, scale: 2 }).default("0"),
  lateArrivalPenalty: decimal("late_arrival_penalty", { precision: 10, scale: 2 }).default("0"),
  earlyDeparturePenalty: decimal("early_departure_penalty", { precision: 10, scale: 2 }).default("0"),
  halfDayDeduction: decimal("half_day_deduction", { precision: 10, scale: 2 }).default("0"),
  
  // Statutory Deductions
  pfDeduction: decimal("pf_deduction", { precision: 10, scale: 2 }).default("0"),
  pfEmployerContribution: decimal("pf_employer_contribution", { precision: 10, scale: 2 }).default("0"),
  esiDeduction: decimal("esi_deduction", { precision: 10, scale: 2 }).default("0"),
  esiEmployerContribution: decimal("esi_employer_contribution", { precision: 10, scale: 2 }).default("0"),
  professionalTax: decimal("professional_tax", { precision: 10, scale: 2 }).default("0"),
  incomeTax: decimal("income_tax", { precision: 10, scale: 2 }).default("0"),
  
  // Other Deductions
  loanDeduction: decimal("loan_deduction", { precision: 10, scale: 2 }).default("0"),
  advanceDeduction: decimal("advance_deduction", { precision: 10, scale: 2 }).default("0"),
  canteenCharges: decimal("canteen_charges", { precision: 10, scale: 2 }).default("0"),
  otherDeductions: decimal("other_deductions", { precision: 10, scale: 2 }).default("0"),
  
  // Calculations
  grossSalary: decimal("gross_salary", { precision: 10, scale: 2 }).notNull(),
  totalDeductions: decimal("total_deductions", { precision: 10, scale: 2 }).default("0"),
  netSalary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  
  // Rates
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }),
  overtimeRate: decimal("overtime_rate", { precision: 10, scale: 2 }),
  
  // Status and Processing
  calculationMethod: text("calculation_method").default("working_days"), // working_days, calendar_days
  status: text("status").notNull().default("pending"), // pending, calculated, approved, processed, paid
  calculatedAt: timestamp("calculated_at"),
  approvedBy: varchar("approved_by").references(() => employees.id),
  approvedAt: timestamp("approved_at"),
  processedAt: timestamp("processed_at"),
  payDate: timestamp("pay_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const salarySlips = pgTable("salary_slips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  payrollId: varchar("payroll_id").references(() => payroll.id).notNull(),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  slipNumber: text("slip_number").notNull().unique(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
  downloadedAt: timestamp("downloaded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobOpenings = pgTable("job_openings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // full_time, part_time, contract, internship
  status: text("status").notNull().default("active"), // active, paused, closed
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  salaryMin: decimal("salary_min", { precision: 10, scale: 2 }),
  salaryMax: decimal("salary_max", { precision: 10, scale: 2 }),
  experience: text("experience"),
  skills: text("skills"),
  postedBy: varchar("posted_by").references(() => employees.id),
  applicantCount: integer("applicant_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobOpenings.id).notNull(),
  candidateName: text("candidate_name").notNull(),
  candidateEmail: text("candidate_email").notNull(),
  candidatePhone: text("candidate_phone"),
  resumeUrl: text("resume_url"),
  coverLetter: text("cover_letter"),
  status: text("status").notNull().default("pending"), // pending, shortlisted, interview, hired, rejected
  appliedAt: timestamp("applied_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => employees.id),
  notes: text("notes"),
});

export const performance = pgTable("performance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  reviewerId: varchar("reviewer_id").references(() => employees.id).notNull(),
  period: text("period").notNull(),
  year: integer("year").notNull(),
  goals: jsonb("goals"),
  achievements: jsonb("achievements"),
  rating: integer("rating"),
  feedback: text("feedback"),
  status: text("status").notNull().default("pending"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clientSites = pgTable("client_sites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  clientName: text("client_name").notNull(),
  siteCode: text("site_code").notNull().unique(),
  address: jsonb("address").notNull(),
  contactPerson: text("contact_person"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  geoFence: jsonb("geo_fence"), // GPS coordinates for location validation
  allowedRadius: decimal("allowed_radius", { precision: 8, scale: 2 }).default("100"), // meters
  shiftTimings: jsonb("shift_timings"), // Different from office shifts
  specialInstructions: text("special_instructions"),
  safetyRequirements: jsonb("safety_requirements"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const biometricDevices = pgTable("biometric_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: text("device_id").notNull().unique(),
  deviceName: text("device_name").notNull(),
  deviceType: text("device_type").notNull(), // fingerprint, face_recognition, iris, card_reader
  location: text("location").notNull(), // main_gate, office_floor, client_site
  ipAddress: text("ip_address"),
  macAddress: text("mac_address"),
  firmwareVersion: text("firmware_version"),
  lastSyncTime: timestamp("last_sync_time"),
  isActive: boolean("is_active").default(true),
  gpsLocation: jsonb("gps_location"),
  clientSiteId: varchar("client_site_id").references(() => clientSites.id),
  departmentId: varchar("department_id").references(() => departments.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const overtimeRequests = pgTable("overtime_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").references(() => employees.id).notNull(),
  attendanceId: varchar("attendance_id").references(() => attendance.id),
  requestedDate: timestamp("requested_date").notNull(),
  estimatedHours: decimal("estimated_hours", { precision: 4, scale: 2 }).notNull(),
  actualHours: decimal("actual_hours", { precision: 4, scale: 2 }),
  overtimeType: text("overtime_type").notNull(), // regular, weekend, holiday, emergency
  reason: text("reason").notNull(),
  taskDescription: text("task_description"),
  projectCode: text("project_code"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, completed
  requestedBy: varchar("requested_by").references(() => employees.id).notNull(),
  approvedBy: varchar("approved_by").references(() => employees.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  entityType: text("entity_type"),
  entityId: varchar("entity_id"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  departmentId: z.string().nullable().optional(),
  hireDate: z.union([z.date(), z.string()]).transform((val) => new Date(val)),
  salary: z.string().transform((val) => val || "0"),
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.union([z.date(), z.string()]).transform((val) => new Date(val)),
  checkIn: z.union([z.date(), z.string()]).transform((val) => val ? new Date(val) : null).nullable().optional(),
  checkOut: z.union([z.date(), z.string()]).transform((val) => val ? new Date(val) : null).nullable().optional(),
});

export const insertSalarySlipSchema = createInsertSchema(salarySlips).omit({
  id: true,
  createdAt: true,
  generatedAt: true,
});

export const insertLeaveSchema = createInsertSchema(leaves).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertPerformanceSchema = createInsertSchema(performance).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertJobOpeningSchema = createInsertSchema(jobOpenings).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  applicantCount: true 
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({ 
  id: true, 
  appliedAt: true, 
  reviewedAt: true 
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;

export type Payroll = typeof payroll.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;

export type Performance = typeof performance.$inferSelect;
export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type SalarySlip = typeof salarySlips.$inferSelect;
export type InsertSalarySlip = z.infer<typeof insertSalarySlipSchema>;

export type JobOpening = typeof jobOpenings.$inferSelect;
export type InsertJobOpening = z.infer<typeof insertJobOpeningSchema>;

export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;

// Extended types for joins
export type EmployeeWithDepartment = Employee & {
  department?: Department;
  manager?: Employee;
};

export type AttendanceWithEmployee = Attendance & {
  employee: Employee;
  shift?: Shift;
};

export type LeaveWithEmployee = Leave & {
  employee: Employee;
  approver?: Employee;
};

export type PayrollWithEmployee = Payroll & {
  employee: Employee;
};

export type JobOpeningWithApplications = JobOpening & {
  applications?: JobApplication[];
};

export type JobApplicationWithJob = JobApplication & {
  jobOpening: JobOpening;
};
