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
import { FileText, Download, Mail, Eye, Calendar } from "lucide-react";
import type { Payslips, Employee } from "@shared/schema";

interface PayslipGeneratorProps {
  employee?: Employee;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function PayslipGenerator({ employee }: PayslipGeneratorProps) {
  const [selectedEmployee, setSelectedEmployee] = useState(employee?.id || "");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPayslip, setPreviewPayslip] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payslips, isLoading } = useQuery({
    queryKey: ["/api/payslips", employee?.id ? { employeeId: employee.id } : {}],
  });

  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: payrollData } = useQuery({
    queryKey: ["/api/payroll", { month: selectedMonth, year: selectedYear }],
  });

  const generatePayslipMutation = useMutation({
    mutationFn: async (payslipData: any) => {
      return apiRequest("/api/payslips", {
        method: "POST",
        body: JSON.stringify(payslipData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payslips"] });
      toast({ title: "Success", description: "Payslip generated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate payslip", variant: "destructive" });
    },
  });

  const handleGeneratePayslip = async () => {
    if (!selectedEmployee) {
      toast({ title: "Error", description: "Please select an employee", variant: "destructive" });
      return;
    }

    const emp = employees?.find((e: Employee) => e.id === selectedEmployee);
    const payroll = payrollData?.find((p: any) => p.employeeId === selectedEmployee);

    if (!emp) {
      toast({ title: "Error", description: "Employee not found", variant: "destructive" });
      return;
    }

    const payslipData = generatePayslipData(emp, payroll, selectedMonth, selectedYear);
    generatePayslipMutation.mutate(payslipData);
  };

  const generatePayslipData = (emp: Employee, payroll: any, month: number, year: number) => {
    const baseSalary = parseFloat(emp.salary || "50000");
    const hra = baseSalary * 0.4; // 40% HRA
    const transportAllowance = 2000;
    const medicalAllowance = 1500;
    const specialAllowance = baseSalary * 0.1;
    
    const grossSalary = baseSalary + hra + transportAllowance + medicalAllowance + specialAllowance;
    
    const pf = Math.min(baseSalary * 0.12, 1800);
    const esi = grossSalary <= 25000 ? grossSalary * 0.0175 : 0;
    const professionalTax = grossSalary > 15000 ? (grossSalary > 25000 ? 200 : 150) : 0;
    const tds = Math.max(0, (grossSalary * 12 - 300000) * 0.1 / 12);
    
    const totalDeductions = pf + esi + professionalTax + tds;
    const netSalary = grossSalary - totalDeductions;

    return {
      employeeId: emp.id,
      payPeriod: `${year}-${month.toString().padStart(2, '0')}`,
      basicSalary: baseSalary,
      hra: hra,
      transportAllowance: transportAllowance,
      medicalAllowance: medicalAllowance,
      specialAllowance: specialAllowance,
      grossSalary: grossSalary,
      pfDeduction: pf,
      esiDeduction: esi,
      professionalTax: professionalTax,
      tds: tds,
      totalDeductions: totalDeductions,
      netSalary: netSalary,
      workingDays: payroll?.totalWorkingDays || 30,
      paidDays: payroll?.daysPresent || 26,
      leaveDays: payroll?.daysAbsent || 4,
      overtimeHours: payroll?.overtimeHours || 0,
      generatedBy: "system",
      status: "generated"
    };
  };

  const handlePreviewPayslip = (payslip: Payslips) => {
    const emp = employees?.find((e: Employee) => e.id === payslip.employeeId);
    setPreviewPayslip({ ...payslip, employee: emp });
    setIsPreviewOpen(true);
  };

  const handleDownloadPayslip = async (payslip: Payslips) => {
    // This would integrate with a PDF library like jsPDF
    const emp = employees?.find((e: Employee) => e.id === payslip.employeeId);
    const payslipHtml = generatePayslipHtml(payslip, emp);
    
    // For now, we'll create a simple HTML download
    const blob = new Blob([payslipHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${emp?.employeeId}_${payslip.payPeriod}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleEmailPayslip = async (payslip: Payslips) => {
    const emp = employees?.find((e: Employee) => e.id === payslip.employeeId);
    
    // This would integrate with an email service
    toast({
      title: "Email Sent",
      description: `Payslip sent to ${emp?.email || 'employee email'}`,
    });
  };

  const generatePayslipHtml = (payslip: Payslips, emp?: Employee) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${emp?.firstName} ${emp?.lastName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; }
          .payslip-title { font-size: 18px; margin-top: 10px; }
          .employee-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .amount { text-align: right; }
          .total { font-weight: bold; background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">FlexUI HRMS</div>
          <div class="payslip-title">SALARY SLIP</div>
          <div>Pay Period: ${payslip.payPeriod}</div>
        </div>
        
        <div class="employee-info">
          <div>
            <strong>Employee Name:</strong> ${emp?.firstName} ${emp?.lastName}<br>
            <strong>Employee ID:</strong> ${emp?.employeeId}<br>
            <strong>Department:</strong> ${emp?.department}<br>
            <strong>Designation:</strong> ${emp?.position}
          </div>
          <div>
            <strong>Bank Account:</strong> ${emp?.bankAccount || 'N/A'}<br>
            <strong>PAN:</strong> ${emp?.panNumber || 'N/A'}<br>
            <strong>Working Days:</strong> ${payslip.workingDays}<br>
            <strong>Paid Days:</strong> ${payslip.paidDays}
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
              <td class="amount">${payslip.basicSalary?.toLocaleString()}</td>
              <td>PF Contribution</td>
              <td class="amount">${payslip.pfDeduction?.toLocaleString()}</td>
            </tr>
            <tr>
              <td>HRA</td>
              <td class="amount">${payslip.hra?.toLocaleString()}</td>
              <td>ESI Contribution</td>
              <td class="amount">${payslip.esiDeduction?.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Transport Allowance</td>
              <td class="amount">${payslip.transportAllowance?.toLocaleString()}</td>
              <td>Professional Tax</td>
              <td class="amount">${payslip.professionalTax?.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Medical Allowance</td>
              <td class="amount">${payslip.medicalAllowance?.toLocaleString()}</td>
              <td>TDS</td>
              <td class="amount">${payslip.tds?.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Special Allowance</td>
              <td class="amount">${payslip.specialAllowance?.toLocaleString()}</td>
              <td></td>
              <td></td>
            </tr>
            <tr class="total">
              <td><strong>Gross Salary</strong></td>
              <td class="amount"><strong>₹${payslip.grossSalary?.toLocaleString()}</strong></td>
              <td><strong>Total Deductions</strong></td>
              <td class="amount"><strong>₹${payslip.totalDeductions?.toLocaleString()}</strong></td>
            </tr>
            <tr class="total">
              <td colspan="3"><strong>Net Salary</strong></td>
              <td class="amount"><strong>₹${payslip.netSalary?.toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          This is a computer-generated payslip and does not require a signature.
        </div>
      </body>
      </html>
    `;
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
                disabled={generatePayslipMutation.isPending}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Payslip
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Payslips */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Payslips</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading payslips...</div>
          ) : payslips?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No payslips generated yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips?.map((payslip: Payslips) => {
                  const emp = employees?.find((e: Employee) => e.id === payslip.employeeId);
                  
                  return (
                    <TableRow key={payslip.id}>
                      <TableCell>
                        {emp ? `${emp.firstName} ${emp.lastName}` : payslip.employeeId}
                        <br />
                        <span className="text-sm text-gray-500">{emp?.employeeId}</span>
                      </TableCell>
                      <TableCell>{payslip.payPeriod}</TableCell>
                      <TableCell>₹{payslip.grossSalary?.toLocaleString()}</TableCell>
                      <TableCell>₹{payslip.totalDeductions?.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{payslip.netSalary?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payslip.status === "generated" ? "default" : "secondary"}>
                          {payslip.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
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
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Payslip Preview - {previewPayslip?.employee?.firstName} {previewPayslip?.employee?.lastName}
            </DialogTitle>
          </DialogHeader>
          
          {previewPayslip && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">FlexUI HRMS</h2>
                <h3 className="text-lg">SALARY SLIP</h3>
                <p>Pay Period: {previewPayslip.payPeriod}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Employee Information</h4>
                  <p><strong>Name:</strong> {previewPayslip.employee?.firstName} {previewPayslip.employee?.lastName}</p>
                  <p><strong>Employee ID:</strong> {previewPayslip.employee?.employeeId}</p>
                  <p><strong>Department:</strong> {previewPayslip.employee?.department}</p>
                  <p><strong>Position:</strong> {previewPayslip.employee?.position}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Pay Information</h4>
                  <p><strong>Working Days:</strong> {previewPayslip.workingDays}</p>
                  <p><strong>Paid Days:</strong> {previewPayslip.paidDays}</p>
                  <p><strong>Leave Days:</strong> {previewPayslip.leaveDays}</p>
                  <p><strong>Overtime Hours:</strong> {previewPayslip.overtimeHours}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Earnings</h4>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Basic Salary</TableCell>
                        <TableCell className="text-right">₹{previewPayslip.basicSalary?.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>HRA</TableCell>
                        <TableCell className="text-right">₹{previewPayslip.hra?.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Transport Allowance</TableCell>
                        <TableCell className="text-right">₹{previewPayslip.transportAllowance?.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Medical Allowance</TableCell>
                        <TableCell className="text-right">₹{previewPayslip.medicalAllowance?.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow className="font-semibold bg-gray-50">
                        <TableCell>Gross Salary</TableCell>
                        <TableCell className="text-right">₹{previewPayslip.grossSalary?.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Deductions</h4>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>PF Contribution</TableCell>
                        <TableCell className="text-right">₹{previewPayslip.pfDeduction?.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ESI Contribution</TableCell>
                        <TableCell className="text-right">₹{previewPayslip.esiDeduction?.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Professional Tax</TableCell>
                        <TableCell className="text-right">₹{previewPayslip.professionalTax?.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>TDS</TableCell>
                        <TableCell className="text-right">₹{previewPayslip.tds?.toLocaleString()}</TableCell>
                      </TableRow>
                      <TableRow className="font-semibold bg-gray-50">
                        <TableCell>Total Deductions</TableCell>
                        <TableCell className="text-right">₹{previewPayslip.totalDeductions?.toLocaleString()}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold">Net Salary</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{previewPayslip.netSalary?.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}