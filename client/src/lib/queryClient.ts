import { QueryClient } from "@tanstack/react-query";
import { localStorageAPI } from "./localStorage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const path = queryKey[0] as string;
        
        // Route API calls to localStorage
        if (path.startsWith('/api/dashboard/metrics')) {
          return localStorageAPI.getDashboardMetrics();
        }
        if (path.startsWith('/api/departments')) {
          return localStorageAPI.getDepartments();
        }
        if (path.startsWith('/api/employees/')) {
          const id = path.split('/').pop();
          return localStorageAPI.getEmployee(id!);
        }
        if (path.startsWith('/api/employees')) {
          return localStorageAPI.getEmployees();
        }
        if (path.startsWith('/api/attendance')) {
          const filters = queryKey[1] as any;
          return localStorageAPI.getAttendance(filters);
        }
        if (path.startsWith('/api/leaves')) {
          const filters = queryKey[1] as any;
          return localStorageAPI.getLeaves(filters);
        }
        if (path.startsWith('/api/payroll')) {
          const filters = queryKey[1] as any;
          return localStorageAPI.getPayroll(filters);
        }
        if (path.startsWith('/api/performance')) {
          const filters = queryKey[1] as any;
          return localStorageAPI.getPerformance(filters);
        }
        if (path.startsWith('/api/activities')) {
          return localStorageAPI.getActivities();
        }
        if (path.startsWith('/api/shifts')) {
          return localStorageAPI.getShifts();
        }
        if (path.startsWith('/api/job-openings')) {
          return localStorageAPI.getJobOpenings();
        }
        if (path.startsWith('/api/job-applications')) {
          const jobId = queryKey[1] as string;
          return localStorageAPI.getJobApplications(jobId);
        }

        // Fallback for unknown routes
        throw new Error(`Unknown endpoint: ${path}`);
      },
    },
  },
});

export { queryClient };

// Helper function for making API requests with different HTTP methods
export async function apiRequest(url: string, options: RequestInit = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;

  // Route POST/PUT/DELETE calls to localStorage
  if (url.startsWith('/api/departments') && method === 'POST') {
    const department = await localStorageAPI.createDepartment(body);
    await localStorageAPI.createActivity({
      type: "department",
      title: "New department created",
      description: `${department.name} department was created`,
      entityType: "department",
      entityId: department.id,
      userId: null,
    });
    return department;
  }
  
  if (url.startsWith('/api/departments/') && method === 'PUT') {
    const id = url.split('/').pop()!;
    return localStorageAPI.updateDepartment(id, body);
  }
  
  if (url.startsWith('/api/departments/') && method === 'DELETE') {
    const id = url.split('/').pop()!;
    return { success: await localStorageAPI.deleteDepartment(id) };
  }

  if (url.startsWith('/api/employees') && method === 'POST') {
    const employee = await localStorageAPI.createEmployee(body);
    await localStorageAPI.createActivity({
      type: "employee",
      title: "New employee added",
      description: `${employee.firstName} ${employee.lastName} was added to the system`,
      entityType: "employee",
      entityId: employee.id,
      userId: null,
    });
    return employee;
  }
  
  if (url.startsWith('/api/employees/') && method === 'PUT') {
    const id = url.split('/').pop()!;
    return localStorageAPI.updateEmployee(id, body);
  }
  
  if (url.startsWith('/api/employees/') && method === 'DELETE') {
    const id = url.split('/').pop()!;
    return { success: await localStorageAPI.deleteEmployee(id) };
  }

  if (url.startsWith('/api/attendance') && method === 'POST') {
    return localStorageAPI.createAttendance(body);
  }

  if (url.startsWith('/api/leaves') && method === 'POST') {
    const leave = await localStorageAPI.createLeave(body);
    await localStorageAPI.createActivity({
      type: "leave",
      title: "Leave request submitted",
      description: `Leave request for ${body.type} submitted`,
      entityType: "leave",
      entityId: leave.id,
      userId: null,
    });
    return leave;
  }
  
  if (url.startsWith('/api/leaves/') && method === 'PUT') {
    const id = url.split('/').pop()!;
    return localStorageAPI.updateLeave(id, body);
  }

  if (url.startsWith('/api/shifts') && method === 'POST') {
    return localStorageAPI.createShift(body);
  }

  if (url.startsWith('/api/payroll') && method === 'POST') {
    return localStorageAPI.createPayroll(body);
  }

  if (url.startsWith('/api/performance') && method === 'POST') {
    return localStorageAPI.createPerformance(body);
  }

  if (url.startsWith('/api/job-openings') && method === 'POST') {
    return localStorageAPI.createJobOpening(body);
  }

  if (url.startsWith('/api/job-applications') && method === 'POST') {
    return localStorageAPI.createJobApplication(body);
  }

  throw new Error(`Unknown API endpoint: ${method} ${url}`);
}