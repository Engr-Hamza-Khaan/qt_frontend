import { Menu, Sun, Moon, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { PAGE_TITLES } from '../../config/navigation';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';

function Header({ sidebarCollapsed, mobileSidebarOpen, onToggleSidebar, onToggleMobileSidebar, user }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const pathKey = location.pathname.replace('/admin/', '').split('/')[0] || 'dashboard';
  const pageInfo = PAGE_TITLES[pathKey] || { title: 'Quick Turn', subtitle: 'Administration Panel' };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={onToggleMobileSidebar}
            aria-label={mobileSidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            type="button"
            className="hidden lg:block p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-white truncate">
              {pageInfo.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              Welcome back, {user?.name}! {pageInfo.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            type="button"
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="hidden md:flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-700">
            <Avatar name={user?.name} size="sm" />
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
