import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Save, X } from "lucide-react";
import type { SalaryComponents, Employee } from "@shared/schema";

interface SalaryEditorProps {
  employee: Employee;
}

const salaryComponentTypes = [
  "basic_salary", "hra", "medical_allowance", "transport_allowance", 
  "food_allowance", "bonus", "overtime", "special_allowance"
];

const frequencyOptions = ["monthly", "quarterly", "yearly", "one_time"];

interface SalaryComponentData {
  id: string;
  componentType: string;
  amount: number;
  frequency: string;
  financialYear: string;
  effectiveFrom: string;
  isActive: boolean;
}

export function SalaryEditor({ employee }: SalaryEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [newComponent, setNewComponent] = useState({
    componentType: "",
    amount: "",
    frequency: "monthly",
    financialYear: new Date().getFullYear().toString(),
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: salaryComponents, isLoading } = useQuery({
    queryKey: [`/api/salary-components/${employee.id}`],
  });

  const createComponentMutation = useMutation({
    mutationFn: async (componentData: any) => {
      return apiRequest("/api/salary-components", {
        method: "POST",
        body: JSON.stringify({
          employeeId: employee.id,
          componentType: componentData.componentType,
          amount: parseFloat(componentData.amount),
          frequency: componentData.frequency,
          financialYear: componentData.financialYear,
          effectiveFrom: new Date(componentData.effectiveFrom).getTime(),
          isActive: true
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/salary-components/${employee.id}`] });
      setNewComponent({ componentType: "", amount: "", frequency: "monthly", financialYear: new Date().getFullYear().toString(), effectiveFrom: new Date().toISOString().split('T')[0] });
      setIsEditing(false);
      toast({ title: "Success", description: "Salary component added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add salary component", variant: "destructive" });
    },
  });

  const updateComponentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/salary-components/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/salary-components/${employee.id}`] });
      setEditingComponent(null);
      toast({ title: "Success", description: "Salary component updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update salary component", variant: "destructive" });
    },
  });

  const handleCreateComponent = () => {
    if (!newComponent.componentType || !newComponent.amount) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    createComponentMutation.mutate(newComponent);
  };

  const calculateTotalSalary = () => {
    return salaryComponents?.reduce((total: number, component: SalaryComponentData) => {
      if (component.frequency === "monthly") {
        return total + component.amount;
      } else if (component.frequency === "yearly") {
        return total + (component.amount / 12);
      } else if (component.frequency === "quarterly") {
        return total + (component.amount / 3);
      }
      return total;
    }, 0) || 0;
  };

  if (isLoading) {
    return <div>Loading salary components...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Salary Editor - {employee.firstName} {employee.lastName}</span>
          <Badge variant="outline">
            Monthly Total: ₹{calculateTotalSalary().toLocaleString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Component */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Add Salary Component</h3>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isEditing ? "Cancel" : "Add Component"}
            </Button>
          </div>

          {isEditing && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="componentType">Component Type</Label>
                <Select
                  value={newComponent.componentType}
                  onValueChange={(value) => setNewComponent({ ...newComponent, componentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {salaryComponentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  type="number"
                  value={newComponent.amount}
                  onChange={(e) => setNewComponent({ ...newComponent, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newComponent.frequency}
                  onValueChange={(value) => setNewComponent({ ...newComponent, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleCreateComponent}
                  disabled={createComponentMutation.isPending}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Component
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Existing Components */}
        <div>
          <h3 className="text-lg font-medium mb-4">Current Salary Components</h3>
          {salaryComponents?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No salary components configured yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Monthly Equivalent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryComponents?.map((component: SalaryComponentData) => (
                  <TableRow key={component.id}>
                    <TableCell className="font-medium">
                      {component.componentType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </TableCell>
                    <TableCell>₹{component.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {component.frequency.charAt(0).toUpperCase() + component.frequency.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ₹{(
                        component.frequency === "monthly" ? component.amount :
                        component.frequency === "yearly" ? component.amount / 12 :
                        component.frequency === "quarterly" ? component.amount / 3 :
                        component.amount
                      ).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={component.isActive ? "default" : "secondary"}>
                        {component.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingComponent(component.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}