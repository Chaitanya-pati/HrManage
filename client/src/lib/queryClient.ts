import { QueryClient } from "@tanstack/react-query";
import { localStorageAPI } from "./localStorage";

// Helper function for mutations
export const apiRequest = async (method: string, url: string, data?: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Route to appropriate localStorage function
  if (method === "POST") {
    if (url === "/api/employees") {
      return localStorageAPI.createEmployee(data);
    } else if (url === "/api/departments") {
      return localStorageAPI.createDepartment(data);
    } else if (url === "/api/attendance") {
      return localStorageAPI.createAttendance(data);
    } else if (url === "/api/payroll") {
      return localStorageAPI.createPayroll(data);
    } else if (url === "/api/performance") {
      return localStorageAPI.createPerformance(data);
    } else if (url === "/api/activities") {
      return localStorageAPI.createActivity(data);
    }
  } else if (method === "PUT" || method === "PATCH") {
    const id = url.split("/").pop();
    if (url.includes("/api/employees/") && id) {
      return localStorageAPI.updateEmployee(id, data);
    }
  } else if (method === "DELETE") {
    const id = url.split("/").pop();
    if (url.includes("/api/employees/") && id) {
      localStorageAPI.deleteEmployee(id);
      return { success: true };
    }
  }
  
  throw new Error(`Unknown API endpoint: ${method} ${url}`);
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const params = queryKey[1] as any;
        
        // Route to appropriate localStorage function
        if (url === "/api/dashboard/metrics") {
          return localStorageAPI.getDashboardMetrics();
        } else if (url === "/api/employees") {
          return localStorageAPI.getEmployees();
        } else if (url === "/api/departments") {
          return localStorageAPI.getDepartments();
        } else if (url === "/api/attendance") {
          return localStorageAPI.getAttendance(params);
        } else if (url === "/api/payroll") {
          return localStorageAPI.getPayroll(params);
        } else if (url === "/api/performance") {
          return localStorageAPI.getPerformance(params);
        } else if (url === "/api/activities") {
          return localStorageAPI.getActivities();
        }
        
        throw new Error(`Unknown endpoint: ${url}`);
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
