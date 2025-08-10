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
  const [view, setView] = useState<"overview" | "timeclock" | "reports" | "entry">("overview");
  
  // Attendance entry form states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [clientSite, setClientSite] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [gateEntryTime, setGateEntryTime] = useState("");
  const [gateExitTime, setGateExitTime] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("present");
  const [fingerprintVerified, setFingerprintVerified] = useState(false);
  const [faceRecognitionVerified, setFaceRecognitionVerified] = useState(false);
  const [overtimeHours, setOvertimeHours] = useState("");
  const [travelDistance, setTravelDistance] = useState("");
  const [travelMode, setTravelMode] = useState("");
  const [attendanceNotes, setAttendanceNotes] = useState("");

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

  // Handler functions for attendance entry
  const handleSubmitAttendance = async () => {
    if (!selectedEmployeeId || !attendanceDate) {
      alert("Please select an employee and date");
      return;
    }

    const attendanceData = {
      employeeId: selectedEmployeeId,
      date: attendanceDate,
      checkIn: checkInTime ? new Date(`${attendanceDate}T${checkInTime}:00`) : null,
      checkOut: checkOutTime ? new Date(`${attendanceDate}T${checkOutTime}:00`) : null,
      gateEntry: gateEntryTime ? `${attendanceDate}T${gateEntryTime}:00` : null,
      gateExit: gateExitTime ? `${attendanceDate}T${gateExitTime}:00` : null,
      status: attendanceStatus,
      shiftId: selectedShiftId || null,
      workLocation: workLocation || "office",
      clientSite: clientSite || null,
      isRemote: workLocation === "remote",
      isFieldWork: workLocation === "field",
      fingerprintVerified,
      faceRecognitionVerified,
      biometricId: fingerprintVerified || faceRecognitionVerified ? `BIO_${Date.now()}` : null,
      overtimeHours: overtimeHours || "0",
      travelDistance: travelDistance || null,
      travelMode: travelMode || null,
      notes: attendanceNotes || null,
      hoursWorked: calculateHoursWorked(),
    };

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      });

      if (response.ok) {
        alert("Attendance saved successfully!");
        handleClearForm();
        // Refresh attendance data
        window.location.reload();
      } else {
        alert("Failed to save attendance");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Error saving attendance");
    }
  };

  const handleClearForm = () => {
    setSelectedEmployeeId("");
    setAttendanceDate(new Date().toISOString().split('T')[0]);
    setSelectedShiftId("");
    setWorkLocation("");
    setClientSite("");
    setCheckInTime("");
    setCheckOutTime("");
    setGateEntryTime("");
    setGateExitTime("");
    setAttendanceStatus("present");
    setFingerprintVerified(false);
    setFaceRecognitionVerified(false);
    setOvertimeHours("");
    setTravelDistance("");
    setTravelMode("");
    setAttendanceNotes("");
  };

  const calculateHoursWorked = () => {
    if (!checkInTime || !checkOutTime) return "0";
    
    const checkIn = new Date(`${attendanceDate}T${checkInTime}:00`);
    const checkOut = new Date(`${attendanceDate}T${checkOutTime}:00`);
    
    if (checkOut <= checkIn) return "0";
    
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours.toFixed(2);
  };

  // Edit attendance handler
  const handleEditAttendance = (record: any) => {
    const employee = employees?.find(emp => emp.id === record.employeeId);
    if (!employee) return;

    // Set form with existing record data
    setSelectedEmployeeId(record.employeeId);
    setAttendanceDate(record.date);
    setSelectedShiftId(record.shiftId || "");
    setWorkLocation(record.workLocation || "office");
    setClientSite(record.clientSite || "");
    
    // Format times for input fields
    if (record.checkIn) {
      setCheckInTime(new Date(record.checkIn).toTimeString().slice(0, 5));
    }
    if (record.checkOut) {
      setCheckOutTime(new Date(record.checkOut).toTimeString().slice(0, 5));
    }
    if (record.gateEntry) {
      setGateEntryTime(new Date(record.gateEntry).toTimeString().slice(0, 5));
    }
    if (record.gateExit) {
      setGateExitTime(new Date(record.gateExit).toTimeString().slice(0, 5));
    }
    
    setAttendanceStatus(record.status);
    setFingerprintVerified(record.fingerprintVerified || false);
    setFaceRecognitionVerified(record.faceRecognitionVerified || false);
    setOvertimeHours(record.overtimeHours || "");
    setTravelDistance(record.travelDistance || "");
    setTravelMode(record.travelMode || "");
    setAttendanceNotes(record.notes || "");
    
    // Switch to entry view for editing
    setView("entry");
  };

  // Delete attendance handler
  const handleDeleteAttendance = async (attendanceId: string) => {
    if (!confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

    try {
      const response = await fetch(`/api/attendance/${attendanceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Attendance record deleted successfully!");
        window.location.reload(); // Refresh the data
      } else {
        alert("Failed to delete attendance record");
      }
    } catch (error) {
      console.error("Error deleting attendance:", error);
      alert("Error deleting attendance record");
    }
  };

  // Quick attendance marking handlers
  const handleQuickMarkAttendance = async (employeeId: string, status: 'present' | 'absent') => {
    const existingRecord = attendance.find(att => 
      att.employeeId === employeeId && 
      att.date === attendanceDate
    );

    const attendanceData = {
      employeeId,
      date: attendanceDate,
      status,
      checkIn: status === 'present' ? new Date(`${attendanceDate}T09:00:00`) : null,
      checkOut: status === 'present' ? new Date(`${attendanceDate}T17:00:00`) : null,
      hoursWorked: status === 'present' ? "8.00" : "0",
      workLocation: "office",
      notes: `Manually marked ${status} via software`,
    };

    try {
      const response = existingRecord 
        ? await fetch(`/api/attendance/${existingRecord.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(attendanceData),
          })
        : await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(attendanceData),
          });

      if (response.ok) {
        window.location.reload();
      } else {
        alert(`Failed to mark employee as ${status}`);
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("Error marking attendance");
    }
  };

  const handleMarkAllPresent = async () => {
    if (!confirm(`Mark all employees as present for ${attendanceDate}?`)) {
      return;
    }

    for (const emp of employees) {
      await handleQuickMarkAttendance(emp.id, 'present');
    }
    alert("All employees marked as present!");
    window.location.reload();
  };

  const handleMarkAllAbsent = async () => {
    if (!confirm(`Mark all employees as absent for ${attendanceDate}?`)) {
      return;
    }

    for (const emp of employees) {
      await handleQuickMarkAttendance(emp.id, 'absent');
    }
    alert("All employees marked as absent!");
    window.location.reload();
  };</old_str>

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
                    <SelectItem value="entry">Manual Entry</SelectItem>
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

            {/* Quick Attendance Marking Section */}
            {view === "entry" && (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Quick Attendance Marking</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Input
                          type="date"
                          value={attendanceDate}
                          onChange={(e) => setAttendanceDate(e.target.value)}
                          className="w-auto"
                        />
                        <Button 
                          onClick={handleMarkAllPresent}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Mark All Present
                        </Button>
                        <Button 
                          onClick={handleMarkAllAbsent}
                          variant="destructive"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Mark All Absent
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                        {employees.map((emp) => {
                          const todayRecord = attendance.find(att => 
                            att.employeeId === emp.id && 
                            att.date === attendanceDate
                          );
                          
                          return (
                            <div key={emp.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.firstName}${emp.lastName}&size=32`}
                                  alt="Avatar"
                                  className="w-8 h-8 rounded-full"
                                />
                                <div>
                                  <p className="font-medium text-sm">{emp.firstName} {emp.lastName}</p>
                                  <p className="text-xs text-gray-500">{emp.employeeId}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {todayRecord && (
                                  <Badge 
                                    variant={
                                      todayRecord.status === 'present' ? 'default' :
                                      todayRecord.status === 'absent' ? 'destructive' :
                                      'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {todayRecord.status}
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQuickMarkAttendance(emp.id, 'present')}
                                  className="h-7 px-2 text-green-600 hover:bg-green-50"
                                >
                                  <UserCheck className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQuickMarkAttendance(emp.id, 'absent')}
                                  className="h-7 px-2 text-red-600 hover:bg-red-50"
                                >
                                  <UserX className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5" />
                      <span>Detailed Manual Attendance Entry</span>
                    </CardTitle>
                  </CardHeader></Card></old_str>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Employee Selection */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Select Employee</label>
                        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.firstName}${emp.lastName}&size=24`}
                                    alt="Avatar"
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <span>{emp.firstName} {emp.lastName} ({emp.employeeId})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date Selection */}
                      <div>
                        <label className="text-sm font-medium">Date</label>
                        <Input
                          type="date"
                          value={attendanceDate}
                          onChange={(e) => setAttendanceDate(e.target.value)}
                          className="w-full"
                        />
                      </div>

                      {/* Shift Selection */}
                      <div>
                        <label className="text-sm font-medium">Shift</label>
                        <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flexible">Flexible Hours</SelectItem>
                            {shifts.map((shift) => (
                              <SelectItem key={shift.id} value={shift.id}>
                                {shift.name} ({shift.startTime} - {shift.endTime})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Work Location */}
                      <div>
                        <label className="text-sm font-medium">Work Location</label>
                        <Select value={workLocation} onValueChange={setWorkLocation}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select work location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="remote">Remote</SelectItem>


            {/* Metrix Software Integration Section */}
            {view === "overview" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Timer className="h-5 w-5" />
                    <span>Metrix Software Integration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg">Integration Status</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Connected to Metrix System</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>• Real-time biometric data sync</p>
                        <p>• Automatic attendance recording</p>
                        <p>• Fingerprint & face recognition</p>
                        <p>• Multi-device support</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium text-lg">API Endpoints</h4>
                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <div className="text-xs font-mono">
                          <span className="text-green-600">POST</span> /api/metrix/attendance
                        </div>
                        <div className="text-xs font-mono">
                          <span className="text-blue-600">POST</span> /api/biometric/sync
                        </div>
                        <div className="text-xs font-mono">
                          <span className="text-purple-600">GET</span> /api/biometric-devices
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Use these endpoints to integrate your Metrix biometric software
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Sample Integration Code</h5>
                    <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`// Metrix software integration
const attendanceData = {
  employeeId: "EMP001",
  biometricId: "BIO123456",
  deviceId: "METRIX_001",
  timestamp: new Date().toISOString(),
  punchType: "IN", // or "OUT"
  verificationMethod: "fingerprint", // or "face"
  location: "office"
};

fetch('/api/metrix/attendance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(attendanceData)
});`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

                            <SelectItem value="field">Field Work</SelectItem>
                            <SelectItem value="client_site">Client Site</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {workLocation === 'client_site' && (
                        <div>
                          <label className="text-sm font-medium">Client Site</label>
                          <Input
                            placeholder="Enter client site name"
                            value={clientSite}
                            onChange={(e) => setClientSite(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Attendance Details */}
                    <div className="space-y-4">
                      {/* Check In/Out Times */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Check In Time</label>
                          <Input
                            type="time"
                            value={checkInTime}
                            onChange={(e) => setCheckInTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Check Out Time</label>
                          <Input
                            type="time"
                            value={checkOutTime}
                            onChange={(e) => setCheckOutTime(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Biometric Gate Times */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Gate Entry Time</label>
                          <Input
                            type="time"
                            value={gateEntryTime}
                            onChange={(e) => setGateEntryTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Gate Exit Time</label>
                          <Input
                            type="time"
                            value={gateExitTime}
                            onChange={(e) => setGateExitTime(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Status Selection */}
                      <div>
                        <label className="text-sm font-medium">Attendance Status</label>
                        <Select value={attendanceStatus} onValueChange={setAttendanceStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="half_day">Half Day</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="on_leave">On Leave</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Biometric Verification */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Biometric Verification</label>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="fingerprintVerified"
                              checked={fingerprintVerified}
                              onChange={(e) => setFingerprintVerified(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor="fingerprintVerified" className="text-sm">Fingerprint</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="faceRecognitionVerified"
                              checked={faceRecognitionVerified}
                              onChange={(e) => setFaceRecognitionVerified(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor="faceRecognitionVerified" className="text-sm">Face Recognition</label>
                          </div>
                        </div>
                      </div>

                      {/* Overtime Hours */}
                      <div>
                        <label className="text-sm font-medium">Overtime Hours</label>
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          placeholder="0.0"
                          value={overtimeHours}
                          onChange={(e) => setOvertimeHours(e.target.value)}
                        />
                      </div>

                      {/* Travel Information (for field work) */}
                      {workLocation === 'field' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Travel Distance (km)</label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={travelDistance}
                              onChange={(e) => setTravelDistance(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Travel Mode</label>
                            <Select value={travelMode} onValueChange={setTravelMode}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="car">Car</SelectItem>
                                <SelectItem value="bike">Bike</SelectItem>
                                <SelectItem value="public_transport">Public Transport</SelectItem>
                                <SelectItem value="walking">Walking</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <label className="text-sm font-medium">Notes</label>
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded-md resize-none"
                          rows={3}
                          placeholder="Any additional notes..."
                          value={attendanceNotes}
                          onChange={(e) => setAttendanceNotes(e.target.value)}
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleSubmitAttendance}
                          disabled={!selectedEmployeeId || !attendanceDate}
                          className="flex-1"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Save Attendance
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleClearForm}
                          className="px-4"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                          <TableHead>Actions</TableHead>
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
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditAttendance(record)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteAttendance(record.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="py-8 text-center text-gray-500">
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
