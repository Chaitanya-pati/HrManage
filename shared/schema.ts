import { sql } from "drizzle-orm";
import { pgTable, text, integer, real, timestamp, boolean, uuid, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("employee"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  managerId: uuid("manager_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id"),
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

  // Address Information (JSON stored as TEXT)
  currentAddress: text("current_address"),
  permanentAddress: text("permanent_address"),

  // Emergency Contact (JSON stored as TEXT)
  emergencyContact: text("emergency_contact"),

  // Professional Information
  departmentId: uuid("department_id"),
  position: text("position").notNull(),
  managerId: uuid("manager_id"),
  employmentType: text("employment_type").notNull().default("permanent"),
  workLocation: text("work_location").notNull().default("office"),
  employeeGrade: text("employee_grade"),
  hireDate: timestamp("hire_date").notNull(),
  probationEndDate: timestamp("probation_end_date"),
  confirmationDate: timestamp("confirmation_date"),
  status: text("status").notNull().default("active"),

  // Salary & Shift Information
  shiftId: uuid("shift_id"),
  baseSalary: numeric("base_salary"),
  hra: numeric("hra").default("0"),
  conveyanceAllowance: numeric("conveyance_allowance").default("0"),
  medicalAllowance: numeric("medical_allowance").default("0"),
  specialAllowance: numeric("special_allowance").default("0"),
  dearnessAllowance: numeric("dearness_allowance").default("0"),

  // Overtime Configuration
  overtimeEligible: boolean("overtime_eligible").default(false),
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
  safetyTrainingCompleted: boolean("safety_training_completed").default(false),
  safetyEquipmentSizes: text("safety_equipment_sizes"),
  specialLicenses: text("special_licenses"),
  policeVerification: text("police_verification_status"),

  // Field Work Configuration
  fieldWorkEligible: boolean("field_work_eligible").default(false),
  clientSiteAccess: text("client_site_access"),
  travelAllowance: numeric("travel_allowance").default("0"),
  fieldAllowance: numeric("field_allowance").default("0"),

  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const shifts = pgTable("shifts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  breakDuration: integer("break_duration").default(60),
  standardHours: numeric("standard_hours").default("8.0"),
  graceTime: integer("grace_time").default(10),
  lateArrivalPenalty: numeric("late_arrival_penalty").default("0"),
  earlyDeparturePenalty: numeric("early_departure_penalty").default("0"),
  halfDayThreshold: numeric("half_day_threshold").default("4.0"),
  isFlexible: boolean("is_flexible").default(false),
  isRotating: boolean("is_rotating").default(false),
  isNightShift: boolean("is_night_shift").default(false),
  nightShiftAllowance: numeric("night_shift_allowance").default("0"),
  overtimeThreshold: numeric("overtime_threshold").default("8.0"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").notNull(),
  date: timestamp("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  hoursWorked: numeric("hours_worked").default("0"),
  overtimeHours: numeric("overtime_hours").default("0"),
  status: text("status").notNull().default("present"), // present, absent, late, half_day
  isManualEntry: boolean("is_manual_entry").default(false),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const leaves = pgTable("leaves", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").notNull(),
  leaveType: text("leave_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  days: numeric("days").notNull(),
  isHalfDay: boolean("is_half_day").default(false),
  halfDayType: text("half_day_type"), // morning, evening
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  appliedAt: timestamp("applied_at").default(sql`CURRENT_TIMESTAMP`),
  approvedAt: timestamp("approved_at"),
  approvedBy: uuid("approved_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: uuid("rejected_by"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Salary Components and TDS Tables
export const salaryComponents = pgTable("salary_components", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").notNull(),
  financialYear: text("financial_year").notNull(),
  
  // Basic Components
  basicSalary: numeric("basic_salary").notNull(),
  hra: numeric("hra").default("0"),
  conveyanceAllowance: numeric("conveyance_allowance").default("0"),
  medicalAllowance: numeric("medical_allowance").default("0"),
  specialAllowance: numeric("special_allowance").default("0"),
  dearnessAllowance: numeric("dearness_allowance").default("0"),
  
  // Variable Components
  performanceBonus: numeric("performance_bonus").default("0"),
  overtimePay: numeric("overtime_pay").default("0"),
  incentives: numeric("incentives").default("0"),
  commission: numeric("commission").default("0"),
  
  // Deductions
  pfDeduction: numeric("pf_deduction").default("0"),
  esiDeduction: numeric("esi_deduction").default("0"),
  professionalTax: numeric("professional_tax").default("0"),
  loanDeduction: numeric("loan_deduction").default("0"),
  advanceDeduction: numeric("advance_deduction").default("0"),
  otherDeductions: numeric("other_deductions").default("0"),
  
  // TDS Components
  tdsDeduction: numeric("tds_deduction").default("0"),
  exemptAmount: numeric("exempt_amount").default("0"),
  taxableIncome: numeric("taxable_income").default("0"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const tdsConfiguration = pgTable("tds_configuration", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  financialYear: text("financial_year").notNull().unique(),
  
  // Tax Slabs (JSON stored as TEXT)
  taxSlabs: text("tax_slabs").notNull(), // Array of {min, max, rate}
  
  // Standard Deduction
  standardDeduction: numeric("standard_deduction").default("50000"),
  
  // Section 80C Limit
  section80cLimit: numeric("section_80c_limit").default("150000"),
  
  // HRA Exemption Rules
  hraExemptionRules: text("hra_exemption_rules"), // JSON
  
  // Professional Tax Limits
  professionalTaxLimits: text("professional_tax_limits"), // JSON by state
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const payslips = pgTable("payslips", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").notNull(),
  payrollId: uuid("payroll_id"), // Links to existing payroll table
  
  // Pay Period
  payPeriod: text("pay_period").notNull(), // e.g., "2025-01"
  payDate: timestamp("pay_date").notNull(),
  
  // Salary Breakdown
  salaryComponents: text("salary_components").notNull(), // JSON with all components
  grossSalary: numeric("gross_salary").notNull(),
  totalDeductions: numeric("total_deductions").notNull(),
  netSalary: numeric("net_salary").notNull(),
  
  // Tax Information
  tdsDeducted: numeric("tds_deducted").default("0"),
  ytdGross: numeric("ytd_gross").default("0"),
  ytdTds: numeric("ytd_tds").default("0"),
  
  // Status and Processing
  status: text("status").notNull().default("draft"), // draft, processed, sent, paid
  generatedAt: timestamp("generated_at").default(sql`CURRENT_TIMESTAMP`),
  sentAt: timestamp("sent_at"),
  pdfPath: text("pdf_path"),
  
  // Email Information
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const employeeLoans = pgTable("employee_loans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").notNull(),
  loanType: text("loan_type").notNull(),
  loanAmount: numeric("loan_amount").notNull(),
  interestRate: numeric("interest_rate").default("0"),
  tenureMonths: integer("tenure_months").notNull(),
  emiAmount: numeric("emi_amount").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  remainingAmount: numeric("remaining_amount").notNull(),
  paidAmount: numeric("paid_amount").default("0"),
  status: text("status").notNull().default("active"),
  purpose: text("purpose"),
  guarantorEmployeeId: uuid("guarantor_employee_id"),
  documentPath: text("document_path"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const salaryAdvances = pgTable("salary_advances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").notNull(),
  advanceAmount: numeric("advance_amount").notNull(),
  reason: text("reason").notNull(),
  requestDate: timestamp("request_date").notNull(),
  approvedDate: timestamp("approved_date"),
  repaymentMonths: integer("repayment_months").notNull(),
  monthlyDeduction: numeric("monthly_deduction").notNull(),
  remainingAmount: numeric("remaining_amount").notNull(),
  paidAmount: numeric("paid_amount").default("0"),
  status: text("status").notNull().default("pending"),
  approvedBy: uuid("approved_by"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const complianceReports = pgTable("compliance_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  reportType: text("report_type").notNull(),
  reportPeriod: text("report_period").notNull(),
  financialYear: text("financial_year").notNull(),
  reportData: text("report_data").notNull(),
  employeeCount: integer("employee_count").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  fileName: text("file_name"),
  filePath: text("file_path"),
  fileFormat: text("file_format").default("excel"),
  status: text("status").notNull().default("generated"),
  generatedAt: timestamp("generated_at").default(sql`CURRENT_TIMESTAMP`),
  downloadedAt: timestamp("downloaded_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id"),
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  emailSent: boolean("email_sent").default(false),
  smsSent: boolean("sms_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  smsSentAt: timestamp("sms_sent_at"),
  metadata: text("metadata"),
  priority: text("priority").default("normal"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const performance = pgTable("performance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").notNull(),
  reviewPeriod: text("review_period").notNull(),
  reviewerId: uuid("reviewer_id").notNull(),
  goals: text("goals"),
  achievements: text("achievements"),
  overallRating: numeric("overall_rating"),
  feedback: text("feedback"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const jobOpenings = pgTable("job_openings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  departmentId: uuid("department_id").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  location: text("location").notNull(),
  employmentType: text("employment_type").notNull().default("permanent"),
  salaryRange: text("salary_range"),
  status: text("status").notNull().default("open"),
  postedBy: uuid("posted_by").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: uuid("job_id").notNull(),
  candidateName: text("candidate_name").notNull(),
  candidateEmail: text("candidate_email").notNull(),
  candidatePhone: text("candidate_phone"),
  resumePath: text("resume_path"),
  coverLetter: text("cover_letter"),
  status: text("status").notNull().default("submitted"),
  appliedAt: timestamp("applied_at").default(sql`CURRENT_TIMESTAMP`),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: uuid("reviewed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Employee-specific allowances and deductions
export const employeeAllowances = pgTable("employee_allowances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").notNull(),
  allowanceType: text("allowance_type").notNull(), // travel, mobile, food, transport, housing, education, medical, internet, uniform, vehicle
  amount: numeric("amount").notNull(),
  frequency: text("frequency").notNull().default("monthly"), // monthly, quarterly, yearly, one-time
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const employeeDeductions = pgTable("employee_deductions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").notNull(),
  deductionType: text("deduction_type").notNull(), // loan, advance, insurance, disciplinary, other
  amount: numeric("amount").notNull(),
  frequency: text("frequency").notNull().default("monthly"), // monthly, quarterly, yearly, one-time
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const employeeLeaveBalances = pgTable("employee_leave_balances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").notNull(),
  leaveType: text("leave_type").notNull(), // annual, sick, casual, maternity, paternity, compensatory
  totalDays: numeric("total_days").notNull(),
  usedDays: numeric("used_days").default("0"),
  remainingDays: numeric("remaining_days").notNull(),
  financialYear: text("financial_year").notNull(),
  carryForward: numeric("carry_forward").default("0"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertDepartmentSchema = createInsertSchema(departments);
export const insertEmployeeSchema = createInsertSchema(employees);
export const insertShiftSchema = createInsertSchema(shifts);
export const insertAttendanceSchema = createInsertSchema(attendance);
export const insertLeaveSchema = createInsertSchema(leaves);
export const insertSalaryComponentsSchema = createInsertSchema(salaryComponents);
export const insertPayslipSchema = createInsertSchema(payslips);
export const insertPerformanceSchema = createInsertSchema(performance);
export const insertJobOpeningSchema = createInsertSchema(jobOpenings);
export const insertApplicationSchema = createInsertSchema(applications);
export const insertEmployeeAllowanceSchema = createInsertSchema(employeeAllowances);
export const insertEmployeeDeductionSchema = createInsertSchema(employeeDeductions);
export const insertEmployeeLeaveBalanceSchema = createInsertSchema(employeeLeaveBalances);

// Types
export type User = typeof users.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Shift = typeof shifts.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Leave = typeof leaves.$inferSelect;
export type SalaryComponent = typeof salaryComponents.$inferSelect;
export type Payslip = typeof payslips.$inferSelect;
export type Performance = typeof performance.$inferSelect;
export type JobOpening = typeof jobOpenings.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type EmployeeAllowance = typeof employeeAllowances.$inferSelect;
export type EmployeeDeduction = typeof employeeDeductions.$inferSelect;
export type EmployeeLeaveBalance = typeof employeeLeaveBalances.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
export type InsertSalaryComponent = z.infer<typeof insertSalaryComponentsSchema>;
export type InsertPayslip = z.infer<typeof insertPayslipSchema>;
export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;
export type InsertJobOpening = z.infer<typeof insertJobOpeningSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type InsertEmployeeAllowance = z.infer<typeof insertEmployeeAllowanceSchema>;
export type InsertEmployeeDeduction = z.infer<typeof insertEmployeeDeductionSchema>;
export type InsertEmployeeLeaveBalance = z.infer<typeof insertEmployeeLeaveBalanceSchema>;