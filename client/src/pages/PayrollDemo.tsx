import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, FileText, Users, TrendingUp, Download, Mail, CheckCircle, Clock, AlertCircle } from "lucide-react";

// Demo data for client presentation
const demoPayrollData = [
  {
    id: "1",
    employeeId: "EMP001",
    employeeName: "John Doe",
    department: "Engineering",
    position: "Senior Software Engineer",
    baseSalary: 75000,
    hra: 30000,
    conveyanceAllowance: 2400,
    medicalAllowance: 1250,
    specialAllowance: 11250,
    overtimePay: 3000,
    grossPay: 122900,
    pfDeduction: 9000,
    esiDeduction: 0,
    tdsDeduction: 3500,
    netPay: 110400,
    payrollStatus: "processed"
  },
  {
    id: "2",
    employeeId: "EMP002",
    employeeName: "Rajesh Kumar",
    department: "Sales",
    position: "Sales Manager",
    baseSalary: 65000,
    hra: 26000,
    conveyanceAllowance: 2400,
    medicalAllowance: 1250,
    specialAllowance: 9750,
    overtimePay: 0,
    grossPay: 104400,
    pfDeduction: 7800,
    esiDeduction: 0,
    tdsDeduction: 2800,
    netPay: 93800,
    payrollStatus: "processed"
  },
  {
    id: "3",
    employeeId: "EMP003",
    employeeName: "Priya Sharma",
    department: "Marketing",
    position: "Marketing Executive",
    baseSalary: 58000,
    hra: 23200,
    conveyanceAllowance: 2400,
    medicalAllowance: 1250,
    specialAllowance: 8700,
    overtimePay: 1500,
    grossPay: 95050,
    pfDeduction: 6960,
    esiDeduction: 0,
    tdsDeduction: 2400,
    netPay: 85690,
    payrollStatus: "processed"
  },
  {
    id: "4",
    employeeId: "EMP004",
    employeeName: "Amit Patel",
    department: "Engineering",
    position: "Backend Developer",
    baseSalary: 82000,
    hra: 32800,
    conveyanceAllowance: 2400,
    medicalAllowance: 1250,
    specialAllowance: 12300,
    overtimePay: 4500,
    grossPay: 135250,
    pfDeduction: 9840,
    esiDeduction: 0,
    tdsDeduction: 4200,
    netPay: 121210,
    payrollStatus: "processed"
  },
  {
    id: "5",
    employeeId: "EMP005",
    employeeName: "Sneha Gupta",
    department: "Finance",
    position: "Finance Manager",
    baseSalary: 70000,
    hra: 28000,
    conveyanceAllowance: 2400,
    medicalAllowance: 1250,
    specialAllowance: 10500,
    overtimePay: 0,
    grossPay: 112150,
    pfDeduction: 8400,
    esiDeduction: 0,
    tdsDeduction: 3200,
    netPay: 100550,
    payrollStatus: "processed"
  }
];

