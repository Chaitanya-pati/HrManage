import { DashboardMetrics } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricsCardsProps {
  metrics?: DashboardMetrics;
  isLoading: boolean;
}

export default function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface rounded-xl p-6 border border-gray-200">
          <p className="text-center text-gray-500">Unable to load metrics</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Employees",
      value: metrics.totalEmployees.toLocaleString(),
      subtitle: "+12% from last month",
      icon: "fas fa-users",
      className: "metric-card",
      testId: "metric-total-employees"
    },
    {
      title: "Active Today",
      value: metrics.activeToday.toLocaleString(),
      subtitle: `${metrics.attendanceRate}% attendance`,
      icon: "fas fa-user-check",
      className: "metric-card-success",
      testId: "metric-active-today"
    },
    {
      title: "Pending Leaves",
      value: metrics.pendingLeaves.toString(),
      subtitle: "Avg 2.3 days",
      icon: "fas fa-calendar-times",
      className: "metric-card-warning",
      testId: "metric-pending-leaves"
    },
    {
      title: "Open Positions",
      value: metrics.openPositions.toString(),
      subtitle: "Avg 28 days to fill",
      icon: "fas fa-user-plus",
      className: "metric-card-neutral",
      testId: "metric-open-positions"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div 
          key={card.title}
          className={`${card.className} rounded-xl p-6 text-white card-hover transition-all duration-200`}
          data-testid={card.testId}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-opacity-80 text-sm font-medium">
                {card.title}
              </p>
              <p className="text-3xl font-bold mt-1" data-testid={`${card.testId}-value`}>
                {card.value}
              </p>
              <p className="text-white text-opacity-80 text-sm mt-2 flex items-center">
                <i className="fas fa-arrow-up mr-1"></i>
                <span>{card.subtitle}</span>
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <i className={`${card.icon} text-2xl`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
