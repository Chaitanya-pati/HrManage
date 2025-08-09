import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import TimeClock from "@/components/attendance/time-clock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Wifi, 
  WifiOff, 
  Timer, 
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle
} from "lucide-react";

export default function Attendance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<"overview" | "timeclock" | "reports">("overview");

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["/api/attendance", { startDate: selectedDate, endDate: selectedDate }],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["/api/shifts"],
  });

  // Mock current employee for demo - in real app this would come from auth
  const currentEmployee = employees[0] || {
    id: "demo-user",
    firstName: "Demo",
    lastName: "User",
    employeeId: "EMP000",
    position: "Demo Position"
  };

  const todayAttendance = attendance.find(att => 
    att.employeeId === currentEmployee.id && 
    new Date(att.date).toDateString() === new Date().toDateString()
  );

  // Calculate metrics
  const presentToday = attendance.filter(att => att.status === "present").length;
  const lateToday = attendance.filter(att => {
    if (!att.checkIn) return false;
    const checkInTime = new Date(att.checkIn);
    const expectedStart = new Date(checkInTime);
    expectedStart.setHours(9, 0, 0, 0); // Assume 9 AM start
    return checkInTime > expectedStart;
  }).length;
  const absentToday = employees.filter(emp => emp.status === "active").length - presentToday;
  const remoteToday = attendance.filter(att => att.isRemote).length;

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
                <h1 className="text-2xl font-bold text-neutral">Time & Attendance</h1>
                <p className="text-gray-600">Advanced workforce tracking with biometric integration</p>
              </div>
              <div className="flex items-center space-x-3">
                <Select value={view} onValueChange={(value: any) => setView(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="timeclock">Time Clock</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <UserCheck className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Present Today</p>
                      <p className="text-2xl font-bold text-gray-900">{presentToday}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Wifi className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-gray-500">{remoteToday} remote</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Timer className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
                      <p className="text-2xl font-bold text-gray-900">{lateToday}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <AlertCircle className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-gray-500">Gate tracked</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <UserX className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Absent</p>
                      <p className="text-2xl font-bold text-gray-900">{absentToday}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-gray-500">Auto-tracked</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Overtime Hours</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {attendance.reduce((total, att) => total + parseFloat(att.overtimeHours || 0), 0).toFixed(1)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-gray-500">Today total</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Time Clock Section */}
            {view === "timeclock" && (
              <div className="flex justify-center">
                <TimeClock employee={currentEmployee} attendance={todayAttendance} />
              </div>
            )}

            {/* Advanced Attendance Table */}
            {view === "overview" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Daily Attendance - Biometric Tracking</CardTitle>
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Shift</TableHead>
                          <TableHead>Gate Entry</TableHead>
                          <TableHead>Check In/Out</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance && attendance.length > 0 ? (
                          attendance.map((record) => {
                            const employee = employees?.find(emp => emp.id === record.employeeId);
                            const isLate = record.checkIn && new Date(record.checkIn) > new Date(`${selectedDate}T09:00:00`);
                            
                            return (
                              <TableRow key={record.id}>
                                <TableCell>
                                  <div className="flex items-center space-x-3">
                                    <img
                                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee?.firstName}${employee?.lastName}&size=32`}
                                      alt="Avatar"
                                      className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                      <p className="font-medium">{employee?.firstName} {employee?.lastName}</p>
                                      <p className="text-sm text-gray-500">{employee?.employeeId}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {record.shiftId ? "Regular" : "Flexible"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {record.gateEntry ? new Date(record.gateEntry).toLocaleTimeString() : '-'}
                                      </span>
                                    </div>
                                    {record.biometricId && (
                                      <p className="text-xs text-gray-500">ID: {record.biometricId.slice(-6)}</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm space-y-1">
                                    <div className="flex items-center space-x-1">
                                      <span className={isLate ? "text-orange-600" : "text-green-600"}>
                                        In: {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                                      </span>
                                    </div>
                                    <div>
                                      Out: {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-1">
                                    {record.isRemote ? (
                                      <>
                                        <Wifi className="h-3 w-3 text-blue-500" />
                                        <span className="text-xs">Remote</span>
                                      </>
                                    ) : (
                                      <>
                                        <MapPin className="h-3 w-3 text-green-500" />
                                        <span className="text-xs">Office</span>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div className="font-medium">{record.hoursWorked || '0'}h</div>
                                    {parseFloat(record.overtimeHours || 0) > 0 && (
                                      <div className="text-xs text-orange-600">
                                        +{record.overtimeHours}h OT
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={
                                      record.status === 'present' ? 'default' :
                                      record.status === 'late' ? 'secondary' :
                                      'destructive'
                                    }
                                  >
                                    {record.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                              No attendance records found for {selectedDate}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
