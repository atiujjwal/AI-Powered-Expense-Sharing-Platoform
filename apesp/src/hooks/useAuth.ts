// Auth context

"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

export const useAuth = () => {
  const { user, token, setUser, setToken, clearAuth } = useAuthStore();

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        const response = await api.post("/api/auth/register", {
          email,
          password,
          name,
        });

        setUser(response.data.user);
        setToken(response.data.token);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    [setUser, setToken]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await api.post("/api/auth/login", {
          email,
          password,
        });

        setUser(response.data.user);
        setToken(response.data.token);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    [setUser, setToken]
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  return {
    user,
    token,
    register,
    login,
    logout,
    isAuthenticated: !!token,
  };
};
