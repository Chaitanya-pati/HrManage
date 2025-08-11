import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Download, Mail, Eye, Calendar, Users, DollarSign, CheckCircle } from "lucide-react";

interface PayslipData {
  id: string;
  employeeId: string;
  payPeriod: string;
  basicSalary: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  grossSalary: number;
  pfDeduction: number;
  esiDeduction: number;
  professionalTax: number;
  tds: number;
  totalDeductions: number;
  netSalary: number;
  workingDays: number;
  paidDays: number;
  leaveDays: number;
  overtimeHours: number;
  status: string;
  generatedBy: string;
  createdAt: string;
}

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  baseSalary: number;
  department?: { name: string };
}

interface PayslipGeneratorProps {
  employee?: Employee;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function PayslipGeneratorFixed({ employee }: PayslipGeneratorProps) {
  const [selectedEmployee, setSelectedEmployee] = useState(employee?.id || "");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPayslip, setPreviewPayslip] = useState<PayslipData & { employee: Employee } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    queryFn: () => apiRequest("/api/employees"),
  });

  // Fetch payslips
  const { data: payslips = [], isLoading: payslipsLoading } = useQuery<PayslipData[]>({
    queryKey: ["/api/payslips", selectedMonth, selectedYear],
    queryFn: () => apiRequest(`/api/payslips?month=${selectedMonth}&year=${selectedYear}`),
  });

  // Generate payslip mutation
  const generatePayslipMutation = useMutation({
    mutationFn: async (payslipData: any) => {
      return apiRequest("/api/payslips", {
        method: "POST",
        body: JSON.stringify(payslipData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payslips"] });
      toast({ 
        title: "Success", 
        description: "Payslip generated successfully",
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to generate payslip", 
        variant: "destructive" 
      });
    },
  });

  const handleGeneratePayslip = async () => {
    if (!selectedEmployee) {
      toast({ title: "Error", description: "Please select an employee", variant: "destructive" });
      return;
    }

    const emp = employees?.find((e: Employee) => e.id === selectedEmployee);

    if (!emp) {
      toast({ title: "Error", description: "Employee not found", variant: "destructive" });
      return;
    }

    // Check if payslip already exists for this period
    const existingPayslip = payslips.find(p => 
      p.employeeId === selectedEmployee && 
      p.payPeriod === `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`
    );

    if (existingPayslip) {
      toast({ 
        title: "Warning", 
        description: "Payslip already exists for this period", 
        variant: "destructive" 
      });
      return;
    }

    const payslipData = generatePayslipData(emp, selectedMonth, selectedYear);
    generatePayslipMutation.mutate(payslipData);
  };

  const generatePayslipData = (emp: Employee, month: number, year: number) => {
    const baseSalary = emp.baseSalary || 50000;
    const hra = baseSalary * 0.4; // 40% HRA
    const transportAllowance = 2000;
    const medicalAllowance = 1500;
    const specialAllowance = baseSalary * 0.1;
    
    const grossSalary = baseSalary + hra + transportAllowance + medicalAllowance + specialAllowance;
    
    // Calculate deductions
    const pf = Math.min(baseSalary * 0.12, 1800);
    const esi = grossSalary <= 25000 ? grossSalary * 0.0175 : 0;
    const professionalTax = grossSalary > 15000 ? (grossSalary > 25000 ? 200 : 150) : 0;
    const tds = Math.max(0, (grossSalary * 12 - 300000) * 0.1 / 12);
    
    const totalDeductions = pf + esi + professionalTax + tds;
    const netSalary = grossSalary - totalDeductions;

    return {
      employeeId: emp.id,
      payPeriod: `${year}-${month.toString().padStart(2, '0')}`,
      basicSalary: Math.round(baseSalary),
      hra: Math.round(hra),
      transportAllowance: Math.round(transportAllowance),
      medicalAllowance: Math.round(medicalAllowance),
      specialAllowance: Math.round(specialAllowance),
      grossSalary: Math.round(grossSalary),
      pfDeduction: Math.round(pf),
      esiDeduction: Math.round(esi),
      professionalTax: Math.round(professionalTax),
      tds: Math.round(tds),
      totalDeductions: Math.round(totalDeductions),
      netSalary: Math.round(netSalary),
      workingDays: 30,
      paidDays: 26,
      leaveDays: 4,
      overtimeHours: 0,
      generatedBy: "system",
      status: "generated"
    };
  };

  const handlePreviewPayslip = (payslip: PayslipData) => {
    const emp = employees?.find((e: Employee) => e.id === payslip.employeeId);
    if (emp) {
      setPreviewPayslip({ ...payslip, employee: emp });
      setIsPreviewOpen(true);
    }
  };

  const handleDownloadPayslip = async (payslip: PayslipData) => {
    const emp = employees?.find((e: Employee) => e.id === payslip.employeeId);
    const payslipHtml = generatePayslipHtml(payslip, emp);
    
    const blob = new Blob([payslipHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${emp?.employeeId}_${payslip.payPeriod}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: "Payslip download has been initiated",
    });
  };

  const handleEmailPayslip = async (payslip: PayslipData) => {
    const emp = employees?.find((e: Employee) => e.id === payslip.employeeId);
    
    toast({
      title: "Email Feature",
      description: `Email integration would send payslip to ${emp?.email || 'employee email'}`,
    });
  };

  const generatePayslipHtml = (payslip: PayslipData, emp?: Employee) => {
    const monthName = months[parseInt(payslip.payPeriod.split('-')[1]) - 1];
    const year = payslip.payPeriod.split('-')[0];
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${emp?.firstName} ${emp?.lastName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #333; }
          .payslip-title { font-size: 20px; margin: 10px 0; color: #666; }
          .employee-info { display: flex; justify-content: space-between; margin: 20px 0; }
          .employee-info div { flex: 1; }
          .section { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px 8px; text-align: left; border: 1px solid #ddd; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .amount { text-align: right; font-family: monospace; }
          .total { font-weight: bold; background-color: #e9ecef; }
          .net-salary { background-color: #d4edda; color: #155724; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">FlexUI HRMS</div>
          <div class="payslip-title">SALARY SLIP</div>
          <div>Pay Period: ${monthName} ${year}</div>
        </div>
        
        <div class="employee-info">
          <div>
            <strong>Employee Name:</strong> ${emp?.firstName} ${emp?.lastName}<br>
            <strong>Employee ID:</strong> ${emp?.employeeId}<br>
            <strong>Email:</strong> ${emp?.email}<br>
            <strong>Position:</strong> ${emp?.position}
          </div>
          <div>
            <strong>Department:</strong> ${emp?.department?.name || 'N/A'}<br>
            <strong>Working Days:</strong> ${payslip.workingDays}<br>
            <strong>Paid Days:</strong> ${payslip.paidDays}<br>
            <strong>Leave Days:</strong> ${payslip.leaveDays}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Earnings</th>
              <th class="amount">Amount (₹)</th>
              <th>Deductions</th>
              <th class="amount">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td class="amount">${payslip.basicSalary?.toLocaleString('en-IN')}</td>
              <td>PF Contribution</td>
              <td class="amount">${payslip.pfDeduction?.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>HRA</td>
              <td class="amount">${payslip.hra?.toLocaleString('en-IN')}</td>
              <td>ESI Contribution</td>
              <td class="amount">${payslip.esiDeduction?.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Transport Allowance</td>
              <td class="amount">${payslip.transportAllowance?.toLocaleString('en-IN')}</td>
              <td>Professional Tax</td>
              <td class="amount">${payslip.professionalTax?.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Medical Allowance</td>
              <td class="amount">${payslip.medicalAllowance?.toLocaleString('en-IN')}</td>
              <td>TDS</td>
              <td class="amount">${payslip.tds?.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>Special Allowance</td>
              <td class="amount">${payslip.specialAllowance?.toLocaleString('en-IN')}</td>
              <td></td>
              <td></td>
            </tr>
            <tr class="total">
              <td><strong>Gross Salary</strong></td>
              <td class="amount"><strong>₹${payslip.grossSalary?.toLocaleString('en-IN')}</strong></td>
              <td><strong>Total Deductions</strong></td>
              <td class="amount"><strong>₹${payslip.totalDeductions?.toLocaleString('en-IN')}</strong></td>
            </tr>
            <tr class="net-salary total">
              <td colspan="3"><strong>Net Salary</strong></td>
              <td class="amount"><strong>₹${payslip.netSalary?.toLocaleString('en-IN')}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>This is a computer-generated payslip and does not require a signature.</p>
          <p>Generated on: ${new Date().toLocaleDateString('en-IN')}</p>
        </div>
      </body>
      </html>
    `;
  };

  // Get filtered payslips for selected employee if any
  const filteredPayslips = employee 
    ? payslips.filter(p => p.employeeId === employee.id)
    : payslips;

  // Statistics
  const stats = {
    total: filteredPayslips.length,
    thisMonth: filteredPayslips.filter(p => {
      const [year, month] = p.payPeriod.split('-');
      return parseInt(year) === selectedYear && parseInt(month) === selectedMonth;
    }).length,
    totalAmount: filteredPayslips.reduce((sum, p) => sum + (p.netSalary || 0), 0)
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payslip Generator
            {employee && ` - ${employee.firstName} ${employee.lastName}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Generation Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {!employee && (
              <div>
                <Label htmlFor="employee">Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp: Employee) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="month">Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleGeneratePayslip}
                disabled={generatePayslipMutation.isPending || !selectedEmployee}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                {generatePayslipMutation.isPending ? "Generating..." : "Generate Payslip"}
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Payslips</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-xl font-bold text-green-600">{stats.thisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-purple-600">
                      ₹{stats.totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Payslips List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Generated Payslips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payslipsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPayslips.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayslips.map((payslip) => {
                  const emp = employees.find(e => e.id === payslip.employeeId);
                  const [year, month] = payslip.payPeriod.split('-');
                  const monthName = months[parseInt(month) - 1];
                  
                  return (
                    <TableRow key={payslip.id}>
                      <TableCell>
                        {emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'}
                        <br />
                        <span className="text-sm text-gray-500">{emp?.employeeId}</span>
                      </TableCell>
                      <TableCell>
                        {monthName} {year}
                      </TableCell>
                      <TableCell>
                        ₹{payslip.grossSalary?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        ₹{payslip.netSalary?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payslip.status === 'generated' ? 'default' : 'secondary'}>
                          {payslip.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewPayslip(payslip)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPayslip(payslip)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEmailPayslip(payslip)}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No payslips found</p>
              <p className="text-sm text-gray-400 mt-2">
                Generate payslips for employees using the form above
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Payslip Preview - {previewPayslip?.employee?.firstName} {previewPayslip?.employee?.lastName}
            </DialogTitle>
          </DialogHeader>
          {previewPayslip && (
            <div 
              className="space-y-4 p-4 bg-white border rounded-lg"
              dangerouslySetInnerHTML={{
                __html: generatePayslipHtml(previewPayslip, previewPayslip.employee)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}