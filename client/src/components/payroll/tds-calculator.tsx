import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calculator, Save, FileText } from "lucide-react";
import type { TdsConfiguration, Employee } from "@shared/schema";

interface TdsCalculatorProps {
  employee: Employee;
}

// TDS tax slabs for FY 2024-25 (as example)
const taxSlabs = [
  { min: 0, max: 300000, rate: 0, description: "Up to ₹3,00,000 - No Tax" },
  { min: 300000, max: 700000, rate: 5, description: "₹3,00,001 to ₹7,00,000 - 5%" },
  { min: 700000, max: 1000000, rate: 10, description: "₹7,00,001 to ₹10,00,000 - 10%" },
  { min: 1000000, max: 1200000, rate: 15, description: "₹10,00,001 to ₹12,00,000 - 15%" },
  { min: 1200000, max: 1500000, rate: 20, description: "₹12,00,001 to ₹15,00,000 - 20%" },
  { min: 1500000, max: Infinity, rate: 30, description: "Above ₹15,00,000 - 30%" },
];

export function TdsCalculator({ employee }: TdsCalculatorProps) {
  const [annualSalary, setAnnualSalary] = useState("");
  const [deductions, setDeductions] = useState({
    section80C: "150000", // Maximum 80C deduction
    section80D: "25000",  // Health insurance
    hra: "0",
    professionalTax: "2500",
    other: "0"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentFinancialYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  const { data: tdsConfig } = useQuery({
    queryKey: [`/api/tds-configuration/${currentFinancialYear}`],
  });

  const saveTdsConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      return apiRequest("/api/tds-configuration", {
        method: "POST",
        body: JSON.stringify(configData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tds-configuration/${currentFinancialYear}`] });
      toast({ title: "Success", description: "TDS configuration saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save TDS configuration", variant: "destructive" });
    },
  });

  const calculateTds = () => {
    const annual = parseFloat(annualSalary) || 0;
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + parseFloat(val || "0"), 0);
    const taxableIncome = Math.max(0, annual - totalDeductions);
    
    let tax = 0;
    let remainingIncome = taxableIncome;

    for (const slab of taxSlabs) {
      if (remainingIncome <= 0) break;
      
      const taxableInThisSlab = Math.min(remainingIncome, slab.max - slab.min);
      tax += (taxableInThisSlab * slab.rate) / 100;
      remainingIncome -= taxableInThisSlab;
    }

    // Add education cess (4% on total tax)
    const educationCess = tax * 0.04;
    const totalTax = tax + educationCess;
    const monthlyTds = totalTax / 12;

    return {
      annualSalary: annual,
      totalDeductions,
      taxableIncome,
      annualTax: totalTax,
      monthlyTds,
      effectiveRate: annual > 0 ? (totalTax / annual) * 100 : 0
    };
  };

  const handleSaveTdsConfig = () => {
    const calculation = calculateTds();
    saveTdsConfigMutation.mutate({
      employeeId: employee.id,
      financialYear: currentFinancialYear,
      annualSalary: calculation.annualSalary,
      totalDeductions: calculation.totalDeductions,
      taxableIncome: calculation.taxableIncome,
      annualTax: calculation.annualTax,
      monthlyTds: calculation.monthlyTds,
      isActive: true,
      taxSlabs: JSON.stringify(taxSlabs),
      deductionBreakup: JSON.stringify(deductions)
    });
  };

  const tdsCalculation = calculateTds();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            TDS Calculator - {employee.firstName} {employee.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Annual Salary Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="annualSalary">Annual Salary (₹)</Label>
              <Input
                type="number"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(e.target.value)}
                placeholder="Enter annual salary"
              />
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="text-lg font-medium mb-4">Tax Deductions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="section80C">Section 80C (₹)</Label>
                <Input
                  type="number"
                  value={deductions.section80C}
                  onChange={(e) => setDeductions({ ...deductions, section80C: e.target.value })}
                  placeholder="150000"
                />
                <p className="text-sm text-gray-500 mt-1">Max: ₹1,50,000</p>
              </div>
              <div>
                <Label htmlFor="section80D">Section 80D (₹)</Label>
                <Input
                  type="number"
                  value={deductions.section80D}
                  onChange={(e) => setDeductions({ ...deductions, section80D: e.target.value })}
                  placeholder="25000"
                />
                <p className="text-sm text-gray-500 mt-1">Health Insurance</p>
              </div>
              <div>
                <Label htmlFor="hra">HRA Exemption (₹)</Label>
                <Input
                  type="number"
                  value={deductions.hra}
                  onChange={(e) => setDeductions({ ...deductions, hra: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="professionalTax">Professional Tax (₹)</Label>
                <Input
                  type="number"
                  value={deductions.professionalTax}
                  onChange={(e) => setDeductions({ ...deductions, professionalTax: e.target.value })}
                  placeholder="2500"
                />
              </div>
              <div>
                <Label htmlFor="other">Other Deductions (₹)</Label>
                <Input
                  type="number"
                  value={deductions.other}
                  onChange={(e) => setDeductions({ ...deductions, other: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Calculation Results */}
      <Card>
        <CardHeader>
          <CardTitle>TDS Calculation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ₹{tdsCalculation.taxableIncome.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Taxable Income</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                ₹{tdsCalculation.annualTax.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Annual Tax</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ₹{tdsCalculation.monthlyTds.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Monthly TDS</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Calculation Summary</h4>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Annual Salary</TableCell>
                    <TableCell className="text-right">₹{tdsCalculation.annualSalary.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Deductions</TableCell>
                    <TableCell className="text-right">₹{tdsCalculation.totalDeductions.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Taxable Income</TableCell>
                    <TableCell className="text-right">₹{tdsCalculation.taxableIncome.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Effective Tax Rate</TableCell>
                    <TableCell className="text-right">{tdsCalculation.effectiveRate.toFixed(2)}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h4 className="font-medium mb-2">Tax Slab Breakdown</h4>
              <div className="space-y-2">
                {taxSlabs.map((slab, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{slab.description}</span>
                    <Badge variant="outline">{slab.rate}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button onClick={handleSaveTdsConfig} disabled={saveTdsConfigMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save TDS Configuration
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Form 16
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}