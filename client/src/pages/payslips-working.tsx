import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Eye, Users, DollarSign, CheckCircle, Calendar } from "lucide-react";

// Mock data for demonstration while database is being fixed
const mockEmployees = [
  {
    id: "1",
    employeeId: "EMP001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    position: "Software Engineer",
    baseSalary: 75000,
    department: { name: "Engineering" }
  },
  {
    id: "2", 
    employeeId: "EMP002",
    firstName: "Sarah",
    lastName: "Smith",
    email: "sarah.smith@company.com",
    position: "HR Manager",
    baseSalary: 65000,
    department: { name: "Human Resources" }
  },
  {
    id: "3",
    employeeId: "EMP003", 
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@company.com",
    position: "Senior Developer",
    baseSalary: 85000,
    department: { name: "Engineering" }
  }
];

const mockPayslips = [
  {
    id: "1",
    employeeId: "1",
    payPeriod: "2025-01",
    basicSalary: 75000,
    hra: 30000,
    transportAllowance: 2000,
    medicalAllowance: 1500,
    specialAllowance: 7500,
    grossSalary: 116000,
    pfDeduction: 1800,
    esiDeduction: 0,
    professionalTax: 200,
    tds: 8333,
    totalDeductions: 10333,
    netSalary: 105667,
    workingDays: 30,
    paidDays: 26,
    leaveDays: 4,
    status: "generated",
    createdAt: "2025-01-10"
  }
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function PayslipsWorkingPage() {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payslips, setPayslips] = useState(mockPayslips);
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();

  const generatePayslipData = (emp: any, month: number, year: number) => {
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
      id: Date.now().toString(),
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
      status: "generated",
      createdAt: new Date().toISOString().split('T')[0]
    };
  };

  const handleGeneratePayslip = async () => {
    if (!selectedEmployee) {
      toast({ title: "Error", description: "Please select an employee", variant: "destructive" });
      return;
    }

    const emp = mockEmployees.find(e => e.id === selectedEmployee);
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

    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newPayslip = generatePayslipData(emp, selectedMonth, selectedYear);
      setPayslips(prev => [...prev, newPayslip]);
      setIsGenerating(false);
      
      toast({ 
        title: "Success", 
        description: "Payslip generated successfully",
      });
    }, 1000);
  };

  const handleDownloadPayslip = (payslip: any) => {
    const emp = mockEmployees.find(e => e.id === payslip.employeeId);
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

  const generatePayslipHtml = (payslip: any, emp?: any) => {
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

  // Statistics
  const stats = {
    total: payslips.length,
    thisMonth: payslips.filter(p => {
      const [year, month] = p.payPeriod.split('-');
      return parseInt(year) === selectedYear && parseInt(month) === selectedMonth;
    }).length,
    totalAmount: payslips.reduce((sum, p) => sum + (p.netSalary || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Payslip Generation System</h1>
        <p className="text-gray-600 mt-2">Complete payslip generation and management solution</p>
      </div>

      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate New Payslip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Month</Label>
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
              <Label>Year</Label>
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
                disabled={isGenerating || !selectedEmployee}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Payslip"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Payslips List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Generated Payslips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payslips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Employee</th>
                    <th className="text-left p-4">Period</th>
                    <th className="text-right p-4">Gross Salary</th>
                    <th className="text-right p-4">Net Salary</th>
                    <th className="text-center p-4">Status</th>
                    <th className="text-center p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map((payslip) => {
                    const emp = mockEmployees.find(e => e.id === payslip.employeeId);
                    const [year, month] = payslip.payPeriod.split('-');
                    const monthName = months[parseInt(month) - 1];
                    
                    return (
                      <tr key={payslip.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{emp?.firstName} {emp?.lastName}</p>
                            <p className="text-sm text-gray-500">{emp?.employeeId}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p>{monthName} {year}</p>
                          <p className="text-sm text-gray-500">{payslip.createdAt}</p>
                        </td>
                        <td className="p-4 text-right">
                          ₹{payslip.grossSalary?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-right">
                          ₹{payslip.netSalary?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant={payslip.status === 'generated' ? 'default' : 'secondary'}>
                            {payslip.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPayslip(payslip)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
    </div>
  );
}