interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-surface border-b border-gray-200 px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={onMenuClick}
            data-testid="menu-toggle"
          >
            <i className="fas fa-bars text-gray-600"></i>
          </button>
          <h2 className="text-2xl font-semibold text-neutral" data-testid="page-title">
            {title}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search employees, departments..." 
              className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              data-testid="search-input"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
          
          <button 
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative"
            data-testid="notifications-button"
          >
            <i className="fas fa-bell text-lg"></i>
            <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
          
          <div className="flex items-center space-x-3" data-testid="user-profile">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=64&h=64" 
              alt="User profile picture" 
              className="w-10 h-10 rounded-full"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-neutral">John Anderson</p>
              <p className="text-xs text-gray-500">HR Manager</p>
            </div>
            <i className="fas fa-chevron-down text-gray-400"></i>
          </div>
        </div>
      </div>
    </header>
  );
}
