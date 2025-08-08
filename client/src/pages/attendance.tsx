import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users } from "lucide-react";

export default function Attendance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: attendance, isLoading } = useQuery({
    queryKey: ["/api/attendance", { startDate: selectedDate, endDate: selectedDate }],
  });

  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
  });

  return (
    <div className="flex h-screen bg-hrms-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Time & Attendance" 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral">Attendance Tracking</h1>
                <p className="text-gray-600">Monitor and manage employee attendance</p>
              </div>
              <Button data-testid="mark-attendance-button">
                <Clock size={16} className="mr-2" />
                Mark Attendance
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Present Today</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {attendance?.length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">On Time</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {attendance?.filter(a => a.status === "present").length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Late</p>
                      <p className="text-2xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Absent</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {employees ? employees.filter(emp => emp.status === "active").length - (attendance?.length || 0) : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Daily Attendance</CardTitle>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-auto"
                      data-testid="date-picker"
                    />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40" data-testid="department-filter">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading attendance data...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Check In</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Check Out</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Hours</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance && attendance.length > 0 ? (
                          attendance.map((record) => {
                            const employee = employees?.find(emp => emp.id === record.employeeId);
                            return (
                              <tr key={record.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-3">
                                    <img
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee?.firstName}${employee?.lastName}&size=32`}
                                      alt="Avatar"
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                      <p className="font-medium">{employee?.firstName} {employee?.lastName}</p>
                                      <p className="text-sm text-gray-500">{employee?.position}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                                </td>
                                <td className="py-3 px-4">
                                  {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                                </td>
                                <td className="py-3 px-4">{record.hoursWorked || '0'} hrs</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {record.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <button className="text-gray-400 hover:text-gray-600">
                                    <i className="fas fa-ellipsis-h"></i>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500">
                              No attendance records found for {selectedDate}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
