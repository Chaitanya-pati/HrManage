import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, X, MapPin, DollarSign, Calendar } from "lucide-react";

const jobOpeningSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["full_time", "part_time", "contract", "internship"]),
  status: z.enum(["active", "paused", "closed"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  experience: z.string().optional(),
  skills: z.string().optional(),
});

type JobOpeningFormData = z.infer<typeof jobOpeningSchema>;

interface JobFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  jobOpening?: any;
}

export default function JobForm({ onCancel, onSuccess, jobOpening }: JobFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments } = useQuery({
    queryKey: ["/api/departments"],
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm<JobOpeningFormData>({
    resolver: zodResolver(jobOpeningSchema),
    defaultValues: jobOpening || {
      title: "",
      department: "",
      location: "",
      type: "full_time",
      status: "active",
      description: "",
      requirements: "",
      salaryMin: "",
      salaryMax: "",
      experience: "",
      skills: "",
    }
  });

  useEffect(() => {
    if (jobOpening) {
      Object.keys(jobOpening).forEach((key) => {
        setValue(key as keyof JobOpeningFormData, jobOpening[key]);
      });
    }
  }, [jobOpening, setValue]);

  const createJobMutation = useMutation({
    mutationFn: async (data: JobOpeningFormData) => {
      const url = jobOpening ? `/api/jobs/${jobOpening.id}` : "/api/jobs";
      const method = jobOpening ? "PUT" : "POST";
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: jobOpening ? "Job Updated" : "Job Posted",
        description: `Job opening has been ${jobOpening ? "updated" : "posted"} successfully.`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || `Failed to ${jobOpening ? "update" : "post"} job`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobOpeningFormData) => {
    console.log("Submitting job:", data);
    createJobMutation.mutate(data);
  };

  const jobTypes = [
    { value: "full_time", label: "Full-time" },
    { value: "part_time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "closed", label: "Closed" },
  ];

  const locations = [
    "Remote",
    "New York, NY",
    "San Francisco, CA", 
    "Los Angeles, CA",
    "Chicago, IL",
    "Austin, TX",
    "Seattle, WA",
    "Boston, MA",
    "Denver, CO",
    "Miami, FL",
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5" />
            <span>{jobOpening ? "Edit Job Opening" : "Post New Job Opening"}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            data-testid="button-close-form"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g., Senior Software Engineer"
                data-testid="input-job-title"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select onValueChange={(value) => setValue("department", value)} defaultValue={jobOpening?.department}>
                <SelectTrigger data-testid="select-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {(departments as any[])?.length > 0 ? (
                    (departments as any[]).map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select onValueChange={(value) => setValue("location", value)} defaultValue={jobOpening?.location}>
                <SelectTrigger data-testid="select-location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Employment Type *</Label>
              <Select onValueChange={(value) => setValue("type", value as any)} defaultValue={jobOpening?.type || "full_time"}>
                <SelectTrigger data-testid="select-job-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select onValueChange={(value) => setValue("status", value as any)} defaultValue={jobOpening?.status || "active"}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select onValueChange={(value) => setValue("experience", value)} defaultValue={jobOpening?.experience}>
                <SelectTrigger data-testid="select-experience">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                  <SelectItem value="senior">Senior Level (5-10 years)</SelectItem>
                  <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Minimum Salary</Label>
              <Input
                id="salaryMin"
                {...register("salaryMin")}
                type="number"
                placeholder="e.g., 60000"
                data-testid="input-salary-min"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryMax">Maximum Salary</Label>
              <Input
                id="salaryMax"
                {...register("salaryMax")}
                type="number"
                placeholder="e.g., 120000"
                data-testid="input-salary-max"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Provide a detailed job description including responsibilities and role overview..."
              rows={4}
              data-testid="textarea-description"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements & Qualifications *</Label>
            <Textarea
              id="requirements"
              {...register("requirements")}
              placeholder="List the required qualifications, skills, and experience for this position..."
              rows={4}
              data-testid="textarea-requirements"
            />
            {errors.requirements && (
              <p className="text-sm text-red-500">{errors.requirements.message}</p>
            )}
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label htmlFor="skills">Key Skills & Technologies</Label>
            <Textarea
              id="skills"
              {...register("skills")}
              placeholder="List key skills and technologies (e.g., React, Node.js, Python, AWS, etc.)"
              rows={3}
              data-testid="textarea-skills"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createJobMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createJobMutation.isPending}
              data-testid="button-save-job"
            >
              {createJobMutation.isPending 
                ? "Saving..." 
                : (jobOpening ? "Update Job" : "Post Job")
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}