// layouts/ProtectedLayout.tsx

import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { getMe } from "@/api/auth";

const ProtectedLayout = () => {

  const [loading, setLoading] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);

  useEffect(() => {

    const checkAuth = async () => {

      try {

        await getMe();

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

  return <Outlet />;
};

export default ProtectedLayout;