import React, { createContext, useState, useEffect, useCallback } from "react";
import { setAuthTokenGetter, type User, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const TOKEN_KEY = "resolveai_token";

export interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  // Keep api-client-react token getter updated
  useEffect(() => {
    setAuthTokenGetter(() => {
      return localStorage.getItem(TOKEN_KEY);
    });
  }, [token]);

  // Fetch current user if token exists
  const { data: user, isLoading: isQueryLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: Boolean(token),
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  // Global 401 handling
  useEffect(() => {
    if (error && (error as any)?.status === 401) {
      logout();
      const currentPath = window.location.pathname + window.location.search;
      if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
        window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
      }
    }
  }, [error, logout]);

  const login = useCallback(
    (newToken: string, newUser: User) => {
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      queryClient.setQueryData(getGetMeQueryKey(), newUser);
    },
    [queryClient]
  );

  const updateUser = useCallback(
    (updatedFields: Partial<User>) => {
      queryClient.setQueryData(getGetMeQueryKey(), (prev: User | undefined) => {
        if (!prev) return prev;
        return { ...prev, ...updatedFields };
      });
    },
    [queryClient]
  );

  const isLoading = Boolean(token && isQueryLoading && !user);

  return (
    <AuthContext.Provider
      value={{
        token,
        user: user ?? null,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
