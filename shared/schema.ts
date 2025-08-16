import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, numeric } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("employee"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const departments = sqliteTable("departments", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  description: text("description"),
  managerId: text("manager_id"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const employees = sqliteTable("employees", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id"),
  employeeId: text("employee_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  personalEmail: text("personal_email"),
  phone: text("phone"),
  personalPhone: text("personal_phone"),
  dateOfBirth: text("date_of_birth"),
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
  hireDate: text("hire_date").notNull(),
  probationEndDate: text("probation_end_date"),
  confirmationDate: text("confirmation_date"),
  status: text("status").notNull().default("active"),

  // Salary & Shift Information
  shiftId: text("shift_id"),
  baseSalary: numeric("base_salary"),
  hra: numeric("hra").default("0"),
  conveyanceAllowance: numeric("conveyance_allowance").default("0"),
  medicalAllowance: numeric("medical_allowance").default("0"),
  specialAllowance: numeric("special_allowance").default("0"),
  dearnessAllowance: numeric("dearness_allowance").default("0"),

  // Overtime Configuration
  overtimeEligible: integer("overtime_eligible", { mode: 'boolean' }).default(false),
  overtimeCategory: text("overtime_category"),
  maxOvertimeHours: numeric("max_overtime_hours").default("0"),
  overtimeRate: numeric("overtime_rate").default("1.5"),
  holidayOvertimeRate: numeric("holiday_overtime_rate").default("2.0"),
  nightShiftOvertimeRate: numeric("night_shift_overtime_rate").default("2.0"),

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
  travelAllowance: numeric("travel_allowance").default("0"),
  fieldAllowance: numeric("field_allowance").default("0"),

  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const shifts = sqliteTable("shifts", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  breakDuration: integer("break_duration").default(60),
  standardHours: numeric("standard_hours").default("8.0"),
  graceTime: integer("grace_time").default(10),
  lateArrivalPenalty: numeric("late_arrival_penalty").default("0"),
  earlyDeparturePenalty: numeric("early_departure_penalty").default("0"),
  halfDayThreshold: numeric("half_day_threshold").default("4.0"),
  isFlexible: integer("is_flexible", { mode: 'boolean' }).default(false),
  isRotating: integer("is_rotating", { mode: 'boolean' }).default(false),
  isNightShift: integer("is_night_shift", { mode: 'boolean' }).default(false),
  nightShiftAllowance: numeric("night_shift_allowance").default("0"),
  overtimeThreshold: numeric("overtime_threshold").default("8.0"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  employeeId: text("employee_id").notNull(),
  date: text("date").notNull(),
  clockIn: text("clock_in"),
  clockOut: text("clock_out"),
  breakTime: integer("break_time").default(0),
  totalHours: numeric("total_hours").default("0"),
  overtimeHours: numeric("overtime_hours").default("0"),
  status: text("status").notNull().default("present"),
  isManualEntry: integer("is_manual_entry", { mode: 'boolean' }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const leaves = sqliteTable("leaves", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  employeeId: text("employee_id").notNull(),
  leaveType: text("leave_type").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  days: numeric("days").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  isHalfDay: integer("is_half_day", { mode: 'boolean' }).default(false),
  halfDaySlot: text("half_day_slot"),
  appliedDate: text("applied_date").default(sql`CURRENT_TIMESTAMP`),
  reviewedDate: text("reviewed_date"),
  reviewedBy: text("reviewed_by"),
  reviewComments: text("review_comments"),
  attachments: text("attachments"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const payroll = sqliteTable("payroll", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  employeeId: text("employee_id").notNull(),
  payPeriodStart: text("pay_period_start").notNull(),
  payPeriodEnd: text("pay_period_end").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  baseSalary: numeric("base_salary").notNull(),
  allowances: text("allowances"), // JSON string of allowance breakdown
  deductions: text("deductions"), // JSON string of deduction breakdown
  overtimePay: numeric("overtime_pay").default("0"),
  overtimeHours: numeric("overtime_hours").default("0"),
  grossPay: numeric("gross_pay").notNull(),
  taxDeductions: numeric("tax_deductions").default("0"),
  pfDeduction: numeric("pf_deduction").default("0"),
  esiDeduction: numeric("esi_deduction").default("0"),
  netPay: numeric("net_pay").notNull(),
  payrollStatus: text("payroll_status").notNull().default("draft"),
  processedAt: text("processed_at"),
  processedBy: text("processed_by"),
  paidAt: text("paid_at"),
  payslipGenerated: integer("payslip_generated", { mode: 'boolean' }).default(false),
  bankTransferStatus: text("bank_transfer_status").default("pending"),
  remarks: text("remarks"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});



// Notifications - for payroll notifications
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  employeeId: text("employee_id"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "payslip", "deduction", "bonus", "system"
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high"
  isRead: integer("is_read", { mode: 'boolean' }).default(false),
  readAt: text("read_at"),
  actionRequired: integer("action_required", { mode: 'boolean' }).default(false),
  actionUrl: text("action_url"),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const performance = sqliteTable("performance", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  employeeId: text("employee_id").notNull(),
  reviewPeriodStart: text("review_period_start").notNull(),
  reviewPeriodEnd: text("review_period_end").notNull(),
  overallRating: numeric("overall_rating"),
  goals: text("goals"),
  achievements: text("achievements"),
  areasForImprovement: text("areas_for_improvement"),
  reviewerComments: text("reviewer_comments"),
  employeeComments: text("employee_comments"),
  status: text("status").notNull().default("draft"),
  reviewerId: text("reviewer_id"),
  submittedAt: text("submitted_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const jobOpenings = sqliteTable("job_openings", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  title: text("title").notNull(),
  departmentId: text("department_id").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  salaryRange: text("salary_range"),
  location: text("location"),
  employmentType: text("employment_type").notNull().default("full-time"),
  experienceLevel: text("experience_level"),
  status: text("status").notNull().default("open"),
  openings: integer("openings").default(1),
  applicationDeadline: text("application_deadline"),
  postedDate: text("posted_date").default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const applications = sqliteTable("applications", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  jobOpeningId: text("job_opening_id").notNull(),
  applicantName: text("applicant_name").notNull(),
  applicantEmail: text("applicant_email").notNull(),
  applicantPhone: text("applicant_phone"),
  resume: text("resume"),
  coverLetter: text("cover_letter"),
  status: text("status").notNull().default("submitted"),
  appliedDate: text("applied_date").default(sql`CURRENT_TIMESTAMP`),
  interviewDate: text("interview_date"),
  interviewNotes: text("interview_notes"),
  reviewerId: text("reviewer_id"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const employeeAllowances = sqliteTable("employee_allowances", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  employeeId: text("employee_id").notNull(),
  allowanceType: text("allowance_type").notNull(),
  amount: numeric("amount").notNull(),
  frequency: text("frequency").notNull().default("monthly"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const employeeDeductions = sqliteTable("employee_deductions", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  employeeId: text("employee_id").notNull(),
  deductionType: text("deduction_type").notNull(),
  amount: numeric("amount").notNull(),
  frequency: text("frequency").notNull().default("monthly"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const employeeLeaveBalances = sqliteTable("employee_leave_balances", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  employeeId: text("employee_id").notNull(),
  leaveType: text("leave_type").notNull(),
  totalDays: numeric("total_days").notNull(),
  usedDays: numeric("used_days").default("0"),
  remainingDays: numeric("remaining_days").notNull(),
  year: integer("year").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Salary Components for advanced payroll
export const salaryComponents = sqliteTable("salary_components", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  employeeId: text("employee_id").notNull(),
  financialYear: text("financial_year").notNull(),
  basicSalary: numeric("basic_salary").notNull(),
  hra: numeric("hra").default("0"),
  conveyanceAllowance: numeric("conveyance_allowance").default("0"),
  medicalAllowance: numeric("medical_allowance").default("0"),
  specialAllowance: numeric("special_allowance").default("0"),
  dearnessAllowance: numeric("dearness_allowance").default("0"),
  otherAllowances: numeric("other_allowances").default("0"),
  pfContribution: numeric("pf_contribution").default("0"),
  esiContribution: numeric("esi_contribution").default("0"),
  professionalTax: numeric("professional_tax").default("0"),
  incomeTax: numeric("income_tax").default("0"),
  otherDeductions: numeric("other_deductions").default("0"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  effectiveFrom: text("effective_from").notNull(),
  effectiveTo: text("effective_to"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// TDS Configuration
export const tdsConfiguration = sqliteTable("tds_configuration", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  financialYear: text("financial_year").notNull(),
  slabFrom: numeric("slab_from").notNull(),
  slabTo: numeric("slab_to"),
  taxRate: numeric("tax_rate").notNull(),
  surcharge: numeric("surcharge").default("0"),
  cess: numeric("cess").default("0"),
  standardDeduction: numeric("standard_deduction").default("0"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Payslips
export const payslips = sqliteTable("payslips", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  employeeId: text("employee_id").notNull(),
  payPeriod: text("pay_period").notNull(),
  basicSalary: numeric("basic_salary").notNull(),
  hra: numeric("hra").default("0"),
  conveyanceAllowance: numeric("conveyance_allowance").default("0"),
  medicalAllowance: numeric("medical_allowance").default("0"),
  specialAllowance: numeric("special_allowance").default("0"),
  overtimePay: numeric("overtime_pay").default("0"),
  bonus: numeric("bonus").default("0"),
  grossPay: numeric("gross_pay").notNull(),
  pfDeduction: numeric("pf_deduction").default("0"),
  esiDeduction: numeric("esi_deduction").default("0"),
  tdsDeduction: numeric("tds_deduction").default("0"),
  professionalTax: numeric("professional_tax").default("0"),
  otherDeductions: numeric("other_deductions").default("0"),
  totalDeductions: numeric("total_deductions").notNull(),
  netPay: numeric("net_pay").notNull(),
  workingDays: integer("working_days").notNull(),
  presentDays: integer("present_days").notNull(),
  leaveDays: integer("leave_days").default(0),
  status: text("status").notNull().default("generated"),
  generatedAt: text("generated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Employee Loans
export const employeeLoans = sqliteTable("employee_loans", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  employeeId: text("employee_id").notNull(),
  loanType: text("loan_type").notNull(),
  loanAmount: numeric("loan_amount").notNull(),
  interestRate: numeric("interest_rate").default("0"),
  tenure: integer("tenure").notNull(), // in months
  emiAmount: numeric("emi_amount").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  outstandingAmount: numeric("outstanding_amount").notNull(),
  status: text("status").notNull().default("active"),
  remarks: text("remarks"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Salary Advances
export const salaryAdvances = sqliteTable("salary_advances", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  employeeId: text("employee_id").notNull(),
  advanceAmount: numeric("advance_amount").notNull(),
  deductionAmount: numeric("deduction_amount").notNull(),
  installments: integer("installments").notNull(),
  remainingInstallments: integer("remaining_installments").notNull(),
  requestDate: text("request_date").notNull(),
  approvalDate: text("approval_date"),
  status: text("status").notNull().default("pending"),
  reason: text("reason"),
  approvedBy: text("approved_by"),
  remarks: text("remarks"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Compliance Reports
export const complianceReports = sqliteTable("compliance_reports", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  reportType: text("report_type").notNull(), // "pf", "esi", "tds", "pt"
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  employeeCount: integer("employee_count").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  employerContribution: numeric("employer_contribution").default("0"),
  employeeContribution: numeric("employee_contribution").default("0"),
  challanNumber: text("challan_number"),
  paymentDate: text("payment_date"),
  status: text("status").notNull().default("pending"),
  remarks: text("remarks"),
  generatedBy: text("generated_by"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, createdAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShiftSchema = createInsertSchema(shifts).omit({ id: true, createdAt: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, createdAt: true });
export const insertLeaveSchema = createInsertSchema(leaves).omit({ id: true, createdAt: true, updatedAt: true, appliedDate: true });
export const insertPayrollSchema = createInsertSchema(payroll).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPerformanceSchema = createInsertSchema(performance).omit({ id: true, createdAt: true, updatedAt: true });
export const insertJobOpeningSchema = createInsertSchema(jobOpenings).omit({ id: true, createdAt: true, updatedAt: true, postedDate: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true, updatedAt: true, appliedDate: true });
export const insertEmployeeAllowanceSchema = createInsertSchema(employeeAllowances).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmployeeDeductionSchema = createInsertSchema(employeeDeductions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmployeeLeaveBalanceSchema = createInsertSchema(employeeLeaveBalances).omit({ id: true, createdAt: true, updatedAt: true });

// Advanced Payroll schemas
export const insertSalaryComponentsSchema = createInsertSchema(salaryComponents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTdsConfigurationSchema = createInsertSchema(tdsConfiguration).omit({ id: true, createdAt: true });
export const insertPayslipsSchema = createInsertSchema(payslips).omit({ id: true, generatedAt: true });
export const insertEmployeeLoansSchema = createInsertSchema(employeeLoans).omit({ id: true, createdAt: true });
export const insertSalaryAdvancesSchema = createInsertSchema(salaryAdvances).omit({ id: true, createdAt: true });
export const insertComplianceReportsSchema = createInsertSchema(complianceReports).omit({ id: true, createdAt: true });
export const insertNotificationsSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

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
export type JobOpening = typeof jobOpenings.$inferSelect;
export type InsertJobOpening = z.infer<typeof insertJobOpeningSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type EmployeeAllowance = typeof employeeAllowances.$inferSelect;
export type InsertEmployeeAllowance = z.infer<typeof insertEmployeeAllowanceSchema>;
export type EmployeeDeduction = typeof employeeDeductions.$inferSelect;
export type InsertEmployeeDeduction = z.infer<typeof insertEmployeeDeductionSchema>;
export type EmployeeLeaveBalance = typeof employeeLeaveBalances.$inferSelect;
export type InsertEmployeeLeaveBalance = z.infer<typeof insertEmployeeLeaveBalanceSchema>;

// Advanced Payroll types
export type SalaryComponent = typeof salaryComponents.$inferSelect;
export type InsertSalaryComponent = z.infer<typeof insertSalaryComponentsSchema>;
export type TdsConfiguration = typeof tdsConfiguration.$inferSelect;
export type InsertTdsConfiguration = z.infer<typeof insertTdsConfigurationSchema>;
export type Payslip = typeof payslips.$inferSelect;
export type InsertPayslip = z.infer<typeof insertPayslipsSchema>;
export type EmployeeLoan = typeof employeeLoans.$inferSelect;
export type InsertEmployeeLoan = z.infer<typeof insertEmployeeLoansSchema>;
export type SalaryAdvance = typeof salaryAdvances.$inferSelect;
export type InsertSalaryAdvance = z.infer<typeof insertSalaryAdvancesSchema>;
export type ComplianceReport = typeof complianceReports.$inferSelect;
export type InsertComplianceReport = z.infer<typeof insertComplianceReportsSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationsSchema>;