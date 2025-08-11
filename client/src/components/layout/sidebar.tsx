import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  FileText,
  Home,
  Settings,
  Users,
  TrendingUp,
  Building2,
  UserCheck,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    section: "Dashboard",
    items: [
      { icon: "fas fa-chart-line", label: "Dashboard", path: "/" },
    ]
  },
  {
    section: "Employee Management",
    items: [
      { icon: "fas fa-user", label: "Employee Profiles", path: "/employees" },
      { icon: "fas fa-sitemap", label: "Organization Structure", path: "/organization" },
      { icon: "fas fa-user-plus", label: "Recruitment", path: "/recruitment" },
    ]
  },
  {
    section: "Time & Attendance",
    items: [
      { icon: "fas fa-clock", label: "Time Tracking", path: "/attendance" },
      { icon: "fas fa-calendar-alt", label: "Leave Management", path: "/leaves" },
      { icon: "fas fa-business-time", label: "Shift Management", path: "/shifts" },
    ]
  },
  {
    section: "Payroll & Benefits",
    items: [
      { icon: "fas fa-dollar-sign", label: "Payroll Processing", path: "/payroll" },
      { icon: "fas fa-shield-alt", label: "Benefits Administration", path: "/benefits" },
      { icon: "fas fa-receipt", label: "Expense Management", path: "/expenses" },
    ]
  },
  {
    section: "Performance",
    items: [
      { icon: "fas fa-chart-bar", label: "Performance Reviews", path: "/performance" },
      { icon: "fas fa-graduation-cap", label: "Learning & Development", path: "/learning" },
      { icon: "fas fa-star", label: "Talent Management", path: "/talent" },
    ]
  },
  {
    section: "Analytics",
    items: [
      { icon: "fas fa-analytics", label: "HR Analytics", path: "/analytics" },
      { icon: "fas fa-file-alt", label: "Reports", path: "/reports" },
    ]
  },
  {
    section: "System",
    items: [
      { icon: "fas fa-cog", label: "Settings", path: "/settings" },
      { icon: "fas fa-users-cog", label: "User Management", path: "/users" },
    ]
  }
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}

      <aside 
        className={cn(
          "w-72 bg-surface border-r border-gray-200 flex-shrink-0 sidebar-transition z-50",
          "fixed md:relative inset-y-0 left-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        data-testid="sidebar"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral">FlexUI</h1>
              <p className="text-sm text-gray-500">HR Management System</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-full pb-20" data-testid="sidebar-nav">
          {menuItems.map((section) => (
            <div key={section.section} className="space-y-1">
              {section.section !== "Dashboard" && (
                <h3 className="px-3 pt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.section}
                </h3>
              )}
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    location === item.path
                      ? "text-primary bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onClose()}
                >
                  <i className={`${item.icon} w-5 h-5 mr-3`}></i>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}