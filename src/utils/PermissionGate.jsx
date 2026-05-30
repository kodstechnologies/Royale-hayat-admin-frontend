import { normalizeUserRole } from "@/lib/userRole";

export const ADMIN_USER_KEY = "rhh_admin_user";

export const getStoredAdminUser = () => {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data && typeof parsed.data === "object" ? parsed.data : parsed;
  } catch {
    return null;
  }
};

/** Mirrors backend checkPermission.js — admin bypass, inactive block, permission includes. */
export const hasPermission = (permission) => {
  const user = getStoredAdminUser();
  if (!user) return false;

  if (user.isActive === false) return false;

  if (normalizeUserRole(String(user.role || "")) === "admin") return true;

  if (!permission) return true;

  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (permissionList) => {
  if (!permissionList?.length) return hasPermission(null);
  return permissionList.some((key) => hasPermission(key));
};

export const isNavItemAllowed = (item) => {
  const user = getStoredAdminUser();
  if (!user) return false;

  if (user.isActive === false) return false;

  const role = normalizeUserRole(String(user.role || ""));
  if (role === "admin") return true;

  if (
    item.excludeRoles?.some(
      (excluded) => normalizeUserRole(excluded) === role,
    )
  ) {
    return false;
  }

  if (!item.permissions?.length) return true;

  return hasAnyPermission(item.permissions);
};

export const PermissionGate = ({
  permission,
  permissions,
  excludeRoles,
  children,
  fallback = null,
}) => {
  const user = getStoredAdminUser();
  if (!user) return fallback;

  if (user.isActive === false) return fallback;

  const role = normalizeUserRole(String(user.role || ""));
  if (role === "admin") return children;

  if (
    excludeRoles?.some(
      (excluded) => normalizeUserRole(excluded) === role,
    )
  ) {
    return fallback;
  }

  const keys = permissions ?? (permission ? [permission] : []);
  if (keys.length === 0) return children;

  if (keys.some((key) => hasPermission(key))) return children;

  return fallback;
};

export default PermissionGate;
