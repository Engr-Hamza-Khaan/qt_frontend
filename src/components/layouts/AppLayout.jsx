import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

function AppLayout() {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileSidebarOpen) return undefined;

    const handleEscape = (e) => {
      if (e.key === 'Escape') setMobileSidebarOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-all duration-500 text-slate-800 dark:text-slate-100 overflow-x-hidden">
      <div className="flex h-screen overflow-hidden">
        {mobileSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <Sidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
          user={user}
          onLogout={logout}
        />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header
            sidebarCollapsed={sidebarCollapsed}
            mobileSidebarOpen={mobileSidebarOpen}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            user={user}
          />

          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 sm:p-5 md:p-6 space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
