import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  CreditCard, 
  Shield, 
  MapPin,
  Clock,
  DollarSign,
  FileText,
  Phone,
  Mail
} from "lucide-react";

const employeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  personalEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10, "Valid phone number is required"),
  personalPhone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional(),

  // Professional Info
  departmentId: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  managerId: z.string().optional(),
  employmentType: z.enum(["permanent", "contract", "temporary", "intern"]),
  workLocation: z.enum(["office", "field", "client_site", "remote", "hybrid"]),
  employeeGrade: z.string().optional(),
  hireDate: z.string().min(1, "Hire date is required"),
  probationEndDate: z.string().optional(),
  shiftId: z.string().optional(),

  // Salary Components
  baseSalary: z.string().min(1, "Base salary is required"),
  hra: z.string().default("0"),
  conveyanceAllowance: z.string().default("0"),
  medicalAllowance: z.string().default("0"),
  specialAllowance: z.string().default("0"),
  dearnessAllowance: z.string().default("0"),

  // Overtime Configuration
  overtimeEligible: z.boolean().default(false),
  overtimeCategory: z.enum(["workmen", "staff", "management"]).optional(),
  maxOvertimeHours: z.string().default("0"),
  overtimeRate: z.string().default("1.5"),
  holidayOvertimeRate: z.string().default("2.0"),
  nightShiftOvertimeRate: z.string().default("2.0"),

  // Field Work
  fieldWorkEligible: z.boolean().default(false),
  travelAllowance: z.string().default("0"),
  fieldAllowance: z.string().default("0"),

  // Statutory Info
  panNumber: z.string().optional(),
  aadharNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  pfAccountNumber: z.string().optional(),
  esiNumber: z.string().optional(),
  uanNumber: z.string().optional(),

  // Safety & Compliance
  safetyTrainingCompleted: z.boolean().default(false),
  medicalFitnessCertificate: z.string().optional(),
  policeVerification: z.enum(["pending", "completed", "not_required"]).default("not_required"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["/api/shifts"],
  });

  const { data: clientSites = [] } = useQuery({
    queryKey: ["/api/client-sites"],
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employmentType: "permanent",
      workLocation: "office",
      baseSalary: "0",
      hra: "0",
      conveyanceAllowance: "0",
      medicalAllowance: "0",
      specialAllowance: "0",
      dearnessAllowance: "0",
      overtimeEligible: false,
      overtimeRate: "1.5",
      holidayOvertimeRate: "2.0",
      nightShiftOvertimeRate: "2.0",
      fieldWorkEligible: false,
      travelAllowance: "0",
      fieldAllowance: "0",
      safetyTrainingCompleted: false,
      policeVerification: "not_required",
    }
  });

  const watchOvertimeEligible = watch("overtimeEligible");
  const watchFieldWorkEligible = watch("fieldWorkEligible");
  const watchWorkLocation = watch("workLocation");

  useEffect(() => {
    if (employee) {
      // Populate form with existing employee data
      Object.keys(employee).forEach((key) => {
        setValue(key as keyof EmployeeFormData, employee[key]);
      });
    }
  }, [employee, setValue]);

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const url = employee ? `/api/employees/${employee.id}` : "/api/employees";
      const method = employee ? "PUT" : "POST";
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: employee ? "Employee Updated" : "Employee Created",
        description: `Employee has been ${employee ? "updated" : "created"} successfully.`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || `Failed to ${employee ? "update" : "create"} employee`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    createEmployeeMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {employee ? "Edit Employee" : "Add New Employee"}
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="personal" className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center space-x-1">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Professional</span>
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Salary</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center space-x-1">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="statutory" className="flex items-center space-x-1">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Statutory</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center space-x-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID *</Label>
                    <Input
                      id="employeeId"
                      {...register("employeeId")}
                      placeholder="EMP001"
                      disabled={!!employee}
                    />
                    {errors.employeeId && (
                      <p className="text-sm text-red-500">{errors.employeeId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      {...register("middleName")}
                      placeholder="Michael"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register("dateOfBirth")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => setValue("gender", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Marital Status</Label>
                    <Select onValueChange={(value) => setValue("maritalStatus", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Work Phone *</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="+91 9876543210"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personalPhone">Personal Phone</Label>
                    <Input
                      id="personalPhone"
                      {...register("personalPhone")}
                      placeholder="+91 9876543211"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="john.doe@company.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="personalEmail">Personal Email</Label>
                    <Input
                      id="personalEmail"
                      type="email"
                      {...register("personalEmail")}
                      placeholder="john.doe@gmail.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Information */}
          <TabsContent value="professional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Professional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Department *</Label>
                    <Select onValueChange={(value) => setValue("departmentId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.departmentId && (
                      <p className="text-sm text-red-500">{errors.departmentId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Select onValueChange={(value) => setValue("position", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Software Development */}
                        <SelectItem value="software_developer">Software Developer</SelectItem>
                        <SelectItem value="junior_developer">Junior Developer</SelectItem>
                        <SelectItem value="senior_developer">Senior Developer</SelectItem>
                        <SelectItem value="lead_developer">Lead Developer</SelectItem>
                        <SelectItem value="full_stack_developer">Full Stack Developer</SelectItem>
                        <SelectItem value="frontend_developer">Frontend Developer</SelectItem>
                        <SelectItem value="backend_developer">Backend Developer</SelectItem>
                        <SelectItem value="mobile_developer">Mobile Developer</SelectItem>
                        <SelectItem value="devops_engineer">DevOps Engineer</SelectItem>
                        <SelectItem value="qa_engineer">QA Engineer</SelectItem>
                        <SelectItem value="test_engineer">Test Engineer</SelectItem>
                        <SelectItem value="software_architect">Software Architect</SelectItem>
                        <SelectItem value="technical_lead">Technical Lead</SelectItem>
                        <SelectItem value="engineering_manager">Engineering Manager</SelectItem>

                        {/* Data & Analytics */}
                        <SelectItem value="data_scientist">Data Scientist</SelectItem>
                        <SelectItem value="data_analyst">Data Analyst</SelectItem>
                        <SelectItem value="data_engineer">Data Engineer</SelectItem>
                        <SelectItem value="business_analyst">Business Analyst</SelectItem>
                        <SelectItem value="system_analyst">System Analyst</SelectItem>

                        {/* Design & UX */}
                        <SelectItem value="ui_designer">UI Designer</SelectItem>
                        <SelectItem value="ux_designer">UX Designer</SelectItem>
                        <SelectItem value="graphic_designer">Graphic Designer</SelectItem>
                        <SelectItem value="product_designer">Product Designer</SelectItem>

                        {/* Product Management */}
                        <SelectItem value="product_manager">Product Manager</SelectItem>
                        <SelectItem value="senior_product_manager">Senior Product Manager</SelectItem>
                        <SelectItem value="product_owner">Product Owner</SelectItem>
                        <SelectItem value="project_manager">Project Manager</SelectItem>
                        <SelectItem value="program_manager">Program Manager</SelectItem>
                        <SelectItem value="scrum_master">Scrum Master</SelectItem>

                        {/* Sales & Marketing */}
                        <SelectItem value="sales_executive">Sales Executive</SelectItem>
                        <SelectItem value="sales_manager">Sales Manager</SelectItem>
                        <SelectItem value="marketing_executive">Marketing Executive</SelectItem>
                        <SelectItem value="marketing_manager">Marketing Manager</SelectItem>
                        <SelectItem value="digital_marketing_specialist">Digital Marketing Specialist</SelectItem>
                        <SelectItem value="content_writer">Content Writer</SelectItem>
                        <SelectItem value="seo_specialist">SEO Specialist</SelectItem>
                        <SelectItem value="social_media_manager">Social Media Manager</SelectItem>

                        {/* Finance & Accounting */}
                        <SelectItem value="accountant">Accountant</SelectItem>
                        <SelectItem value="senior_accountant">Senior Accountant</SelectItem>
                        <SelectItem value="financial_analyst">Financial Analyst</SelectItem>
                        <SelectItem value="finance_manager">Finance Manager</SelectItem>
                        <SelectItem value="accounts_payable_clerk">Accounts Payable Clerk</SelectItem>
                        <SelectItem value="accounts_receivable_clerk">Accounts Receivable Clerk</SelectItem>
                        <SelectItem value="payroll_specialist">Payroll Specialist</SelectItem>
                        <SelectItem value="tax_specialist">Tax Specialist</SelectItem>
                        <SelectItem value="financial_controller">Financial Controller</SelectItem>
                        <SelectItem value="cfo">Chief Financial Officer</SelectItem>

                        {/* Human Resources */}
                        <SelectItem value="hr_executive">HR Executive</SelectItem>
                        <SelectItem value="hr_manager">HR Manager</SelectItem>
                        <SelectItem value="hr_generalist">HR Generalist</SelectItem>
                        <SelectItem value="hr_specialist">HR Specialist</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="talent_acquisition_specialist">Talent Acquisition Specialist</SelectItem>
                        <SelectItem value="training_specialist">Training Specialist</SelectItem>
                        <SelectItem value="compensation_benefits_specialist">Compensation & Benefits Specialist</SelectItem>
                        <SelectItem value="hr_business_partner">HR Business Partner</SelectItem>
                        <SelectItem value="chro">Chief Human Resources Officer</SelectItem>

                        {/* Operations */}
                        <SelectItem value="operations_manager">Operations Manager</SelectItem>
                        <SelectItem value="operations_executive">Operations Executive</SelectItem>
                        <SelectItem value="process_analyst">Process Analyst</SelectItem>
                        <SelectItem value="operations_coordinator">Operations Coordinator</SelectItem>
                        <SelectItem value="facility_manager">Facility Manager</SelectItem>
                        <SelectItem value="admin_assistant">Admin Assistant</SelectItem>
                        <SelectItem value="office_manager">Office Manager</SelectItem>

                        {/* Customer Service */}
                        <SelectItem value="customer_service_representative">Customer Service Representative</SelectItem>
                        <SelectItem value="customer_success_manager">Customer Success Manager</SelectItem>
                        <SelectItem value="support_engineer">Support Engineer</SelectItem>
                        <SelectItem value="technical_support_specialist">Technical Support Specialist</SelectItem>
                        <SelectItem value="call_center_agent">Call Center Agent</SelectItem>

                        {/* Legal & Compliance */}
                        <SelectItem value="legal_counsel">Legal Counsel</SelectItem>
                        <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
                        <SelectItem value="legal_assistant">Legal Assistant</SelectItem>
                        <SelectItem value="contract_specialist">Contract Specialist</SelectItem>

                        {/* Security */}
                        <SelectItem value="security_officer">Security Officer</SelectItem>
                        <SelectItem value="security_guard">Security Guard</SelectItem>
                        <SelectItem value="cybersecurity_analyst">Cybersecurity Analyst</SelectItem>
                        <SelectItem value="information_security_manager">Information Security Manager</SelectItem>

                        {/* Executive */}
                        <SelectItem value="ceo">Chief Executive Officer</SelectItem>
                        <SelectItem value="cto">Chief Technology Officer</SelectItem>
                        <SelectItem value="coo">Chief Operating Officer</SelectItem>
                        <SelectItem value="cmo">Chief Marketing Officer</SelectItem>
                        <SelectItem value="vp_engineering">VP Engineering</SelectItem>
                        <SelectItem value="vp_sales">VP Sales</SelectItem>
                        <SelectItem value="vp_marketing">VP Marketing</SelectItem>
                        <SelectItem value="director">Director</SelectItem>
                        <SelectItem value="associate_director">Associate Director</SelectItem>

                        {/* Industrial/Manufacturing */}
                        <SelectItem value="production_manager">Production Manager</SelectItem>
                        <SelectItem value="production_supervisor">Production Supervisor</SelectItem>
                        <SelectItem value="machine_operator">Machine Operator</SelectItem>
                        <SelectItem value="quality_control_inspector">Quality Control Inspector</SelectItem>
                        <SelectItem value="maintenance_technician">Maintenance Technician</SelectItem>
                        <SelectItem value="safety_officer">Safety Officer</SelectItem>
                        <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                        <SelectItem value="inventory_specialist">Inventory Specialist</SelectItem>
                        <SelectItem value="logistics_coordinator">Logistics Coordinator</SelectItem>
                        <SelectItem value="plant_engineer">Plant Engineer</SelectItem>
                        <SelectItem value="mechanical_engineer">Mechanical Engineer</SelectItem>
                        <SelectItem value="electrical_engineer">Electrical Engineer</SelectItem>
                        <SelectItem value="industrial_engineer">Industrial Engineer</SelectItem>
                        <SelectItem value="field_technician">Field Technician</SelectItem>
                        <SelectItem value="site_supervisor">Site Supervisor</SelectItem>
                        <SelectItem value="foreman">Foreman</SelectItem>
                        <SelectItem value="welder">Welder</SelectItem>
                        <SelectItem value="fitter">Fitter</SelectItem>
                        <SelectItem value="electrician">Electrician</SelectItem>
                        <SelectItem value="plumber">Plumber</SelectItem>
                        <SelectItem value="carpenter">Carpenter</SelectItem>
                        <SelectItem value="mason">Mason</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="helper">Helper</SelectItem>
                        <SelectItem value="laborer">Laborer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.position && (
                      <p className="text-sm text-red-500">{errors.position.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="managerId">Reporting Manager</Label>
                    <Select onValueChange={(value) => setValue("managerId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.filter((emp: any) => emp.id !== employee?.id).map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type *</Label>
                    <Select onValueChange={(value) => setValue("employmentType", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="permanent">Permanent</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workLocation">Work Location *</Label>
                    <Select onValueChange={(value) => setValue("workLocation", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="field">Field Work</SelectItem>
                        <SelectItem value="client_site">Client Site</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeGrade">Employee Grade</Label>
                    <Select onValueChange={(value) => setValue("employeeGrade", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trainee">Trainee</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="associate">Associate</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="senior_manager">Senior Manager</SelectItem>
                        <SelectItem value="director">Director</SelectItem>
                        <SelectItem value="vice_president">Vice President</SelectItem>
                        <SelectItem value="l1">L1 - Entry Level</SelectItem>
                        <SelectItem value="l2">L2 - Associate</SelectItem>
                        <SelectItem value="l3">L3 - Mid Level</SelectItem>
                        <SelectItem value="l4">L4 - Senior</SelectItem>
                        <SelectItem value="l5">L5 - Staff</SelectItem>
                        <SelectItem value="l6">L6 - Principal</SelectItem>
                        <SelectItem value="l7">L7 - Distinguished</SelectItem>
                        <SelectItem value="m1">M1 - Team Lead</SelectItem>
                        <SelectItem value="m2">M2 - Manager</SelectItem>
                        <SelectItem value="m3">M3 - Senior Manager</SelectItem>
                        <SelectItem value="m4">M4 - Director</SelectItem>
                        <SelectItem value="grade_a">Grade A</SelectItem>
                        <SelectItem value="grade_b">Grade B</SelectItem>
                        <SelectItem value="grade_c">Grade C</SelectItem>
                        <SelectItem value="grade_d">Grade D</SelectItem>
                        <SelectItem value="grade_e">Grade E</SelectItem>
                        <SelectItem value="exec_1">Executive Level 1</SelectItem>
                        <SelectItem value="exec_2">Executive Level 2</SelectItem>
                        <SelectItem value="exec_3">Executive Level 3</SelectItem>
                        <SelectItem value="specialist">Specialist</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                        <SelectItem value="consultant">Consultant</SelectItem>
                        <SelectItem value="advisor">Advisor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Hire Date *</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      {...register("hireDate")}
                    />
                    {errors.hireDate && (
                      <p className="text-sm text-red-500">{errors.hireDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="probationEndDate">Probation End Date</Label>
                    <Input
                      id="probationEndDate"
                      type="date"
                      {...register("probationEndDate")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shiftId">Assigned Shift</Label>
                    <Select onValueChange={(value) => setValue("shiftId", value)} defaultValue="">
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-shift">No Shift Assigned</SelectItem>
                        {shifts && shifts.length > 0 ? (
                          shifts.map((shift: any) => (
                            <SelectItem key={shift.id} value={shift.id}>
                              {shift.name} ({shift.startTime} - {shift.endTime})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>Loading shifts...</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Field Work Configuration */}
                {(watchWorkLocation === "field" || watchWorkLocation === "client_site") && (
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span>Field Work Configuration</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={watchFieldWorkEligible}
                          onCheckedChange={(checked) => setValue("fieldWorkEligible", checked)}
                        />
                        <Label>Field Work Eligible</Label>
                      </div>

                      {watchFieldWorkEligible && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="travelAllowance">Travel Allowance (₹/day)</Label>
                            <Input
                              id="travelAllowance"
                              type="number"
                              {...register("travelAllowance")}
                              placeholder="500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="fieldAllowance">Field Allowance (₹/day)</Label>
                            <Input
                              id="fieldAllowance"
                              type="number"
                              {...register("fieldAllowance")}
                              placeholder="200"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Salary Information */}
          <TabsContent value="salary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Salary Structure</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseSalary">Base Salary (₹/month) *</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      {...register("baseSalary")}
                      placeholder="50000"
                    />
                    {errors.baseSalary && (
                      <p className="text-sm text-red-500">{errors.baseSalary.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hra">HRA (₹/month)</Label>
                    <Input
                      id="hra"
                      type="number"
                      {...register("hra")}
                      placeholder="15000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="conveyanceAllowance">Conveyance Allowance</Label>
                    <Input
                      id="conveyanceAllowance"
                      type="number"
                      {...register("conveyanceAllowance")}
                      placeholder="2000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalAllowance">Medical Allowance</Label>
                    <Input
                      id="medicalAllowance"
                      type="number"
                      {...register("medicalAllowance")}
                      placeholder="2000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialAllowance">Special Allowance</Label>
                    <Input
                      id="specialAllowance"
                      type="number"
                      {...register("specialAllowance")}
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dearnessAllowance">Dearness Allowance</Label>
                  <Input
                    id="dearnessAllowance"
                    type="number"
                    {...register("dearnessAllowance")}
                    placeholder="1000"
                  />
                </div>

                {/* Overtime Configuration */}
                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Overtime Configuration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={watchOvertimeEligible}
                        onCheckedChange={(checked) => setValue("overtimeEligible", checked)}
                      />
                      <Label>Overtime Eligible</Label>
                    </div>

                    {watchOvertimeEligible && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="overtimeCategory">Overtime Category</Label>
                          <Select onValueChange={(value) => setValue("overtimeCategory", value as any)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="workmen">Workmen</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="management">Management</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="maxOvertimeHours">Max OT Hours/Day</Label>
                          <Input
                            id="maxOvertimeHours"
                            type="number"
                            step="0.5"
                            {...register("maxOvertimeHours")}
                            placeholder="4"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="overtimeRate">OT Rate Multiplier</Label>
                          <Input
                            id="overtimeRate"
                            type="number"
                            step="0.1"
                            {...register("overtimeRate")}
                            placeholder="1.5"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="holidayOvertimeRate">Holiday OT Rate</Label>
                          <Input
                            id="holidayOvertimeRate"
                            type="number"
                            step="0.1"
                            {...register("holidayOvertimeRate")}
                            placeholder="2.0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nightShiftOvertimeRate">Night Shift OT Rate</Label>
                          <Input
                            id="nightShiftOvertimeRate"
                            type="number"
                            step="0.1"
                            {...register("nightShiftOvertimeRate")}
                            placeholder="2.0"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Information */}
          <TabsContent value="education" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Education & Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Educational qualifications, skills, and previous experience will be managed 
                  through separate forms after employee creation.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Degree Management</Badge>
                  <Badge variant="outline">Skills Assessment</Badge>
                  <Badge variant="outline">Experience Records</Badge>
                  <Badge variant="outline">Certifications</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statutory Information */}
          <TabsContent value="statutory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Statutory Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input
                      id="panNumber"
                      {...register("panNumber")}
                      placeholder="ABCDE1234F"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber">Aadhaar Number</Label>
                    <Input
                      id="aadharNumber"
                      {...register("aadharNumber")}
                      placeholder="1234 5678 9012"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pfAccountNumber">PF Account Number</Label>
                    <Input
                      id="pfAccountNumber"
                      {...register("pfAccountNumber")}
                      placeholder="DL/12345/67890"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="esiNumber">ESI Number</Label>
                    <Input
                      id="esiNumber"
                      {...register("esiNumber")}
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="uanNumber">UAN Number</Label>
                    <Input
                      id="uanNumber"
                      {...register("uanNumber")}
                      placeholder="123456789012"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passportNumber">Passport Number</Label>
                    <Input
                      id="passportNumber"
                      {...register("passportNumber")}
                      placeholder="A1234567"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance */}
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Safety & Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={watch("safetyTrainingCompleted")}
                    onCheckedChange={(checked) => setValue("safetyTrainingCompleted", checked)}
                  />
                  <Label>Safety Training Completed</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalFitnessCertificate">Medical Fitness Certificate</Label>
                  <Input
                    id="medicalFitnessCertificate"
                    {...register("medicalFitnessCertificate")}
                    placeholder="Certificate number or file reference"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policeVerification">Police Verification Status</Label>
                  <Select onValueChange={(value) => setValue("policeVerification", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_required">Not Required</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : (employee ? "Update Employee" : "Create Employee")}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}