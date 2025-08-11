import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar, Settings } from "lucide-react";

const allowanceFormSchema = z.object({
  allowanceType: z.string().min(1, "Allowance type is required"),
  amount: z.number().min(0, "Amount must be positive"),
  isPercentage: z.boolean().default(false),
  frequency: z.enum(["monthly", "quarterly", "yearly", "one-time"]).default("monthly"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

type AllowanceForm = z.infer<typeof allowanceFormSchema>;

interface EmployeeBenefitsTabProps {
  employeeId: string;
}

export function EmployeeBenefitsTab({ employeeId }: EmployeeBenefitsTabProps) {
  const { toast } = useToast();
  const [showAddAllowance, setShowAddAllowance] = useState(false);

  // Fetch allowances
  const { data: allowances = [], isLoading } = useQuery({
    queryKey: ["/api/employees", employeeId, "allowances"],
    enabled: !!employeeId,
  });

  // Create allowance mutation
  const createAllowanceMutation = useMutation({
    mutationFn: (data: AllowanceForm) => 
      apiRequest(`/api/employees/${employeeId}/allowances`, {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "allowances"] });
      toast({ title: "Allowance added successfully" });
      setShowAddAllowance(false);
      allowanceForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Failed to add allowance", description: error.message, variant: "destructive" });
    },
  });

  // Form
  const allowanceForm = useForm<AllowanceForm>({
    resolver: zodResolver(allowanceFormSchema),
    defaultValues: {
      allowanceType: "",
      amount: 0,
      isPercentage: false,
      frequency: "monthly",
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const allowanceTypes = [
    { value: "travel", label: "Travel Allowance" },
    { value: "mobile", label: "Mobile Allowance" },
    { value: "food", label: "Food Allowance" },
    { value: "transport", label: "Transport Allowance" },
    { value: "special", label: "Special Allowance" },
    { value: "housing", label: "Housing Allowance" },
    { value: "education", label: "Education Allowance" },
    { value: "medical", label: "Medical Allowance" },
    { value: "internet", label: "Internet Allowance" },
    { value: "uniform", label: "Uniform Allowance" },
    { value: "vehicle", label: "Vehicle Allowance" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Employee Benefits & Allowances
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage individual allowances and benefits for this employee
          </p>
        </div>
        <Dialog open={showAddAllowance} onOpenChange={setShowAddAllowance}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Allowance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Allowance</DialogTitle>
              <DialogDescription>
                Add a special allowance for this employee
              </DialogDescription>
            </DialogHeader>
            <Form {...allowanceForm}>
              <form onSubmit={allowanceForm.handleSubmit((data) => createAllowanceMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={allowanceForm.control}
                  name="allowanceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allowance Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select allowance type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allowanceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={allowanceForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter amount"
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={allowanceForm.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="one-time">One-time</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={allowanceForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={allowanceForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={allowanceForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Additional details..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddAllowance(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={createAllowanceMutation.isPending}
                  >
                    {createAllowanceMutation.isPending ? "Adding..." : "Add Allowance"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Allowances Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-6">
              <p className="text-muted-foreground">Loading allowances...</p>
            </CardContent>
          </Card>
        ) : allowances.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="flex flex-col items-center gap-2">
                <DollarSign className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No special allowances found</p>
                <p className="text-sm text-muted-foreground">Add individual allowances like travel, mobile, or housing allowances</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          allowances.map((allowance: any) => (
            <Card key={allowance.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      {allowanceTypes.find(type => type.value === allowance.allowanceType)?.label || 
                       allowance.allowanceType.charAt(0).toUpperCase() + allowance.allowanceType.slice(1) + " Allowance"}
                    </CardTitle>
                    <CardDescription>
                      {allowance.description || `${allowance.frequency} allowance payment`}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{allowance.amount.toLocaleString()}
                      {allowance.isPercentage && "%"}
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {allowance.frequency}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Start: {new Date(allowance.startDate).toLocaleDateString()}
                  </span>
                  {allowance.endDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      End: {new Date(allowance.endDate).toLocaleDateString()}
                    </span>
                  )}
                  {allowance.isActive && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Summary */}
      {allowances.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Allowances Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₹{allowances
                    .filter((a: any) => a.frequency === 'monthly' && a.isActive)
                    .reduce((sum: number, a: any) => sum + a.amount, 0)
                    .toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {allowances.filter((a: any) => a.isActive).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Allowances</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ₹{allowances
                    .filter((a: any) => a.frequency === 'yearly' && a.isActive)
                    .reduce((sum: number, a: any) => sum + a.amount, 0)
                    .toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Yearly Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  ₹{allowances
                    .filter((a: any) => a.frequency === 'one-time' && a.isActive)
                    .reduce((sum: number, a: any) => sum + a.amount, 0)
                    .toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">One-time Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}