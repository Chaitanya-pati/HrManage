import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, DollarSign, FileText, Percent, Settings, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const salarySettingsSchema = z.object({
  pfPercentage: z.number().min(0).max(100),
  pfEmployerContribution: z.number().min(0).max(100),
  esiPercentage: z.number().min(0).max(10),
  esiEmployerContribution: z.number().min(0).max(10),
  tdsThreshold: z.number().min(0),
  professionalTaxAmount: z.number().min(0),
  gratuityPercentage: z.number().min(0).max(100),
  bonusPercentage: z.number().min(0).max(100),
  overtimeMultiplier: z.number().min(1).max(5),
  weekendOvertimeMultiplier: z.number().min(1).max(5),
  holidayOvertimeMultiplier: z.number().min(1).max(5),
  autoCalculateTds: z.boolean(),
  autoCalculatePf: z.boolean(),
  autoCalculateEsi: z.boolean(),
  enableGratuity: z.boolean(),
  enableBonus: z.boolean(),
});

type SalarySettingsForm = z.infer<typeof salarySettingsSchema>;

const defaultSettings: SalarySettingsForm = {
  pfPercentage: 12,
  pfEmployerContribution: 12,
  esiPercentage: 0.75,
  esiEmployerContribution: 3.25,
  tdsThreshold: 250000,
  professionalTaxAmount: 200,
  gratuityPercentage: 4.81,
  bonusPercentage: 8.33,
  overtimeMultiplier: 1.5,
  weekendOvertimeMultiplier: 2.0,
  holidayOvertimeMultiplier: 2.5,
  autoCalculateTds: true,
  autoCalculatePf: true,
  autoCalculateEsi: true,
  enableGratuity: true,
  enableBonus: true,
};

export default function SalarySettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SalarySettingsForm>({
    resolver: zodResolver(salarySettingsSchema),
    defaultValues: defaultSettings,
  });

  const onSubmit = async (data: SalarySettingsForm) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save settings
      console.log("Saving salary settings:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved successfully",
        description: "Salary configuration has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    form.reset(defaultSettings);
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Salary Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure payroll calculations and deductions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active Configuration
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">PF Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{form.watch('pfPercentage')}%</p>
              </div>
              <Percent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ESI Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{form.watch('esiPercentage')}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">TDS Threshold</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{form.watch('tdsThreshold').toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overtime Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{form.watch('overtimeMultiplier')}x</p>
              </div>
              <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="statutory" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="statutory">Statutory Deductions</TabsTrigger>
              <TabsTrigger value="overtime">Overtime Settings</TabsTrigger>
              <TabsTrigger value="benefits">Benefits & Gratuity</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
            </TabsList>

            <TabsContent value="statutory" className="space-y-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Provident Fund (PF) Settings
                  </CardTitle>
                  <CardDescription>
                    Configure PF deduction rates for employees and employer contributions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="pfPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee PF Percentage</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Percentage of basic salary deducted as PF
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="pfEmployerContribution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer PF Contribution</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Employer contribution percentage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Employee State Insurance (ESI) Settings
                  </CardTitle>
                  <CardDescription>
                    Configure ESI deduction rates and employer contributions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="esiPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee ESI Percentage</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="10"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Percentage of gross salary deducted as ESI
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="esiEmployerContribution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employer ESI Contribution</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="10"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Employer contribution percentage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tax Deduction Settings
                  </CardTitle>
                  <CardDescription>
                    Configure TDS and professional tax settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="tdsThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TDS Threshold (Annual)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Annual income threshold for TDS deduction
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="professionalTaxAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Tax (Monthly)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Fixed monthly professional tax amount
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overtime" className="space-y-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Overtime Calculation Rules
                  </CardTitle>
                  <CardDescription>
                    Configure overtime multipliers for different scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="overtimeMultiplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regular Overtime Multiplier</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Multiplier for regular overtime hours
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="weekendOvertimeMultiplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weekend Overtime Multiplier</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Multiplier for weekend overtime
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="holidayOvertimeMultiplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Holiday Overtime Multiplier</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Multiplier for holiday overtime
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benefits" className="space-y-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Benefits & Gratuity Settings
                  </CardTitle>
                  <CardDescription>
                    Configure bonus and gratuity calculation parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="bonusPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Bonus Percentage</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Percentage of annual salary as bonus
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gratuityPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gratuity Percentage</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Gratuity calculation percentage (4.81% as per law)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="enableBonus"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Annual Bonus</FormLabel>
                            <FormDescription>
                              Automatically calculate and include annual bonus in payroll
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="enableGratuity"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Gratuity Calculation</FormLabel>
                            <FormDescription>
                              Calculate gratuity for eligible employees (5+ years service)
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Automation Settings
                  </CardTitle>
                  <CardDescription>
                    Configure automatic calculation and processing options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="autoCalculateTds"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto Calculate TDS</FormLabel>
                          <FormDescription>
                            Automatically calculate and deduct TDS based on income slabs
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="autoCalculatePf"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto Calculate PF</FormLabel>
                          <FormDescription>
                            Automatically calculate and deduct PF contributions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="autoCalculateEsi"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto Calculate ESI</FormLabel>
                          <FormDescription>
                            Automatically calculate and deduct ESI contributions
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex gap-4 justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetToDefaults}
                  className="bg-white dark:bg-gray-700"
                >
                  Reset to Defaults
                </Button>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="bg-white dark:bg-gray-700"
                  >
                    Preview Changes
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {/* Important Notice */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Important Notice</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Changes to salary settings will affect all future payroll calculations. Please verify all percentages 
                and amounts comply with current statutory requirements before saving.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}