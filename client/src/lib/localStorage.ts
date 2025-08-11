// localStorage-based data layer for fast development
import type {
  Employee,
  Department,
  Attendance,
  Leave,
  Payroll,
  Performance,
  Activity,
  Shift,
  JobOpening,
  JobApplication,
  InsertEmployee,
  InsertDepartment,
  InsertAttendance,
  InsertLeave,
  InsertPayroll,
  InsertPerformance,
  InsertActivity,
  InsertShift,
  InsertJobOpening,
  InsertJobApplication
} from '@shared/schema';

// Storage keys
const STORAGE_KEYS = {
  EMPLOYEES: 'hrms_employees',
  DEPARTMENTS: 'hrms_departments',
  ATTENDANCE: 'hrms_attendance',
  LEAVES: 'hrms_leaves',
  PAYROLL: 'hrms_payroll',
  PERFORMANCE: 'hrms_performance',
  ACTIVITIES: 'hrms_activities',
  SHIFTS: 'hrms_shifts',
  JOB_OPENINGS: 'hrms_job_openings',
  JOB_APPLICATIONS: 'hrms_job_applications',
  INITIALIZED: 'hrms_initialized'
};

// Generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Get data from localStorage
function getStorageData<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Set data to localStorage
function setStorageData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initialize sample data
function initializeSampleData(): void {
  if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    return;
  }

  // Clear any existing data first
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });

  // Sample departments
  const departments = [
    {
      id: 'dept1',
      name: 'Human Resources',
      description: 'Manages employee relations and policies',
      managerId: null,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'dept2', 
      name: 'Engineering',
      description: 'Software development and technical operations',
      managerId: null,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'dept3',
      name: 'Marketing',
      description: 'Brand management and customer acquisition',
      managerId: null,
      createdAt: new Date('2024-01-01'),
    }
  ];

  // Sample employees
  const employees = [
    {
      id: 'emp1',
      userId: null,
      employeeId: 'EMP001',
      firstName: 'John',
      middleName: null,
      lastName: 'Doe',
      email: 'john.doe@company.com',
      personalEmail: 'john@gmail.com',
      phone: '+1-555-0101',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'male' as const,
      personalAddress: '123 Main St, City, State 12345',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+1-555-0102',
      hireDate: new Date('2023-01-15'),
      departmentId: 'dept2',
      position: 'Senior Software Engineer',
      managerId: null,
      employmentType: 'full_time' as const,
      status: 'active' as const,
      salary: '95000',
      bankAccountNumber: null,
      routingNumber: null,
      taxId: null,
      probationEndDate: null,
      lastReviewDate: null,
      nextReviewDate: null,
      skills: null,
      certifications: null,
      socialSecurityNumber: null,
      maritalStatus: null,
      numberOfDependents: null,
      passportNumber: null,
      visaStatus: null,
      workEligibility: 'authorized' as const,
      preferredLanguage: 'English',
      timeZone: 'America/New_York',
      profilePicture: null,
      linkedinProfile: null,
      githubProfile: null,
      portfolioUrl: null,
      notes: null,
      isDeleted: false,
      deletedAt: null,
      terminationDate: null,
      terminationReason: null,
      rehireEligible: null,
      exitInterviewCompleted: null,
      finalWorkingDay: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'emp2',
      userId: null,
      employeeId: 'EMP002',
      firstName: 'Sarah',
      middleName: null,
      lastName: 'Smith',
      email: 'sarah.smith@company.com',
      personalEmail: 'sarah@gmail.com',
      phone: '+1-555-0201',
      dateOfBirth: new Date('1990-07-22'),
      gender: 'female' as const,
      personalAddress: '456 Oak Ave, City, State 12345',
      emergencyContactName: 'Mike Smith',
      emergencyContactPhone: '+1-555-0202',
      hireDate: new Date('2023-03-01'),
      departmentId: 'dept1',
      position: 'HR Manager',
      managerId: null,
      employmentType: 'full_time' as const,
      status: 'active' as const,
      salary: '75000',
      bankAccountNumber: null,
      routingNumber: null,
      taxId: null,
      probationEndDate: null,
      lastReviewDate: null,
      nextReviewDate: null,
      skills: null,
      certifications: null,
      socialSecurityNumber: null,
      maritalStatus: null,
      numberOfDependents: null,
      passportNumber: null,
      visaStatus: null,
      workEligibility: 'authorized' as const,
      preferredLanguage: 'English',
      timeZone: 'America/New_York',
      profilePicture: null,
      linkedinProfile: null,
      githubProfile: null,
      portfolioUrl: null,
      notes: null,
      isDeleted: false,
      deletedAt: null,
      terminationDate: null,
      terminationReason: null,
      rehireEligible: null,
      exitInterviewCompleted: null,
      finalWorkingDay: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }
  ];

  // Store all sample data
  setStorageData(STORAGE_KEYS.DEPARTMENTS, departments);
  setStorageData(STORAGE_KEYS.EMPLOYEES, employees);
  setStorageData(STORAGE_KEYS.ATTENDANCE, []);
  setStorageData(STORAGE_KEYS.LEAVES, []);
  setStorageData(STORAGE_KEYS.PAYROLL, []);
  setStorageData(STORAGE_KEYS.PERFORMANCE, []);
  setStorageData(STORAGE_KEYS.ACTIVITIES, []);
  setStorageData(STORAGE_KEYS.SHIFTS, []);
  setStorageData(STORAGE_KEYS.JOB_OPENINGS, []);
  setStorageData(STORAGE_KEYS.JOB_APPLICATIONS, []);
  
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

