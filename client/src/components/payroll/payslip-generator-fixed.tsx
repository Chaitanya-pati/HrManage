import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Edit, Save, X } from "lucide-react";

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
  // Earnings
  basicSalary: number;
  hra: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  overtimePay: number;
  bonus: number;
  // Deductions
  pfDeduction: number;
  esiDeduction: number;
  tdsDeduction: number;
  loan: number;
  advance: number;
  other: number;
}

export default function PayslipGeneratorFixed() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [payslipData, setPayslipData] = useState<PayslipData>({
    employeeId: "EMP001",
    employeeName: "John Doe",
    employeeCode: "EMP001",
    department: "Engineering",
    designation: "Senior Software Engineer",
    month: "August",
    year: "2025",
    workingDays: 22,
    presentDays: 22,
    // Earnings
    basicSalary: 75000,
    hra: 30000,
    conveyanceAllowance: 2400,
    medicalAllowance: 1250,
    specialAllowance: 11250,
    overtimePay: 0,
    bonus: 5000,
    // Deductions
    pfDeduction: 9000,
    esiDeduction: 0,
    tdsDeduction: 2500,
    loan: 0,
    advance: 0,
    other: 0,
  });

  // Sample employees for demo
  const employees = [
    { id: "EMP001", name: "John Doe", department: "Engineering", salary: 75000 },
    { id: "EMP002", name: "Rajesh Kumar", department: "Sales", salary: 65000 },
    { id: "EMP003", name: "Priya Sharma", department: "Marketing", salary: 58000 },
    { id: "EMP004", name: "Amit Patel", department: "Engineering", salary: 82000 },
    { id: "EMP005", name: "Sneha Gupta", department: "Finance", salary: 70000 },
  ];

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setSelectedEmployee(employeeId);
      const basicSalary = employee.salary;
      const hra = Math.round(basicSalary * 0.4);
      const specialAllowance = Math.round(basicSalary * 0.15);
      const pfDeduction = Math.round(basicSalary * 0.12);
      const tdsDeduction = Math.round(basicSalary * 0.05);

      setPayslipData({
        ...payslipData,
        employeeId: employee.id,
        employeeName: employee.name,
        employeeCode: employee.id,
        department: employee.department,
        basicSalary,
        hra,
        specialAllowance,
        pfDeduction,
        tdsDeduction,
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
    setPayslipData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePayslip = () => {
    alert(`Payslip generated for ${payslipData.employeeName}!\nNet Pay: ₹${netPay.toLocaleString()}\n\nThis would normally download a PDF file.`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payslip Generator</h1>
          <p className="text-muted-foreground">Generate detailed payslips with all salary components</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
            {isEditing ? "Save Changes" : "Edit Mode"}
          </Button>
          <Button onClick={generatePayslip} className="bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Employee Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Employee</CardTitle>
            <CardDescription>Choose employee for payslip generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select value={selectedEmployee} onValueChange={handleEmployeeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id})
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
              <div className="p-2 bg-gray-50 rounded font-medium">{payslipData.employeeName}</div>
            </div>
            <div>
              <Label>Employee Code</Label>
              <div className="p-2 bg-gray-50 rounded">{payslipData.employeeCode}</div>
            </div>
            <div>
              <Label>Department</Label>
              <div className="p-2 bg-gray-50 rounded">{payslipData.department}</div>
            </div>
            <div>
              <Label>Designation</Label>
              {isEditing ? (
                <Input 
                  value={payslipData.designation} 
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded">{payslipData.designation}</div>
              )}
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
                {Math.round((payslipData.presentDays / payslipData.workingDays) * 100)}%
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
                <Label>Overtime Pay</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.overtimePay} 
                    onChange={(e) => handleInputChange('overtimePay', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-green-50 rounded text-green-700">
                    ₹{payslipData.overtimePay.toLocaleString()}
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
                <Label>ESI</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.esiDeduction} 
                    onChange={(e) => handleInputChange('esiDeduction', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-red-50 rounded text-red-700">
                    ₹{payslipData.esiDeduction.toLocaleString()}
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
                <Label>Advance Deduction</Label>
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

              <div>
                <Label>Other Deductions</Label>
                {isEditing ? (
                  <Input 
                    type="number"
                    value={payslipData.other} 
                    onChange={(e) => handleInputChange('other', Number(e.target.value))}
                  />
                ) : (
                  <div className="p-2 bg-red-50 rounded text-red-700">
                    ₹{payslipData.other.toLocaleString()}
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
          <CardTitle>Salary Summary</CardTitle>
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
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <X className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
              {isEditing ? "Cancel Edit" : "Edit Details"}
            </Button>
            <Button onClick={generatePayslip} className="bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Generate & Download Payslip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}