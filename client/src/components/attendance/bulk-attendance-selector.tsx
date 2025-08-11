import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  UserCheck, 
  UserX, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Filter,
  Calendar,
  WifiOff
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function BulkAttendanceSelector() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["/api/attendance", { startDate: selectedDate, endDate: selectedDate }],
  });

  // Filter employees based on search, department, and status
  const filteredEmployees = employees.filter((emp) => {
    // Search filter
    const searchMatch = searchTerm === "" || 
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Department filter
    const departmentMatch = departmentFilter === "all" || emp.departmentId === departmentFilter;
    
    // Get today's attendance record
    const todayRecord = attendance.find(att => 
      att.employeeId === emp.id && 
      new Date(att.date).toISOString().split('T')[0] === selectedDate
    );
    
    // Status filter
    let statusMatch = true;
    if (statusFilter === "unmarked") {
      statusMatch = !todayRecord;
    } else if (statusFilter === "present") {
      statusMatch = todayRecord?.status === "present";
    } else if (statusFilter === "absent") {
      statusMatch = todayRecord?.status === "absent";
    }
    
    return searchMatch && departmentMatch && statusMatch;
  });

  // Calculate stats
  const stats = {
    total: employees.length,
    present: attendance.filter(att => att.status === "present").length,
    absent: attendance.filter(att => att.status === "absent").length,
    unmarked: employees.length - attendance.length,
  };

  // Bulk attendance mutation
  const bulkAttendanceMutation = useMutation({
    mutationFn: async ({ employeeIds, status }: { employeeIds: string[], status: 'present' | 'absent' }) => {
      const promises = employeeIds.map(async (employeeId) => {
        const existingRecord = attendance.find(att => 
          att.employeeId === employeeId && 
          new Date(att.date).toISOString().split('T')[0] === selectedDate
        );

        const attendanceData = {
          employeeId,
          date: selectedDate,
          status,
          checkIn: status === 'present' ? `${selectedDate}T09:00:00` : null,
          checkOut: status === 'present' ? `${selectedDate}T17:00:00` : null,
          hoursWorked: status === 'present' ? "8.00" : "0.00",
          regularHours: status === 'present' ? "8.00" : "0.00",
          workLocation: "office",
          isRemote: false,
          isFieldWork: false,
          lateArrival: false,
          earlyDeparture: false,
          overtimeHours: "0.00",
          shiftId: null,
          biometricDeviceId: null,
          deviceName: "Manual Entry (Offline)",
          notes: `Manually marked ${status} via bulk selection (Hardware device offline)`,
        };

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

        if (!response.ok) {
          throw new Error(`Failed to mark employee ${employeeId} as ${status}`);
        }
        return response.json();
      });

      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      setSelectedEmployees([]);
      toast({
        title: "Success",
        description: "Attendance updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleBulkMarkAttendance = async (status: 'present' | 'absent') => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select employees to mark attendance",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await bulkAttendanceMutation.mutateAsync({ 
        employeeIds: selectedEmployees, 
        status 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Offline Device Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <WifiOff className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">Manual Attendance Entry</h3>
              <p className="text-xs text-orange-600">
                Use this when biometric devices are offline or malfunctioning
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Bulk Attendance Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
              </div>
              
              <div className="flex space-x-4 text-sm">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Present: {stats.present}
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  Absent: {stats.absent}
                </Badge>
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                  Unmarked: {stats.unmarked}
                </Badge>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unmarked">Unmarked</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">
                {selectedEmployees.length} of {filteredEmployees.length} selected
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleBulkMarkAttendance('present')}
                disabled={selectedEmployees.length === 0 || isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark Present ({selectedEmployees.length})
              </Button>
              <Button
                onClick={() => handleBulkMarkAttendance('absent')}
                disabled={selectedEmployees.length === 0 || isProcessing}
                variant="destructive"
              >
                <UserX className="h-4 w-4 mr-2" />
                Mark Absent ({selectedEmployees.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => {
                const todayRecord = attendance.find(att => 
                  att.employeeId === employee.id && 
                  new Date(att.date).toISOString().split('T')[0] === selectedDate
                );
                const department = departments.find(d => d.id === employee.departmentId);
                
                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => handleEmployeeSelect(employee.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.employeeId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{department?.name || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{employee.position}</span>
                    </TableCell>
                    <TableCell>
                      {todayRecord ? (
                        <Badge 
                          variant={todayRecord.status === 'present' ? 'default' : 'destructive'}
                          className={
                            todayRecord.status === 'present' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }
                        >
                          {todayRecord.status === 'present' ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {todayRecord.status.charAt(0).toUpperCase() + todayRecord.status.slice(1)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Unmarked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkMarkAttendance('present')}
                          className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50"
                          disabled={isProcessing}
                        >
                          <UserCheck className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkMarkAttendance('absent')}
                          className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                          disabled={isProcessing}
                        >
                          <UserX className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No employees found matching your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}