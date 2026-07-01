
import {
  Menu,
  Search,
  Filter,
  Sun,
  Moon,
  Plus,
  Bell,
  Settings,
} from "lucide-react";
import profileImage from "../../assets/profilePic.jpg";

function Header({ sidebarCollapsed, onToggleSidebar, theme, toggleTheme, user, onLogout, currentPage }) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {/* Menu Button (Always visible) */}
          <button
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Dashboard Title (Hidden on small screens) */}
          <div className="hidden xl:block">
            <h1 className="text-lg md:text-2xl font-black text-slate-800 dark:text-white capitalize">
              {currentPage === 'dashboard' ? 'Dashboard Summary' : currentPage?.replace('-', ' ')}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
              Welcome back, {user?.name || 'Administrator'}! Here's the latest store activity.
            </p>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="w-full sm:w-auto flex-1 max-w-md order-last sm:order-none">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme Toggle */}
          <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={toggleTheme}>
            {theme==='light' ? (<Sun className="w-5 h-5" />) : (<Moon className="w-5 h-5" />)}
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-700">
            <img
              src={profileImage}
              alt="User"
              className="w-8 h-8 rounded-full ring-2 ring-blue-500 object-cover"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {user?.name || 'Hamza Khan'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.role || 'Administrator'}
              </p>
            </div>
            {user && (
              <button 
                onClick={onLogout}
                className="ml-2 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-lg transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
