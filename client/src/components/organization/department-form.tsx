import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Building, X } from "lucide-react";

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Department code is required").max(10, "Code must be 10 characters or less"),
  budget: z.string().optional(),
  headId: z.string().optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  department?: any;
}

export default function DepartmentForm({ onCancel, onSuccess, department }: DepartmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: department || {
      name: "",
      description: "",
      code: "",
      budget: "",
      headId: "",
    }
  });

  const createDepartmentMutation = useMutation({
    mutationFn: async (data: DepartmentFormData) => {
      const url = department ? `/api/departments/${department.id}` : "/api/departments";
      const method = department ? "PUT" : "POST";
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({
        title: department ? "Department Updated" : "Department Created",
        description: `Department has been ${department ? "updated" : "created"} successfully.`,
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || `Failed to ${department ? "update" : "create"} department`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DepartmentFormData) => {
    console.log("Submitting department:", data);
    createDepartmentMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>{department ? "Edit Department" : "Add New Department"}</span>
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Human Resources"
                data-testid="input-department-name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Department Code *</Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="e.g., HR"
                maxLength={10}
                data-testid="input-department-code"
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the department's role and responsibilities"
              rows={3}
              data-testid="textarea-department-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Annual Budget</Label>
            <Input
              id="budget"
              {...register("budget")}
              type="number"
              placeholder="e.g., 500000"
              data-testid="input-department-budget"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createDepartmentMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createDepartmentMutation.isPending}
              data-testid="button-save-department"
            >
              {createDepartmentMutation.isPending 
                ? "Saving..." 
                : (department ? "Update Department" : "Create Department")
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}