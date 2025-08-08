import { useState } from "react";
import { EmployeeWithDepartment } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Download } from "lucide-react";

interface EmployeeListProps {
  employees: EmployeeWithDepartment[];
  isLoading: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'on_leave':
      return 'bg-yellow-100 text-yellow-800';
    case 'inactive':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
  const name = `${firstName} ${lastName}`;
  const seed = name.toLowerCase().replace(/\s+/g, '');
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&size=64`;
};

export default function EmployeeList({ employees, isLoading }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || employee.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="employee-list">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">All Employees ({employees.length})</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
                data-testid="employee-search"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              data-testid="employee-status-filter"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button variant="outline" size="sm" data-testid="export-button">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12" data-testid="no-employees-found">
            <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first employee"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <div 
                key={employee.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                data-testid={`employee-card-${employee.id}`}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={getAvatarUrl(employee.firstName, employee.lastName)}
                    alt={`${employee.firstName} ${employee.lastName}`}
                    className="w-16 h-16 rounded-full"
                    data-testid={`employee-avatar-${employee.id}`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate" data-testid={`employee-name-${employee.id}`}>
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate" data-testid={`employee-email-${employee.id}`}>
                      {employee.email}
                    </p>
                    <p className="text-sm text-gray-600 mt-1" data-testid={`employee-position-${employee.id}`}>
                      {employee.position}
                    </p>
                    <p className="text-sm text-gray-500" data-testid={`employee-department-${employee.id}`}>
                      {employee.department?.name || 'Unassigned'}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span 
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(employee.status)}`}
                        data-testid={`employee-status-${employee.id}`}
                      >
                        {getStatusText(employee.status)}
                      </span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        data-testid={`employee-menu-${employee.id}`}
                      >
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
