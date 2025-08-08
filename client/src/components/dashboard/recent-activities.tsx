import { Activity } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentActivitiesProps {
  activities?: Activity[];
  isLoading: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'employee':
      return { icon: 'fas fa-user-plus', color: 'bg-blue-100 text-primary' };
    case 'leave':
      return { icon: 'fas fa-check', color: 'bg-green-100 text-success' };
    case 'performance':
      return { icon: 'fas fa-clock', color: 'bg-yellow-100 text-warning' };
    case 'payroll':
      return { icon: 'fas fa-exclamation-triangle', color: 'bg-red-100 text-error' };
    default:
      return { icon: 'fas fa-info', color: 'bg-gray-100 text-gray-600' };
  }
};

const getTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return 'Less than an hour ago';
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

export default function RecentActivities({ activities, isLoading }: RecentActivitiesProps) {
  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl p-6 border border-gray-200 card-hover transition-all duration-200">
        <h3 className="text-lg font-semibold text-neutral mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 border border-gray-200 card-hover transition-all duration-200" data-testid="recent-activities">
      <h3 className="text-lg font-semibold text-neutral mb-4">Recent Activities</h3>
      <div className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity) => {
            const { icon, color } = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
                <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <i className={`${icon} text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral" data-testid={`activity-title-${activity.id}`}>
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-sm text-gray-500" data-testid={`activity-description-${activity.id}`}>
                      {activity.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1" data-testid={`activity-time-${activity.id}`}>
                    {getTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-8" data-testid="no-activities">
            <i className="fas fa-clock text-2xl mb-2"></i>
            <p>No recent activities</p>
          </div>
        )}
      </div>
      
      <button 
        className="w-full mt-4 text-center text-sm text-primary hover:text-secondary font-medium py-2 border-t border-gray-100"
        data-testid="view-all-activities"
      >
        View all activities
      </button>
    </div>
  );
}
