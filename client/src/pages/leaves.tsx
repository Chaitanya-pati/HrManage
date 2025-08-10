import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, CheckCircle, XCircle, Plus } from "lucide-react";

export default function LeavesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayType, setHalfDayType] = useState("");

  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: leaveRequests, isLoading: leavesLoading } = useQuery({
    queryKey: ["/api/leaves"],
  });

  // Remove mock data - use only real API data
  const displayLeaveRequests = Array.isArray(leaveRequests) ? leaveRequests : [];

  const getEmployeeName = (employeeId: string) => {
    const employee = Array.isArray(employees) ? employees.find((emp: any) => emp.id === employeeId) : null;
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // If it's a half day, return 0.5 for single day, otherwise calculate normally
    if (isHalfDay && diffDays === 1) {
      return 0.5;
    }
    return diffDays;
  };

  const handleSubmitLeave = async () => {
    if (!leaveType || !startDate || !endDate || !reason || !selectedEmployee) {
      alert("Please fill in all required fields");
      return;
    }

    if (isHalfDay && !halfDayType) {
      alert("Please select half day type (Morning or Evening)");
      return;
    }

    if (isHalfDay && startDate !== endDate) {
      alert("Half day leave must be for a single day only");
      return;
    }

    const leaveData = {
      employeeId: selectedEmployee,
      type: leaveType,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      days: calculateDays(),
      isHalfDay,
      halfDayType: isHalfDay ? halfDayType : null,
      reason,
      status: "pending"
    };

    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveData),
      });

      if (response.ok) {
        alert("Leave request submitted successfully!");
        setIsDialogOpen(false);
        setLeaveType("");
        setStartDate("");
        setEndDate("");
        setReason("");
        setSelectedEmployee("");
        setIsHalfDay(false);
        setHalfDayType("");
        // Refresh the leave requests data
        window.location.reload();
      } else {
        alert("Failed to submit leave request");
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      alert("Error submitting leave request");
    }
  };

  const handleApproveLeave = async (requestId: string) => {
    try {
      const response = await fetch(`/api/leaves/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (response.ok) {
        alert("Leave request approved!");
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to approve leave request: ${error.message}`);
      }
    } catch (error) {
      console.error("Error approving leave:", error);
      alert("Error approving leave request");
    }
  };

  const handleRejectLeave = async (requestId: string) => {
    try {
      const response = await fetch(`/api/leaves/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (response.ok) {
        alert("Leave request rejected!");
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Failed to reject leave request: ${error.message}`);
      }
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert("Error rejecting leave request");
    }
  };

  return (
    <div className="flex h-screen bg-hrms-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Leave Management" 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral">Leave Management</h1>
                <p className="text-gray-600">Manage employee leave requests and approvals</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="request-leave-button">
                    <Plus size={16} className="mr-2" />
                    Request Leave
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Submit Leave Request</DialogTitle>
                    <DialogDescription>
                      Fill in the details to submit a new leave request. You can select half-day options for single-day leaves.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="employee">Employee</Label>
                      <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(employees) ? employees.map((emp: any) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName} ({emp.employeeId})
                            </SelectItem>
                          )) : null}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="leave-type">Leave Type</Label>
                      <Select value={leaveType} onValueChange={setLeaveType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                          <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                          <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                          <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                          <SelectItem value="Paternity Leave">Paternity Leave</SelectItem>
                          <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="half-day"
                          checked={isHalfDay}
                          onChange={(e) => {
                            setIsHalfDay(e.target.checked);
                            if (e.target.checked) {
                              setEndDate(startDate); // Auto-set end date to same as start for half day
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="half-day" className="text-sm font-medium">
                          Half Day Leave
                        </Label>
                      </div>
                      {isHalfDay && (
                        <Select value={halfDayType} onValueChange={setHalfDayType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select half day type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning Half Day (9 AM - 1 PM)</SelectItem>
                            <SelectItem value="evening">Evening Half Day (1 PM - 6 PM)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    {startDate && endDate && (
                      <div className="text-sm text-gray-600">
                        Duration: {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
                        {isHalfDay && halfDayType && (
                          <span className="ml-2 text-blue-600 font-medium">
                            ({halfDayType.charAt(0).toUpperCase() + halfDayType.slice(1)} Half Day)
                          </span>
                        )}
                      </div>
                    )}
                    <div className="grid gap-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        placeholder="Provide a reason for your leave request..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitLeave}>
                      Submit Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="pending-requests">
                        {displayLeaveRequests.filter(req => req.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="approved-requests">
                        {displayLeaveRequests.filter(req => req.status === 'approved').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <XCircle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="rejected-requests">
                        {displayLeaveRequests.filter(req => req.status === 'rejected').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Days</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="total-leave-days">
                        {displayLeaveRequests.reduce((sum, req) => sum + parseFloat(req.days), 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leave Requests Table */}
            <Card className="card-hover transition-all duration-200">
              <CardHeader>
                <CardTitle>Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full" data-testid="leaves-table">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Leave Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Start Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">End Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Days</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Reason</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayLeaveRequests.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-500">
                            {leavesLoading ? "Loading leave requests..." : "No leave requests found. Click 'Request Leave' to submit a new request."}
                          </td>
                        </tr>
                      ) : (
                        displayLeaveRequests.map((request) => (
                        <tr key={request.id} className="border-b hover:bg-gray-50" data-testid={`leave-row-${request.id}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getEmployeeName(request.employeeId)}&size=32`}
                                alt="Avatar"
                                className="w-8 h-8 rounded-full"
                              />
                              <span className="font-medium" data-testid={`employee-name-${request.id}`}>
                                {getEmployeeName(request.employeeId)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4" data-testid={`leave-type-${request.id}`}>
                            {request.type}
                          </td>
                          <td className="py-3 px-4" data-testid={`start-date-${request.id}`}>
                            {new Date(request.startDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4" data-testid={`end-date-${request.id}`}>
                            {new Date(request.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4" data-testid={`leave-days-${request.id}`}>
                            {request.days} day{request.days !== 1 ? 's' : ''}
                            {request.isHalfDay && (
                              <span className="ml-1 text-xs text-blue-600 font-medium">
                                ({request.halfDayType} half)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4" data-testid={`leave-reason-${request.id}`}>
                            {request.reason}
                          </td>
                          <td className="py-3 px-4" data-testid={`leave-status-${request.id}`}>
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="py-3 px-4">
                            {request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  data-testid={`approve-leave-${request.id}`}
                                  onClick={() => handleApproveLeave(request.id)}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                  data-testid={`reject-leave-${request.id}`}
                                  onClick={() => handleRejectLeave(request.id)}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}