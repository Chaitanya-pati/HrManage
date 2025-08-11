import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, FileText, Users, TrendingUp, Download, Mail, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function AdvancedPayroll() {
  const [selectedMonth, setSelectedMonth] = useState("8");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch payroll data
  const { data: payrollData = [], isLoading } = useQuery({
    queryKey: ["/api/payroll", selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/payroll?month=${selectedMonth}&year=${selectedYear}`);
      return response.json();
    },
  });

  // Fetch employees for joining payroll data
  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  // Combine payroll with employee data
  const enrichedPayrollData = payrollData.map((payroll: any) => {
    const employee = employees.find((emp: any) => emp.id === payroll.employeeId);
    return {
      ...payroll,
      employee,
      allowancesData: payroll.allowances ? JSON.parse(payroll.allowances) : {},
      deductionsData: payroll.deductions ? JSON.parse(payroll.deductions) : {},
    };
  });

  // Filter payroll data based on search
  const filteredPayrollData = enrichedPayrollData.filter((payroll: any) => {
    if (!payroll.employee) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      payroll.employee.firstName?.toLowerCase().includes(searchLower) ||
      payroll.employee.lastName?.toLowerCase().includes(searchLower) ||
      payroll.employee.employeeId?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate summary statistics
  const totalEmployees = enrichedPayrollData.length;
  const totalGrossPay = enrichedPayrollData.reduce((sum: number, p: any) => sum + Number(p.grossPay || 0), 0);
  const totalNetPay = enrichedPayrollData.reduce((sum: number, p: any) => sum + Number(p.netPay || 0), 0);
  const totalDeductions = totalGrossPay - totalNetPay;
  const processedCount = enrichedPayrollData.filter((p: any) => p.payrollStatus === "processed").length;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Loading payroll data...</span>
        </div>
      </div>
    );
  }

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
            <div className="text-2xl font-bold">{totalEmployees.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">₹{totalGrossPay.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">₹{totalNetPay.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              After deductions: ₹{totalDeductions.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((processedCount / totalEmployees) * 100)}%</div>
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
          <div className="flex justify-end mb-4">
            <Button 
              onClick={() => window.open('/payslip-generator', '_blank')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <FileText className="mr-2 h-4 w-4" />
              Open Payslip Generator
            </Button>
          </div>
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
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Send Payslips
              </Button>
            </CardContent>
          </Card>

          {/* Payroll Table */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Payroll Details</CardTitle>
              <CardDescription>
                {filteredPayrollData.length} employees • {new Date(0, Number(selectedMonth) - 1).toLocaleDateString('default', { month: 'long' })} {selectedYear}
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
                  {filteredPayrollData.slice(0, 10).map((payroll: any) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{payroll.employee?.firstName} {payroll.employee?.lastName}</div>
                          <div className="text-sm text-muted-foreground">{payroll.employee?.employeeId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{payroll.employee?.position}</TableCell>
                      <TableCell>₹{Number(payroll.baseSalary).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>HRA: ₹{payroll.allowancesData?.hra || 0}</div>
                          <div>Conv: ₹{payroll.allowancesData?.conveyance || 0}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>PF: ₹{payroll.deductionsData?.pf || 0}</div>
                          <div>Tax: ₹{payroll.deductionsData?.tax || 0}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">₹{Number(payroll.grossPay).toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-green-600">₹{Number(payroll.netPay).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={payroll.payrollStatus === "processed" ? "default" : "secondary"}
                          className={payroll.payrollStatus === "processed" ? "bg-green-100 text-green-800" : ""}
                        >
                          {payroll.payrollStatus === "processed" ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Processed
                            </>
                          ) : (
                            <>
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
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
              {filteredPayrollData.length > 10 && (
                <div className="mt-4 text-center">
                  <Button variant="outline">
                    Load More ({filteredPayrollData.length - 10} remaining)
                  </Button>
                </div>
              )}
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
                <Button className="w-full" variant="outline">
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
                <Button className="w-full" variant="outline">
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
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Generate TDS Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Analytics</CardTitle>
              <CardDescription>Insights and trends for payroll data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Comprehensive payroll analytics including cost trends, department-wise analysis, and compliance metrics.
                </p>
              </div>
            </CardContent>
          </Card>
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
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Send payslips and notifications to employees</p>
                  </div>
                  <Button variant="outline" size="sm">Setup</Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Compliance Settings</h4>
                    <p className="text-sm text-muted-foreground">Configure PF, ESI, and tax calculation rules</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}