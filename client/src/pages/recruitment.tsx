import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Briefcase, Users, Clock } from "lucide-react";

export default function RecruitmentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mockJobOpenings = [
    {
      id: "1",
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      status: "Active",
      applicants: 23,
      datePosted: "2024-01-15"
    },
    {
      id: "2", 
      title: "Marketing Manager",
      department: "Marketing",
      location: "New York",
      type: "Full-time", 
      status: "Active",
      applicants: 15,
      datePosted: "2024-01-20"
    },
    {
      id: "3",
      title: "HR Coordinator",
      department: "Human Resources",
      location: "San Francisco",
      type: "Part-time",
      status: "Paused",
      applicants: 8,
      datePosted: "2024-01-10"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'Paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'Closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
              <Button data-testid="create-job-button">
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
                        {mockJobOpenings.filter(job => job.status === 'Active').length}
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
                        {mockJobOpenings.reduce((sum, job) => sum + job.applicants, 0)}
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

            {/* Job Openings */}
            <Card className="card-hover transition-all duration-200">
              <CardHeader>
                <CardTitle>Current Job Openings</CardTitle>
              </CardHeader>
              <CardContent>
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
                      {mockJobOpenings.map((job) => (
                        <tr key={job.id} className="border-b hover:bg-gray-50" data-testid={`job-row-${job.id}`}>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium" data-testid={`job-title-${job.id}`}>
                                {job.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                Posted: {new Date(job.datePosted).toLocaleDateString()}
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
                            {job.type}
                          </td>
                          <td className="py-3 px-4" data-testid={`job-applicants-${job.id}`}>
                            <Badge variant="outline">{job.applicants} applicants</Badge>
                          </td>
                          <td className="py-3 px-4" data-testid={`job-status-${job.id}`}>
                            {getStatusBadge(job.status)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                data-testid={`view-applicants-${job.id}`}
                              >
                                View Applicants
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                data-testid={`edit-job-${job.id}`}
                              >
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}