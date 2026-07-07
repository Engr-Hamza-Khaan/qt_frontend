export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  STAFF: 'Staff',
  VENDOR: 'Vendor',
  CUSTOMER: 'Customer',
};

export function isAdmin(role) {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
}

export function isStaffOrAbove(role) {
  return isAdmin(role) || role === ROLES.STAFF;
}

export function isVendor(role) {
  return role === ROLES.VENDOR;
}

export function canAccessFinancial(role) {
  return isAdmin(role);
}

export function canManageVendors(role) {
  return isAdmin(role) || role === ROLES.STAFF;
}

export function canAccessDashboard(role) {
  return isStaffOrAbove(role);
}

export function hasRole(user, allowedRoles = []) {
  if (!user?.role) return false;
  return allowedRoles.includes(user.role);
}
