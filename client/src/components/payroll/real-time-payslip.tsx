import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Edit, Save, X, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  position: string;
  baseSalary: number;
  hra: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
}

interface PayslipData {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  month: string;
  year: string;
  workingDays: number;
  presentDays: number;
  basicSalary: number;
  hra: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  overtimePay: number;
  bonus: number;
  pfDeduction: number;
  esiDeduction: number;
  tdsDeduction: number;
  loan: number;
  advance: number;
  other: number;
}

export default function RealTimePayslip() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [payslipData, setPayslipData] = useState<PayslipData>({
    employeeId: "",
    employeeName: "",
    employeeCode: "",
    department: "",
    designation: "",
    month: "August",
    year: "2025",
    workingDays: 22,
    presentDays: 22,
    basicSalary: 0,
    hra: 0,
    conveyanceAllowance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    overtimePay: 0,
    bonus: 0,
    pfDeduction: 0,
    esiDeduction: 0,
    tdsDeduction: 0,
    loan: 0,
    advance: 0,
    other: 0,
  });

  const queryClient = useQueryClient();

  // Fetch employees from real database
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  // Fetch departments for mapping
  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  // Calculate salary components based on basic salary
  const calculateSalaryComponents = (basicSalary: number) => {
    const hra = Math.round(basicSalary * 0.4); // 40% HRA
    const specialAllowance = Math.round(basicSalary * 0.15); // 15% Special Allowance
    const pfDeduction = Math.round(basicSalary * 0.12); // 12% PF
    const tdsDeduction = Math.round(basicSalary * 0.05); // 5% TDS (basic estimate)
    
    return {
      hra,
      specialAllowance,
      pfDeduction,
      tdsDeduction,
    };
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find((emp: Employee) => emp.id === employeeId);
    if (employee) {
      setSelectedEmployeeId(employeeId);
      
      // Get department name
      const department = departments.find((dept: any) => dept.id === employee.departmentId);
      
      // Calculate salary components
      const calculations = calculateSalaryComponents(employee.baseSalary || 0);
      
      setPayslipData({
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeId,
        department: department?.name || "Unknown",
        designation: employee.position || "Not specified",
        month: "August",
        year: "2025",
        workingDays: 22,
        presentDays: 22,
        basicSalary: employee.baseSalary || 0,
        hra: calculations.hra,
        conveyanceAllowance: employee.conveyanceAllowance || 2400,
        medicalAllowance: employee.medicalAllowance || 1250,
        specialAllowance: calculations.specialAllowance,
        overtimePay: 0,
        bonus: 0,
        pfDeduction: calculations.pfDeduction,
        esiDeduction: 0,
        tdsDeduction: calculations.tdsDeduction,
        loan: 0,
        advance: 0,
        other: 0,
      });
    }
  };

  const calculateTotals = () => {
    const totalEarnings = payslipData.basicSalary + payslipData.hra + payslipData.conveyanceAllowance + 
                         payslipData.medicalAllowance + payslipData.specialAllowance + payslipData.overtimePay + payslipData.bonus;
    
    const totalDeductions = payslipData.pfDeduction + payslipData.esiDeduction + payslipData.tdsDeduction + 
                           payslipData.loan + payslipData.advance + payslipData.other;
    
    const netPay = totalEarnings - totalDeductions;
    
    return { totalEarnings, totalDeductions, netPay };
  };

  const { totalEarnings, totalDeductions, netPay } = calculateTotals();

  const handleInputChange = (field: keyof PayslipData, value: any) => {
    setPayslipData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Auto-calculate dependent fields when basic salary changes
      if (field === 'basicSalary') {
        const calculations = calculateSalaryComponents(Number(value));
        updated.hra = calculations.hra;
        updated.specialAllowance = calculations.specialAllowance;
        updated.pfDeduction = calculations.pfDeduction;
        updated.tdsDeduction = calculations.tdsDeduction;
      }
      
      return updated;
    });
  };

  // Mutation to save payslip
  const savePayslipMutation = useMutation({
    mutationFn: async (payslipData: PayslipData) => {
      const response = await fetch("/api/payslips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: payslipData.employeeId,
          payPeriod: `${payslipData.month} ${payslipData.year}`,
          basicSalary: payslipData.basicSalary.toString(),
          hra: payslipData.hra.toString(),
          conveyanceAllowance: payslipData.conveyanceAllowance.toString(),
          medicalAllowance: payslipData.medicalAllowance.toString(),
          specialAllowance: payslipData.specialAllowance.toString(),
          overtimePay: payslipData.overtimePay.toString(),
          bonus: payslipData.bonus.toString(),
          grossPay: totalEarnings.toString(),
          pfDeduction: payslipData.pfDeduction.toString(),
          esiDeduction: payslipData.esiDeduction.toString(),
          tdsDeduction: payslipData.tdsDeduction.toString(),
          totalDeductions: totalDeductions.toString(),
          netPay: netPay.toString(),
          workingDays: payslipData.workingDays,
          presentDays: payslipData.presentDays,
          status: "generated",
          generatedAt: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save payslip");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payslip generated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payslips"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generatePayslip = () => {
    if (!selectedEmployeeId) {
      toast({
        title: "Error",
        description: "Please select an employee first",
        variant: "destructive",
      });
      return;
    }
    
    savePayslipMutation.mutate(payslipData);
  };

  if (employeesLoading) {
    return <div className="p-6">Loading employees...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Payslip Generator</h1>
          <p className="text-muted-foreground">Generate payslips with live employee data</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
            {isEditing ? "Save Changes" : "Edit Mode"}
          </Button>
          <Button 
            onClick={generatePayslip} 
            disabled={savePayslipMutation.isPending || !selectedEmployeeId}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" />
            {savePayslipMutation.isPending ? "Generating..." : "Generate Payslip"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Employee Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Employee</CardTitle>
            <CardDescription>Choose from {employees.length} active employees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select value={selectedEmployeeId} onValueChange={handleEmployeeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp: Employee) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Month</Label>
                {isEditing ? (
                  <Input 
                    value={payslipData.month} 
                    onChange={(e) => handleInputChange('month', e.target.value)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded">{payslipData.month}</div>
                )}
              </div>
              <div>
                <Label>Year</Label>
                {isEditing ? (
                  <Input 
                    value={payslipData.year} 
                    onChange={(e) => handleInputChange('year', e.target.value)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 rounded">{payslipData.year}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Details */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <div className="p-2 bg-gray-50 rounded font-medium">{payslipData.employeeName || "Select employee"}</div>
            </div>
            <div>
              <Label>Employee Code</Label>
              <div className="p-2 bg-gray-50 rounded">{payslipData.employeeCode || "N/A"}</div>
            </div>
            <div>
              <Label>Department</Label>
              <div className="p-2 bg-gray-50 rounded">{payslipData.department || "N/A"}</div>
            </div>
            <div>
              <Label>Designation</Label>
              <div className="p-2 bg-gray-50 rounded">{payslipData.designation || "N/A"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Working Days</Label>
              {isEditing ? (
                <Input 
                  type="number"
                  value={payslipData.workingDays} 
                  onChange={(e) => handleInputChange('workingDays', Number(e.target.value))}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded">{payslipData.workingDays}</div>
              )}
            </div>
            <div>
              <Label>Present Days</Label>
              {isEditing ? (
                <Input 
                  type="number"
                  value={payslipData.presentDays} 
                  onChange={(e) => handleInputChange('presentDays', Number(e.target.value))}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded">{payslipData.presentDays}</div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Attendance %</span>
              <Badge variant="secondary">
                {payslipData.workingDays > 0 ? Math.round((payslipData.presentDays / payslipData.workingDays) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Earnings
              <Badge variant="secondary">₹{totalEarnings.toLocaleString()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Basic Salary</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.basicSalary} 
                    onChange={(e) => handleInputChange('basicSalary', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-green-50 rounded text-green-700 font-medium">
                    ₹{payslipData.basicSalary.toLocaleString()}
                  </div>
                )}
              </div>
              
              <div>
                <Label>HRA (40%)</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.hra} 
                    onChange={(e) => handleInputChange('hra', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-green-50 rounded text-green-700 font-medium">
                    ₹{payslipData.hra.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label>Conveyance</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.conveyanceAllowance} 
                    onChange={(e) => handleInputChange('conveyanceAllowance', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-green-50 rounded text-green-700">
                    ₹{payslipData.conveyanceAllowance.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label>Medical</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.medicalAllowance} 
                    onChange={(e) => handleInputChange('medicalAllowance', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-green-50 rounded text-green-700">
                    ₹{payslipData.medicalAllowance.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label>Special Allowance</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.specialAllowance} 
                    onChange={(e) => handleInputChange('specialAllowance', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-green-50 rounded text-green-700">
                    ₹{payslipData.specialAllowance.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label>Bonus</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.bonus} 
                    onChange={(e) => handleInputChange('bonus', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-green-50 rounded text-green-700">
                    ₹{payslipData.bonus.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deductions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Deductions
              <Badge variant="destructive">₹{totalDeductions.toLocaleString()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>PF (12%)</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.pfDeduction} 
                    onChange={(e) => handleInputChange('pfDeduction', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-red-50 rounded text-red-700 font-medium">
                    ₹{payslipData.pfDeduction.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label>TDS</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.tdsDeduction} 
                    onChange={(e) => handleInputChange('tdsDeduction', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-red-50 rounded text-red-700">
                    ₹{payslipData.tdsDeduction.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label>Loan Deduction</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.loan} 
                    onChange={(e) => handleInputChange('loan', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-red-50 rounded text-red-700">
                    ₹{payslipData.loan.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label>Advance</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.advance} 
                    onChange={(e) => handleInputChange('advance', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-red-50 rounded text-red-700">
                    ₹{payslipData.advance.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Salary Summary - Real-Time Calculations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₹{totalEarnings.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">₹{totalDeductions.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Deductions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">₹{netPay.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Net Pay</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={generatePayslip} 
              disabled={savePayslipMutation.isPending || !selectedEmployeeId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="mr-2 h-4 w-4" />
              {savePayslipMutation.isPending ? "Generating..." : "Generate & Save Payslip"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}