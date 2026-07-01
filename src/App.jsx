import { useState, useEffect } from 'react';
import Sidebar from './components/layouts/Sidebar';
import Header from './components/layouts/Header';
import Dashboard from './components/dashboard/Dashboard';
import Login from './components/auth/Login';
import ProductList from './components/products/ProductList';
import OrderList from './components/orders/OrderList';
import CustomerList from './components/customers/CustomerList';
import DiscountList from './components/discounts/DiscountList';
import CMSManager from './components/cms/CMSManager';
import ServiceTickets from './components/services/ServiceTickets';
import FinancialReport from './components/analytics/FinancialReport';
import { api } from './api/client';

function App() {
  const [user, setUser] = useState(api.auth.getCurrentUser());
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  // Synchronize Dark Theme Mode
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Handle Session Timeout / 401 Logout events
  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setCurrentPage('dashboard');
    };
    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    api.auth.logout();
  };

  // If user is not authenticated, display login portal view
  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50
      dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-all duration-500 text-slate-800 dark:text-slate-100"
    >
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          collapsed={sideBarCollapsed}
          onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
          {/* Header Panel */}
          <Header
            sidebarCollapsed={sideBarCollapsed}
            onToggleSidebar={() => setSideBarCollapsed(!sideBarCollapsed)}
            theme={theme} 
            toggleTheme={toggleTheme}
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
          />

          {/* Page Routing Dispatcher */}
          <main className="flex-1 overflow-y-auto bg-transparent">
            <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
              
              {currentPage === 'dashboard' && <Dashboard />}
              
              {currentPage === 'products' && <ProductList />}
              
              {currentPage === 'orders' && <OrderList />}
              
              {currentPage === 'customer' && <CustomerList />}
              
              {currentPage === 'discounts' && <DiscountList />}
              
              {currentPage === 'cms' && <CMSManager />}
              
              {currentPage === 'services' && <ServiceTickets />}
              
              {currentPage === 'financial' && <FinancialReport />}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
