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

  // Sample departments
  const departments: Department[] = [
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
  const employees: Employee[] = [
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
      gender: 'male',
      personalAddress: '123 Main St, City, State 12345',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+1-555-0102',
      hireDate: new Date('2023-01-15'),
      departmentId: 'dept2',
      position: 'Senior Software Engineer',
      managerId: null,
      employmentType: 'full_time',
      status: 'active',
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
      workEligibility: 'authorized',
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
      gender: 'female',
      personalAddress: '456 Oak Ave, City, State 12345',
      emergencyContactName: 'Mike Smith',
      emergencyContactPhone: '+1-555-0202',
      hireDate: new Date('2023-03-01'),
      departmentId: 'dept1',
      position: 'HR Manager',
      managerId: null,
      employmentType: 'full_time',
      status: 'active',
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
      workEligibility: 'authorized',
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
const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

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
    
    return {
      totalEmployees: employees.length,
      presentToday: attendance.filter(a => a.status === 'present' && 
        new Date(a.date).toDateString() === new Date().toDateString()).length,
      onLeaveToday: leaves.filter(l => l.status === 'approved' &&
        new Date(l.startDate) <= new Date() && new Date(l.endDate) >= new Date()).length,
      pendingLeaves: leaves.filter(l => l.status === 'pending').length
    };
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    await delay();
    return getStorageData<Department>(STORAGE_KEYS.DEPARTMENTS);
  },

  async createDepartment(data: InsertDepartment): Promise<Department> {
    await delay();
    const departments = getStorageData<Department>(STORAGE_KEYS.DEPARTMENTS);
    const department: Department = {
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

  async updateDepartment(id: string, data: Partial<InsertDepartment>): Promise<Department | null> {
    await delay();
    const departments = getStorageData<Department>(STORAGE_KEYS.DEPARTMENTS);
    const index = departments.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    departments[index] = { ...departments[index], ...data };
    setStorageData(STORAGE_KEYS.DEPARTMENTS, departments);
    return departments[index];
  },

  async deleteDepartment(id: string): Promise<boolean> {
    await delay();
    const departments = getStorageData<Department>(STORAGE_KEYS.DEPARTMENTS);
    const filtered = departments.filter(d => d.id !== id);
    if (filtered.length === departments.length) return false;
    
    setStorageData(STORAGE_KEYS.DEPARTMENTS, filtered);
    return true;
  },

  // Employees
  async getEmployees(): Promise<Employee[]> {
    await delay();
    return getStorageData<Employee>(STORAGE_KEYS.EMPLOYEES);
  },

  async getEmployee(id: string): Promise<Employee | null> {
    await delay();
    const employees = getStorageData<Employee>(STORAGE_KEYS.EMPLOYEES);
    return employees.find(e => e.id === id) || null;
  },

  async createEmployee(data: InsertEmployee): Promise<Employee> {
    await delay();
    const employees = getStorageData<Employee>(STORAGE_KEYS.EMPLOYEES);
    const employee: Employee = {
      id: generateId(),
      userId: data.userId || null,
      employeeId: data.employeeId,
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      email: data.email,
      personalEmail: data.personalEmail || null,
      phone: data.phone || null,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      personalAddress: data.personalAddress || null,
      emergencyContactName: data.emergencyContactName || null,
      emergencyContactPhone: data.emergencyContactPhone || null,
      hireDate: data.hireDate,
      departmentId: data.departmentId,
      position: data.position,
      managerId: data.managerId || null,
      employmentType: data.employmentType,
      status: data.status || 'active',
      salary: data.salary,
      bankAccountNumber: data.bankAccountNumber || null,
      routingNumber: data.routingNumber || null,
      taxId: data.taxId || null,
      probationEndDate: data.probationEndDate || null,
      lastReviewDate: data.lastReviewDate || null,
      nextReviewDate: data.nextReviewDate || null,
      skills: data.skills || null,
      certifications: data.certifications || null,
      socialSecurityNumber: data.socialSecurityNumber || null,
      maritalStatus: data.maritalStatus || null,
      numberOfDependents: data.numberOfDependents || null,
      passportNumber: data.passportNumber || null,
      visaStatus: data.visaStatus || null,
      workEligibility: data.workEligibility || 'authorized',
      preferredLanguage: data.preferredLanguage || 'English',
      timeZone: data.timeZone || 'America/New_York',
      profilePicture: data.profilePicture || null,
      linkedinProfile: data.linkedinProfile || null,
      githubProfile: data.githubProfile || null,
      portfolioUrl: data.portfolioUrl || null,
      notes: data.notes || null,
      isDeleted: data.isDeleted || false,
      deletedAt: data.deletedAt || null,
      terminationDate: data.terminationDate || null,
      terminationReason: data.terminationReason || null,
      rehireEligible: data.rehireEligible || null,
      exitInterviewCompleted: data.exitInterviewCompleted || null,
      finalWorkingDay: data.finalWorkingDay || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    employees.push(employee);
    setStorageData(STORAGE_KEYS.EMPLOYEES, employees);
    return employee;
  },

  async updateEmployee(id: string, data: Partial<InsertEmployee>): Promise<Employee | null> {
    await delay();
    const employees = getStorageData<Employee>(STORAGE_KEYS.EMPLOYEES);
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    employees[index] = { ...employees[index], ...data, updatedAt: new Date() };
    setStorageData(STORAGE_KEYS.EMPLOYEES, employees);
    return employees[index];
  },

  async deleteEmployee(id: string): Promise<boolean> {
    await delay();
    const employees = getStorageData<Employee>(STORAGE_KEYS.EMPLOYEES);
    const filtered = employees.filter(e => e.id !== id);
    if (filtered.length === employees.length) return false;
    
    setStorageData(STORAGE_KEYS.EMPLOYEES, filtered);
    return true;
  },

  // Attendance
  async getAttendance(filters?: { employeeId?: string; startDate?: Date; endDate?: Date }): Promise<Attendance[]> {
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

  async createAttendance(data: InsertAttendance): Promise<Attendance> {
    await delay();
    const attendance = getStorageData<Attendance>(STORAGE_KEYS.ATTENDANCE);
    const record: Attendance = {
      id: generateId(),
      date: data.date,
      employeeId: data.employeeId,
      workLocation: data.workLocation || 'office',
      status: data.status || 'present',
      shiftId: data.shiftId || null,
      checkIn: data.checkIn || null,
      checkOut: data.checkOut || null,
      breakStart: data.breakStart || null,
      breakEnd: data.breakEnd || null,
      actualBreakDuration: data.actualBreakDuration || null,
      hoursWorked: data.hoursWorked || null,
      overtimeHours: data.overtimeHours || null,
      undertimeHours: data.undertimeHours || null,
      lateArrival: data.lateArrival || false,
      earlyDeparture: data.earlyDeparture || false,
      lateMinutes: data.lateMinutes || null,
      earlyDepartureMinutes: data.earlyDepartureMinutes || null,
      notes: data.notes || null,
      adminNotes: data.adminNotes || null,
      biometricId: data.biometricId || null,
      fingerprintVerified: data.fingerprintVerified || false,
      faceRecognitionVerified: data.faceRecognitionVerified || false,
      cardSwipeIn: data.cardSwipeIn || null,
      cardSwipeOut: data.cardSwipeOut || null,
      gateEntry: data.gateEntry || null,
      gateExit: data.gateExit || null,
      ipAddress: data.ipAddress || null,
      deviceInfo: data.deviceInfo || null,
      gpsLocationIn: data.gpsLocationIn || null,
      gpsLocationOut: data.gpsLocationOut || null,
      photoIn: data.photoIn || null,
      photoOut: data.photoOut || null,
      approvedBy: data.approvedBy || null,
      approvedAt: data.approvedAt || null,
      temperature: data.temperature || null,
      healthCheckStatus: data.healthCheckStatus || null,
      workFromHome: data.workFromHome || false,
      clientSite: data.clientSite || null,
      projectAllocation: data.projectAllocation || null,
      billableHours: data.billableHours || null,
      nonBillableHours: data.nonBillableHours || null,
      travelTime: data.travelTime || null,
      mealBreakTaken: data.mealBreakTaken || null,
      shortBreaksTaken: data.shortBreaksTaken || null,
      totalBreakTime: data.totalBreakTime || null,
      productivityScore: data.productivityScore || null,
      tasksCompleted: data.tasksCompleted || null,
      meetingsAttended: data.meetingsAttended || null,
      trainingHours: data.trainingHours || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    attendance.push(record);
    setStorageData(STORAGE_KEYS.ATTENDANCE, attendance);
    return record;
  },

  // Leaves
  async getLeaves(filters?: { employeeId?: string; status?: string }): Promise<Leave[]> {
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

  async createLeave(data: InsertLeave): Promise<Leave> {
    await delay();
    const leaves = getStorageData<Leave>(STORAGE_KEYS.LEAVES);
    const leave: Leave = {
      id: generateId(),
      employeeId: data.employeeId,
      status: data.status || 'pending',
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      days: data.days.toString(),
      isHalfDay: data.isHalfDay || false,
      halfDayType: data.halfDayType || null,
      reason: data.reason,
      approvedBy: data.approvedBy || null,
      approvedAt: data.approvedAt || null,
      createdAt: new Date(),
    };
    leaves.push(leave);
    setStorageData(STORAGE_KEYS.LEAVES, leaves);
    return leave;
  },

  async updateLeave(id: string, data: Partial<InsertLeave>): Promise<Leave | null> {
    await delay();
    const leaves = getStorageData<Leave>(STORAGE_KEYS.LEAVES);
    const index = leaves.findIndex(l => l.id === id);
    if (index === -1) return null;
    
    if (data.days) {
      data.days = data.days.toString() as any;
    }
    leaves[index] = { ...leaves[index], ...data };
    setStorageData(STORAGE_KEYS.LEAVES, leaves);
    return leaves[index];
  },

  // Activities
  async getActivities(limit: number = 50): Promise<Activity[]> {
    await delay();
    const activities = getStorageData<Activity>(STORAGE_KEYS.ACTIVITIES);
    return activities
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, limit);
  },

  async createActivity(data: InsertActivity): Promise<Activity> {
    await delay();
    const activities = getStorageData<Activity>(STORAGE_KEYS.ACTIVITIES);
    const activity: Activity = {
      id: generateId(),
      type: data.type,
      title: data.title,
      description: data.description || null,
      userId: data.userId || null,
      entityType: data.entityType || null,
      entityId: data.entityId || null,
      createdAt: new Date(),
    };
    activities.push(activity);
    setStorageData(STORAGE_KEYS.ACTIVITIES, activities);
    return activity;
  },

  // Placeholder methods for other entities
  async getShifts(): Promise<Shift[]> {
    await delay();
    return getStorageData<Shift>(STORAGE_KEYS.SHIFTS);
  },

  async createShift(data: InsertShift): Promise<Shift> {
    await delay();
    const shifts = getStorageData<Shift>(STORAGE_KEYS.SHIFTS);
    const shift: Shift = {
      id: generateId(),
      name: data.name,
      departmentId: data.departmentId || null,
      startTime: data.startTime,
      endTime: data.endTime,
      breakDuration: data.breakDuration || null,
      standardHours: data.standardHours || null,
      overtimeThreshold: data.overtimeThreshold || null,
      isActive: data.isActive !== false,
      workDays: data.workDays || null,
      isFlexible: data.isFlexible || false,
      coreHoursStart: data.coreHoursStart || null,
      coreHoursEnd: data.coreHoursEnd || null,
      allowedLateArrival: data.allowedLateArrival || null,
      maxConsecutiveDays: data.maxConsecutiveDays || null,
      weekendRate: data.weekendRate || null,
      nightShiftRate: data.nightShiftRate || null,
      holidayWorkingRate: data.holidayWorkingRate || null,
      createdAt: new Date(),
    };
    shifts.push(shift);
    setStorageData(STORAGE_KEYS.SHIFTS, shifts);
    return shift;
  },

  async getPayroll(filters?: { employeeId?: string; month?: number; year?: number }): Promise<Payroll[]> {
    await delay();
    return getStorageData<Payroll>(STORAGE_KEYS.PAYROLL);
  },

  async createPayroll(data: InsertPayroll): Promise<Payroll> {
    await delay();
    const payroll = getStorageData<Payroll>(STORAGE_KEYS.PAYROLL);
    const record: Payroll = {
      id: generateId(),
      employeeId: data.employeeId,
      status: data.status || 'pending',
      lateArrivalPenalty: data.lateArrivalPenalty || null,
      earlyDeparturePenalty: data.earlyDeparturePenalty || null,
      nightShiftAllowance: data.nightShiftAllowance || null,
      weekendAllowance: data.weekendAllowance || null,
      holidayAllowance: data.holidayAllowance || null,
      overtimeAmount: data.overtimeAmount || null,
      bonusAmount: data.bonusAmount || null,
      commissionAmount: data.commissionAmount || null,
      allowanceAmount: data.allowanceAmount || null,
      deductionAmount: data.deductionAmount || null,
      taxAmount: data.taxAmount || null,
      providentFund: data.providentFund || null,
      insurance: data.insurance || null,
      loan: data.loan || null,
      advance: data.advance || null,
      year: data.year,
      month: data.month,
      totalWorkingDays: data.totalWorkingDays,
      workedDays: data.workedDays || 0,
      totalLeaves: data.totalLeaves || 0,
      paidLeaves: data.paidLeaves || 0,
      unpaidLeaves: data.unpaidLeaves || 0,
      holidays: data.holidays || 0,
      weekends: data.weekends || 0,
      overtimeHours: data.overtimeHours || null,
      undertimeHours: data.undertimeHours || null,
      lateArrivalDays: data.lateArrivalDays || null,
      earlyDepartureDays: data.earlyDepartureDays || null,
      absentDays: data.absentDays || null,
      presentDays: data.presentDays || null,
      baseSalary: data.baseSalary,
      grossSalary: data.grossSalary,
      netSalary: data.netSalary,
      hourlySalary: data.hourlySalary || null,
      dailySalary: data.dailySalary || null,
      overtimeRate: data.overtimeRate || null,
      nightShiftRate: data.nightShiftRate || null,
      weekendRate: data.weekendRate || null,
      holidayRate: data.holidayRate || null,
      houseRentAllowance: data.houseRentAllowance || null,
      medicalAllowance: data.medicalAllowance || null,
      transportAllowance: data.transportAllowance || null,
      mealAllowance: data.mealAllowance || null,
      communicationAllowance: data.communicationAllowance || null,
      educationAllowance: data.educationAllowance || null,
      specialAllowance: data.specialAllowance || null,
      cityCompensatoryAllowance: data.cityCompensatoryAllowance || null,
      performanceBonus: data.performanceBonus || null,
      attendanceBonus: data.attendanceBonus || null,
      festivalBonus: data.festivalBonus || null,
      yearEndBonus: data.yearEndBonus || null,
      retentionBonus: data.retentionBonus || null,
      referralBonus: data.referralBonus || null,
      targetAchievementBonus: data.targetAchievementBonus || null,
      processedAt: new Date(),
      processedBy: data.processedBy || null,
      payDate: data.payDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    payroll.push(record);
    setStorageData(STORAGE_KEYS.PAYROLL, payroll);
    return record;
  },

  async getPerformance(filters?: { employeeId?: string; year?: number }): Promise<Performance[]> {
    await delay();
    return getStorageData<Performance>(STORAGE_KEYS.PERFORMANCE);
  },

  async createPerformance(data: InsertPerformance): Promise<Performance> {
    await delay();
    const performance = getStorageData<Performance>(STORAGE_KEYS.PERFORMANCE);
    const record: Performance = {
      id: generateId(),
      employeeId: data.employeeId,
      status: data.status || 'draft',
      year: data.year,
      reviewerId: data.reviewerId,
      period: data.period,
      goals: data.goals || null,
      achievements: data.achievements || null,
      rating: data.rating || null,
      feedback: data.feedback || null,
      completedAt: new Date(),
      createdAt: new Date(),
    };
    performance.push(record);
    setStorageData(STORAGE_KEYS.PERFORMANCE, performance);
    return record;
  },

  async getJobOpenings(): Promise<JobOpening[]> {
    await delay();
    return getStorageData<JobOpening>(STORAGE_KEYS.JOB_OPENINGS);
  },

  async createJobOpening(data: InsertJobOpening): Promise<JobOpening> {
    await delay();
    const jobOpenings = getStorageData<JobOpening>(STORAGE_KEYS.JOB_OPENINGS);
    const job: JobOpening = {
      id: generateId(),
      title: data.title,
      description: data.description,
      type: data.type,
      department: data.department,
      location: data.location,
      requirements: data.requirements,
      skills: data.skills || null,
      experience: data.experience || null,
      status: data.status || 'open',
      salaryMin: data.salaryMin || null,
      salaryMax: data.salaryMax || null,
      applicationDeadline: data.applicationDeadline || null,
      postedBy: data.postedBy || null,
      applicantCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jobOpenings.push(job);
    setStorageData(STORAGE_KEYS.JOB_OPENINGS, jobOpenings);
    return job;
  },

  async getJobApplications(jobId?: string): Promise<JobApplication[]> {
    await delay();
    let applications = getStorageData<JobApplication>(STORAGE_KEYS.JOB_APPLICATIONS);
    
    if (jobId) {
      applications = applications.filter(a => a.jobId === jobId);
    }
    
    return applications.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
  },

  async createJobApplication(data: InsertJobApplication): Promise<JobApplication> {
    await delay();
    const applications = getStorageData<JobApplication>(STORAGE_KEYS.JOB_APPLICATIONS);
    const application: JobApplication = {
      id: generateId(),
      jobId: data.jobId,
      candidateName: data.candidateName,
      candidateEmail: data.candidateEmail,
      candidatePhone: data.candidatePhone || null,
      resumeUrl: data.resumeUrl || null,
      coverLetter: data.coverLetter || null,
      status: data.status || 'applied',
      notes: data.notes || null,
      appliedAt: new Date(),
      reviewedAt: null,
      reviewedBy: data.reviewedBy || null,
    };
    applications.push(application);
    setStorageData(STORAGE_KEYS.JOB_APPLICATIONS, applications);
    return application;
  }
};

// Initialize on import
localStorageAPI.initialize();