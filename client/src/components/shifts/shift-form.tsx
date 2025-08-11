
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import type { Shift, InsertShift } from "@shared/schema";

interface ShiftFormProps {
  shift?: Shift | null;
  onClose: () => void;
}

const weekDays = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
];

export function ShiftForm({ shift, onClose }: ShiftFormProps) {
  const [weeklyOffDays, setWeeklyOffDays] = useState<string[]>(
    shift?.weeklyOffPattern ? shift.weeklyOffPattern.split(",").map(d => d.trim()) : ["saturday", "sunday"]
  );
  
  const queryClient = useQueryClient();
  const isEditing = !!shift;

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InsertShift>({
    defaultValues: {
      name: shift?.name || "",
      startTime: shift?.startTime || "09:00",
      endTime: shift?.endTime || "17:00",
      breakDuration: shift?.breakDuration || 60,
      standardHours: shift?.standardHours || 8,
      graceTime: shift?.graceTime || 10,
      lateArrivalPenalty: shift?.lateArrivalPenalty || 0,
      earlyDeparturePenalty: shift?.earlyDeparturePenalty || 0,
      halfDayThreshold: shift?.halfDayThreshold || 4,
      isFlexible: shift?.isFlexible || false,
      isRotating: shift?.isRotating || false,
      isNightShift: shift?.isNightShift || false,
      nightShiftAllowance: shift?.nightShiftAllowance || 0,
      overtimeThreshold: shift?.overtimeThreshold || 8,
      maxOvertimePerDay: shift?.maxOvertimePerDay || 4,
      workingDaysPerWeek: shift?.workingDaysPerWeek || 5,
      holidayWorkingRate: shift?.holidayWorkingRate || 2,
      departmentId: shift?.departmentId || "",
    },
  });

  const isFlexible = watch("isFlexible");
  const isNightShift = watch("isNightShift");

  const createShift = useMutation({
    mutationFn: async (data: InsertShift) => {
      const shiftData = {
        ...data,
        weeklyOffPattern: weeklyOffDays.join(","),
      };
      
      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shiftData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create shift");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({
        title: "Success",
        description: "Shift created successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create shift",
        variant: "destructive",
      });
    },
  });

  const updateShift = useMutation({
    mutationFn: async (data: InsertShift) => {
      const shiftData = {
        ...data,
        weeklyOffPattern: weeklyOffDays.join(","),
      };
      
      const response = await fetch(`/api/shifts/${shift!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shiftData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update shift");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({
        title: "Success",
        description: "Shift updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update shift",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertShift) => {
    if (isEditing) {
      updateShift.mutate(data);
    } else {
      createShift.mutate(data);
    }
  };

  const handleWeeklyOffChange = (day: string, checked: boolean) => {
    if (checked) {
      setWeeklyOffDays([...weeklyOffDays, day]);
    } else {
      setWeeklyOffDays(weeklyOffDays.filter(d => d !== day));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Shift Name</Label>
              <Input
                id="name"
                {...register("name", { required: "Shift name is required" })}
                placeholder="e.g., Day Shift, Night Shift"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department (Optional)</Label>
              <Select onValueChange={(value) => setValue("departmentId", value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime", { required: "Start time is required" })}
                disabled={isFlexible}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime", { required: "End time is required" })}
                disabled={isFlexible}
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shift Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="isFlexible"
                {...register("isFlexible")}
                onCheckedChange={(checked) => setValue("isFlexible", checked)}
              />
              <Label htmlFor="isFlexible">Flexible Hours</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isRotating"
                {...register("isRotating")}
                onCheckedChange={(checked) => setValue("isRotating", checked)}
              />
              <Label htmlFor="isRotating">Rotating Shift</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isNightShift"
                {...register("isNightShift")}
                onCheckedChange={(checked) => setValue("isNightShift", checked)}
              />
              <Label htmlFor="isNightShift">Night Shift</Label>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="standardHours">Standard Hours</Label>
              <Input
                id="standardHours"
                type="number"
                step="0.5"
                {...register("standardHours", { valueAsNumber: true })}
                placeholder="8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
              <Input
                id="breakDuration"
                type="number"
                {...register("breakDuration", { valueAsNumber: true })}
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="graceTime">Grace Time (minutes)</Label>
              <Input
                id="graceTime"
                type="number"
                {...register("graceTime", { valueAsNumber: true })}
                placeholder="10"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workingDaysPerWeek">Working Days Per Week</Label>
              <Input
                id="workingDaysPerWeek"
                type="number"
                min="1"
                max="7"
                {...register("workingDaysPerWeek", { valueAsNumber: true })}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="halfDayThreshold">Half Day Threshold (hours)</Label>
              <Input
                id="halfDayThreshold"
                type="number"
                step="0.5"
                {...register("halfDayThreshold", { valueAsNumber: true })}
                placeholder="4"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overtime & Penalties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overtimeThreshold">Overtime Threshold (hours)</Label>
              <Input
                id="overtimeThreshold"
                type="number"
                step="0.5"
                {...register("overtimeThreshold", { valueAsNumber: true })}
                placeholder="8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxOvertimePerDay">Max Overtime Per Day (hours)</Label>
              <Input
                id="maxOvertimePerDay"
                type="number"
                step="0.5"
                {...register("maxOvertimePerDay", { valueAsNumber: true })}
                placeholder="4"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lateArrivalPenalty">Late Arrival Penalty (amount)</Label>
              <Input
                id="lateArrivalPenalty"
                type="number"
                step="0.01"
                {...register("lateArrivalPenalty", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="earlyDeparturePenalty">Early Departure Penalty (amount)</Label>
              <Input
                id="earlyDeparturePenalty"
                type="number"
                step="0.01"
                {...register("earlyDeparturePenalty", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="holidayWorkingRate">Holiday Working Rate (multiplier)</Label>
              <Input
                id="holidayWorkingRate"
                type="number"
                step="0.1"
                {...register("holidayWorkingRate", { valueAsNumber: true })}
                placeholder="2"
              />
            </div>
            {isNightShift && (
              <div className="space-y-2">
                <Label htmlFor="nightShiftAllowance">Night Shift Allowance</Label>
                <Input
                  id="nightShiftAllowance"
                  type="number"
                  step="0.01"
                  {...register("nightShiftAllowance", { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Off Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {weekDays.map((day) => (
              <div key={day.id} className="flex items-center space-x-2">
                <Checkbox
                  id={day.id}
                  checked={weeklyOffDays.includes(day.id)}
                  onCheckedChange={(checked) => handleWeeklyOffChange(day.id, checked as boolean)}
                />
                <Label htmlFor={day.id}>{day.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createShift.isPending || updateShift.isPending}>
          {createShift.isPending || updateShift.isPending
            ? "Saving..."
            : isEditing
            ? "Update Shift"
            : "Create Shift"}
        </Button>
      </div>
    </form>
  );
}
