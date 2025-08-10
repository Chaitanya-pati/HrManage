// Frontend-only data layer using localStorage

// Simplified types for frontend-only usage
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  departmentId?: string;
  salary?: string;
  hireDate: string;
  status: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  hoursWorked?: number;
  notes?: string;
}

export interface Payroll {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: string;
  allowances?: string;
  deductions?: string;
  netSalary: string;
  status: string;
}

export interface Performance {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  year: number;
  goals?: any;
  achievements?: any;
  rating?: number;
  feedback?: string;
  status: string;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  timestamp: string;
}

// Storage keys
const STORAGE_KEYS = {
  employees: 'hrms_employees',
  departments: 'hrms_departments',
  attendance: 'hrms_attendance',
  payroll: 'hrms_payroll',
  performance: 'hrms_performance',
  activities: 'hrms_activities',
  jobs: 'hrms_jobs',
};

// Helper functions
const getStorageItem = <T>(key: string, defaultValue: T[] = []): T[] => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

const generateId = (): string => crypto.randomUUID();

// Initialize sample data
const initializeSampleData = () => {
  // Sample departments
  const departments: Department[] = [
    { id: generateId(), name: 'Engineering', description: 'Software development team' },
    { id: generateId(), name: 'Human Resources', description: 'HR management team' },
    { id: generateId(), name: 'Marketing', description: 'Marketing and sales team' },
    { id: generateId(), name: 'Finance', description: 'Finance and accounting team' }
  ];

  // Sample employees
  const employees: Employee[] = [
    {
      id: generateId(),
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+1-555-0101',
      position: 'Senior Developer',
      departmentId: departments[0].id,
      salary: '85000',
      hireDate: '2022-01-15',
      status: 'active'
    },
    {
      id: generateId(),
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      phone: '+1-555-0102',
      position: 'HR Manager',
      departmentId: departments[1].id,
      salary: '75000',
      hireDate: '2021-03-20',
      status: 'active'
    },
    {
      id: generateId(),
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@company.com',
      phone: '+1-555-0103',
      position: 'Marketing Specialist',
      departmentId: departments[2].id,
      salary: '65000',
      hireDate: '2023-06-10',
      status: 'active'
    },
    {
      id: generateId(),
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@company.com',
      phone: '+1-555-0104',
      position: 'Financial Analyst',
      departmentId: departments[3].id,
      salary: '70000',
      hireDate: '2022-11-05',
      status: 'active'
    },
    {
      id: generateId(),
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@company.com',
      phone: '+1-555-0105',
      position: 'Junior Developer',
      departmentId: departments[0].id,
      salary: '60000',
      hireDate: '2023-09-01',
      status: 'active'
    }
  ];

  // Sample attendance
  const attendance: Attendance[] = employees.map(emp => ({
    id: generateId(),
    employeeId: emp.id,
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '17:30',
    status: 'present',
    hoursWorked: 8.5
  }));

  // Sample activities
  const activities: Activity[] = [
    {
      id: generateId(),
      type: 'login',
      title: 'Employee logged in',
      description: 'User successfully logged into the system',
      entityType: 'employee',
      entityId: employees[0].id,
      userId: employees[0].id,
      timestamp: new Date().toISOString()
    },
    {
      id: generateId(),
      type: 'update',
      title: 'Updated employee profile',
      description: 'Employee profile information was updated',
      entityType: 'employee',
      entityId: employees[2].id,
      userId: employees[1].id,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  // Store sample data if not already present
  if (!localStorage.getItem(STORAGE_KEYS.departments)) {
    setStorageItem(STORAGE_KEYS.departments, departments);
  }
  if (!localStorage.getItem(STORAGE_KEYS.employees)) {
    setStorageItem(STORAGE_KEYS.employees, employees);
  }
  if (!localStorage.getItem(STORAGE_KEYS.attendance)) {
    setStorageItem(STORAGE_KEYS.attendance, attendance);
  }
  if (!localStorage.getItem(STORAGE_KEYS.activities)) {
    setStorageItem(STORAGE_KEYS.activities, activities);
  }
  if (!localStorage.getItem(STORAGE_KEYS.payroll)) {
    setStorageItem(STORAGE_KEYS.payroll, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.performance)) {
    setStorageItem(STORAGE_KEYS.performance, []);
  }
};

// API simulation functions
export const localStorageAPI = {
  // Dashboard metrics
  getDashboardMetrics: () => {
    const employees = getStorageItem<Employee>(STORAGE_KEYS.employees);
    const attendance = getStorageItem<Attendance>(STORAGE_KEYS.attendance);
    const departments = getStorageItem<Department>(STORAGE_KEYS.departments);
    const today = new Date().toISOString().split('T')[0];

    const activeToday = attendance.filter(a => a.date === today && a.status === 'present').length;
    const attendanceRate = employees.length > 0 ? Math.round((activeToday / employees.length) * 100) : 0;

    // Calculate department distribution
    const departmentDistribution = departments.map(dept => ({
      name: dept.name,
      count: employees.filter(emp => emp.departmentId === dept.id).length
    }));

    // Mock attendance trend for last 7 days
    const attendanceTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        rate: Math.floor(Math.random() * 20) + 80 // 80-100% attendance
      };
    }).reverse();

    return {
      totalEmployees: employees.length,
      activeToday,
      pendingLeaves: 3,
      openPositions: 2,
      attendanceRate,
      departmentDistribution,
      attendanceTrend
    };
  },

  // Employees
  getEmployees: () => getStorageItem<Employee>(STORAGE_KEYS.employees),
  createEmployee: (employee: Omit<Employee, 'id'>) => {
    const employees = getStorageItem<Employee>(STORAGE_KEYS.employees);
    const newEmployee = { ...employee, id: generateId() };
    employees.push(newEmployee);
    setStorageItem(STORAGE_KEYS.employees, employees);
    return newEmployee;
  },
  updateEmployee: (id: string, updates: Partial<Employee>) => {
    const employees = getStorageItem<Employee>(STORAGE_KEYS.employees);
    const index = employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...updates };
      setStorageItem(STORAGE_KEYS.employees, employees);
      return employees[index];
    }
    throw new Error('Employee not found');
  },
  deleteEmployee: (id: string) => {
    const employees = getStorageItem<Employee>(STORAGE_KEYS.employees);
    const filtered = employees.filter(emp => emp.id !== id);
    setStorageItem(STORAGE_KEYS.employees, filtered);
  },

  // Departments
  getDepartments: () => getStorageItem<Department>(STORAGE_KEYS.departments),
  createDepartment: (department: Omit<Department, 'id'>) => {
    const departments = getStorageItem<Department>(STORAGE_KEYS.departments);
    const newDepartment = { ...department, id: generateId() };
    departments.push(newDepartment);
    setStorageItem(STORAGE_KEYS.departments, departments);
    return newDepartment;
  },

  // Attendance
  getAttendance: (params?: { date?: string; employeeId?: string }) => {
    let attendance = getStorageItem<Attendance>(STORAGE_KEYS.attendance);
    if (params?.date) {
      attendance = attendance.filter(a => a.date === params.date);
    }
    if (params?.employeeId) {
      attendance = attendance.filter(a => a.employeeId === params.employeeId);
    }
    return attendance;
  },
  createAttendance: (attendance: Omit<Attendance, 'id'>) => {
    const attendanceList = getStorageItem<Attendance>(STORAGE_KEYS.attendance);
    const newAttendance = { ...attendance, id: generateId() };
    attendanceList.push(newAttendance);
    setStorageItem(STORAGE_KEYS.attendance, attendanceList);
    return newAttendance;
  },

  // Payroll
  getPayroll: (params?: { month?: number; year?: number }) => {
    let payroll = getStorageItem<Payroll>(STORAGE_KEYS.payroll);
    if (params?.month && params?.year) {
      payroll = payroll.filter(p => p.month === params.month && p.year === params.year);
    }
    return payroll;
  },
  createPayroll: (payroll: Omit<Payroll, 'id'>) => {
    const payrollList = getStorageItem<Payroll>(STORAGE_KEYS.payroll);
    const newPayroll = { ...payroll, id: generateId() };
    payrollList.push(newPayroll);
    setStorageItem(STORAGE_KEYS.payroll, payrollList);
    return newPayroll;
  },

  // Performance
  getPerformance: (params?: { year?: number }) => {
    let performance = getStorageItem<Performance>(STORAGE_KEYS.performance);
    if (params?.year) {
      performance = performance.filter(p => p.year === params.year);
    }
    return performance;
  },
  createPerformance: (performance: Omit<Performance, 'id'>) => {
    const performanceList = getStorageItem<Performance>(STORAGE_KEYS.performance);
    const newPerformance = { ...performance, id: generateId() };
    performanceList.push(newPerformance);
    setStorageItem(STORAGE_KEYS.performance, performanceList);
    return newPerformance;
  },

  // Activities
  getActivities: () => getStorageItem<Activity>(STORAGE_KEYS.activities),
  createActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const activities = getStorageItem<Activity>(STORAGE_KEYS.activities);
    const newActivity = {
      ...activity,
      id: generateId(),
      timestamp: new Date().toISOString()
    };
    activities.unshift(newActivity); // Add to beginning
    setStorageItem(STORAGE_KEYS.activities, activities.slice(0, 50)); // Keep only 50 latest
    return newActivity;
  },

  // Jobs - New methods to be added here
  getJobs: () => getStorageItem<any>(STORAGE_KEYS.jobs), // Assuming 'any' for Job type, replace with actual type if available
  createJob: (job: any) => { // Assuming 'any' for Job type
    const jobs = getStorageItem<any>(STORAGE_KEYS.jobs);
    const newJob = { ...job, id: generateId() };
    jobs.push(newJob);
    setStorageItem(STORAGE_KEYS.jobs, jobs);
    return newJob;
  },
  updateJob: (id: string, updates: any) => { // Assuming 'any' for Job type
    const jobs = getStorageItem<any>(STORAGE_KEYS.jobs);
    const index = jobs.findIndex((j: { id: string }) => j.id === id);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates };
      setStorageItem(STORAGE_KEYS.jobs, jobs);
      return jobs[index];
    }
    throw new Error('Job not found');
  },
  deleteJob: (id: string) => {
    const jobs = getStorageItem<any>(STORAGE_KEYS.jobs);
    const filtered = jobs.filter((j: { id: string }) => j.id !== id);
    setStorageItem(STORAGE_KEYS.jobs, filtered);
  }
};

// Initialize data on import
initializeSampleData();