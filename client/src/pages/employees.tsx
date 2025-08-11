import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import EmployeeList from "@/components/employees/employee-list";
import EmployeeForm from "@/components/employees/employee-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Employees() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["/api/employees"],
    staleTime: 0, // Force fresh data
    gcTime: 0, // Don't cache
  });

  // Debug: Log what the query returns
  console.log('Query returned employees:', employees?.length, employees);

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  return (
    <div className="flex h-screen bg-hrms-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Employee Management" 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-neutral">Employees</h1>
                <p className="text-gray-600">Manage your organization's workforce</p>
              </div>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2"
                data-testid="add-employee-header-button"
              >
                <Plus size={16} />
                <span>Add Employee</span>
              </Button>
            </div>

            {showAddForm ? (
              <EmployeeForm 
                onCancel={() => setShowAddForm(false)}
                onSuccess={() => setShowAddForm(false)}
              />
            ) : (
              <EmployeeList employees={employees as any[]} isLoading={isLoading} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
