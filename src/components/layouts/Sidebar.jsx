import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, X } from 'lucide-react';
import { getNavigationForRole } from '../../config/navigation';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';
import BrandLogo from '../ui/BrandLogo';

function Sidebar({ collapsed, mobileOpen, onMobileClose, user, onLogout }) {
  const { theme } = useTheme();
  const location = useLocation();
  const menuItems = getNavigationForRole(user?.role);
  const [expandedItems, setExpandedItems] = useState(new Set(['ecommerce']));

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const isActive = (path) => location.pathname === path;
  const isGroupActive = (item) =>
    isActive(item.path) || item.submenu?.some((sub) => isActive(sub.path));

  const handleNavClick = () => {
    onMobileClose?.();
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-10 shrink-0 flex flex-col transition-transform duration-300 ease-in-out lg:transition-[width] lg:duration-500 lg:ease-in-out bg-white/95 dark:bg-slate-900/95 lg:bg-white/80 lg:dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${collapsed ? 'w-72 lg:w-20' : 'w-72'}`}
    >
      <div className="p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-3">
        <BrandLogo
          variant={theme === 'dark' ? 'white' : 'default'}
          logoSize="md"
          collapsed={collapsed && !mobileOpen}
          subtitle="Admin Panel"
          nameClassName="text-lg font-bold text-slate-800 dark:text-white leading-none"
          subtitleClassName="text-xs text-slate-500 dark:text-slate-400 mt-0.5 normal-case tracking-normal"
        />
        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const groupActive = isGroupActive(item);
          const showLabels = !collapsed || mobileOpen;

          return (
            <div key={item.id}>
              {item.submenu ? (
                <>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                      groupActive
                        ? 'sidebar-link-active'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 shrink-0" />
                      {showLabels && <span className="font-medium">{item.label}</span>}
                    </div>
                    {showLabels && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${expandedItems.has(item.id) ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>

                  {showLabels && expandedItems.has(item.id) && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                      {item.submenu.map((sub) => (
                        <NavLink
                          key={sub.id}
                          to={sub.path}
                          onClick={handleNavClick}
                          className={({ isActive: active }) =>
                            `block w-full text-left p-2.5 text-sm rounded-lg transition-all ${
                              active
                                ? 'text-blue-600 dark:text-neon-purple font-semibold bg-blue-50/80 dark:bg-neon-purple/15'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                            }`
                          }
                        >
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive: active }) =>
                    `w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'sidebar-link-active'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {showLabels && <span className="font-medium">{item.label}</span>}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      {user && (
        <div className="p-3 sm:p-4 border-t border-slate-200/50 dark:border-slate-700/50">
          {collapsed && !mobileOpen ? (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Logout"
              title="Logout"
              className="w-full flex items-center justify-center p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <Avatar name={user.name} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.role}</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                aria-label="Logout"
                title="Logout"
                className="shrink-0 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
