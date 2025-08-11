import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DollarSign, FileText, TrendingUp, Users } from "lucide-react";
import type { Payroll, EmployeeWithDepartment } from "@shared/schema";

export default function PayrollPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payrollData, isLoading: payrollLoading } = useQuery({
    queryKey: ["/api/payroll", { month: selectedMonth, year: selectedYear }],
  });

  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const processPayrollMutation = useMutation({
    mutationFn: async () => {
      const activeEmployees = employees?.filter(emp => emp.status === "active") || [];
      
      for (const employee of activeEmployees) {
        const baseSalary = parseFloat(employee.salary || "0");
        const allowances = baseSalary * 0.2; // 20% allowances
        const deductions = baseSalary * 0.15; // 15% deductions (tax, etc.)
        const netSalary = baseSalary + allowances - deductions;

        await apiRequest("/api/payroll", {
          method: "POST",
          body: JSON.stringify({
            employeeId: employee.id,
            month: selectedMonth,
            year: selectedYear,
            totalWorkingDays: 30,
            daysPresent: 25,
            daysAbsent: 5,
            baseSalary: baseSalary,
            hra: baseSalary * 0.1,
            conveyanceAllowance: 1500,
            medicalAllowance: 1000,
            grossSalary: baseSalary + (baseSalary * 0.1) + 1500 + 1000,
            totalDeductions: baseSalary * 0.15,
            netSalary: (baseSalary + (baseSalary * 0.1) + 1500 + 1000) - (baseSalary * 0.15),
            status: "processed"
          }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Payroll processed",
        description: "Payroll has been successfully processed for all employees.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payroll",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge className="bg-green-100 text-green-800">Processed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees?.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  const getEmployeePosition = (employeeId: string) => {
    const employee = employees?.find(emp => emp.id === employeeId);
    return employee?.position || 'N/A';
  };

  const totalPayroll = payrollData?.reduce((sum, payroll) => sum + parseFloat(payroll.netSalary), 0) || 0;
  const processedCount = payrollData?.filter(p => p.status === 'processed').length || 0;
  const pendingCount = payrollData?.filter(p => p.status === 'pending').length || 0;

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="flex h-screen bg-hrms-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Payroll Processing" 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral">Payroll Management</h1>
                <p className="text-gray-600">Process and manage employee payroll</p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-32" data-testid="month-selector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-24" data-testid="year-selector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={() => processPayrollMutation.mutate()}
                  disabled={processPayrollMutation.isPending}
                  data-testid="process-payroll-button"
                >
                  <DollarSign size={16} className="mr-2" />
                  {processPayrollMutation.isPending ? "Processing..." : "Process Payroll"}
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="total-payroll">
                        ${totalPayroll.toLocaleString()}
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
                      <p className="text-sm font-medium text-gray-600">Processed</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="processed-count">
                        {processedCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="pending-count">
                        {pendingCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Salary</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="average-salary">
                        ${payrollData && payrollData.length > 0 ? Math.round(totalPayroll / payrollData.length).toLocaleString() : '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payroll Table */}
            <Card className="card-hover transition-all duration-200">
              <CardHeader>
                <CardTitle>
                  Payroll Details - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payrollLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 py-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full" data-testid="payroll-table">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Base Salary</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Allowances</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Deductions</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Net Salary</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollData && payrollData.length > 0 ? (
                          payrollData.map((payroll) => (
                            <tr key={payroll.id} className="border-b hover:bg-gray-50" data-testid={`payroll-row-${payroll.id}`}>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getEmployeeName(payroll.employeeId)}&size=32`}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full"
                                  />
                                  <div>
                                    <p className="font-medium" data-testid={`employee-name-${payroll.id}`}>
                                      {getEmployeeName(payroll.employeeId)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {getEmployeePosition(payroll.employeeId)}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4" data-testid={`base-salary-${payroll.id}`}>
                                ${parseFloat(payroll.baseSalary).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-green-600" data-testid={`allowances-${payroll.id}`}>
                                +${parseFloat(payroll.allowances || "0").toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-red-600" data-testid={`deductions-${payroll.id}`}>
                                -${parseFloat(payroll.deductions || "0").toLocaleString()}
                              </td>
                              <td className="py-3 px-4 font-semibold" data-testid={`net-salary-${payroll.id}`}>
                                ${parseFloat(payroll.netSalary).toLocaleString()}
                              </td>
                              <td className="py-3 px-4" data-testid={`status-${payroll.id}`}>
                                {getStatusBadge(payroll.status)}
                              </td>
                              <td className="py-3 px-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  data-testid={`generate-payslip-${payroll.id}`}
                                >
                                  <FileText size={16} />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-500" data-testid="no-payroll-data">
                              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-lg font-medium">No payroll data found</p>
                              <p className="text-sm">Process payroll to generate salary records for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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
