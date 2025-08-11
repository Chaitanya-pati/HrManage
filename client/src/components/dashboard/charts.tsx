import { useEffect, useRef } from "react";
import { DashboardMetrics } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartsProps {
  metrics?: DashboardMetrics;
  isLoading: boolean;
}

export default function Charts({ metrics, isLoading }: ChartsProps) {
  const attendanceChartRef = useRef<HTMLCanvasElement>(null);
  const departmentChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!metrics || isLoading || !metrics.attendanceTrend || !metrics.departmentDistribution) return;

    // Dynamically import Chart.js to avoid SSR issues
    import('chart.js/auto').then(({ default: Chart }) => {
      // Attendance Chart
      if (attendanceChartRef.current) {
        const attendanceCtx = attendanceChartRef.current.getContext('2d');
        if (attendanceCtx) {
          new Chart(attendanceCtx, {
            type: 'line',
            data: {
              labels: metrics.attendanceTrend?.map(item => item.date) || [],
              datasets: [{
                label: 'Attendance Rate',
                data: metrics.attendanceTrend?.map(item => item.rate) || [],
                borderColor: 'hsl(208.9, 88.2%, 41.2%)',
                backgroundColor: 'hsla(208.9, 88.2%, 41.2%, 0.1)',
                tension: 0.4,
                fill: true
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: function(value) {
                      return value + '%';
                    }
                  }
                }
              }
            }
          });
        }
      }

      // Department Chart
      if (departmentChartRef.current) {
        const departmentCtx = departmentChartRef.current.getContext('2d');
        if (departmentCtx) {
          new Chart(departmentCtx, {
            type: 'doughnut',
            data: {
              labels: metrics.departmentDistribution?.map(dept => dept.name) || [],
              datasets: [{
                data: metrics.departmentDistribution?.map(dept => dept.count) || [],
                backgroundColor: [
                  'hsl(208.9, 88.2%, 41.2%)',
                  'hsl(120, 100%, 25%)',
                  'hsl(48, 96%, 53%)',
                  'hsl(0, 72%, 51%)',
                  'hsl(280, 100%, 50%)',
                  'hsl(180, 100%, 50%)'
                ]
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    padding: 20,
                    usePointStyle: true
                  }
                }
              }
            }
          });
        }
      }
    });
  }, [metrics, isLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-surface rounded-xl p-6 border border-gray-200 card-hover transition-all duration-200" data-testid="attendance-chart-container">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral">Attendance Overview</h3>
          <select 
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary"
            data-testid="attendance-chart-filter"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
        <div className="h-64">
          <canvas ref={attendanceChartRef} data-testid="attendance-chart"></canvas>
        </div>
      </div>

      <div className="bg-surface rounded-xl p-6 border border-gray-200 card-hover transition-all duration-200" data-testid="department-chart-container">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral">Department Distribution</h3>
          <button 
            className="text-sm text-primary hover:text-secondary font-medium"
            data-testid="view-all-departments"
          >
            View All
          </button>
        </div>
        <div className="h-64">
          <canvas ref={departmentChartRef} data-testid="department-chart"></canvas>
        </div>
      </div>
    </div>
  );
}
