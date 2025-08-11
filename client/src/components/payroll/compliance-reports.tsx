import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileBarChart, Download, Calendar, TrendingUp } from "lucide-react";
import type { ComplianceReports } from "@shared/schema";

const reportTypes = [
  { value: "pf", label: "Provident Fund (PF)" },
  { value: "esi", label: "Employee State Insurance (ESI)" },
  { value: "professional_tax", label: "Professional Tax" },
  { value: "tds", label: "Tax Deducted at Source (TDS)" },
  { value: "labor_welfare", label: "Labor Welfare Fund" },
  { value: "bonus", label: "Bonus & Gratuity" }
];

const financialYears = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return `${year}-${year + 1}`;
});

export function ComplianceReports() {
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(financialYears[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/compliance-reports", { reportType: selectedReportType, financialYear: selectedFinancialYear }],
  });

  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      return apiRequest("/api/compliance-reports", {
        method: "POST",
        body: JSON.stringify(reportData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance-reports"] });
      setIsGenerating(false);
      toast({ title: "Success", description: "Compliance report generated successfully" });
    },
    onError: () => {
      setIsGenerating(false);
      toast({ title: "Error", description: "Failed to generate compliance report", variant: "destructive" });
    },
  });

  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      toast({ title: "Error", description: "Please select a report type", variant: "destructive" });
      return;
    }

    setIsGenerating(true);

    // Generate mock compliance data based on report type and employees
    const reportData = await generateComplianceData(selectedReportType, selectedFinancialYear, employees);

    generateReportMutation.mutate({
      reportType: selectedReportType,
      financialYear: selectedFinancialYear,
      generatedBy: "admin", // This would come from auth context
      reportData: JSON.stringify(reportData),
      summary: generateReportSummary(reportData, selectedReportType)
    });
  };

  const generateComplianceData = async (reportType: string, financialYear: string, employees: any[]) => {
    // This would normally fetch real payroll data for calculations
    const mockData = {
      reportType,
      financialYear,
      generatedDate: new Date().toISOString(),
      employees: employees?.map(emp => ({
        employeeId: emp.employeeId,
        name: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        ...generateEmployeeComplianceData(reportType, emp)
      })) || []
    };

    return mockData;
  };

  const generateEmployeeComplianceData = (reportType: string, employee: any) => {
    const annualSalary = parseFloat(employee.salary || "500000");
    const monthlySalary = annualSalary / 12;

    switch (reportType) {
      case "pf":
        const pfContribution = Math.min(monthlySalary * 0.12, 1800); // 12% or max 1800
        return {
          monthlyContribution: pfContribution,
          annualContribution: pfContribution * 12,
          employerContribution: pfContribution,
          totalContribution: pfContribution * 2
        };
      
      case "esi":
        const esiContribution = monthlySalary <= 25000 ? monthlySalary * 0.0175 : 0; // 1.75% if salary <= 25k
        return {
          monthlyContribution: esiContribution,
          annualContribution: esiContribution * 12,
          employerContribution: monthlySalary <= 25000 ? monthlySalary * 0.0325 : 0,
          eligibility: monthlySalary <= 25000 ? "Eligible" : "Not Eligible"
        };
      
      case "professional_tax":
        let ptAmount = 0;
        if (monthlySalary <= 15000) ptAmount = 0;
        else if (monthlySalary <= 25000) ptAmount = 150;
        else ptAmount = 200;
        
        return {
          monthlyDeduction: ptAmount,
          annualDeduction: ptAmount * 12,
          state: "Maharashtra" // This would be dynamic
        };
      
      case "tds":
        const annualTax = Math.max(0, (annualSalary - 300000) * 0.1); // Simplified TDS calculation
        return {
          annualTax: annualTax,
          monthlyTds: annualTax / 12,
          exemptionUsed: 300000,
          taxableIncome: Math.max(0, annualSalary - 300000)
        };
      
      default:
        return {};
    }
  };

  const generateReportSummary = (reportData: any, reportType: string) => {
    const employees = reportData.employees || [];
    
    switch (reportType) {
      case "pf":
        const totalPfContribution = employees.reduce((sum: number, emp: any) => sum + (emp.annualContribution || 0), 0);
        return `Total PF Contribution: ₹${totalPfContribution.toLocaleString()} | Employees: ${employees.length}`;
      
      case "esi":
        const eligibleEmployees = employees.filter((emp: any) => emp.eligibility === "Eligible").length;
        const totalEsiContribution = employees.reduce((sum: number, emp: any) => sum + (emp.annualContribution || 0), 0);
        return `Total ESI Contribution: ₹${totalEsiContribution.toLocaleString()} | Eligible Employees: ${eligibleEmployees}`;
      
      case "professional_tax":
        const totalPtDeduction = employees.reduce((sum: number, emp: any) => sum + (emp.annualDeduction || 0), 0);
        return `Total Professional Tax: ₹${totalPtDeduction.toLocaleString()} | Employees: ${employees.length}`;
      
      case "tds":
        const totalTds = employees.reduce((sum: number, emp: any) => sum + (emp.annualTax || 0), 0);
        return `Total TDS: ₹${totalTds.toLocaleString()} | Employees: ${employees.length}`;
      
      default:
        return `Report generated for ${employees.length} employees`;
    }
  };

  const handleDownloadReport = (report: ComplianceReports) => {
    // This would generate and download the actual report file
    const reportData = JSON.parse(report.reportData);
    const csvContent = generateCsvContent(reportData, report.reportType);
    downloadCsv(csvContent, `${report.reportType}_${report.financialYear}.csv`);
  };

  const generateCsvContent = (reportData: any, reportType: string) => {
    const employees = reportData.employees || [];
    let headers = ["Employee ID", "Name", "Department"];
    
    switch (reportType) {
      case "pf":
        headers.push("Monthly Contribution", "Annual Contribution", "Employer Contribution");
        break;
      case "esi":
        headers.push("Monthly Contribution", "Annual Contribution", "Eligibility");
        break;
      case "professional_tax":
        headers.push("Monthly Deduction", "Annual Deduction", "State");
        break;
      case "tds":
        headers.push("Annual Tax", "Monthly TDS", "Taxable Income");
        break;
    }
    
    const csvRows = [headers.join(",")];
    
    employees.forEach((emp: any) => {
      let row = [emp.employeeId, emp.name, emp.department];
      
      switch (reportType) {
        case "pf":
          row.push(emp.monthlyContribution, emp.annualContribution, emp.employerContribution);
          break;
        case "esi":
          row.push(emp.monthlyContribution, emp.annualContribution, emp.eligibility);
          break;
        case "professional_tax":
          row.push(emp.monthlyDeduction, emp.annualDeduction, emp.state);
          break;
        case "tds":
          row.push(emp.annualTax, emp.monthlyTds, emp.taxableIncome);
          break;
      }
      
      csvRows.push(row.join(","));
    });
    
    return csvRows.join("\n");
  };

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Compliance Reports Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Generation Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="financialYear">Financial Year</Label>
              <Select value={selectedFinancialYear} onValueChange={setSelectedFinancialYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {financialYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleGenerateReport} 
                disabled={isGenerating || generateReportMutation.isPending}
                className="w-full"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          {employees && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
                <div className="text-sm text-gray-600">Total Employees</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {employees.filter((emp: any) => parseFloat(emp.salary || "0") > 15000).length}
                </div>
                <div className="text-sm text-gray-600">PT Applicable</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {employees.filter((emp: any) => parseFloat(emp.salary || "0") <= 25000).length}
                </div>
                <div className="text-sm text-gray-600">ESI Eligible</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {employees.filter((emp: any) => parseFloat(emp.salary || "0") > 300000).length}
                </div>
                <div className="text-sm text-gray-600">TDS Applicable</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading reports...</div>
          ) : reports?.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No compliance reports generated yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Financial Year</TableHead>
                  <TableHead>Generated Date</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports?.map((report: ComplianceReports) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {reportTypes.find(type => type.value === report.reportType)?.label || report.reportType}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.financialYear}</TableCell>
                    <TableCell>
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {report.summary}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}