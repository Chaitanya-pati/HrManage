import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar } from "lucide-react";

interface SalarySlipProps {
  payroll: any; // Payroll data with employee info
  employee: any;
  onDownload: () => void;
}

export default function SalarySlip({ payroll, employee, onDownload }: SalarySlipProps) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthName = monthNames[payroll.month - 1];
  const earnings = parseFloat(payroll.baseSalary || 0) + parseFloat(payroll.allowances || 0) + parseFloat(payroll.overtimePay || 0);
  const deductions = parseFloat(payroll.deductions || 0) + parseFloat(payroll.tax || 0);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Salary Slip</CardTitle>
              <p className="text-sm text-gray-500">
                {monthName} {payroll.year} • {employee.employeeId}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={payroll.status === "paid" ? "default" : "secondary"}>
              {payroll.status}
            </Badge>
            <Button onClick={onDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Employee Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Employee Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{employee.firstName} {employee.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Employee ID:</span>
                <span className="font-medium">{employee.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium">{employee.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{employee.department?.name || "N/A"}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Pay Period</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Month:</span>
                <span className="font-medium">{monthName} {payroll.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pay Date:</span>
                <span className="font-medium">
                  {payroll.payDate ? new Date(payroll.payDate).toLocaleDateString() : "Pending"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Working Days:</span>
                <span className="font-medium">
                  {Math.round(parseFloat(payroll.totalHours || 0) / 8)} days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hours Breakdown */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Hours Worked</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Regular Hours</p>
              <p className="text-xl font-bold text-blue-700">
                {parseFloat(payroll.regularHours || 0).toFixed(1)}h
              </p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Overtime Hours</p>
              <p className="text-xl font-bold text-orange-700">
                {parseFloat(payroll.overtimeHours || 0).toFixed(1)}h
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-xl font-bold text-green-700">
                {parseFloat(payroll.totalHours || 0).toFixed(1)}h
              </p>
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Earnings</h4>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Base Salary</span>
              <span className="font-medium">${parseFloat(payroll.baseSalary || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Allowances</span>
              <span className="font-medium">${parseFloat(payroll.allowances || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Overtime Pay</span>
              <span className="font-medium">${parseFloat(payroll.overtimePay || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 font-semibold text-green-700 bg-green-50 px-3 rounded">
              <span>Total Earnings</span>
              <span>${earnings.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Deductions</h4>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">${parseFloat(payroll.tax || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Other Deductions</span>
              <span className="font-medium">${parseFloat(payroll.deductions || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 font-semibold text-red-700 bg-red-50 px-3 rounded">
              <span>Total Deductions</span>
              <span>${deductions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="border-t-2 border-gray-200 pt-4">
          <div className="flex justify-between items-center p-4 bg-gray-900 text-white rounded-lg">
            <span className="text-lg font-semibold">Net Pay</span>
            <span className="text-2xl font-bold">
              ${parseFloat(payroll.netSalary || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 text-center pt-4 border-t">
          <p>This is a computer-generated salary slip. No signature required.</p>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}