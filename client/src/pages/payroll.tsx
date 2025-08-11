import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DollarSign, FileText, TrendingUp, Users, Calculator, CreditCard, BarChart3, Settings } from "lucide-react";
import type { Payroll, Employee } from "@shared/schema";
import { SalaryEditor } from "@/components/payroll/salary-editor";
import { TdsCalculator } from "@/components/payroll/tds-calculator";
import { LoanAdvanceTracker } from "@/components/payroll/loan-advance-tracker";
import { ComplianceReports } from "@/components/payroll/compliance-reports";
import { PayslipGenerator } from "@/components/payroll/payslip-generator";

export default function PayrollPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
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
      const activeEmployees = employees?.filter((emp: Employee) => emp.status === "active") || [];
      
      for (const employee of activeEmployees) {
        const baseSalary = parseFloat(employee.salary || "0");
        const allowances = baseSalary * 0.2; // 20% allowances
        const deductions = baseSalary * 0.15; // 15% deductions (tax, etc.)
        const netSalary = baseSalary + allowances - deductions;

        const grossPay = baseSalary + (baseSalary * 0.1) + 1500 + 1000;
        const netPay = grossPay - (baseSalary * 0.15);
        
        await apiRequest("/api/payroll", {
          method: "POST",
          body: JSON.stringify({
            employeeId: employee.id,
            month: selectedMonth,
            year: selectedYear,
            payPeriodStart: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
            payPeriodEnd: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`,
            baseSalary: baseSalary.toString(),
            grossPay: grossPay.toString(),
            netPay: netPay.toString(),
            allowances: (baseSalary * 0.2).toString(),
            deductions: (baseSalary * 0.15).toString(),
            payrollStatus: "processed"
          }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      toast({
        title: "Success!",
        description: "Payroll has been run successfully!",
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
          title="Advanced Payroll Management" 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral">Advanced Payroll Management</h1>
                <p className="text-gray-600">Comprehensive payroll processing with salary editor, TDS calculation, and compliance reporting</p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-32">
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
                  <SelectTrigger className="w-24">
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
              </div>
            </div>

            {/* Advanced Payroll Features Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="salary-editor" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Salary Editor
                </TabsTrigger>
                <TabsTrigger value="tds-calculator" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  TDS Calculator
                </TabsTrigger>
                <TabsTrigger value="loans-advances" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Loans & Advances
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Compliance
                </TabsTrigger>
                <TabsTrigger value="payslips" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Payslips
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Payroll Overview</h2>
                  <Button 
                    onClick={() => processPayrollMutation.mutate()}
                    disabled={processPayrollMutation.isPending}
                  >
                    <DollarSign size={16} className="mr-2" />
                    {processPayrollMutation.isPending ? "Processing..." : "Process Payroll"}
                  </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-primary" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{totalPayroll.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Processed</p>
                          <p className="text-2xl font-bold text-gray-900">{processedCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Pending</p>
                          <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Avg Salary</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{payrollData && payrollData.length > 0 ? Math.round(totalPayroll / payrollData.length).toLocaleString() : '0'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payroll Processing Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payroll Processing</CardTitle>
                    <CardDescription>Process payroll for all employees for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex space-x-4">
                    <Button
                      onClick={() => processPayrollMutation.mutate()}
                      disabled={processPayrollMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processPayrollMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Process Payroll
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/payslip-generator', '_blank')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Payslip Generator
                    </Button>
                  </CardContent>
                </Card>

                {/* Employee Selection for Advanced Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Employee for Advanced Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={selectedEmployee?.id || ""}
                      onValueChange={(value) => {
                        const emp = employees?.find((e: Employee) => e.id === value);
                        setSelectedEmployee(emp || null);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an employee to manage salary, TDS, loans etc." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees?.map((emp: Employee) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeId}) - {emp.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Simple Payroll Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Payroll Summary - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
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
                          </div>
                        ))}
                      </div>
                    ) : payrollData && payrollData.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Base Salary</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Net Salary</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payrollData.map((payroll: Payroll) => (
                              <tr key={payroll.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div className="font-medium">
                                    {getEmployeeName(payroll.employeeId)}
                                  </div>
                                </td>
                                <td className="py-3 px-4">₹{parseFloat(payroll.baseSalary).toLocaleString()}</td>
                                <td className="py-3 px-4 font-semibold">₹{parseFloat(payroll.netSalary).toLocaleString()}</td>
                                <td className="py-3 px-4">{getStatusBadge(payroll.status)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        No payroll data found for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="salary-editor">
                {selectedEmployee ? (
                  <SalaryEditor employee={selectedEmployee} />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">Please select an employee from the Overview tab to manage their salary components.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="tds-calculator">
                {selectedEmployee ? (
                  <TdsCalculator employee={selectedEmployee} />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">Please select an employee from the Overview tab to calculate their TDS.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="loans-advances">
                <LoanAdvanceTracker employee={selectedEmployee || undefined} />
              </TabsContent>

              <TabsContent value="compliance">
                <ComplianceReports />
              </TabsContent>

              <TabsContent value="payslips">
                <PayslipGenerator employee={selectedEmployee || undefined} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
