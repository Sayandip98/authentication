import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div>
        <div></div>
        <p>Verifying session...</p>
      </div>
    )
  }

  if (!user) {
    return (<Navigate to="/login" state={{ from: location }} replace />)
  }

  return children ? children : <Outlet />
}

export default ProtectedRoute;