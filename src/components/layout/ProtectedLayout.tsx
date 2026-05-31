// layouts/ProtectedLayout.tsx

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { getMe } from "@/api/auth";
import { ADMIN_USER_KEY } from "@/utils/PermissionGate";
import {
  CALL_CENTER_HOME_PATH,
  isCallCenterAllowedPath,
  isCallCenterUser,
} from "@/lib/userRole";

const ProtectedLayout = () => {
  const location = useLocation();

  const [loading, setLoading] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);

  useEffect(() => {

    const checkAuth = async () => {

      try {

        const response = await getMe();
        const user = response?.data ?? response;
        if (user && typeof user === "object") {
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
        }

        setAuthenticated(true);

      } catch (error) {

        setAuthenticated(false);

      } finally {

        setLoading(false);
      }
    };

    checkAuth();

  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isCallCenterUser() && !isCallCenterAllowedPath(location.pathname)) {
    return <Navigate to={CALL_CENTER_HOME_PATH} replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;