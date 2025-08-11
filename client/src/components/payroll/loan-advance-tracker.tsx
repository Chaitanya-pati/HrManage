import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, CreditCard, TrendingUp, Calendar, DollarSign } from "lucide-react";
import type { EmployeeLoans, SalaryAdvances, Employee } from "@shared/schema";

interface LoanAdvanceTrackerProps {
  employee?: Employee;
}

const loanTypes = ["personal", "home", "vehicle", "education", "emergency"];
const loanStatuses = ["pending", "approved", "active", "completed", "rejected"];

export function LoanAdvanceTracker({ employee }: LoanAdvanceTrackerProps) {
  const [activeTab, setActiveTab] = useState("loans");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLoan, setNewLoan] = useState({
    employeeId: employee?.id || "",
    loanType: "",
    requestedAmount: "",
    purpose: "",
    tenure: "",
    interestRate: "8.5",
  });
  const [newAdvance, setNewAdvance] = useState({
    employeeId: employee?.id || "",
    requestedAmount: "",
    reason: "",
    requestedDate: new Date().toISOString().split('T')[0],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: loans, isLoading: loansLoading } = useQuery({
    queryKey: ["/api/employee-loans", employee?.id],
  });

  const { data: advances, isLoading: advancesLoading } = useQuery({
    queryKey: ["/api/salary-advances", employee?.id],
  });

  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const createLoanMutation = useMutation({
    mutationFn: async (loanData: any) => {
      return apiRequest("/api/employee-loans", {
        method: "POST",
        body: JSON.stringify({
          ...loanData,
          requestedAmount: parseFloat(loanData.requestedAmount),
          tenure: parseInt(loanData.tenure),
          interestRate: parseFloat(loanData.interestRate),
          status: "pending",
          requestedDate: new Date().toISOString()
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-loans"] });
      setNewLoan({ employeeId: employee?.id || "", loanType: "", requestedAmount: "", purpose: "", tenure: "", interestRate: "8.5" });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Loan application submitted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit loan application", variant: "destructive" });
    },
  });

  const createAdvanceMutation = useMutation({
    mutationFn: async (advanceData: any) => {
      return apiRequest("/api/salary-advances", {
        method: "POST",
        body: JSON.stringify({
          ...advanceData,
          requestedAmount: parseFloat(advanceData.requestedAmount),
          status: "pending",
          requestedDate: new Date(advanceData.requestedDate).toISOString()
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salary-advances"] });
      setNewAdvance({ employeeId: employee?.id || "", requestedAmount: "", reason: "", requestedDate: new Date().toISOString().split('T')[0] });
      setIsDialogOpen(false);
      toast({ title: "Success", description: "Salary advance request submitted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit advance request", variant: "destructive" });
    },
  });

  const updateLoanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/employee-loans/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-loans"] });
      toast({ title: "Success", description: "Loan updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update loan", variant: "destructive" });
    },
  });

  const handleCreateLoan = () => {
    if (!newLoan.employeeId || !newLoan.loanType || !newLoan.requestedAmount) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    createLoanMutation.mutate(newLoan);
  };

  const handleCreateAdvance = () => {
    if (!newAdvance.employeeId || !newAdvance.requestedAmount || !newAdvance.reason) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    createAdvanceMutation.mutate(newAdvance);
  };

  const calculateEmi = (amount: number, rate: number, tenure: number) => {
    const monthlyRate = rate / (12 * 100);
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return isNaN(emi) ? 0 : emi;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800", 
      active: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
      rejected: "bg-red-100 text-red-800"
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Loans & Advances Tracker
              {employee && ` - ${employee.firstName} ${employee.lastName}`}
            </span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>New {activeTab === "loans" ? "Loan" : "Advance"} Request</DialogTitle>
                </DialogHeader>
                
                {activeTab === "loans" ? (
                  <div className="space-y-4">
                    {!employee && (
                      <div>
                        <Label htmlFor="employeeId">Employee</Label>
                        <Select value={newLoan.employeeId} onValueChange={(value) => setNewLoan({ ...newLoan, employeeId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees?.map((emp: Employee) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName} ({emp.employeeId})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="loanType">Loan Type</Label>
                      <Select value={newLoan.loanType} onValueChange={(value) => setNewLoan({ ...newLoan, loanType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                        <SelectContent>
                          {loanTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="requestedAmount">Amount (₹)</Label>
                      <Input
                        type="number"
                        value={newLoan.requestedAmount}
                        onChange={(e) => setNewLoan({ ...newLoan, requestedAmount: e.target.value })}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tenure">Tenure (months)</Label>
                      <Input
                        type="number"
                        value={newLoan.tenure}
                        onChange={(e) => setNewLoan({ ...newLoan, tenure: e.target.value })}
                        placeholder="Enter tenure"
                      />
                    </div>
                    <div>
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newLoan.interestRate}
                        onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                        placeholder="8.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="purpose">Purpose</Label>
                      <Input
                        value={newLoan.purpose}
                        onChange={(e) => setNewLoan({ ...newLoan, purpose: e.target.value })}
                        placeholder="Purpose of loan"
                      />
                    </div>
                    {newLoan.requestedAmount && newLoan.tenure && newLoan.interestRate && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium">Estimated EMI</div>
                        <div className="text-lg font-bold text-blue-600">
                          ₹{calculateEmi(
                            parseFloat(newLoan.requestedAmount),
                            parseFloat(newLoan.interestRate),
                            parseInt(newLoan.tenure)
                          ).toLocaleString()}
                        </div>
                      </div>
                    )}
                    <Button onClick={handleCreateLoan} disabled={createLoanMutation.isPending} className="w-full">
                      Submit Loan Application
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!employee && (
                      <div>
                        <Label htmlFor="employeeId">Employee</Label>
                        <Select value={newAdvance.employeeId} onValueChange={(value) => setNewAdvance({ ...newAdvance, employeeId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees?.map((emp: Employee) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName} ({emp.employeeId})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="requestedAmount">Amount (₹)</Label>
                      <Input
                        type="number"
                        value={newAdvance.requestedAmount}
                        onChange={(e) => setNewAdvance({ ...newAdvance, requestedAmount: e.target.value })}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Input
                        value={newAdvance.reason}
                        onChange={(e) => setNewAdvance({ ...newAdvance, reason: e.target.value })}
                        placeholder="Reason for advance"
                      />
                    </div>
                    <div>
                      <Label htmlFor="requestedDate">Requested Date</Label>
                      <Input
                        type="date"
                        value={newAdvance.requestedDate}
                        onChange={(e) => setNewAdvance({ ...newAdvance, requestedDate: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleCreateAdvance} disabled={createAdvanceMutation.isPending} className="w-full">
                      Submit Advance Request
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="loans">Employee Loans</TabsTrigger>
              <TabsTrigger value="advances">Salary Advances</TabsTrigger>
            </TabsList>
            
            <TabsContent value="loans" className="space-y-4">
              {loansLoading ? (
                <div>Loading loans...</div>
              ) : loans?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No loan applications found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Tenure</TableHead>
                      <TableHead>EMI</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans?.map((loan: EmployeeLoans) => {
                      const emp = employees?.find((e: Employee) => e.id === loan.employeeId);
                      const emi = calculateEmi(loan.requestedAmount, loan.interestRate || 8.5, loan.tenure || 12);
                      
                      return (
                        <TableRow key={loan.id}>
                          <TableCell>
                            {emp ? `${emp.firstName} ${emp.lastName}` : loan.employeeId}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {loan.loanType?.charAt(0).toUpperCase() + loan.loanType?.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>₹{loan.requestedAmount.toLocaleString()}</TableCell>
                          <TableCell>{loan.tenure} months</TableCell>
                          <TableCell>₹{emi.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(loan.status)}>
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {loan.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => updateLoanMutation.mutate({ id: loan.id, data: { status: "approved" } })}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateLoanMutation.mutate({ id: loan.id, data: { status: "rejected" } })}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="advances" className="space-y-4">
              {advancesLoading ? (
                <div>Loading advances...</div>
              ) : advances?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No salary advance requests found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Requested Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advances?.map((advance: SalaryAdvances) => {
                      const emp = employees?.find((e: Employee) => e.id === advance.employeeId);
                      
                      return (
                        <TableRow key={advance.id}>
                          <TableCell>
                            {emp ? `${emp.firstName} ${emp.lastName}` : advance.employeeId}
                          </TableCell>
                          <TableCell>₹{advance.requestedAmount.toLocaleString()}</TableCell>
                          <TableCell>{advance.reason}</TableCell>
                          <TableCell>
                            {new Date(advance.requestedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(advance.status)}>
                              {advance.status.charAt(0).toUpperCase() + advance.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {advance.status === "pending" && (
                              <div className="flex gap-2">
                                <Button size="sm">Approve</Button>
                                <Button size="sm" variant="outline">Reject</Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}