export default function PayrollDemo() {
  const [selectedMonth, setSelectedMonth] = useState("8");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter payroll data based on search
  const filteredPayrollData = demoPayrollData.filter((payroll) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      payroll.employeeName.toLowerCase().includes(searchLower) ||
      payroll.employeeId.toLowerCase().includes(searchLower) ||
      payroll.department.toLowerCase().includes(searchLower)
    );
  });

  // Calculate summary statistics
  const totalEmployees = demoPayrollData.length;
  const totalGrossPay = demoPayrollData.reduce((sum, p) => sum + p.grossPay, 0);
  const totalNetPay = demoPayrollData.reduce((sum, p) => sum + p.netPay, 0);
  const totalDeductions = totalGrossPay - totalNetPay;
  const processedCount = demoPayrollData.filter(p => p.payrollStatus === "processed").length;

  const generatePayslip = (employee: any) => {
    window.open(`/payslip-generator?emp=${employee.employeeId}`, '_blank');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Payroll Management</h1>
          <p className="text-muted-foreground">Comprehensive payroll processing for 2000+ employees</p>
        </div>
        <div className="flex space-x-2">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="mr-2 h-4 w-4" />
            Generate Reports
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,247</div>
            <p className="text-xs text-muted-foreground">
              {processedCount} processed, {totalEmployees - processedCount} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalGrossPay * 449).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalNetPay * 449).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              After deductions: ₹{(totalDeductions * 449).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              Payroll completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="payroll" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payroll">Payroll Processing</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Payroll Filters</CardTitle>
              <CardDescription>Filter and search payroll data</CardDescription>
            </CardHeader>
            <CardContent className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {new Date(0, i).toLocaleDateString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => window.open('/payslip-generator', '_blank')} className="bg-purple-600 hover:bg-purple-700">
                <FileText className="mr-2 h-4 w-4" />
                Payslip Generator
              </Button>
            </CardContent>
          </Card>

          {/* Payroll Table */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll Details</CardTitle>
              <CardDescription>
                {filteredPayrollData.length} employees • August 2025 • Demo Data Showing 2000+ Employee Scale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayrollData.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{payroll.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{payroll.employeeId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payroll.department}</div>
                          <div className="text-sm text-muted-foreground">{payroll.position}</div>
                        </div>
                      </TableCell>
                      <TableCell>₹{payroll.baseSalary.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>HRA: ₹{payroll.hra.toLocaleString()}</div>
                          <div>Conv: ₹{payroll.conveyanceAllowance.toLocaleString()}</div>
                          <div>Special: ₹{payroll.specialAllowance.toLocaleString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>PF: ₹{payroll.pfDeduction.toLocaleString()}</div>
                          <div>TDS: ₹{payroll.tdsDeduction.toLocaleString()}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">₹{payroll.grossPay.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-green-600">₹{payroll.netPay.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Processed
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => generatePayslip(payroll)}>
                            <FileText className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Scalable for 2000+ Employees</p>
                    <p className="text-sm text-blue-700">
                      This demo shows 5 employees. The system is optimized to handle 2000+ employees with the same performance and detailed breakdowns.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>PF Report</CardTitle>
                <CardDescription>Monthly PF compliance report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total PF Contributions:</span>
                    <span className="font-semibold">₹18,45,680</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employees Covered:</span>
                    <span className="font-semibold">2,247</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Generate PF Report
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>ESI Report</CardTitle>
                <CardDescription>Employee State Insurance report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total ESI Contributions:</span>
                    <span className="font-semibold">₹3,25,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Eligible Employees:</span>
                    <span className="font-semibold">1,847</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Generate ESI Report
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>TDS Report</CardTitle>
                <CardDescription>Tax deducted at source report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total TDS Deducted:</span>
                    <span className="font-semibold">₹12,45,750</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxpayers:</span>
                    <span className="font-semibold">2,247</span>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Generate TDS Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Engineering</span>
                    <span className="font-semibold">₹45,67,890</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sales</span>
                    <span className="font-semibold">₹32,45,670</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Marketing</span>
                    <span className="font-semibold">₹18,23,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Finance</span>
                    <span className="font-semibold">₹15,67,890</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>July 2025</span>
                    <span className="text-green-600">+8.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>June 2025</span>
                    <span className="text-green-600">+5.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>May 2025</span>
                    <span className="text-green-600">+3.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>PF Compliance</span>
                    <Badge className="bg-green-100 text-green-800">100%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ESI Compliance</span>
                    <Badge className="bg-green-100 text-green-800">100%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>TDS Compliance</span>
                    <Badge className="bg-green-100 text-green-800">100%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Configuration</CardTitle>
              <CardDescription>Manage payroll settings and configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Auto-process Payroll</h4>
                    <p className="text-sm text-muted-foreground">Automatically process payroll on the 1st of each month</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send payslips and notifications to employees</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Compliance Settings</h4>
                    <p className="text-sm text-muted-foreground">PF: 12%, ESI: 0.75%, TDS: As per slabs</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Configured</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}