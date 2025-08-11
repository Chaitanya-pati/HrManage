
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Search, Calendar, Filter, Eye, Users } from "lucide-react";
import SalarySlip from "@/components/payroll/salary-slip";

const apiRequest = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  position: string;
  department?: { name: string };
}

interface PayrollRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: string;
  netSalary: string;
  status: string;
  [key: string]: any;
}

export default function PayslipsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayslip, setSelectedPayslip] = useState<{ payroll: PayrollRecord; employee: Employee } | null>(null);
  const [showPayslipDialog, setShowPayslipDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    queryFn: () => apiRequest("/api/employees"),
  });

  // Fetch payroll data
  const { data: payrollData = [], isLoading } = useQuery<PayrollRecord[]>({
    queryKey: ["/api/payroll", selectedMonth, selectedYear],
    queryFn: () => apiRequest(`/api/payroll?month=${selectedMonth}&year=${selectedYear}`),
  });

  // Generate months array
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Generate years array (current year ± 5)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Helper functions
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  const getEmployee = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId);
  };

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

  // Filter payroll data based on search and status
  const filteredPayrollData = useMemo(() => {
    return payrollData.filter(payroll => {
      const employee = getEmployee(payroll.employeeId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : '';
      const employeeId = employee?.employeeId || '';
      
      const matchesSearch = searchTerm === '' || 
        employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || payroll.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [payrollData, searchTerm, statusFilter, employees]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredPayrollData.length;
    const processed = filteredPayrollData.filter(p => p.status === 'processed').length;
    const pending = filteredPayrollData.filter(p => p.status === 'pending').length;
    const totalAmount = filteredPayrollData.reduce((sum, p) => sum + parseFloat(p.netSalary || '0'), 0);
    
    return { total, processed, pending, totalAmount };
  }, [filteredPayrollData]);

  // View payslip
  const viewPayslip = (payroll: PayrollRecord) => {
    const employee = getEmployee(payroll.employeeId);
    if (employee) {
      setSelectedPayslip({ payroll, employee });
      setShowPayslipDialog(true);
    }
  };

  // Bulk generate payslips mutation
  const generateAllPayslipsMutation = useMutation({
    mutationFn: async () => {
      const processedPayrolls = filteredPayrollData.filter(p => p.status === 'processed');
      
      for (const payroll of processedPayrolls) {
        await apiRequest("/api/salary-slips", {
          method: "POST",
          body: JSON.stringify({
            payrollId: payroll.id,
            employeeId: payroll.employeeId,
            slipNumber: `SLP-${payroll.id.slice(-6)}-${payroll.month}-${payroll.year}`,
            payPeriod: `${months.find(m => m.value === payroll.month)?.label} ${payroll.year}`,
          }),
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All payslips generated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/salary-slips"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate payslips",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payslip Management</h1>
          <p className="text-gray-600">Generate and manage employee payslips</p>
        </div>
        <Button 
          onClick={() => generateAllPayslipsMutation.mutate()}
          disabled={generateAllPayslipsMutation.isPending || stats.processed === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate All Payslips
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-purple-600">₹{stats.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Employee</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status Filter</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payslips Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Payslips for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading payslips...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Employee ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Position</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Net Salary</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrollData.length > 0 ? (
                    filteredPayrollData.map((payroll) => {
                      const employee = getEmployee(payroll.employeeId);
                      return (
                        <tr key={payroll.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getEmployeeName(payroll.employeeId)}&size=32`}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full"
                              />
                              <span className="font-medium">{getEmployeeName(payroll.employeeId)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{employee?.employeeId || 'N/A'}</td>
                          <td className="py-3 px-4">{employee?.position || 'N/A'}</td>
                          <td className="py-3 px-4 font-semibold">₹{parseFloat(payroll.netSalary).toLocaleString()}</td>
                          <td className="py-3 px-4">{getStatusBadge(payroll.status)}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewPayslip(payroll)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium">No payslips found</p>
                        <p className="text-sm">No payroll data available for the selected period</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payslip Preview Dialog */}
      <Dialog open={showPayslipDialog} onOpenChange={setShowPayslipDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Salary Slip - {selectedPayslip?.employee ? `${selectedPayslip.employee.firstName} ${selectedPayslip.employee.lastName}` : ''} 
              ({months.find(m => m.value === selectedPayslip?.payroll.month)?.label} {selectedPayslip?.payroll.year})
            </DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <SalarySlip 
              payroll={selectedPayslip.payroll} 
              employee={selectedPayslip.employee}
              onDownload={() => {
                toast({
                  title: "PDF Downloaded",
                  description: "Salary slip has been downloaded successfully!",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
