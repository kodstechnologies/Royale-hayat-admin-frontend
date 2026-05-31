import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  getFirstAllowedRoutePath,
  isRouteAllowed,
} from "@/config/routePermissions";

/**
 * Layout guard: allows child routes only when the logged-in user's
 * permissions array (from user-management) includes the required access.
 */
const PermissionProtectedRoute = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const allowed = isRouteAllowed(pathname);

  useEffect(() => {
    if (!allowed) {
      toast.error("You do not have permission to access this page.");
    }
  }, [allowed, pathname]);

  if (allowed) {
    return <Outlet />;
  }

  const redirectTo = getFirstAllowedRoutePath(pathname);

  if (redirectTo === pathname) {
    return <Navigate to="/settings" replace />;
  }

  return (
    <Navigate
      to={redirectTo}
      replace
      state={{ from: pathname, reason: "permission_denied" }}
    />
  );
};

export default PermissionProtectedRoute;
