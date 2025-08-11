import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import EmployeeBenefits from "@/pages/employee-benefits";
import Attendance from "@/pages/attendance";
import Payroll from "@/pages/payroll";
import AdvancedPayroll from "@/pages/AdvancedPayroll";
import PayslipGeneratorFixed from "@/components/payroll/payslip-generator-fixed";
import Payslips from "@/pages/payslips";
import Performance from "@/pages/performance";
import Organization from "@/pages/organization";
import Recruitment from "@/pages/recruitment";
import Leaves from "@/pages/leaves";
import Shifts from "./pages/shifts";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import PlaceholderPage from "@/pages/placeholder";
import NotFound from "@/pages/not-found";
import { Calendar, Shield, Receipt, GraduationCap, Star, FileText, Users } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/employees" component={Employees} />
      <Route path="/employee-benefits" component={EmployeeBenefits} />
      <Route path="/organization" component={Organization} />
      <Route path="/recruitment" component={Recruitment} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/leaves" component={Leaves} />
      <Route path="/shifts" component={Shifts} />
      <Route path="/payroll" component={Payroll} />
      <Route path="/advanced-payroll" component={AdvancedPayroll} />
      <Route path="/payslip-generator" component={PayslipGeneratorFixed} />
      <Route path="/payslips" component={Payslips} />
      <Route path="/performance" component={Performance} />
      <Route path="/benefits"
        component={() =>
          <PlaceholderPage
            title="Benefits Administration"
            subtitle="Manage employee benefits and insurance"
            icon={<Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
          />
        }
      />
      <Route path="/expenses"
        component={() =>
          <PlaceholderPage
            title="Expense Management"
            subtitle="Track and manage employee expenses"
            icon={<Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
          />
        }
      />
      <Route path="/learning"
        component={() =>
          <PlaceholderPage
            title="Learning & Development"
            subtitle="Manage training programs and development"
            icon={<GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
          />
        }
      />
      <Route path="/talent"
        component={() =>
          <PlaceholderPage
            title="Talent Management"
            subtitle="Identify and develop talent within the organization"
            icon={<Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
          />
        }
      />
      <Route path="/analytics" component={Analytics} />
      <Route path="/reports"
        component={() =>
          <PlaceholderPage
            title="Reports"
            subtitle="Generate comprehensive HR reports"
            icon={<FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
          />
        }
      />
      <Route path="/settings" component={Settings} />
      <Route path="/users"
        component={() =>
          <PlaceholderPage
            title="User Management"
            subtitle="Manage system users and permissions"
            icon={<Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
          />
        }
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;