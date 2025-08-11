import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { FileText, Download, Calendar, Users, Clock, TrendingUp, AlertTriangle, DollarSign, PieChart, BarChart3 } from "lucide-react";
import { format } from "date-fns";

interface ReportItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: any;
  lastGenerated?: string;
  recordCount?: number;
}

const reportCategories = [
  { value: "all", label: "All Reports" },
  { value: "payroll", label: "Payroll Reports" },
  { value: "attendance", label: "Attendance Reports" },
  { value: "employee", label: "Employee Reports" },
  { value: "compliance", label: "Compliance Reports" },
  { value: "analytics", label: "Analytics Reports" }
];

const availableReports: ReportItem[] = [
  {
    id: "monthly-payslips",
    title: "Monthly Payslips Report",
    description: "Detailed salary breakdown for all employees including allowances, deductions, and net pay",
    category: "payroll",
    icon: DollarSign,
    lastGenerated: "2025-08-11",
    recordCount: 26
  },
  {
    id: "attendance-summary",
    title: "Attendance Summary Report",
    description: "Daily attendance tracking with present/absent status and working hours",
    category: "attendance", 
    icon: Clock,
    lastGenerated: "2025-08-11",
    recordCount: 780
  },
  {
    id: "late-coming-report",
    title: "Late Coming Analysis",
    description: "Employees with frequent late arrivals and pattern analysis",
    category: "attendance",
    icon: AlertTriangle,
    lastGenerated: "2025-08-11",
    recordCount: 45
  },
  {
    id: "employee-directory",
    title: "Employee Directory",
    description: "Complete employee information with contact details and department wise listing",
    category: "employee",
    icon: Users,
    lastGenerated: "2025-08-11",
    recordCount: 26
  },
  {
    id: "salary-structure",
    title: "Salary Structure Analysis",
    description: "Department wise salary distribution and grade wise compensation analysis",
    category: "payroll",
    icon: BarChart3,
    lastGenerated: "2025-08-11",
    recordCount: 26
  },
  {
    id: "leave-balance",
    title: "Leave Balance Report",
    description: "Employee wise leave balance showing available, used, and remaining days",
    category: "employee",
    icon: Calendar,
    lastGenerated: "2025-08-11",
    recordCount: 26
  },
  {
    id: "overtime-analysis",
    title: "Overtime Analysis Report", 
    description: "Overtime hours tracking with cost analysis and department wise breakdown",
    category: "attendance",
    icon: TrendingUp,
    lastGenerated: "2025-08-11",
    recordCount: 89
  },
  {
    id: "pf-esi-compliance",
    title: "PF & ESI Compliance Report",
    description: "Statutory compliance report for PF and ESI contributions",
    category: "compliance",
    icon: FileText,
    lastGenerated: "2025-08-11",
    recordCount: 26
  },
  {
    id: "tds-deduction",
    title: "TDS Deduction Report",
    description: "Tax deducted at source report with employee wise TDS calculations",
    category: "compliance",
    icon: FileText,
    lastGenerated: "2025-08-11",
    recordCount: 18
  },
  {
    id: "department-analytics",
    title: "Department Analytics",
    description: "Department wise employee strength, costs, and performance metrics",
    category: "analytics",
    icon: PieChart,
    lastGenerated: "2025-08-11",
    recordCount: 6
  },
  {
    id: "new-joiners",
    title: "New Joiners Report",
    description: "Recently joined employees with probation status and confirmation dates",
    category: "employee",
    icon: Users,
    lastGenerated: "2025-08-11",
    recordCount: 8
  },
  {
    id: "exit-analysis",
    title: "Employee Exit Analysis",
    description: "Resigned/terminated employees with exit interview feedback",
    category: "employee",
    icon: TrendingUp,
    lastGenerated: "2025-08-11",
    recordCount: 3
  },
  {
    id: "performance-ratings",
    title: "Performance Ratings Report",
    description: "Annual performance ratings with goal achievement and appraisal data",
    category: "analytics",
    icon: BarChart3,
    lastGenerated: "2025-08-11",
    recordCount: 26
  },
  {
    id: "training-compliance",
    title: "Training Compliance Report",
    description: "Employee training completion status and pending certifications",
    category: "compliance",
    icon: FileText,
    lastGenerated: "2025-08-11",
    recordCount: 26
  },
  {
    id: "cost-center-analysis",
    title: "Cost Center Analysis",
    description: "Cost center wise employee allocation and budget utilization",
    category: "analytics",
    icon: DollarSign,
    lastGenerated: "2025-08-11",
    recordCount: 12
  }
];

export default function Reports() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['/api/reports/data'],
    enabled: false // We'll generate this data
  });

  const filteredReports = selectedCategory === "all" 
    ? availableReports 
    : availableReports.filter(report => report.category === selectedCategory);

  const handleGenerateReport = async (reportId: string) => {
    // Navigate to report detail page
    window.location.href = `/reports/${reportId}`;
  };

  const handleDownloadReport = async (reportId: string) => {
    // This will download the generated report
    console.log(`Downloading report: ${reportId}`);
    // TODO: Implement report download functionality
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">HR Reports</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">15 Reports Available</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {reportCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Date range picker temporarily disabled */}
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
        </Button>
        
        <Button variant="outline" className="ml-auto">
          <Download className="mr-2 h-4 w-4" />
          Bulk Download
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {report.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {report.description}
                </CardDescription>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>Records: {report.recordCount}</span>
                  <span>Last: {report.lastGenerated}</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleGenerateReport(report.id)}
                  >
                    <FileText className="mr-2 h-3 w-3" />
                    Generate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadReport(report.id)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>

                <Badge 
                  variant="secondary" 
                  className="mt-2 capitalize"
                >
                  {report.category}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              Across 5 categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">
              Across all reports
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employees Covered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26</div>
            <p className="text-xs text-muted-foreground">
              100% coverage
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}