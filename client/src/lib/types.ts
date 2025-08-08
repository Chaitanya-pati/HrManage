export interface DashboardMetrics {
  totalEmployees: number;
  activeToday: number;
  pendingLeaves: number;
  openPositions: number;
  attendanceRate: number;
  departmentDistribution: { name: string; count: number }[];
  attendanceTrend: { date: string; rate: number }[];
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: Date;
}
