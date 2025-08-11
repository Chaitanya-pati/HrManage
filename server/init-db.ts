import { db, sqlite } from './db';
import * as schema from '@shared/schema';

async function initializeDatabase() {
  console.log('Creating SQLite database tables...');
  
  try {
    // Create tables using raw SQL since drizzle-kit is configured for PostgreSQL
    // Use a single exec statement with all table creation
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'employee',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        name TEXT NOT NULL,
        description TEXT,
        manager_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT,
        employee_id TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        middle_name TEXT,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        personal_email TEXT,
        phone TEXT,
        personal_phone TEXT,
        date_of_birth TEXT,
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
        hire_date TEXT NOT NULL,
        probation_end_date TEXT,
        confirmation_date TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        shift_id TEXT,
        base_salary NUMERIC,
        hra NUMERIC DEFAULT 0,
        conveyance_allowance NUMERIC DEFAULT 0,
        medical_allowance NUMERIC DEFAULT 0,
        special_allowance NUMERIC DEFAULT 0,
        dearness_allowance NUMERIC DEFAULT 0,
        overtime_eligible INTEGER DEFAULT 0,
        overtime_category TEXT,
        max_overtime_hours NUMERIC DEFAULT 0,
        overtime_rate NUMERIC DEFAULT 1.5,
        holiday_overtime_rate NUMERIC DEFAULT 2.0,
        night_shift_overtime_rate NUMERIC DEFAULT 2.0,
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
        travel_allowance NUMERIC DEFAULT 0,
        field_allowance NUMERIC DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shifts (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        name TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        break_duration INTEGER DEFAULT 60,
        standard_hours NUMERIC DEFAULT 8.0,
        grace_time INTEGER DEFAULT 10,
        late_arrival_penalty NUMERIC DEFAULT 0,
        early_departure_penalty NUMERIC DEFAULT 0,
        half_day_threshold NUMERIC DEFAULT 4.0,
        is_flexible INTEGER DEFAULT 0,
        is_rotating INTEGER DEFAULT 0,
        is_night_shift INTEGER DEFAULT 0,
        night_shift_allowance NUMERIC DEFAULT 0,
        overtime_threshold NUMERIC DEFAULT 8.0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        date TEXT NOT NULL,
        clock_in TEXT,
        clock_out TEXT,
        break_time INTEGER DEFAULT 0,
        total_hours NUMERIC DEFAULT 0,
        overtime_hours NUMERIC DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'present',
        is_manual_entry INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS leaves (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        leave_type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        days NUMERIC NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        is_half_day INTEGER DEFAULT 0,
        half_day_slot TEXT,
        applied_date TEXT DEFAULT CURRENT_TIMESTAMP,
        reviewed_date TEXT,
        reviewed_by TEXT,
        review_comments TEXT,
        attachments TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payroll (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        pay_period_start TEXT NOT NULL,
        pay_period_end TEXT NOT NULL,
        base_salary NUMERIC NOT NULL,
        allowances TEXT,
        deductions TEXT,
        overtime_pay NUMERIC DEFAULT 0,
        gross_pay NUMERIC NOT NULL,
        tax_deductions NUMERIC DEFAULT 0,
        net_pay NUMERIC NOT NULL,
        payroll_status TEXT NOT NULL DEFAULT 'draft',
        processed_at TEXT,
        paid_at TEXT,
        payslip_generated INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS performance (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        review_period_start TEXT NOT NULL,
        review_period_end TEXT NOT NULL,
        overall_rating NUMERIC,
        goals TEXT,
        achievements TEXT,
        areas_for_improvement TEXT,
        reviewer_comments TEXT,
        employee_comments TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        reviewer_id TEXT,
        submitted_at TEXT,
        completed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS job_openings (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        title TEXT NOT NULL,
        department_id TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        salary_range TEXT,
        location TEXT,
        employment_type TEXT NOT NULL DEFAULT 'full-time',
        experience_level TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        openings INTEGER DEFAULT 1,
        application_deadline TEXT,
        posted_date TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        job_opening_id TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        applicant_email TEXT NOT NULL,
        applicant_phone TEXT,
        resume TEXT,
        cover_letter TEXT,
        status TEXT NOT NULL DEFAULT 'submitted',
        applied_date TEXT DEFAULT CURRENT_TIMESTAMP,
        interview_date TEXT,
        interview_notes TEXT,
        reviewer_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS employee_allowances (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        allowance_type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        frequency TEXT NOT NULL DEFAULT 'monthly',
        start_date TEXT NOT NULL,
        end_date TEXT,
        is_active INTEGER DEFAULT 1,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS employee_deductions (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        deduction_type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        frequency TEXT NOT NULL DEFAULT 'monthly',
        start_date TEXT NOT NULL,
        end_date TEXT,
        is_active INTEGER DEFAULT 1,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS employee_leave_balances (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        leave_type TEXT NOT NULL,
        total_days NUMERIC NOT NULL,
        used_days NUMERIC DEFAULT 0,
        remaining_days NUMERIC NOT NULL,
        year INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        name TEXT NOT NULL,
        description TEXT,
        manager_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT,
        employee_id TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        middle_name TEXT,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        personal_email TEXT,
        phone TEXT,
        personal_phone TEXT,
        date_of_birth TEXT,
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
        hire_date TEXT NOT NULL,
        probation_end_date TEXT,
        confirmation_date TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        shift_id TEXT,
        base_salary NUMERIC,
        hra NUMERIC DEFAULT 0,
        conveyance_allowance NUMERIC DEFAULT 0,
        medical_allowance NUMERIC DEFAULT 0,
        special_allowance NUMERIC DEFAULT 0,
        dearness_allowance NUMERIC DEFAULT 0,
        overtime_eligible INTEGER DEFAULT 0,
        overtime_category TEXT,
        max_overtime_hours NUMERIC DEFAULT 0,
        overtime_rate NUMERIC DEFAULT 1.5,
        holiday_overtime_rate NUMERIC DEFAULT 2.0,
        night_shift_overtime_rate NUMERIC DEFAULT 2.0,
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
        travel_allowance NUMERIC DEFAULT 0,
        field_allowance NUMERIC DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS shifts (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        name TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        break_duration INTEGER DEFAULT 60,
        standard_hours NUMERIC DEFAULT 8.0,
        grace_time INTEGER DEFAULT 10,
        late_arrival_penalty NUMERIC DEFAULT 0,
        early_departure_penalty NUMERIC DEFAULT 0,
        half_day_threshold NUMERIC DEFAULT 4.0,
        is_flexible INTEGER DEFAULT 0,
        is_rotating INTEGER DEFAULT 0,
        is_night_shift INTEGER DEFAULT 0,
        night_shift_allowance NUMERIC DEFAULT 0,
        overtime_threshold NUMERIC DEFAULT 8.0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        date TEXT NOT NULL,
        clock_in TEXT,
        clock_out TEXT,
        break_time INTEGER DEFAULT 0,
        total_hours NUMERIC DEFAULT 0,
        overtime_hours NUMERIC DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'present',
        is_manual_entry INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS leaves (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        leave_type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        days NUMERIC NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        is_half_day INTEGER DEFAULT 0,
        half_day_slot TEXT,
        applied_date TEXT DEFAULT CURRENT_TIMESTAMP,
        reviewed_date TEXT,
        reviewed_by TEXT,
        review_comments TEXT,
        attachments TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS payroll (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        pay_period_start TEXT NOT NULL,
        pay_period_end TEXT NOT NULL,
        base_salary NUMERIC NOT NULL,
        allowances TEXT,
        deductions TEXT,
        overtime_pay NUMERIC DEFAULT 0,
        gross_pay NUMERIC NOT NULL,
        tax_deductions NUMERIC DEFAULT 0,
        net_pay NUMERIC NOT NULL,
        payroll_status TEXT NOT NULL DEFAULT 'draft',
        processed_at TEXT,
        paid_at TEXT,
        payslip_generated INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS performance (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        review_period_start TEXT NOT NULL,
        review_period_end TEXT NOT NULL,
        overall_rating NUMERIC,
        goals TEXT,
        achievements TEXT,
        areas_for_improvement TEXT,
        reviewer_comments TEXT,
        employee_comments TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        reviewer_id TEXT,
        submitted_at TEXT,
        completed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS job_openings (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        title TEXT NOT NULL,
        department_id TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        salary_range TEXT,
        location TEXT,
        employment_type TEXT NOT NULL DEFAULT 'full-time',
        experience_level TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        openings INTEGER DEFAULT 1,
        application_deadline TEXT,
        posted_date TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        job_opening_id TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        applicant_email TEXT NOT NULL,
        applicant_phone TEXT,
        resume TEXT,
        cover_letter TEXT,
        status TEXT NOT NULL DEFAULT 'submitted',
        applied_date TEXT DEFAULT CURRENT_TIMESTAMP,
        interview_date TEXT,
        interview_notes TEXT,
        reviewer_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS employee_allowances (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        allowance_type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        frequency TEXT NOT NULL DEFAULT 'monthly',
        start_date TEXT NOT NULL,
        end_date TEXT,
        is_active INTEGER DEFAULT 1,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS employee_deductions (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        deduction_type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        frequency TEXT NOT NULL DEFAULT 'monthly',
        start_date TEXT NOT NULL,
        end_date TEXT,
        is_active INTEGER DEFAULT 1,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS employee_leave_balances (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        employee_id TEXT NOT NULL,
        leave_type TEXT NOT NULL,
        total_days NUMERIC NOT NULL,
        used_days NUMERIC DEFAULT 0,
        remaining_days NUMERIC NOT NULL,
        year INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables created successfully!');
    
    // Insert sample data
    console.log('Inserting sample data...');
    
    // Insert sample department
    const deptResult = await db.insert(schema.departments).values({
      name: 'Human Resources',
      description: 'Handles employee relations and policies'
    }).returning();
    
    const hrDeptId = deptResult[0].id;
    
    // Insert sample user
    const userResult = await db.insert(schema.users).values({
      username: 'admin',
      password: 'admin123', // In production, this should be hashed
      email: 'admin@flexui.com',
      role: 'admin'
    }).returning();
    
    const adminUserId = userResult[0].id;
    
    // Insert sample employee
    await db.insert(schema.employees).values({
      userId: adminUserId,
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@flexui.com',
      phone: '+1234567890',
      departmentId: hrDeptId,
      position: 'HR Manager',
      hireDate: '2024-01-15',
      baseSalary: '75000'
    });
    
    // Insert sample shift
    await db.insert(schema.shifts).values({
      name: 'Day Shift',
      startTime: '09:00',
      endTime: '18:00',
      standardHours: '8.0'
    });
    
    console.log('Sample data inserted successfully!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };