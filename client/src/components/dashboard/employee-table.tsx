import { EmployeeWithDepartment } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface EmployeeTableProps {
  employees?: EmployeeWithDepartment[];
  isLoading: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return 'inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full';
    case 'on_leave':
      return 'inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full';
    case 'inactive':
      return 'inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full';
    default:
      return 'inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'on_leave':
      return 'On Leave';
    case 'inactive':
      return 'Inactive';
    default:
      return status;
  }
};

const getAvatarUrl = (firstName: string, lastName: string) => {
  // Generate consistent avatar URLs based on name
  const name = `${firstName} ${lastName}`;
  const seed = name.toLowerCase().replace(/\s+/g, '');
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&size=40`;
};

export default function EmployeeTable({ employees, isLoading }: EmployeeTableProps) {
  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-gray-200 card-hover transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-16" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 border border-gray-200 card-hover transition-all duration-200" data-testid="employee-table">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral">Employee Overview</h3>
        <div className="flex space-x-2">
          <Button 
            className="bg-primary text-white hover:bg-secondary"
            data-testid="add-employee-button"
          >
            Add Employee
          </Button>
          <Button 
            variant="outline"
            data-testid="export-employees-button"
          >
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Employee</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Department</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Position</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees && employees.length > 0 ? (
              employees.slice(0, 4).map((employee) => (
                <tr 
                  key={employee.id} 
                  className="border-b border-gray-100 hover:bg-gray-50"
                  data-testid={`employee-row-${employee.id}`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={getAvatarUrl(employee.firstName, employee.lastName)}
                        alt={`${employee.firstName} ${employee.lastName} avatar`}
                        className="w-10 h-10 rounded-full"
                        data-testid={`employee-avatar-${employee.id}`}
                      />
                      <div>
                        <p className="font-medium text-neutral" data-testid={`employee-name-${employee.id}`}>
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-gray-500" data-testid={`employee-email-${employee.id}`}>
                          {employee.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600" data-testid={`employee-department-${employee.id}`}>
                    {employee.department?.name || 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600" data-testid={`employee-position-${employee.id}`}>
                    {employee.position}
                  </td>
                  <td className="py-3 px-4">
                    <span className={getStatusBadge(employee.status)} data-testid={`employee-status-${employee.id}`}>
                      {getStatusText(employee.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      data-testid={`employee-actions-${employee.id}`}
                    >
                      <i className="fas fa-ellipsis-h"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500" data-testid="no-employees">
                  <i className="fas fa-users text-2xl mb-2"></i>
                  <p>No employees found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {employees && employees.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500" data-testid="employee-pagination-info">
            Showing 1 to {Math.min(4, employees.length)} of {employees.length} employees
          </p>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              data-testid="previous-page-button"
            >
              Previous
            </Button>
            <Button 
              size="sm"
              data-testid="next-page-button"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
