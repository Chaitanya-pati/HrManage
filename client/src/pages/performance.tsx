import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Star, TrendingUp, Users, Award, Plus, FileText, Edit, Trash2, MoreVertical, Eye } from "lucide-react";
import type { Performance, EmployeeWithDepartment } from "@shared/schema";

export default function PerformancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [period, setPeriod] = useState("");
  const [rating, setRating] = useState("");
  const [feedback, setFeedback] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ["/api/performance", { year: selectedYear }],
  });

  const { data: employees } = useQuery({
    queryKey: ["/api/employees"],
  });

  const createPerformanceMutation = useMutation({
    mutationFn: async () => {
      const data = {
        employeeId: selectedEmployee,
        reviewerId: reviewer,
        period,
        year: selectedYear,
        goals: null,
        achievements: null,
        rating: parseInt(rating),
        feedback,
        status: "completed"
      };
      
      const url = editingReview ? `/api/performance/${editingReview.id}` : "/api/performance";
      const method = editingReview ? "PUT" : "POST";
      
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance"] });
      toast({
        title: editingReview ? "Review Updated" : "Review Created",
        description: `Performance review has been successfully ${editingReview ? "updated" : "recorded"}.`,
      });
      setShowCreateForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingReview ? "update" : "create"} performance review`,
        variant: "destructive",
      });
    },
  });

  const deletePerformanceMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return apiRequest("DELETE", `/api/performance/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance"] });
      toast({
        title: "Review Deleted",
        description: "Performance review has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedEmployee("");
    setReviewer("");
    setPeriod("");
    setRating("");
    setFeedback("");
    setEditingReview(null);
  };

  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setSelectedEmployee(review.employeeId);
    setReviewer(review.reviewerId);
    setPeriod(review.period);
    setRating(review.rating?.toString() || "");
    setFeedback(review.feedback || "");
    setShowCreateForm(true);
  };

  const handleDeleteReview = (reviewId: string) => {
    deletePerformanceMutation.mutate(reviewId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees?.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  const getEmployeePosition = (employeeId: string) => {
    const employee = employees?.find(emp => emp.id === employeeId);
    return employee?.position || 'N/A';
  };

  const completedReviews = performanceData?.filter(p => p.status === 'completed').length || 0;
  const pendingReviews = performanceData?.filter(p => p.status === 'pending').length || 0;
  const averageRating = performanceData && performanceData.length > 0 
    ? performanceData.reduce((sum, p) => sum + (p.rating || 0), 0) / performanceData.length
    : 0;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const periods = ['Q1', 'Q2', 'Q3', 'Q4', 'Annual', 'Mid-Year'];
  const activeEmployees = employees?.filter(emp => emp.status === 'active') || [];

  return (
    <div className="flex h-screen bg-hrms-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Performance Management" 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral">Performance Reviews</h1>
                <p className="text-gray-600">Track and manage employee performance</p>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-24" data-testid="year-selector">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={() => setShowCreateForm(true)}
                  data-testid="create-review-button"
                >
                  <Plus size={16} className="mr-2" />
                  New Review
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed Reviews</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="completed-reviews">
                        {completedReviews}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="pending-reviews">
                        {pendingReviews}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-2xl font-bold text-gray-900" data-testid="average-rating">
                          {averageRating.toFixed(1)}
                        </p>
                        <div className="flex">
                          {getRatingStars(Math.round(averageRating))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">High Performers</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="high-performers">
                        {performanceData?.filter(p => (p.rating || 0) >= 4).length || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create Review Form */}
            {showCreateForm && (
              <Card className="card-hover transition-all duration-200">
                <CardHeader>
                  <CardTitle>Create Performance Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Employee</label>
                      <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger data-testid="employee-select">
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeEmployees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.firstName} {employee.lastName} - {employee.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Reviewer</label>
                      <Select value={reviewer} onValueChange={setReviewer}>
                        <SelectTrigger data-testid="reviewer-select">
                          <SelectValue placeholder="Select reviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeEmployees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.firstName} {employee.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Review Period</label>
                      <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger data-testid="period-select">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {periods.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Rating (1-5)</label>
                      <Select value={rating} onValueChange={setRating}>
                        <SelectTrigger data-testid="rating-select">
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((r) => (
                            <SelectItem key={r} value={r.toString()}>
                              {r} {r === 1 ? 'Star' : 'Stars'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Feedback</label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Enter performance feedback and comments..."
                      rows={4}
                      data-testid="feedback-textarea"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowCreateForm(false);
                        resetForm();
                      }}
                      data-testid="cancel-review-button"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => createPerformanceMutation.mutate()}
                      disabled={!selectedEmployee || !reviewer || !period || !rating || createPerformanceMutation.isPending}
                      data-testid="submit-review-button"
                    >
                      {createPerformanceMutation.isPending 
                        ? (editingReview ? "Updating..." : "Creating...") 
                        : (editingReview ? "Update Review" : "Create Review")
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Reviews Table */}
            <Card className="card-hover transition-all duration-200">
              <CardHeader>
                <CardTitle>Performance Reviews - {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 py-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full" data-testid="performance-table">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Employee</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Reviewer</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Period</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Rating</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performanceData && performanceData.length > 0 ? (
                          performanceData.map((review) => (
                            <tr key={review.id} className="border-b hover:bg-gray-50" data-testid={`performance-row-${review.id}`}>
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${getEmployeeName(review.employeeId)}&size=32`}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full"
                                  />
                                  <div>
                                    <p className="font-medium" data-testid={`employee-name-${review.id}`}>
                                      {getEmployeeName(review.employeeId)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {getEmployeePosition(review.employeeId)}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4" data-testid={`reviewer-${review.id}`}>
                                {getEmployeeName(review.reviewerId)}
                              </td>
                              <td className="py-3 px-4" data-testid={`period-${review.id}`}>
                                {review.period}
                              </td>
                              <td className="py-3 px-4" data-testid={`rating-${review.id}`}>
                                <div className="flex items-center space-x-2">
                                  <div className="flex">
                                    {getRatingStars(review.rating || 0)}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {review.rating || 0}/5
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4" data-testid={`status-${review.id}`}>
                                {getStatusBadge(review.status)}
                              </td>
                              <td className="py-3 px-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" data-testid={`performance-actions-${review.id}`}>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem 
                                      data-testid={`view-review-${review.id}`}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleEditReview(review)}
                                      data-testid={`edit-review-${review.id}`}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Review
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                          onSelect={(e) => e.preventDefault()}
                                          data-testid={`delete-review-${review.id}`}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete Review
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Performance Review</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this performance review for {getEmployeeName(review.employeeId)}? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => handleDeleteReview(review.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                            data-testid={`confirm-delete-review-${review.id}`}
                                          >
                                            Delete Review
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500" data-testid="no-performance-data">
                              <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-lg font-medium">No performance reviews found</p>
                              <p className="text-sm mb-4">Create performance reviews to track employee performance for {selectedYear}</p>
                              <Button onClick={() => setShowCreateForm(true)}>
                                <Plus size={16} className="mr-2" />
                                Create Review
                              </Button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