// Simulate API delays for realistic experience
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// localStorage API
export const localStorageAPI = {
  // Initialize data
  initialize(): void {
    initializeSampleData();
  },

  // Dashboard metrics
  async getDashboardMetrics() {
    await delay();
    const employees = getStorageData<Employee>(STORAGE_KEYS.EMPLOYEES);
    const attendance = getStorageData<Attendance>(STORAGE_KEYS.ATTENDANCE);
    const leaves = getStorageData<Leave>(STORAGE_KEYS.LEAVES);
    const jobOpenings = getStorageData<JobOpening>(STORAGE_KEYS.JOB_OPENINGS);
    
    const activeToday = attendance.filter(a => a.status === 'present' && 
      new Date(a.date).toDateString() === new Date().toDateString()).length;
    
    // Generate sample department distribution
    const departmentCounts = employees.reduce((acc, emp) => {
      const dept = emp.departmentId || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const departments = getStorageData<Department>(STORAGE_KEYS.DEPARTMENTS);
    const departmentDistribution = Object.entries(departmentCounts).map(([id, count]) => {
      const dept = departments.find(d => d.id === id);
      return {
        name: dept ? dept.name : 'Unknown',
        count: count
      };
    });

    // Generate sample attendance trend data
    const attendanceTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        rate: Math.floor(Math.random() * 20) + 80 // Random between 80-100%
      };
    });

    return {
      totalEmployees: employees.length,
      activeToday: activeToday,
      presentToday: activeToday,
      onLeaveToday: leaves.filter(l => l.status === 'approved' &&
        new Date(l.startDate) <= new Date() && new Date(l.endDate) >= new Date()).length,
      pendingLeaves: leaves.filter(l => l.status === 'pending').length,
      openPositions: jobOpenings.filter(j => j.status === 'open').length,
      attendanceRate: employees.length > 0 ? Math.round((activeToday / employees.length) * 100) : 0,
      departmentDistribution,
      attendanceTrend
    };
  },

  // Departments
  async getDepartments() {
    await delay();
    return getStorageData<Department>(STORAGE_KEYS.DEPARTMENTS);
  },

  async createDepartment(data: InsertDepartment) {
    await delay();
    const departments = getStorageData<Department>(STORAGE_KEYS.DEPARTMENTS);
    const department = {
      id: generateId(),
      name: data.name,
      description: data.description || null,
      managerId: data.managerId || null,
      createdAt: new Date(),
    };
    departments.push(department);
    setStorageData(STORAGE_KEYS.DEPARTMENTS, departments);
    return department;
  },

  async updateDepartment(id: string, data: Partial<InsertDepartment>) {
    await delay();
    const departments = getStorageData<Department>(STORAGE_KEYS.DEPARTMENTS);
    const index = departments.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    departments[index] = { ...departments[index], ...data };
    setStorageData(STORAGE_KEYS.DEPARTMENTS, departments);
    return departments[index];
  },

  async deleteDepartment(id: string) {
    await delay();
    const departments = getStorageData<Department>(STORAGE_KEYS.DEPARTMENTS);
    const filtered = departments.filter(d => d.id !== id);
    if (filtered.length === departments.length) return false;
    
    setStorageData(STORAGE_KEYS.DEPARTMENTS, filtered);
    return true;
  },

  // Employees
  async getEmployees() {
    await delay();
    return getStorageData<Employee>(STORAGE_KEYS.EMPLOYEES);
  },

  async getEmployee(id: string) {
    await delay();
    const employees = getStorageData<Employee>(STORAGE_KEYS.EMPLOYEES);
    return employees.find(e => e.id === id) || null;
  },

  async createEmployee(data: InsertEmployee) {
    await delay();
    const employees = getStorageData<Employee>(STORAGE_KEYS.EMPLOYEES);
    const employee = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    employees.push(employee as any);
    setStorageData(STORAGE_KEYS.EMPLOYEES, employees);
    return employee;
  },

  async updateEmployee(id: string, data: Partial<InsertEmployee>) {
    await delay();
    const employees = getStorageData<Employee>(STORAGE_KEYS.EMPLOYEES);
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    employees[index] = { ...employees[index], ...data, updatedAt: new Date() };
    setStorageData(STORAGE_KEYS.EMPLOYEES, employees);
    return employees[index];
  },

  async deleteEmployee(id: string) {
    await delay();
    const employees = getStorageData<Employee>(STORAGE_KEYS.EMPLOYEES);
    const filtered = employees.filter(e => e.id !== id);
    if (filtered.length === employees.length) return false;
    
    setStorageData(STORAGE_KEYS.EMPLOYEES, filtered);
    return true;
  },

  // Attendance
  async getAttendance(filters?: { employeeId?: string; startDate?: Date; endDate?: Date }) {
    await delay();
    let attendance = getStorageData<Attendance>(STORAGE_KEYS.ATTENDANCE);
    
    if (filters) {
      if (filters.employeeId) {
        attendance = attendance.filter(a => a.employeeId === filters.employeeId);
      }
      if (filters.startDate) {
        attendance = attendance.filter(a => new Date(a.date) >= filters.startDate!);
      }
      if (filters.endDate) {
        attendance = attendance.filter(a => new Date(a.date) <= filters.endDate!);
      }
    }
    
    return attendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async createAttendance(data: InsertAttendance) {
    await delay();
    const attendance = getStorageData<Attendance>(STORAGE_KEYS.ATTENDANCE);
    const record = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    attendance.push(record as any);
    setStorageData(STORAGE_KEYS.ATTENDANCE, attendance);
    return record;
  },

  // Leaves
  async getLeaves(filters?: { employeeId?: string; status?: string }) {
    await delay();
    let leaves = getStorageData<Leave>(STORAGE_KEYS.LEAVES);
    
    if (filters) {
      if (filters.employeeId) {
        leaves = leaves.filter(l => l.employeeId === filters.employeeId);
      }
      if (filters.status) {
        leaves = leaves.filter(l => l.status === filters.status);
      }
    }
    
    return leaves.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  },

  async createLeave(data: InsertLeave) {
    await delay();
    const leaves = getStorageData<Leave>(STORAGE_KEYS.LEAVES);
    const leave = {
      id: generateId(),
      ...data,
      days: data.days.toString(),
      createdAt: new Date(),
    };
    leaves.push(leave as any);
    setStorageData(STORAGE_KEYS.LEAVES, leaves);
    return leave;
  },

  async updateLeave(id: string, data: Partial<InsertLeave>) {
    await delay();
    const leaves = getStorageData<Leave>(STORAGE_KEYS.LEAVES);
    const index = leaves.findIndex(l => l.id === id);
    if (index === -1) return null;
    
    const updateData = { ...data };
    if (updateData.days) {
      updateData.days = updateData.days.toString() as any;
    }
    leaves[index] = { ...leaves[index], ...updateData };
    setStorageData(STORAGE_KEYS.LEAVES, leaves);
    return leaves[index];
  },

  // Activities
  async getActivities(limit: number = 50) {
    await delay();
    const activities = getStorageData<Activity>(STORAGE_KEYS.ACTIVITIES);
    return activities
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, limit);
  },

  async createActivity(data: InsertActivity) {
    await delay();
    const activities = getStorageData<Activity>(STORAGE_KEYS.ACTIVITIES);
    const activity = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    };
    activities.push(activity as any);
    setStorageData(STORAGE_KEYS.ACTIVITIES, activities);
    return activity;
  },

  // Placeholder methods for other entities
  async getShifts() {
    await delay();
    return getStorageData<Shift>(STORAGE_KEYS.SHIFTS);
  },

  async createShift(data: InsertShift) {
    await delay();
    const shifts = getStorageData<Shift>(STORAGE_KEYS.SHIFTS);
    const shift = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    };
    shifts.push(shift as any);
    setStorageData(STORAGE_KEYS.SHIFTS, shifts);
    return shift;
  },

  async getPayroll(filters?: any) {
    await delay();
    return getStorageData<Payroll>(STORAGE_KEYS.PAYROLL);
  },

  async createPayroll(data: InsertPayroll) {
    await delay();
    const payroll = getStorageData<Payroll>(STORAGE_KEYS.PAYROLL);
    const record = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    payroll.push(record as any);
    setStorageData(STORAGE_KEYS.PAYROLL, payroll);
    return record;
  },

  async getPerformance(filters?: any) {
    await delay();
    return getStorageData<Performance>(STORAGE_KEYS.PERFORMANCE);
  },

  async createPerformance(data: InsertPerformance) {
    await delay();
    const performance = getStorageData<Performance>(STORAGE_KEYS.PERFORMANCE);
    const record = {
      id: generateId(),
      ...data,
      createdAt: new Date(),
    };
    performance.push(record as any);
    setStorageData(STORAGE_KEYS.PERFORMANCE, performance);
    return record;
  },

  async getJobOpenings() {
    await delay();
    return getStorageData<JobOpening>(STORAGE_KEYS.JOB_OPENINGS);
  },

  async createJobOpening(data: InsertJobOpening) {
    await delay();
    const jobOpenings = getStorageData<JobOpening>(STORAGE_KEYS.JOB_OPENINGS);
    const job = {
      id: generateId(),
      ...data,
      applicantCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jobOpenings.push(job as any);
    setStorageData(STORAGE_KEYS.JOB_OPENINGS, jobOpenings);
    return job;
  },

  async getJobApplications(jobId?: string) {
    await delay();
    let applications = getStorageData<JobApplication>(STORAGE_KEYS.JOB_APPLICATIONS);
    
    if (jobId) {
      applications = applications.filter(a => a.jobId === jobId);
    }
    
    return applications.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
  },

  async createJobApplication(data: InsertJobApplication) {
    await delay();
    const applications = getStorageData<JobApplication>(STORAGE_KEYS.JOB_APPLICATIONS);
    const application = {
      id: generateId(),
      ...data,
      appliedAt: new Date(),
    };
    applications.push(application as any);
    setStorageData(STORAGE_KEYS.JOB_APPLICATIONS, applications);
    return application;
  }
};

// Initialize on import
localStorageAPI.initialize();