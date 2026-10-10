import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import {useAuth} from "../hooks/useAuth.js"

const PublicRoute = ({children}) => {
  const {user, loading} = useAuth();
  const location = useLocation();

  if(loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500">Verifying session...</p>
      </div>
    )
  }

  if(user) {
    const origin = location.state?.from?.pathname || "/";

    return <Navigate to={origin} replace/>
  }

  return children ? children : <Outlet />
}

export default PublicRoute;