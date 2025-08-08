const quickActions = [
  { icon: 'fas fa-user-plus', label: 'Add Employee', testId: 'quick-action-add-employee' },
  { icon: 'fas fa-calendar-check', label: 'Mark Attendance', testId: 'quick-action-mark-attendance' },
  { icon: 'fas fa-dollar-sign', label: 'Process Payroll', testId: 'quick-action-process-payroll' },
  { icon: 'fas fa-file-alt', label: 'Generate Report', testId: 'quick-action-generate-report' },
  { icon: 'fas fa-chart-bar', label: 'Performance Review', testId: 'quick-action-performance-review' },
  { icon: 'fas fa-briefcase', label: 'Job Posting', testId: 'quick-action-job-posting' },
];

export default function QuickActions() {
  return (
    <div className="bg-surface rounded-xl p-6 border border-gray-200 card-hover transition-all duration-200" data-testid="quick-actions">
      <h3 className="text-lg font-semibold text-neutral mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {quickActions.map((action) => (
          <button 
            key={action.label}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-all duration-200"
            data-testid={action.testId}
          >
            <i className={`${action.icon} text-primary text-2xl mb-2`}></i>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
