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

  // Biometric devices data
  const { data: biometricDevices = [] } = useQuery({
    queryKey: ["/api/biometric-devices"],
  });

  // Enhanced metrics for biometric tracking
  const biometricVerifications = attendance.filter(att => 
    att.fingerprintVerified || att.faceRecognitionVerified
  ).length;
  
  const deviceSyncStatus = biometricDevices.filter(device => device.isActive).length;

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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Biometric Verified</p>
                      <p className="text-2xl font-bold text-gray-900">{biometricVerifications}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex space-x-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        </div>
                        <span className="text-xs text-gray-500">{deviceSyncStatus} devices online</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Biometric Devices Status */}
            {view === "overview" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Biometric Devices Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {biometricDevices.length > 0 ? biometricDevices.map((device) => (
                      <div key={device.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{device.deviceName}</h4>
                          <Badge variant={device.isActive ? "default" : "destructive"}>
                            {device.isActive ? "Online" : "Offline"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{device.location}</p>
                        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                          <span>{device.deviceType}</span>
                          {device.lastSyncTime && (
                            <>
                              <span>•</span>
                              <span>Last sync: {new Date(device.lastSyncTime).toLocaleTimeString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-3 text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No biometric devices configured</p>
                        <Button variant="outline" className="mt-2" size="sm">
                          Configure Devices
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

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
                    <CardTitle>Daily Attendance - Biometric & Field Work Tracking</CardTitle>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-auto"
                        data-testid="date-picker"
                      />
                      <Select defaultValue="all">
                        <SelectTrigger className="w-40" data-testid="work-location-filter">
                          <SelectValue placeholder="Work Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="field">Field Work</SelectItem>
                          <SelectItem value="client_site">Client Site</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <TableHead>Shift & Location</TableHead>
                          <TableHead>Biometric Entry/Exit</TableHead>
                          <TableHead>Check In/Out</TableHead>
                          <TableHead>Work Details</TableHead>
                          <TableHead>Hours & OT</TableHead>
                          <TableHead>Status & Approvals</TableHead>
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
                                  <div className="text-sm space-y-1">
                                    <Badge variant="outline" className="text-xs">
                                      {record.shiftId ? "Regular" : "Flexible"}
                                    </Badge>
                                    <div className="flex items-center space-x-1">
                                      {record.workLocation === 'field' ? (
                                        <>
                                          <MapPin className="h-3 w-3 text-orange-500" />
                                          <span className="text-xs">Field Work</span>
                                        </>
                                      ) : record.workLocation === 'client_site' ? (
                                        <>
                                          <MapPin className="h-3 w-3 text-purple-500" />
                                          <span className="text-xs">Client Site</span>
                                        </>
                                      ) : record.isRemote ? (
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
                                    {record.clientSite && (
                                      <p className="text-xs text-gray-500">Client: {record.clientSite}</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm space-y-1">
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        Entry: {record.gateEntry ? new Date(record.gateEntry).toLocaleTimeString() : '-'}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        Exit: {record.gateExit ? new Date(record.gateExit).toLocaleTimeString() : '-'}
                                      </span>
                                    </div>
                                    {record.biometricId && (
                                      <div className="flex items-center space-x-1">
                                        {record.fingerprintVerified && <Badge variant="secondary" className="text-xs">Fingerprint</Badge>}
                                        {record.faceRecognitionVerified && <Badge variant="secondary" className="text-xs">Face</Badge>}
                                      </div>
                                    )}
                                    {record.biometricDeviceIn && (
                                      <p className="text-xs text-gray-500">Device: {record.biometricDeviceIn.slice(-4)}</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm space-y-1">
                                    <div className="flex items-center space-x-1">
                                      <span className={isLate ? "text-orange-600" : "text-green-600"}>
                                        In: {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-'}
                                      </span>
                                      {record.lateArrival && (
                                        <Badge variant="destructive" className="text-xs">Late</Badge>
                                      )}
                                    </div>
                                    <div>
                                      Out: {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                                      {record.earlyDeparture && (
                                        <Badge variant="destructive" className="text-xs ml-1">Early</Badge>
                                      )}
                                    </div>
                                    {(record.lateArrivalMinutes > 0 || record.earlyDepartureMinutes > 0) && (
                                      <p className="text-xs text-orange-600">
                                        {record.lateArrivalMinutes > 0 && `Late: ${record.lateArrivalMinutes}min`}
                                        {record.lateArrivalMinutes > 0 && record.earlyDepartureMinutes > 0 && ', '}
                                        {record.earlyDepartureMinutes > 0 && `Early: ${record.earlyDepartureMinutes}min`}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm space-y-1">
                                    <div>
                                      <span className="font-medium">Regular: </span>
                                      <span>{parseFloat(record.regularHours || 0).toFixed(1)}h</span>
                                    </div>
                                    {parseFloat(record.fieldWorkHours || 0) > 0 && (
                                      <div>
                                        <span className="font-medium">Field: </span>
                                        <span className="text-orange-600">{parseFloat(record.fieldWorkHours).toFixed(1)}h</span>
                                      </div>
                                    )}
                                    {parseFloat(record.nightShiftHours || 0) > 0 && (
                                      <div>
                                        <span className="font-medium">Night: </span>
                                        <span className="text-purple-600">{parseFloat(record.nightShiftHours).toFixed(1)}h</span>
                                      </div>
                                    )}
                                    {parseFloat(record.travelDistance || 0) > 0 && (
                                      <p className="text-xs text-gray-500">
                                        Travel: {record.travelDistance}km ({record.travelMode})
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm space-y-1">
                                    <div>
                                      <span className="font-medium">Total: </span>
                                      <span>{record.hoursWorked || '0'}h</span>
                                    </div>
                                    {parseFloat(record.overtimeHours || 0) > 0 && (
                                      <div className="space-y-1">
                                        <div>
                                          <span className="font-medium">OT: </span>
                                          <span className="text-orange-600">{record.overtimeHours}h</span>
                                          {!record.overtimeApproved && (
                                            <Badge variant="outline" className="text-xs ml-1">Pending</Badge>
                                          )}
                                        </div>
                                        {parseFloat(record.preShiftOvertime || 0) > 0 && (
                                          <p className="text-xs text-gray-500">Pre: {record.preShiftOvertime}h</p>
                                        )}
                                        {parseFloat(record.postShiftOvertime || 0) > 0 && (
                                          <p className="text-xs text-gray-500">Post: {record.postShiftOvertime}h</p>
                                        )}
                                        {parseFloat(record.weekendOvertime || 0) > 0 && (
                                          <p className="text-xs text-gray-500">Weekend: {record.weekendOvertime}h</p>
                                        )}
                                        {parseFloat(record.holidayOvertime || 0) > 0 && (
                                          <p className="text-xs text-gray-500">Holiday: {record.holidayOvertime}h</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <Badge 
                                      variant={
                                        record.status === 'present' ? 'default' :
                                        record.status === 'late' ? 'secondary' :
                                        record.status === 'half_day' ? 'outline' :
                                        'destructive'
                                      }
                                    >
                                      {record.status}
                                    </Badge>
                                    
                                    <div className="flex flex-wrap gap-1">
                                      {record.isFieldWork && (
                                        <Badge 
                                          variant={record.fieldWorkApproved ? "default" : "outline"} 
                                          className="text-xs"
                                        >
                                          Field {record.fieldWorkApproved ? '✓' : '⏳'}
                                        </Badge>
                                      )}
                                      
                                      {parseFloat(record.overtimeHours || 0) > 0 && (
                                        <Badge 
                                          variant={record.overtimeApproved ? "default" : "outline"} 
                                          className="text-xs"
                                        >
                                          OT {record.overtimeApproved ? '✓' : '⏳'}
                                        </Badge>
                                      )}
                                      
                                      {record.geoFenceStatus === 'outside' && (
                                        <Badge variant="destructive" className="text-xs">
                                          Outside Zone
                                        </Badge>
                                      )}
                                      
                                      {record.fingerprintVerified && record.faceRecognitionVerified && (
                                        <Badge variant="secondary" className="text-xs">
                                          Bio Verified
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
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
