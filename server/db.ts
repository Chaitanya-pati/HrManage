import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

const sqlite = new Database('database.sqlite');
export const db = drizzle(sqlite, { schema });

// Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'employee',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT NOT NULL,
      description TEXT,
      manager_id TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT,
      employee_id TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      middle_name TEXT,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      personal_email TEXT,
      phone TEXT,
      personal_phone TEXT,
      date_of_birth INTEGER,
      gender TEXT,
      marital_status TEXT,
      profile_image TEXT,
      current_address TEXT,
      permanent_address TEXT,
      emergency_contact TEXT,
      department_id TEXT,
      position TEXT NOT NULL,
      manager_id TEXT,
      employment_type TEXT NOT NULL DEFAULT 'permanent',
      work_location TEXT NOT NULL DEFAULT 'office',
      employee_grade TEXT,
      hire_date INTEGER NOT NULL,
      probation_end_date INTEGER,
      confirmation_date INTEGER,
      status TEXT NOT NULL DEFAULT 'active',
      shift_id TEXT,
      base_salary REAL,
      hra REAL DEFAULT 0,
      conveyance_allowance REAL DEFAULT 0,
      medical_allowance REAL DEFAULT 0,
      special_allowance REAL DEFAULT 0,
      dearness_allowance REAL DEFAULT 0,
      overtime_eligible INTEGER DEFAULT 0,
      overtime_category TEXT,
      max_overtime_hours REAL DEFAULT 0,
      overtime_rate REAL DEFAULT 1.5,
      holiday_overtime_rate REAL DEFAULT 2.0,
      night_shift_overtime_rate REAL DEFAULT 2.0,
      education TEXT,
      skills TEXT,
      experience TEXT,
      languages TEXT,
      pan_number TEXT,
      aadhar_number TEXT,
      passport_number TEXT,
      pf_account_number TEXT,
      esi_number TEXT,
      uan_number TEXT,
      previous_pf_details TEXT,
      bank_details TEXT,
      medical_fitness_certificate TEXT,
      safety_training_completed INTEGER DEFAULT 0,
      safety_equipment_sizes TEXT,
      special_licenses TEXT,
      police_verification_status TEXT,
      field_work_eligible INTEGER DEFAULT 0,
      client_site_access TEXT,
      travel_allowance REAL DEFAULT 0,
      field_allowance REAL DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  // Advanced Payroll Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS salary_components (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      employee_id TEXT NOT NULL,
      component_type TEXT NOT NULL,
      amount REAL NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'monthly',
      financial_year TEXT NOT NULL,
      effective_from INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS payslips (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      employee_id TEXT NOT NULL,
      payroll_id TEXT,
      pay_period TEXT NOT NULL,
      pay_date INTEGER NOT NULL,
      salary_components TEXT NOT NULL,
      gross_salary REAL NOT NULL,
      total_deductions REAL NOT NULL,
      net_salary REAL NOT NULL,
      tds_deducted REAL DEFAULT 0,
      ytd_gross REAL DEFAULT 0,
      ytd_tds REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'draft',
      generated_at INTEGER DEFAULT (strftime('%s', 'now')),
      sent_at INTEGER,
      pdf_path TEXT,
      email_sent INTEGER DEFAULT 0,
      email_sent_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS employee_loans (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      employee_id TEXT NOT NULL,
      loan_type TEXT NOT NULL,
      loan_amount REAL NOT NULL,
      interest_rate REAL DEFAULT 0,
      tenure_months INTEGER NOT NULL,
      emi_amount REAL NOT NULL,
      start_date INTEGER NOT NULL,
      end_date INTEGER NOT NULL,
      remaining_amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      purpose TEXT,
      guarantor_employee_id TEXT,
      document_path TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS salary_advances (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      employee_id TEXT NOT NULL,
      advance_amount REAL NOT NULL,
      reason TEXT NOT NULL,
      request_date INTEGER NOT NULL,
      approved_date INTEGER,
      repayment_months INTEGER NOT NULL,
      monthly_deduction REAL NOT NULL,
      remaining_amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      approved_by TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS compliance_reports (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      report_type TEXT NOT NULL,
      report_period TEXT NOT NULL,
      financial_year TEXT NOT NULL,
      report_data TEXT NOT NULL,
      employee_count INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      file_name TEXT,
      file_path TEXT,
      file_format TEXT DEFAULT 'excel',
      status TEXT NOT NULL DEFAULT 'generated',
      generated_at INTEGER DEFAULT (strftime('%s', 'now')),
      downloaded_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tds_configuration (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      financial_year TEXT NOT NULL UNIQUE,
      tax_slabs TEXT NOT NULL,
      standard_deduction REAL DEFAULT 50000,
      section_80c_limit REAL DEFAULT 150000,
      hra_exemption_rules TEXT,
      professional_tax_limits TEXT,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      employee_id TEXT,
      recipient_email TEXT,
      recipient_phone TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      email_sent INTEGER DEFAULT 0,
      sms_sent INTEGER DEFAULT 0,
      email_sent_at INTEGER,
      sms_sent_at INTEGER,
      metadata TEXT,
      priority TEXT DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);