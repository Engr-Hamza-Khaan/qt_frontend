import {
  LayoutDashboard,
  ShoppingBag,
  Zap,
  BarChart3,
  Truck,
} from 'lucide-react';
import {
  canAccessDashboard,
  canAccessFinancial,
  canManageVendors,
  isStaffOrAbove,
  isVendor,
} from '../utils/roles';

export const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your store performance' },
  'vendor-portal': { title: 'Vendor Portal', subtitle: 'Your supplier dashboard and earnings' },
  products: { title: 'Products', subtitle: 'Manage catalog, variations and inventory' },
  orders: { title: 'Orders', subtitle: 'Track and fulfill customer orders' },
  customers: { title: 'Customers', subtitle: 'Manage registered customer accounts' },
  discounts: { title: 'Discounts', subtitle: 'Create and manage promotional campaigns' },
  vendors: { title: 'Suppliers', subtitle: 'Manage vendor accounts and payouts' },
  services: { title: 'Service Tickets', subtitle: 'Repairs, trade-ins and live chat' },
  financial: { title: 'Financial Analytics', subtitle: 'Revenue, profit and performance reports' },
};

const ALL_NAV_ITEMS = [
  {
    id: 'dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    roles: (role) => canAccessDashboard(role),
  },
  {
    id: 'vendor-portal',
    path: '/admin/vendor-portal',
    icon: LayoutDashboard,
    label: 'My Portal',
    roles: (role) => isVendor(role),
  },
  {
    id: 'ecommerce',
    icon: ShoppingBag,
    label: 'E-commerce',
    roles: (role) => isStaffOrAbove(role) || isVendor(role),
    submenu: [
      { id: 'products', path: '/admin/products', label: 'Products', roles: (role) => isStaffOrAbove(role) || isVendor(role) },
      { id: 'orders', path: '/admin/orders', label: 'Orders', roles: (role) => isStaffOrAbove(role) || isVendor(role) },
      { id: 'customers', path: '/admin/customers', label: 'Customers', roles: (role) => isStaffOrAbove(role) },
      { id: 'discounts', path: '/admin/discounts', label: 'Discounts', roles: (role) => isStaffOrAbove(role) },
    ],
  },
  {
    id: 'vendors',
    path: '/admin/vendors',
    icon: Truck,
    label: 'Suppliers',
    roles: (role) => canManageVendors(role),
  },
  {
    id: 'services',
    path: '/admin/services',
    icon: Zap,
    label: 'Service Tickets',
    roles: (role) => isStaffOrAbove(role),
  },
  {
    id: 'financial',
    path: '/admin/financial',
    icon: BarChart3,
    label: 'Financial Analytics',
    roles: (role) => canAccessFinancial(role),
  },
];

export function getNavigationForRole(role) {
  return ALL_NAV_ITEMS.filter((item) => item.roles(role)).map((item) => {
    if (item.submenu) {
      return {
        ...item,
        submenu: item.submenu.filter((sub) => sub.roles(role)),
      };
    }
    return item;
  }).filter((item) => !item.submenu || item.submenu.length > 0);
}

export function getDefaultRoute(role) {
  if (isVendor(role)) return '/admin/vendor-portal';
  if (canAccessDashboard(role)) return '/admin/dashboard';
  return '/admin/products';
}
