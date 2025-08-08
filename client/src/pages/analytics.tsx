import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  return (
    <div className="flex h-screen bg-hrms-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="HR Analytics" 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral">HR Analytics Dashboard</h1>
                <p className="text-gray-600">Comprehensive insights into workforce metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Workforce</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="total-workforce">
                        {employees?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="attendance-rate">
                        {metrics?.attendanceRate || 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Salary</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="avg-salary">
                        $72,000
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Turnover Rate</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="turnover-rate">
                        5.2%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="card-hover transition-all duration-200">
              <CardHeader>
                <CardTitle>Workforce Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900">Advanced Analytics Coming Soon</p>
                  <p className="text-gray-600">Detailed workforce insights and reporting tools</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}