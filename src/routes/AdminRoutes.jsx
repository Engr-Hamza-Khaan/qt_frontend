import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';
import { ROLES } from '../utils/roles';
import { getDefaultRoute } from '../config/navigation';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layouts/AppLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Login from '../components/auth/Login';

const Dashboard = lazy(() => import('../components/dashboard/Dashboard'));
const ProductList = lazy(() => import('../components/products/ProductList'));
const OrderList = lazy(() => import('../components/orders/OrderList'));
const CustomerList = lazy(() => import('../components/customers/CustomerList'));
const DiscountList = lazy(() => import('../components/discounts/DiscountList'));
const ServiceTickets = lazy(() => import('../components/services/ServiceTickets'));
const FinancialReport = lazy(() => import('../components/analytics/FinancialReport'));
const VendorList = lazy(() => import('../components/vendors/VendorList'));
const VendorPortal = lazy(() => import('../components/vendors/VendorPortal'));

function PageLoader() {
  return <LoadingSpinner size="lg" className="min-h-[400px]" />;
}

function LazyPage({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function RoleRedirect() {
  const { user } = useAuth();
  return <Navigate to={getDefaultRoute(user?.role)} replace />;
}

export default function AdminRoutes() {
  const staffRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF];
  const adminRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
  const vendorRoles = [ROLES.VENDOR];
  const productRoles = [...staffRoles, ROLES.VENDOR];
  const orderRoles = [...staffRoles, ROLES.VENDOR];

  return (
    <Routes>
      <Route
        path="login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleRedirect />} />

        <Route path="dashboard" element={<ProtectedRoute roles={staffRoles}><LazyPage><Dashboard /></LazyPage></ProtectedRoute>} />
        <Route path="vendor-portal" element={<ProtectedRoute roles={vendorRoles}><LazyPage><VendorPortal /></LazyPage></ProtectedRoute>} />
        <Route path="products" element={<ProtectedRoute roles={productRoles}><LazyPage><ProductList /></LazyPage></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute roles={orderRoles}><LazyPage><OrderList /></LazyPage></ProtectedRoute>} />
        <Route path="customers" element={<ProtectedRoute roles={staffRoles}><LazyPage><CustomerList /></LazyPage></ProtectedRoute>} />
        <Route path="discounts" element={<ProtectedRoute roles={staffRoles}><LazyPage><DiscountList /></LazyPage></ProtectedRoute>} />
        <Route path="vendors" element={<ProtectedRoute roles={staffRoles}><LazyPage><VendorList /></LazyPage></ProtectedRoute>} />
        <Route path="services" element={<ProtectedRoute roles={staffRoles}><LazyPage><ServiceTickets /></LazyPage></ProtectedRoute>} />
        <Route path="financial" element={<ProtectedRoute roles={adminRoles}><LazyPage><FinancialReport /></LazyPage></ProtectedRoute>} />
        <Route path="*" element={<RoleRedirect />} />
      </Route>
    </Routes>
  );
}
