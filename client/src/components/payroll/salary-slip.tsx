
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, Building2, Mail, Phone } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SalarySlipProps {
  payroll: any; // Payroll data with employee info
  employee: any;
  onDownload?: () => void;
}

export default function SalarySlip({ payroll, employee, onDownload }: SalarySlipProps) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthName = monthNames[payroll.month - 1];
  
  // Enhanced calculations with proper fallbacks
  const baseSalary = parseFloat(payroll.baseSalary || 0);
  const hra = parseFloat(payroll.hra || 0);
  const conveyanceAllowance = parseFloat(payroll.conveyanceAllowance || 0);
  const medicalAllowance = parseFloat(payroll.medicalAllowance || 0);
  const specialAllowance = parseFloat(payroll.specialAllowance || 0);
  const overtimePay = parseFloat(payroll.overtimePay || 0);
  const nightShiftAllowance = parseFloat(payroll.nightShiftAllowance || 0);
  const fieldAllowance = parseFloat(payroll.fieldAllowance || 0);
  const performanceBonus = parseFloat(payroll.performanceBonus || 0);
  
  // Deductions
  const pfDeduction = parseFloat(payroll.pfDeduction || 0);
  const esiDeduction = parseFloat(payroll.esiDeduction || 0);
  const professionalTax = parseFloat(payroll.professionalTax || 0);
  const incomeTax = parseFloat(payroll.incomeTax || 0);
  const lossOfPayDeduction = parseFloat(payroll.lossOfPayDeduction || 0);
  const loanDeduction = parseFloat(payroll.loanDeduction || 0);
  const advanceDeduction = parseFloat(payroll.advanceDeduction || 0);
  const otherDeductions = parseFloat(payroll.otherDeductions || 0);
  
  // Calculate totals
  const totalEarnings = baseSalary + hra + conveyanceAllowance + medicalAllowance + 
                       specialAllowance + overtimePay + nightShiftAllowance + 
                       fieldAllowance + performanceBonus;
  
  const totalDeductions = pfDeduction + esiDeduction + professionalTax + incomeTax + 
                         lossOfPayDeduction + loanDeduction + advanceDeduction + otherDeductions;
  
  const netSalary = totalEarnings - totalDeductions;

  // PDF Generation Function
  const generatePDF = async () => {
    const element = document.getElementById('salary-slip-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `Salary_Slip_${employee.employeeId}_${monthName}_${payroll.year}.pdf`;
      pdf.save(fileName);
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 flex justify-end">
        <Button onClick={generatePDF} className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
      
      <Card id="salary-slip-content" className="w-full bg-white">
        <CardHeader className="border-b-2 border-gray-800 pb-6">
          {/* Company Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">YOUR COMPANY NAME</h1>
            <p className="text-sm text-gray-600">123 Business Street, City, State - 123456</p>
            <p className="text-sm text-gray-600">Email: hr@company.com | Phone: +91-1234567890</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle className="text-xl">SALARY SLIP</CardTitle>
                <p className="text-sm text-gray-500 font-medium">
                  {monthName} {payroll.year} • Slip No: SLP-{payroll.id?.slice(-6) || '000001'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={payroll.status === "processed" ? "default" : "secondary"} className="mb-2">
                {payroll.status?.toUpperCase() || 'DRAFT'}
              </Badge>
              <p className="text-xs text-gray-500">
                Generated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Employee Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                EMPLOYEE DETAILS
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-600 font-medium">Name:</span>
                  <span className="font-semibold">{employee.firstName} {employee.lastName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-600 font-medium">Employee ID:</span>
                  <span className="font-semibold">{employee.employeeId}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-600 font-medium">Designation:</span>
                  <span className="font-semibold">{employee.position}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-600 font-medium">Department:</span>
                  <span className="font-semibold">{employee.department?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-600 font-medium">Date of Joining:</span>
                  <span className="font-semibold">
                    {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                PAY PERIOD DETAILS
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-600 font-medium">Pay Period:</span>
                  <span className="font-semibold">{monthName} {payroll.year}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-600 font-medium">Working Days:</span>
                  <span className="font-semibold">{payroll.totalWorkingDays || 30}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-600 font-medium">Days Present:</span>
                  <span className="font-semibold">{payroll.daysPresent || 0}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-600 font-medium">Days Absent:</span>
                  <span className="font-semibold">{payroll.daysAbsent || 0}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-600 font-medium">Pay Date:</span>
                  <span className="font-semibold">
                    {payroll.payDate ? new Date(payroll.payDate).toLocaleDateString() : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Earnings */}
            <div>
              <h3 className="font-bold text-green-700 mb-4 text-lg">EARNINGS</h3>
              <div className="space-y-2">
                {baseSalary > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Basic Salary</span>
                    <span className="font-semibold">₹{baseSalary.toLocaleString()}</span>
                  </div>
                )}
                {hra > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">HRA</span>
                    <span className="font-semibold">₹{hra.toLocaleString()}</span>
                  </div>
                )}
                {conveyanceAllowance > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Conveyance Allowance</span>
                    <span className="font-semibold">₹{conveyanceAllowance.toLocaleString()}</span>
                  </div>
                )}
                {medicalAllowance > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Medical Allowance</span>
                    <span className="font-semibold">₹{medicalAllowance.toLocaleString()}</span>
                  </div>
                )}
                {specialAllowance > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Special Allowance</span>
                    <span className="font-semibold">₹{specialAllowance.toLocaleString()}</span>
                  </div>
                )}
                {overtimePay > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Overtime Pay</span>
                    <span className="font-semibold">₹{overtimePay.toLocaleString()}</span>
                  </div>
                )}
                {performanceBonus > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Performance Bonus</span>
                    <span className="font-semibold">₹{performanceBonus.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-3 font-bold text-green-700 bg-green-50 px-3 rounded border-2 border-green-200">
                  <span>TOTAL EARNINGS</span>
                  <span>₹{totalEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="font-bold text-red-700 mb-4 text-lg">DEDUCTIONS</h3>
              <div className="space-y-2">
                {pfDeduction > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">PF Deduction</span>
                    <span className="font-semibold">₹{pfDeduction.toLocaleString()}</span>
                  </div>
                )}
                {esiDeduction > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">ESI Deduction</span>
                    <span className="font-semibold">₹{esiDeduction.toLocaleString()}</span>
                  </div>
                )}
                {professionalTax > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Professional Tax</span>
                    <span className="font-semibold">₹{professionalTax.toLocaleString()}</span>
                  </div>
                )}
                {incomeTax > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Income Tax (TDS)</span>
                    <span className="font-semibold">₹{incomeTax.toLocaleString()}</span>
                  </div>
                )}
                {lossOfPayDeduction > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Loss of Pay</span>
                    <span className="font-semibold">₹{lossOfPayDeduction.toLocaleString()}</span>
                  </div>
                )}
                {loanDeduction > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Loan Deduction</span>
                    <span className="font-semibold">₹{loanDeduction.toLocaleString()}</span>
                  </div>
                )}
                {advanceDeduction > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Advance Deduction</span>
                    <span className="font-semibold">₹{advanceDeduction.toLocaleString()}</span>
                  </div>
                )}
                {otherDeductions > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700">Other Deductions</span>
                    <span className="font-semibold">₹{otherDeductions.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-3 font-bold text-red-700 bg-red-50 px-3 rounded border-2 border-red-200">
                  <span>TOTAL DEDUCTIONS</span>
                  <span>₹{totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="border-t-2 border-gray-800 pt-6">
            <div className="flex justify-between items-center p-6 bg-gray-900 text-white rounded-lg text-xl">
              <span className="font-bold">NET PAY</span>
              <span className="font-bold text-2xl">₹{netSalary.toLocaleString()}</span>
            </div>
            <div className="mt-4 text-center">
              <p className="font-semibold text-gray-700">
                Net Pay in Words: {numberToWords(netSalary)} Rupees Only
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 text-center pt-6 border-t space-y-2">
            <p className="font-semibold">*** This is a computer-generated salary slip and does not require signature ***</p>
            <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p>For any queries regarding this salary slip, please contact HR Department</p>
            <p className="text-red-600 font-medium">
              This document is confidential and intended solely for the use of the above named employee
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to convert number to words (simplified version)
function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  function convertThousands(n: number): string {
    let result = "";
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + " ";
      return result;
    }
    
    if (n > 0) {
      result += ones[n] + " ";
    }
    
    return result;
  }
  
  let result = "";
  const crores = Math.floor(num / 10000000);
  if (crores > 0) {
    result += convertThousands(crores) + "Crore ";
    num %= 10000000;
  }
  
  const lakhs = Math.floor(num / 100000);
  if (lakhs > 0) {
    result += convertThousands(lakhs) + "Lakh ";
    num %= 100000;
  }
  
  const thousands = Math.floor(num / 1000);
  if (thousands > 0) {
    result += convertThousands(thousands) + "Thousand ";
    num %= 1000;
  }
  
  if (num > 0) {
    result += convertThousands(num);
  }
  
  return result.trim();
}
