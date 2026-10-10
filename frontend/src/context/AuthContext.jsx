import React, { createContext, useState, useEffect, useContext, Children } from "react";
import { authAPI } from "../api/auth.api.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser();

      const userData = response.data?.data?.user;
      setUser(userData || null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  const register = async (data) => {
    const response = await authAPI.register(data);

    const userData = response.data?.data?.user;

    setUser(userData);
    return response.data;
  }

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);

    const userData = response.data?.data?.user;
    setUser(userData);
    return response.data;
  }

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null)
    }
  }

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? {...prev, ...updatedFields}: null))
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateUser,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}