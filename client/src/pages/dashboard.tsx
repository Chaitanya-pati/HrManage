import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import Charts from "@/components/dashboard/charts";
import RecentActivities from "@/components/dashboard/recent-activities";
import EmployeeTable from "@/components/dashboard/employee-table";
import QuickActions from "@/components/dashboard/quick-actions";
import { DashboardMetrics } from "@/lib/types";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
  });

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  return (
    <div className="flex h-screen bg-hrms-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <MetricsCards metrics={metrics} isLoading={metricsLoading} />
          
          <Charts metrics={metrics} isLoading={metricsLoading} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentActivities activities={activities} isLoading={activitiesLoading} />
            
            <div className="lg:col-span-2">
              <EmployeeTable employees={employees} isLoading={employeesLoading} />
            </div>
          </div>
          
          <QuickActions />
        </main>
      </div>
    </div>
  );
}
