import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, FileText, Users, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface ReportDetailProps {
  reportId: string;
}

export default function ReportDetail({ reportId }: ReportDetailProps) {
  const [, navigate] = useLocation();

  const { data: reportData, isLoading } = useQuery({
    queryKey: [`/api/reports/data?reportType=${reportId}`],
    enabled: !!reportId
  });

  const getReportTitle = (id: string) => {
    const titles: Record<string, string> = {
      'monthly-payslips': 'Monthly Payslips Report',
      'attendance-summary': 'Attendance Summary Report',
      'late-coming-report': 'Late Coming Analysis',
      'employee-directory': 'Employee Directory',
      'salary-structure': 'Salary Structure Analysis',
      'leave-balance': 'Leave Balance Report',
      'overtime-analysis': 'Overtime Analysis Report',
      'pf-esi-compliance': 'PF & ESI Compliance Report',
      'tds-deduction': 'TDS Deduction Report',
      'department-analytics': 'Department Analytics',
      'new-joiners': 'New Joiners Report',
      'exit-analysis': 'Employee Exit Analysis',
      'performance-ratings': 'Performance Ratings Report',
      'training-compliance': 'Training Compliance Report',
      'cost-center-analysis': 'Cost Center Analysis'
    };
    return titles[id] || 'Report';
  };

  const renderReportContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Generating report...</p>
          </div>
        </div>
      );
    }

    if (!reportData || !Array.isArray(reportData)) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No data available for this report</p>
        </div>
      );
    }

    // Render different table structures based on report type
    switch (reportId) {
      case 'monthly-payslips':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((record: any) => (
                <TableRow key={record.id}>
                  <TableCell>{record.employeeId}</TableCell>
                  <TableCell>{record.month}/{record.year}</TableCell>
                  <TableCell>₹{parseFloat(record.baseSalary).toLocaleString()}</TableCell>
                  <TableCell>₹{parseFloat(record.grossPay).toLocaleString()}</TableCell>
                  <TableCell>₹{(parseFloat(record.pfDeduction) + parseFloat(record.esiDeduction) + parseFloat(record.taxDeductions)).toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">₹{parseFloat(record.netPay).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={record.payrollStatus === 'processed' ? 'default' : 'secondary'}>
                      {record.payrollStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'attendance-summary':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Working Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Overtime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((record: any) => (
                <TableRow key={`${record.employeeId}-${record.date}`}>
                  <TableCell>{record.employeeId}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.checkIn || 'N/A'}</TableCell>
                  <TableCell>{record.checkOut || 'N/A'}</TableCell>
                  <TableCell>{record.workingHours}h</TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'present' ? 'default' : record.status === 'late' ? 'destructive' : 'secondary'}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.overtimeHours}h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case 'employee-directory':
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((employee: any) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.departmentId}</TableCell>
                  <TableCell>{employee.hireDate}</TableCell>
                  <TableCell>
                    <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      default:
        return (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Report view for {getReportTitle(reportId)} is under development</p>
            <p className="text-sm text-gray-400 mt-2">Found {reportData.length} records</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/reports')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{getReportTitle(reportId)}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Report Metadata */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total entries
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(new Date(), 'MMM dd')}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), 'yyyy HH:mm')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26</div>
            <p className="text-xs text-muted-foreground">
              Employees
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Format</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹</div>
            <p className="text-xs text-muted-foreground">
              Indian Rupees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle>Report Data</CardTitle>
          <CardDescription>
            Detailed breakdown of {getReportTitle(reportId).toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderReportContent()}
        </CardContent>
      </Card>
    </div>
  );
}