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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">HR Reports</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Generate and download comprehensive HR reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            15 Reports Available
          </Badge>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">26</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">352</p>
              </div>
              <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payroll Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leave Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">43</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
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
            </div>
            
            <Button variant="outline" size="sm" className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
            
            <Button variant="outline" className="ml-auto bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-200 dark:border-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Bulk Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-t-lg">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  {report.title}
                </CardTitle>
                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardDescription className="mb-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {report.description}
                </CardDescription>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>Records: {report.recordCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Last: {report.lastGenerated}</span>
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    onClick={() => handleGenerateReport(report.id)}
                  >
                    <FileText className="mr-2 h-3 w-3" />
                    Generate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleDownloadReport(report.id)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>

                <Badge 
                  variant="secondary" 
                  className={`capitalize text-xs px-2 py-1 ${
                    report.category === 'payroll' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    report.category === 'attendance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    report.category === 'employee' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                    report.category === 'compliance' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}
                >
                  {report.category}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Footer */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Need Help with Reports?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Contact HR support for custom report requests or data analysis assistance.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" className="bg-white dark:bg-gray-800">
              <FileText className="mr-2 h-4 w-4" />
              Documentation
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}