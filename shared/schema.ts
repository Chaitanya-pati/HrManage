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
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Salary Components and TDS Tables
export const salaryComponents = sqliteTable("salary_components", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
  financialYear: text("financial_year").notNull(),
  
  // Basic Components
  basicSalary: real("basic_salary").notNull(),
  hra: real("hra").default(0),
  conveyanceAllowance: real("conveyance_allowance").default(0),
  medicalAllowance: real("medical_allowance").default(0),
  specialAllowance: real("special_allowance").default(0),
  dearnessAllowance: real("dearness_allowance").default(0),
  
  // Variable Components
  performanceBonus: real("performance_bonus").default(0),
  overtimePay: real("overtime_pay").default(0),
  incentives: real("incentives").default(0),
  commission: real("commission").default(0),
  
  // Deductions
  pfDeduction: real("pf_deduction").default(0),
  esiDeduction: real("esi_deduction").default(0),
  professionalTax: real("professional_tax").default(0),
  loanDeduction: real("loan_deduction").default(0),
  advanceDeduction: real("advance_deduction").default(0),
  otherDeductions: real("other_deductions").default(0),
  
  // TDS Components
  tdsDeduction: real("tds_deduction").default(0),
  exemptAmount: real("exempt_amount").default(0),
  taxableIncome: real("taxable_income").default(0),
  
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const tdsConfiguration = sqliteTable("tds_configuration", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  financialYear: text("financial_year").notNull().unique(),
  
  // Tax Slabs (JSON stored as TEXT)
  taxSlabs: text("tax_slabs").notNull(), // Array of {min, max, rate}
  
  // Standard Deduction
  standardDeduction: real("standard_deduction").default(50000),
  
  // Section 80C Limit
  section80cLimit: real("section_80c_limit").default(150000),
  
  // HRA Exemption Rules
  hraExemptionRules: text("hra_exemption_rules"), // JSON
  
  // Professional Tax Limits
  professionalTaxLimits: text("professional_tax_limits"), // JSON by state
  
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const payslips = sqliteTable("payslips", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
  payrollId: text("payroll_id"), // Links to existing payroll table
  
  // Pay Period
  payPeriod: text("pay_period").notNull(), // e.g., "2025-01"
  payDate: integer("pay_date", { mode: 'timestamp' }).notNull(),
  
  // Salary Breakdown
  salaryComponents: text("salary_components").notNull(), // JSON with all components
  grossSalary: real("gross_salary").notNull(),
  totalDeductions: real("total_deductions").notNull(),
  netSalary: real("net_salary").notNull(),
  
  // Tax Information
  tdsDeducted: real("tds_deducted").default(0),
  ytdGross: real("ytd_gross").default(0),
  ytdTds: real("ytd_tds").default(0),
  
  // Status and Processing
  status: text("status").notNull().default("draft"), // draft, processed, sent, paid
  generatedAt: integer("generated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  sentAt: integer("sent_at", { mode: 'timestamp' }),
  pdfPath: text("pdf_path"),
  
  // Email Information
  emailSent: integer("email_sent", { mode: 'boolean' }).default(false),
  emailSentAt: integer("email_sent_at", { mode: 'timestamp' }),
  
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const employeeLoans = sqliteTable("employee_loans", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
  
  // Loan Details
  loanType: text("loan_type").notNull(), // personal, home, vehicle, emergency
  loanAmount: real("loan_amount").notNull(),
  interestRate: real("interest_rate").default(0),
  tenureMonths: integer("tenure_months").notNull(),
  
  // EMI Details
  emiAmount: real("emi_amount").notNull(),
  startDate: integer("start_date", { mode: 'timestamp' }).notNull(),
  endDate: integer("end_date", { mode: 'timestamp' }).notNull(),
  
  // Current Status
  remainingAmount: real("remaining_amount").notNull(),
  paidAmount: real("paid_amount").default(0),
  status: text("status").notNull().default("active"), // active, completed, defaulted
  
  // Additional Information
  purpose: text("purpose"),
  guarantorEmployeeId: text("guarantor_employee_id"),
  documentPath: text("document_path"),
  
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const salaryAdvances = sqliteTable("salary_advances", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
  
  // Advance Details
  advanceAmount: real("advance_amount").notNull(),
  reason: text("reason").notNull(),
  requestDate: integer("request_date", { mode: 'timestamp' }).notNull(),
  approvedDate: integer("approved_date", { mode: 'timestamp' }),
  
  // Repayment Details
  repaymentMonths: integer("repayment_months").notNull(),
  monthlyDeduction: real("monthly_deduction").notNull(),
  remainingAmount: real("remaining_amount").notNull(),
  paidAmount: real("paid_amount").default(0),
  
  // Status
  status: text("status").notNull().default("pending"), // pending, approved, rejected, active, completed
  approvedBy: text("approved_by"),
  
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const complianceReports = sqliteTable("compliance_reports", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  
  // Report Details
  reportType: text("report_type").notNull(), // pf, esi, professional_tax, tds
  reportPeriod: text("report_period").notNull(), // YYYY-MM or YYYY
  financialYear: text("financial_year").notNull(),
  
  // Generated Data
  reportData: text("report_data").notNull(), // JSON with all report details
  employeeCount: integer("employee_count").notNull(),
  totalAmount: real("total_amount").notNull(),
  
  // File Information
  fileName: text("file_name"),
  filePath: text("file_path"),
  fileFormat: text("file_format").default("excel"), // excel, csv, pdf
  
  // Status and Processing
  status: text("status").notNull().default("generated"), // generated, downloaded, filed
  generatedAt: integer("generated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  downloadedAt: integer("downloaded_at", { mode: 'timestamp' }),
  
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  
  // Recipient Information
  employeeId: text("employee_id"),
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  
  // Notification Details
  type: text("type").notNull(), // salary_credit, tds_update, leave_approval, payslip_ready
  title: text("title").notNull(),
  message: text("message").notNull(),
  
  // Channel Information
  emailSent: integer("email_sent", { mode: 'boolean' }).default(false),
  smsSent: integer("sms_sent", { mode: 'boolean' }).default(false),
  emailSentAt: integer("email_sent_at", { mode: 'timestamp' }),
  smsSentAt: integer("sms_sent_at", { mode: 'timestamp' }),
  
  // Additional Data
  metadata: text("metadata"), // JSON with additional data
  priority: text("priority").default("normal"), // low, normal, high, urgent
  
  // Status
  status: text("status").notNull().default("pending"), // pending, sent, failed, read
  
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Continue from existing tables - adding only what was missing
export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
  shiftId: text("shift_id"),
  date: integer("date", { mode: 'timestamp' }).notNull(),
  checkIn: integer("check_in", { mode: 'timestamp' }),
  checkOut: integer("check_out", { mode: 'timestamp' }),
  status: text("status").notNull().default("present"),
  hoursWorked: real("hours_worked"),
  overtimeHours: real("overtime_hours").default(0),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const leaves = sqliteTable("leaves", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
  type: text("type").notNull(),
  startDate: integer("start_date").notNull(),
  endDate: integer("end_date").notNull(),
  days: real("days").notNull(),
  isHalfDay: integer("is_half_day", { mode: 'boolean' }).default(false),
  halfDayType: text("half_day_type"),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"),
  approvedBy: text("approved_by"),
  approvedAt: integer("approved_at"),
  createdAt: integer("created_at").default(sql`CURRENT_TIMESTAMP`),
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

// Employee-specific allowances and benefits
export const employeeAllowances = sqliteTable("employee_allowances", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
  allowanceType: text("allowance_type").notNull(), // "travel", "mobile", "food", "transport", "special", "housing", etc.
  amount: real("amount").notNull(),
  isPercentage: integer("is_percentage", { mode: 'boolean' }).default(false),
  frequency: text("frequency").notNull().default("monthly"), // "monthly", "quarterly", "yearly", "one-time"
  startDate: integer("start_date", { mode: 'timestamp' }).notNull(),
  endDate: integer("end_date", { mode: 'timestamp' }),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  description: text("description"),
  approvedBy: text("approved_by"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Employee-specific deductions
export const employeeDeductions = sqliteTable("employee_deductions", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
  deductionType: text("deduction_type").notNull(), // "loan", "advance", "insurance", "disciplinary", "other"
  amount: real("amount").notNull(),
  isPercentage: integer("is_percentage", { mode: 'boolean' }).default(false),
  frequency: text("frequency").notNull().default("monthly"),
  startDate: integer("start_date", { mode: 'timestamp' }).notNull(),
  endDate: integer("end_date", { mode: 'timestamp' }),
  remainingAmount: real("remaining_amount"),
  installmentAmount: real("installment_amount"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  description: text("description"),
  approvedBy: text("approved_by"),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Employee leave balances and entitlements
export const employeeLeaveBalances = sqliteTable("employee_leave_balances", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  employeeId: text("employee_id").notNull(),
  leaveType: text("leave_type").notNull(), // "annual", "sick", "casual", "maternity", "paternity", "compensatory"
  totalEntitlement: real("total_entitlement").notNull(),
  usedLeaves: real("used_leaves").default(0),
  remainingLeaves: real("remaining_leaves").notNull(),
  carryForward: real("carry_forward").default(0),
  year: integer("year").notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
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
export const insertEmployeeSchema = createInsertSchema(employees, {
  dateOfBirth: z.coerce.date().optional(),
  hireDate: z.coerce.date().optional(),
});
export const insertShiftSchema = createInsertSchema(shifts);
export const insertAttendanceSchema = createInsertSchema(attendance, {
  date: z.coerce.date(),
  checkIn: z.coerce.date().optional(),
  checkOut: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeaveSchema = createInsertSchema(leaves, {
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPerformanceSchema = createInsertSchema(performance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobOpeningSchema = createInsertSchema(jobOpenings).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  submittedAt: true,
});

// New advanced payroll schemas
export const insertSalaryComponentsSchema = createInsertSchema(salaryComponents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTdsConfigurationSchema = createInsertSchema(tdsConfiguration).omit({
  id: true,
  createdAt: true,
});

export const insertPayslipsSchema = createInsertSchema(payslips).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeLoansSchema = createInsertSchema(employeeLoans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSalaryAdvancesSchema = createInsertSchema(salaryAdvances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertComplianceReportsSchema = createInsertSchema(complianceReports).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationsSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeAllowanceSchema = createInsertSchema(employeeAllowances, {
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeDeductionSchema = createInsertSchema(employeeDeductions, {
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeLeaveBalanceSchema = createInsertSchema(employeeLeaveBalances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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
export type EmployeeAllowance = typeof employeeAllowances.$inferSelect;
export type EmployeeDeduction = typeof employeeDeductions.$inferSelect;
export type EmployeeLeaveBalance = typeof employeeLeaveBalances.$inferSelect;

// New advanced payroll types
export type SalaryComponents = typeof salaryComponents.$inferSelect;
export type TdsConfiguration = typeof tdsConfiguration.$inferSelect;
export type Payslips = typeof payslips.$inferSelect;
export type EmployeeLoans = typeof employeeLoans.$inferSelect;
export type SalaryAdvances = typeof salaryAdvances.$inferSelect;
export type ComplianceReports = typeof complianceReports.$inferSelect;
export type Notifications = typeof notifications.$inferSelect;

// Insert types
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
export type InsertEmployeeAllowance = z.infer<typeof insertEmployeeAllowanceSchema>;
export type InsertEmployeeDeduction = z.infer<typeof insertEmployeeDeductionSchema>;
export type InsertEmployeeLeaveBalance = z.infer<typeof insertEmployeeLeaveBalanceSchema>;

// New advanced payroll insert types
export type InsertSalaryComponents = z.infer<typeof insertSalaryComponentsSchema>;
export type InsertTdsConfiguration = z.infer<typeof insertTdsConfigurationSchema>;
export type InsertPayslips = z.infer<typeof insertPayslipsSchema>;
export type InsertEmployeeLoans = z.infer<typeof insertEmployeeLoansSchema>;
export type InsertSalaryAdvances = z.infer<typeof insertSalaryAdvancesSchema>;
export type InsertComplianceReports = z.infer<typeof insertComplianceReportsSchema>;
export type InsertNotifications = z.infer<typeof insertNotificationsSchema>;