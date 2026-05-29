export const CALL_CENTER_HOME_PATH = "/appointment";

const CALL_CENTER_ALLOWED_PREFIXES = [CALL_CENTER_HOME_PATH];

export const normalizeUserRole = (role: string) =>
  role.trim().toLowerCase().replace(/[\s-]+/g, "_");

export const isCallCenterRole = (role: string) => {
  const normalized = normalizeUserRole(role);
  return normalized === "call_center" || normalized === "callcenter";
};

export const getStoredUserRole = (): string => {
  try {
    const storedUser = localStorage.getItem("rhh_admin_user");
    const storedAuth = localStorage.getItem("rhh_admin_auth");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    return String(
      parsedUser?.role ||
        parsedUser?.data?.role ||
        (typeof storedAuth === "string" ? storedAuth : ""),
    );
  } catch {
    return "";
  }
};

export const isCallCenterUser = () => isCallCenterRole(getStoredUserRole());

export const isCallCenterAllowedPath = (pathname: string) =>
  CALL_CENTER_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

export const getHomePathForUser = (
  user?: { role?: string; data?: { role?: string } } | null,
): string => {
  const role = user?.role || user?.data?.role || "";
  return isCallCenterRole(role) ? CALL_CENTER_HOME_PATH : "/";
};
