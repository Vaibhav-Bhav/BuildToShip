import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { RequireAuth, RequireRole, RedirectIfAuthenticated } from "./guards";
import { AppShell } from "../components/layout/AppShell";
import { NeuSkeleton } from "../components/neu/NeuSkeleton";

// Route-level React.lazy code splitting
const LandingPage = lazy(() => import("../pages/public/LandingPage"));
const LoginPage = lazy(() => import("../features/auth/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/RegisterPage"));
const StyleguidePage = lazy(() => import("../pages/public/StyleguidePage"));

const CustomerCasesPage = lazy(() => import("../pages/customer/CustomerCasesPage"));
const CustomerReportPage = lazy(() => import("../pages/customer/CustomerReportPage"));
const CustomerCaseDetailPage = lazy(() => import("../pages/customer/CustomerCaseDetailPage"));

const AgentDashboardPage = lazy(() => import("../pages/agent/AgentDashboardPage"));
const AgentCasesPage = lazy(() => import("../pages/agent/AgentCasesPage"));
const AgentCaseWorkspacePage = lazy(() => import("../pages/agent/AgentCaseWorkspacePage"));

const ProfilePage = lazy(() => import("../pages/shared/ProfilePage"));
const NotFoundPage = lazy(() => import("../pages/shared/NotFoundPage"));

const PageFallback = () => (
  <div className="p-8 max-w-6xl mx-auto space-y-4">
    <NeuSkeleton className="h-10 w-48" />
    <NeuSkeleton className="h-28 w-full" />
    <NeuSkeleton className="h-64 w-full" />
  </div>
);

export const router = createBrowserRouter([
  // Public Landing
  {
    path: "/",
    element: (
      <Suspense fallback={<PageFallback />}>
        <LandingPage />
      </Suspense>
    ),
  },

  // Auth (redirect if already logged in)
  {
    path: "/login",
    element: (
      <RedirectIfAuthenticated>
        <Suspense fallback={<PageFallback />}>
          <LoginPage />
        </Suspense>
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: "/register",
    element: (
      <RedirectIfAuthenticated>
        <Suspense fallback={<PageFallback />}>
          <RegisterPage />
        </Suspense>
      </RedirectIfAuthenticated>
    ),
  },

  // Customer Portal Routes (Nested in AppShell)
  {
    path: "/customer",
    element: (
      <RequireRole role="customer">
        <AppShell>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </AppShell>
      </RequireRole>
    ),
    children: [
      {
        path: "cases",
        element: <CustomerCasesPage />,
      },
      {
        path: "report",
        element: <CustomerReportPage />,
      },
      {
        path: "cases/:id",
        element: <CustomerCaseDetailPage />,
      },
      {
        index: true,
        element: <Navigate to="/customer/cases" replace />,
      },
    ],
  },

  // Agent Portal Routes (Nested in AppShell)
  {
    path: "/agent",
    element: (
      <RequireRole role="agent">
        <AppShell>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </AppShell>
      </RequireRole>
    ),
    children: [
      {
        path: "dashboard",
        element: <AgentDashboardPage />,
      },
      {
        path: "cases",
        element: <AgentCasesPage />,
      },
      {
        path: "cases/:id",
        element: <AgentCaseWorkspacePage />,
      },
      {
        index: true,
        element: <Navigate to="/agent/dashboard" replace />,
      },
    ],
  },

  // Shared Authenticated Profile
  {
    path: "/profile",
    element: (
      <RequireAuth>
        <AppShell title="Profile">
          <Suspense fallback={<PageFallback />}>
            <ProfilePage />
          </Suspense>
        </AppShell>
      </RequireAuth>
    ),
  },

  // Dev Styleguide Route (dev only)
  ...(import.meta.env.DEV
    ? [
        {
          path: "/__styleguide",
          element: (
            <Suspense fallback={<PageFallback />}>
              <StyleguidePage />
            </Suspense>
          ),
        },
      ]
    : []),

  // 404 Catch-all
  {
    path: "*",
    element: (
      <Suspense fallback={<PageFallback />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);
