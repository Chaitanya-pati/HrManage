import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Building, Users, UserCheck, Award, Edit, Trash2, MoreVertical } from "lucide-react";
import DepartmentForm from "@/components/organization/department-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function OrganizationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ["/api/departments"],
  });

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  const getEmployeesByDepartment = (departmentId: string) => {
    return (employees as any[])?.filter((emp: any) => emp.departmentId === departmentId) || [];
  };

  const getDepartmentHead = (departmentId: string) => {
    const deptEmployees = getEmployeesByDepartment(departmentId);
    return deptEmployees.find((emp: any) => emp.position.toLowerCase().includes('manager') || 
                               emp.position.toLowerCase().includes('head') ||
                               emp.position.toLowerCase().includes('director'));
  };

  const deleteDepartmentMutation = useMutation({
    mutationFn: async (departmentId: string) => {
      return apiRequest("DELETE", `/api/departments/${departmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({
        title: "Department Deleted",
        description: "Department has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete department",
        variant: "destructive",
      });
    },
  });

  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department);
    setShowAddForm(true);
  };

  const handleDeleteDepartment = (departmentId: string) => {
    deleteDepartmentMutation.mutate(departmentId);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingDepartment(null);
  };

  return (
    <div className="flex h-screen bg-hrms-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Organization Structure" 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Department Form Modal */}
            {showAddForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <DepartmentForm 
                  department={editingDepartment}
                  onCancel={closeForm}
                  onSuccess={closeForm}
                />
              </div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral">Organization Structure</h1>
                <p className="text-gray-600">View company organizational hierarchy and departments</p>
              </div>
              <Button 
                onClick={() => setShowAddForm(true)}
                data-testid="add-department-button"
              >
                <Building size={16} className="mr-2" />
                Add Department
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Building className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Departments</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="total-departments">
                        {departments?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Employees</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="total-employees">
                        {employees?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <UserCheck className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Department Heads</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="department-heads">
                        {departments?.filter(dept => getDepartmentHead(dept.id)).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Team Size</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="avg-team-size">
                        {departments && employees ? Math.round(employees.length / departments.length) : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Organization Chart */}
            <Card className="card-hover transition-all duration-200">
              <CardHeader>
                <CardTitle>Organizational Chart</CardTitle>
              </CardHeader>
              <CardContent>
                {departmentsLoading || employeesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 py-3">
                        <Skeleton className="h-16 w-16 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(departments as any[])?.map((department: any) => {
                      const deptEmployees = getEmployeesByDepartment(department.id);
                      const departmentHead = getDepartmentHead(department.id);
                      
                      return (
                        <Card key={department.id} className="border border-gray-200 hover:shadow-md transition-shadow" data-testid={`department-card-${department.id}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                                  <Building className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg" data-testid={`department-name-${department.id}`}>
                                    {department.name}
                                  </CardTitle>
                                  <p className="text-sm text-gray-500">{department.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" data-testid={`employee-count-${department.id}`}>
                                  {deptEmployees.length} employees
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" data-testid={`department-actions-${department.id}`}>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem 
                                      onClick={() => handleEditDepartment(department)}
                                      data-testid={`edit-department-${department.id}`}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Department
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                          onSelect={(e) => e.preventDefault()}
                                          className="text-red-600"
                                          data-testid={`delete-department-${department.id}`}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete Department
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{department.name}"? This action cannot be undone.
                                            {deptEmployees.length > 0 && (
                                              <span className="block mt-2 text-red-600">
                                                Warning: This department has {deptEmployees.length} employee(s) assigned.
                                              </span>
                                            )}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => handleDeleteDepartment(department.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                            data-testid={`confirm-delete-${department.id}`}
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {departmentHead && (
                              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-600 mb-1">Department Head</p>
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${departmentHead.firstName} ${departmentHead.lastName}&size=24`}
                                    alt="Avatar"
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <span className="font-medium" data-testid={`department-head-${department.id}`}>
                                    {departmentHead.firstName} {departmentHead.lastName}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">{departmentHead.position}</p>
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-600">Team Members</p>
                              {deptEmployees.length > 0 ? (
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                  {deptEmployees.map((employee: any) => (
                                    <div key={employee.id} className="flex items-center space-x-2 text-sm">
                                      <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.firstName} ${employee.lastName}&size=20`}
                                        alt="Avatar"
                                        className="w-5 h-5 rounded-full"
                                      />
                                      <span>{employee.firstName} {employee.lastName}</span>
                                      <span className="text-gray-500">- {employee.position}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No employees assigned</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}