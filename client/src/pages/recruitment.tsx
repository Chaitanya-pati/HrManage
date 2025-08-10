import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserPlus, Briefcase, Users, Clock, Edit, Trash2, MoreVertical, Eye } from "lucide-react";
import JobForm from "@/components/recruitment/job-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RecruitmentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data using React Query
  const { data: jobOpenings = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs"],
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job Deleted",
        description: "Job opening has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete job",
        variant: "destructive",
      });
    },
  });

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setShowAddForm(true);
  };

  const handleDeleteJob = (jobId: string) => {
    deleteJobMutation.mutate(jobId);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingJob(null);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingJob(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'full_time': return 'Full-time';
      case 'part_time': return 'Part-time';
      case 'contract': return 'Contract';
      case 'internship': return 'Internship';
      default: return type;
    }
  };

  // Summary calculations
  const activeJobs = jobOpenings?.filter((job: any) => job.status === 'active') || [];
  const totalApplicants = jobOpenings?.reduce((sum: number, job: any) => sum + (job.applicantCount || 0), 0) || 0;

  return (
    <div className="flex h-screen bg-hrms-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Recruitment" 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral">Recruitment Management</h1>
                <p className="text-gray-600">Manage job postings and track candidates</p>
              </div>
              <Button onClick={() => setShowAddForm(true)} data-testid="create-job-button">
                <UserPlus size={16} className="mr-2" />
                Post New Job
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Briefcase className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Open Positions</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="open-positions">
                        {activeJobs.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="total-applicants">
                        {totalApplicants}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Time to Hire</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="avg-time-hire">
                        28 days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <UserPlus className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">New Hires This Month</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="new-hires">
                        3
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Job Form Modal */}
            {showAddForm && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
                  <JobForm 
                    jobOpening={editingJob}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                  />
                </div>
              </div>
            )}

            {/* Job Openings */}
            <Card className="card-hover transition-all duration-200">
              <CardHeader>
                <CardTitle>Current Job Openings</CardTitle>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 py-3 border-b">
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : jobOpenings.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No job openings</h3>
                    <p className="text-gray-500 mb-4">Start by posting your first job opening.</p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <UserPlus size={16} className="mr-2" />
                      Post Job Opening
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full" data-testid="jobs-table">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Job Title</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Department</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Applicants</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(jobOpenings as any[]).map((job: any) => (
                          <tr key={job.id} className="border-b hover:bg-gray-50" data-testid={`job-row-${job.id}`}>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium" data-testid={`job-title-${job.id}`}>
                                  {job.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Posted: {new Date(job.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4" data-testid={`job-department-${job.id}`}>
                              {job.department}
                            </td>
                            <td className="py-3 px-4" data-testid={`job-location-${job.id}`}>
                              {job.location}
                            </td>
                            <td className="py-3 px-4" data-testid={`job-type-${job.id}`}>
                              {getJobTypeLabel(job.type)}
                            </td>
                            <td className="py-3 px-4" data-testid={`job-applicants-${job.id}`}>
                              <Badge variant="outline">{job.applicantCount || 0} applicants</Badge>
                            </td>
                            <td className="py-3 px-4" data-testid={`job-status-${job.id}`}>
                              {getStatusBadge(job.status)}
                            </td>
                            <td className="py-3 px-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" data-testid={`job-actions-${job.id}`}>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem 
                                    onClick={() => handleEditJob(job)}
                                    data-testid={`edit-job-${job.id}`}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Job
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    data-testid={`view-applicants-${job.id}`}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Applicants ({job.applicantCount || 0})
                                  </DropdownMenuItem>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem 
                                        onSelect={(e) => e.preventDefault()}
                                        data-testid={`delete-job-${job.id}`}
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Job
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Job Opening</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{job.title}"? This action cannot be undone.
                                          {job.applicantCount > 0 && (
                                            <span className="block mt-2 text-red-600 font-medium">
                                              Warning: This job has {job.applicantCount} applicant(s).
                                            </span>
                                          )}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleDeleteJob(job.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                          data-testid={`confirm-delete-job-${job.id}`}
                                        >
                                          Delete Job
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
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