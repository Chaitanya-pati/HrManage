
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Clock, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ShiftForm } from "@/components/shifts/shift-form";
import type { Shift } from "@shared/schema";

export default function Shifts() {
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ["/api/shifts"],
  });

  const deleteShift = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/shifts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete shift");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({
        title: "Success",
        description: "Shift deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete shift",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this shift?")) {
      deleteShift.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingShift(null);
  };

  const formatTime = (time: string) => {
    if (time === "Flexible") return "Flexible";
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getShiftTypeBadge = (shift: Shift) => {
    if (shift.isNightShift) return <Badge variant="destructive">Night Shift</Badge>;
    if (shift.isFlexible) return <Badge variant="secondary">Flexible</Badge>;
    if (shift.isRotating) return <Badge variant="outline">Rotating</Badge>;
    return <Badge variant="default">Regular</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Shift Management</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Shift Management</h1>
          <p className="text-muted-foreground">Manage work shifts and schedules</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingShift(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingShift ? "Edit Shift" : "Create New Shift"}
              </DialogTitle>
            </DialogHeader>
            <ShiftForm shift={editingShift} onClose={handleFormClose} />
          </DialogContent>
        </Dialog>
      </div>

      {shifts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No shifts found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first shift schedule
            </p>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingShift(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Shift
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {shifts.map((shift: Shift) => (
            <Card key={shift.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{shift.name}</CardTitle>
                      <CardDescription>
                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getShiftTypeBadge(shift)}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(shift)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(shift.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Standard Hours</p>
                      <p className="text-sm text-muted-foreground">
                        {shift.standardHours || 8} hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Working Days</p>
                      <p className="text-sm text-muted-foreground">
                        {shift.workingDaysPerWeek || 5} days/week
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Break Duration</p>
                      <p className="text-sm text-muted-foreground">
                        {shift.breakDuration || 60} minutes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Grace Time</p>
                      <p className="text-sm text-muted-foreground">
                        {shift.graceTime || 10} minutes
                      </p>
                    </div>
                  </div>
                </div>
                
                {shift.weeklyOffPattern && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Weekly Off Days</p>
                    <div className="flex gap-2">
                      {shift.weeklyOffPattern.split(",").map((day) => (
                        <Badge key={day} variant="outline" className="capitalize">
                          {day.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
