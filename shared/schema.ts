import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("employee"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const departments = sqliteTable("departments", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  description: text("description"),
  managerId: text("manager_id"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const employees = sqliteTable("employees", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id"),
  employeeId: text("employee_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  personalEmail: text("personal_email"),
  phone: text("phone"),
  personalPhone: text("personal_phone"),
  dateOfBirth: integer("date_of_birth", { mode: 'timestamp' }),
  gender: text("gender"),
  maritalStatus: text("marital_status"),
  profileImage: text("profile_image"),

  // Address Information (JSON stored as TEXT)
  currentAddress: text("current_address"),
  permanentAddress: text("permanent_address"),

  // Emergency Contact (JSON stored as TEXT)
  emergencyContact: text("emergency_contact"),

  // Professional Information
  departmentId: text("department_id"),
  position: text("position").notNull(),
  managerId: text("manager_id"),
  employmentType: text("employment_type").notNull().default("permanent"),
  workLocation: text("work_location").notNull().default("office"),
  employeeGrade: text("employee_grade"),
  hireDate: integer("hire_date", { mode: 'timestamp' }).notNull(),
  probationEndDate: integer("probation_end_date", { mode: 'timestamp' }),
  confirmationDate: integer("confirmation_date", { mode: 'timestamp' }),
  status: text("status").notNull().default("active"),

  // Salary & Shift Information
  shiftId: text("shift_id"),
  baseSalary: real("base_salary"),
  hra: real("hra").default(0),
  conveyanceAllowance: real("conveyance_allowance").default(0),
  medicalAllowance: real("medical_allowance").default(0),
  specialAllowance: real("special_allowance").default(0),
  dearnessAllowance: real("dearness_allowance").default(0),

  // Overtime Configuration
  overtimeEligible: integer("overtime_eligible", { mode: 'boolean' }).default(false),
  overtimeCategory: text("overtime_category"),
  maxOvertimeHours: real("max_overtime_hours").default(0),
  overtimeRate: real("overtime_rate").default(1.5),
  holidayOvertimeRate: real("holiday_overtime_rate").default(2.0),
  nightShiftOvertimeRate: real("night_shift_overtime_rate").default(2.0),

  // Educational Information (JSON stored as TEXT)
  education: text("education"),
  skills: text("skills"),
  experience: text("experience"),
  languages: text("languages"),

  // Statutory Information
  panNumber: text("pan_number"),
  aadharNumber: text("aadhar_number"),
  passportNumber: text("passport_number"),
  pfAccountNumber: text("pf_account_number"),
  esiNumber: text("esi_number"),
  uanNumber: text("uan_number"),
  previousPfDetails: text("previous_pf_details"),

  // Banking Information (JSON stored as TEXT)
  bankDetails: text("bank_details"),

  // Safety & Compliance
  medicalFitnessCertificate: text("medical_fitness_certificate"),
  safetyTrainingCompleted: integer("safety_training_completed", { mode: 'boolean' }).default(false),
  safetyEquipmentSizes: text("safety_equipment_sizes"),
  specialLicenses: text("special_licenses"),
  policeVerification: text("police_verification_status"),

  // Field Work Configuration
  fieldWorkEligible: integer("field_work_eligible", { mode: 'boolean' }).default(false),
  clientSiteAccess: text("client_site_access"),
  travelAllowance: real("travel_allowance").default(0),
  fieldAllowance: real("field_allowance").default(0),

  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const shifts = sqliteTable("shifts", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  breakDuration: integer("break_duration").default(60),
  standardHours: real("standard_hours").default(8.0),
  graceTime: integer("grace_time").default(10),
  lateArrivalPenalty: real("late_arrival_penalty").default(0),
  earlyDeparturePenalty: real("early_departure_penalty").default(0),
  halfDayThreshold: real("half_day_threshold").default(4.0),
  isFlexible: integer("is_flexible", { mode: 'boolean' }).default(false),
  isRotating: integer("is_rotating", { mode: 'boolean' }).default(false),
  isNightShift: integer("is_night_shift", { mode: 'boolean' }).default(false),
  nightShiftAllowance: real("night_shift_allowance").default(0),
  overtimeThreshold: real("overtime_threshold").default(8.0),
  maxOvertimePerDay: real("max_overtime_per_day").default(4.0),
  weeklyOffPattern: text("weekly_off_pattern").default("saturday,sunday"),
  workingDaysPerWeek: integer("working_days_per_week").default(5),
  holidayWorkingRate: real("holiday_working_rate").default(2.0),
  departmentId: text("department_id"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
  shiftId: text("shift_id"),
  date: integer("date", { mode: 'timestamp' }).notNull(),

  // Time tracking
  checkIn: integer("check_in", { mode: 'timestamp' }),
  checkOut: integer("check_out", { mode: 'timestamp' }),
  breakStart: integer("break_start", { mode: 'timestamp' }),
  breakEnd: integer("break_end", { mode: 'timestamp' }),
  actualBreakDuration: integer("actual_break_duration"),

  // Biometric tracking
  gateEntry: integer("gate_entry", { mode: 'timestamp' }),
  gateExit: integer("gate_exit", { mode: 'timestamp' }),
  biometricDeviceIn: text("biometric_device_in"),
  biometricDeviceOut: text("biometric_device_out"),
  biometricId: text("biometric_id"),
  fingerprintVerified: integer("fingerprint_verified", { mode: 'boolean' }).default(false),
  faceRecognitionVerified: integer("face_recognition_verified", { mode: 'boolean' }).default(false),

  // Work location tracking
  workLocation: text("work_location").notNull().default("office"),
  isRemote: integer("is_remote", { mode: 'boolean' }).default(false),
  isFieldWork: integer("is_field_work", { mode: 'boolean' }).default(false),
  clientSite: text("client_site"),
  clientLocation: text("client_location"),
  remoteLocation: text("remote_location"),
  geoFenceStatus: text("geo_fence_status"),

  // Hours calculation
  regularHours: real("regular_hours").default(0),
  overtimeHours: real("overtime_hours").default(0),
  nightShiftHours: real("night_shift_hours").default(0),
  holidayHours: real("holiday_hours").default(0),
  fieldWorkHours: real("field_work_hours").default(0),
  hoursWorked: real("hours_worked"),

  // Overtime breakdown
  preShiftOvertime: real("pre_shift_overtime").default(0),
  postShiftOvertime: real("post_shift_overtime").default(0),
  weekendOvertime: real("weekend_overtime").default(0),
  holidayOvertime: real("holiday_overtime").default(0),

  // Status and approvals
  status: text("status").notNull().default("present"),
  lateArrival: integer("late_arrival", { mode: 'boolean' }).default(false),
  earlyDeparture: integer("early_departure", { mode: 'boolean' }).default(false),
  lateArrivalMinutes: integer("late_arrival_minutes").default(0),
  earlyDepartureMinutes: integer("early_departure_minutes").default(0),

  // Approval workflow
  overtimeApproved: integer("overtime_approved", { mode: 'boolean' }).default(false),
  overtimeApprovedBy: text("overtime_approved_by"),
  overtimeApprovedAt: integer("overtime_approved_at", { mode: 'timestamp' }),
  fieldWorkApproved: integer("field_work_approved", { mode: 'boolean' }).default(false),
  fieldWorkApprovedBy: text("field_work_approved_by"),

  // Travel and expenses
  travelDistance: real("travel_distance"),
  travelMode: text("travel_mode"),
  travelExpenses: real("travel_expenses").default(0),
  fieldExpenses: real("field_expenses").default(0),

  notes: text("notes"),
  adminNotes: text("admin_notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const leaves = sqliteTable("leaves", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
  type: text("type").notNull(),
  startDate: integer("start_date", { mode: 'timestamp' }).notNull(),
  endDate: integer("end_date", { mode: 'timestamp' }).notNull(),
  days: real("days").notNull(),
  isHalfDay: integer("is_half_day", { mode: 'boolean' }).default(false),
  halfDayType: text("half_day_type"),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  approvedBy: text("approved_by"),
  approvedAt: integer("approved_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const payroll = sqliteTable("payroll", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
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
  regularHours: real("regular_hours").default(0),
  overtimeHours: real("overtime_hours").default(0),
  nightShiftHours: real("night_shift_hours").default(0),
  holidayHours: real("holiday_hours").default(0),
  fieldWorkHours: real("field_work_hours").default(0),
  totalHours: real("total_hours").default(0),

  // Basic Salary Components
  baseSalary: real("base_salary").notNull(),
  hra: real("hra").default(0),
  conveyanceAllowance: real("conveyance_allowance").default(0),
  medicalAllowance: real("medical_allowance").default(0),
  specialAllowance: real("special_allowance").default(0),
  dearnessAllowance: real("dearness_allowance").default(0),

  // Variable Pay Components
  overtimePay: real("overtime_pay").default(0),
  nightShiftAllowance: real("night_shift_allowance").default(0),
  holidayWorkingPay: real("holiday_working_pay").default(0),
  fieldAllowance: real("field_allowance").default(0),
  travelAllowance: real("travel_allowance").default(0),
  performanceBonus: real("performance_bonus").default(0),
  incentives: real("incentives").default(0),

  // Deductions
  lossOfPayDeduction: real("loss_of_pay_deduction").default(0),
  lateArrivalPenalty: real("late_arrival_penalty").default(0),
  earlyDeparturePenalty: real("early_departure_penalty").default(0),
  halfDayDeduction: real("half_day_deduction").default(0),

  // Statutory Deductions
  pfDeduction: real("pf_deduction").default(0),
  pfEmployerContribution: real("pf_employer_contribution").default(0),
  esiDeduction: real("esi_deduction").default(0),
  esiEmployerContribution: real("esi_employer_contribution").default(0),
  professionalTax: real("professional_tax").default(0),
  incomeTax: real("income_tax").default(0),

  // Other Deductions
  loanDeduction: real("loan_deduction").default(0),
  advanceDeduction: real("advance_deduction").default(0),
  canteenCharges: real("canteen_charges").default(0),
  otherDeductions: real("other_deductions").default(0),

  // Calculations
  grossSalary: real("gross_salary").notNull(),
  totalDeductions: real("total_deductions").default(0),
  netSalary: real("net_salary").notNull(),

  // Rates
  hourlyRate: real("hourly_rate"),
  dailyRate: real("daily_rate"),
  overtimeRate: real("overtime_rate"),

  // Status and Processing
  calculationMethod: text("calculation_method").default("working_days"),
  status: text("status").notNull().default("pending"),
  calculatedAt: integer("calculated_at", { mode: 'timestamp' }),
  approvedBy: text("approved_by"),
  approvedAt: integer("approved_at", { mode: 'timestamp' }),
  processedAt: integer("processed_at", { mode: 'timestamp' }),
  payDate: integer("pay_date", { mode: 'timestamp' }),

  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const salarySlips = sqliteTable("salary_slips", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  payrollId: text("payroll_id").notNull(),
  employeeId: text("employee_id").notNull(),
  slipNumber: text("slip_number").notNull().unique(),
  payPeriod: text("pay_period").notNull(),
  generatedAt: integer("generated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const performance = sqliteTable("performance", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
  reviewerId: text("reviewer_id").notNull(),
  reviewPeriod: text("review_period").notNull(),
  overallRating: real("overall_rating"),
  goals: text("goals"),
  achievements: text("achievements"),
  feedback: text("feedback"),
  status: text("status").notNull().default("draft"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const jobOpenings = sqliteTable("job_openings", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  title: text("title").notNull(),
  department: text("department").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  salary: text("salary"),
  location: text("location").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const applications = sqliteTable("applications", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  jobId: text("job_id").notNull(),
  candidateName: text("candidate_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  resume: text("resume"),
  coverLetter: text("cover_letter"),
  status: text("status").notNull().default("pending"),
  submittedAt: integer("submitted_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertDepartmentSchema = createInsertSchema(departments);
export const insertEmployeeSchema = createInsertSchema(employees);
export const insertShiftSchema = createInsertSchema(shifts);
export const insertAttendanceSchema = createInsertSchema(attendance);
export const insertLeaveSchema = createInsertSchema(leaves);
export const insertPayrollSchema = createInsertSchema(payroll);
export const insertPerformanceSchema = createInsertSchema(performance);
export const insertJobOpeningSchema = createInsertSchema(jobOpenings);
export const insertApplicationSchema = createInsertSchema(applications);

// Types
export type User = typeof users.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Shift = typeof shifts.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Leave = typeof leaves.$inferSelect;
export type Payroll = typeof payroll.$inferSelect;
export type Performance = typeof performance.$inferSelect;
export type JobOpening = typeof jobOpenings.$inferSelect;
export type Application = typeof applications.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;
export type InsertJobOpening = z.infer<typeof insertJobOpeningSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;