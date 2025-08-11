import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Edit, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  bonus: number;
  pfDeduction: number;
  tdsDeduction: number;
  loanDeduction: number;
  advance: number;
}

export default function ExactPayslipGenerator() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [payslipData, setPayslipData] = useState<PayslipData>({
    employeeId: "",
    employeeName: "Select employee",
    employeeCode: "N/A",
    department: "N/A",
    designation: "N/A",
    month: "August",
    year: "2025",
    workingDays: 22,
    presentDays: 22,
    basicSalary: 0,
    hra: 0,
    conveyanceAllowance: 0,
    medicalAllowance: 0,
    specialAllowance: 0,
    bonus: 0,
    pfDeduction: 0,
    tdsDeduction: 0,
    loanDeduction: 0,
    advance: 0,
  });

  // Sample employees for demo - matches your existing data structure
  const employees = [
    { id: "EMP001", name: "John Doe", department: "Engineering", position: "Senior Software Engineer", salary: 75000 },
    { id: "EMP002", name: "Rajesh Kumar", department: "Sales", position: "Sales Manager", salary: 65000 },
    { id: "EMP003", name: "Priya Sharma", department: "Marketing", position: "Marketing Executive", salary: 58000 },
    { id: "EMP004", name: "Amit Patel", department: "Engineering", position: "Backend Developer", salary: 82000 },
    { id: "EMP005", name: "Sneha Gupta", department: "Finance", position: "Finance Manager", salary: 70000 },
    { id: "EMP006", name: "Rahul Singh", department: "Operations", position: "Operations Manager", salary: 68000 },
    { id: "EMP007", name: "Anita Rao", department: "Customer Support", position: "Support Lead", salary: 55000 },
    { id: "EMP008", name: "Vikram Joshi", department: "Engineering", position: "Frontend Developer", salary: 72000 },
  ];

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setSelectedEmployee(employeeId);
      const basicSalary = employee.salary;
      const hra = Math.round(basicSalary * 0.4); // 40% HRA
      const specialAllowance = Math.round(basicSalary * 0.15); // 15% Special Allowance
      const pfDeduction = Math.round(basicSalary * 0.12); // 12% PF
      const tdsDeduction = Math.round(basicSalary * 0.05); // 5% TDS

      setPayslipData({
        ...payslipData,
        employeeId: employee.id,
        employeeName: employee.name,
        employeeCode: employee.id,
        department: employee.department,
        designation: employee.position,
        basicSalary,
        hra,
        specialAllowance,
        pfDeduction,
        tdsDeduction,
        conveyanceAllowance: 2400,
        medicalAllowance: 1250,
        bonus: 0,
        loanDeduction: 0,
        advance: 0,
      });
    }
  };

  const calculateTotals = () => {
    const totalEarnings = payslipData.basicSalary + payslipData.hra + payslipData.conveyanceAllowance + 
                         payslipData.medicalAllowance + payslipData.specialAllowance + payslipData.bonus;
    
    const totalDeductions = payslipData.pfDeduction + payslipData.tdsDeduction + 
                           payslipData.loanDeduction + payslipData.advance;
    
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
        const basicSal = Number(value);
        updated.hra = Math.round(basicSal * 0.4);
        updated.specialAllowance = Math.round(basicSal * 0.15);
        updated.pfDeduction = Math.round(basicSal * 0.12);
        updated.tdsDeduction = Math.round(basicSal * 0.05);
      }
      
      return updated;
    });
  };

  const generatePayslip = () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee first",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Success",
      description: `Payslip generated for ${payslipData.employeeName}! Net Pay: ₹${netPay.toLocaleString()}`,
    });
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header - Exact match to your image */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Real-Time Payslip Generator</h1>
          <p className="text-sm text-gray-600 mt-1">Generate payslips with live employee data</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Mode
          </Button>
          <Button 
            onClick={generatePayslip} 
            disabled={!selectedEmployee}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
          >
            <Download className="mr-2 h-4 w-4" />
            Generate Payslip
          </Button>
        </div>
      </div>

      {/* Main Grid - Exact layout from your image */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Employee Selection Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">Select Employee</CardTitle>
            <CardDescription className="text-sm text-gray-500">Choose from {employees.length} active employees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Employee</Label>
              <Select value={selectedEmployee} onValueChange={handleEmployeeSelect}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Month</Label>
                {isEditing ? (
                  <Input 
                    value={payslipData.month} 
                    onChange={(e) => handleInputChange('month', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 px-3 py-2 bg-gray-50 rounded border text-sm">{payslipData.month}</div>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Year</Label>
                {isEditing ? (
                  <Input 
                    value={payslipData.year} 
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 px-3 py-2 bg-gray-50 rounded border text-sm">{payslipData.year}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Details Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">Employee Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Name</Label>
              <div className="mt-1 px-3 py-2 bg-gray-50 rounded border text-sm font-medium">{payslipData.employeeName}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Employee Code</Label>
              <div className="mt-1 px-3 py-2 bg-gray-50 rounded border text-sm">{payslipData.employeeCode}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Department</Label>
              <div className="mt-1 px-3 py-2 bg-gray-50 rounded border text-sm">{payslipData.department}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Designation</Label>
              <div className="mt-1 px-3 py-2 bg-gray-50 rounded border text-sm">{payslipData.designation}</div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Working Days</Label>
              {isEditing ? (
                <Input 
                  type="number"
                  value={payslipData.workingDays} 
                  onChange={(e) => handleInputChange('workingDays', Number(e.target.value))}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border text-sm">{payslipData.workingDays}</div>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Present Days</Label>
              {isEditing ? (
                <Input 
                  type="number"
                  value={payslipData.presentDays} 
                  onChange={(e) => handleInputChange('presentDays', Number(e.target.value))}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 px-3 py-2 bg-gray-50 rounded border text-sm">{payslipData.presentDays}</div>
              )}
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-medium text-gray-700">Attendance %</span>
              <Badge className="bg-gray-900 text-white px-2 py-1 text-xs rounded">
                {payslipData.workingDays > 0 ? Math.round((payslipData.presentDays / payslipData.workingDays) * 100) : 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings and Deductions - Exact layout from your image */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Earnings Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-lg font-medium text-gray-900">
              Earnings
              <Badge className="bg-gray-900 text-white px-2 py-1 text-xs rounded">₹{totalEarnings.toLocaleString()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Basic Salary</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.basicSalary} 
                    onChange={(e) => handleInputChange('basicSalary', Number(e.target.value))}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-sm font-medium text-green-600">
                    ₹{payslipData.basicSalary.toLocaleString()}
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">HRA (40%)</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.hra} 
                    onChange={(e) => handleInputChange('hra', Number(e.target.value))}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-sm font-medium text-green-600">
                    ₹{payslipData.hra.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Conveyance</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.conveyanceAllowance} 
                    onChange={(e) => handleInputChange('conveyanceAllowance', Number(e.target.value))}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-sm text-green-600">
                    ₹{payslipData.conveyanceAllowance.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Medical</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.medicalAllowance} 
                    onChange={(e) => handleInputChange('medicalAllowance', Number(e.target.value))}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-sm text-green-600">
                    ₹{payslipData.medicalAllowance.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Special Allowance</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.specialAllowance} 
                    onChange={(e) => handleInputChange('specialAllowance', Number(e.target.value))}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-sm text-green-600">
                    ₹{payslipData.specialAllowance.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Bonus</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.bonus} 
                    onChange={(e) => handleInputChange('bonus', Number(e.target.value))}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-sm text-green-600">
                    ₹{payslipData.bonus.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deductions Card */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-lg font-medium text-gray-900">
              Deductions
              <Badge className="bg-red-600 text-white px-2 py-1 text-xs rounded">₹{totalDeductions.toLocaleString()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">PF (12%)</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.pfDeduction} 
                    onChange={(e) => handleInputChange('pfDeduction', Number(e.target.value))}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-sm font-medium text-red-600">
                    ₹{payslipData.pfDeduction.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">TDS</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.tdsDeduction} 
                    onChange={(e) => handleInputChange('tdsDeduction', Number(e.target.value))}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-sm text-red-600">
                    ₹{payslipData.tdsDeduction.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Loan Deduction</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.loanDeduction} 
                    onChange={(e) => handleInputChange('loanDeduction', Number(e.target.value))}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-sm text-red-600">
                    ₹{payslipData.loanDeduction.toLocaleString()}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Advance</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.advance} 
                    onChange={(e) => handleInputChange('advance', Number(e.target.value))}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 text-sm text-red-600">
                    ₹{payslipData.advance.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-gray-900">Salary Summary - Real-Time Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">₹{totalEarnings.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">Total Earnings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">₹{totalDeductions.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">Total Deductions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">₹{netPay.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">Net Pay</div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex justify-center">
            <Button 
              onClick={generatePayslip} 
              disabled={!selectedEmployee}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              <Download className="mr-2 h-4 w-4" />
              Generate & Save Payslip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}