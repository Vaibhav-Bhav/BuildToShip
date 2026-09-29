import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { NeuSkeleton } from "../components/neu/NeuSkeleton";

export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
        <div className="w-full max-w-md space-y-4">
          <NeuSkeleton className="h-10 w-3/4 mx-auto" />
          <NeuSkeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
};

export const RequireRole: React.FC<{ role: "agent" | "customer"; children: React.ReactElement }> = ({
  role,
  children,
}) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
        <div className="w-full max-w-md space-y-4">
          <NeuSkeleton className="h-10 w-3/4 mx-auto" />
          <NeuSkeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to={`/login?from=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (user.role !== role) {
    const targetHome = user.role === "agent" ? "/agent/dashboard" : "/customer/cases";
    return <Navigate to={targetHome} replace />;
  }

  return children;
};

export const RedirectIfAuthenticated: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
        <div className="w-full max-w-md space-y-4">
          <NeuSkeleton className="h-10 w-3/4 mx-auto" />
          <NeuSkeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (token && user) {
    const targetHome = user.role === "agent" ? "/agent/dashboard" : "/customer/cases";
    return <Navigate to={targetHome} replace />;
  }

  return children;
};
