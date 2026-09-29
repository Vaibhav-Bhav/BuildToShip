import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "../../lib/cn";

export interface AppShellProps {
  title?: string;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ title, children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (title) {
      document.title = `${title} | ResolveAI`;
    } else {
      document.title = "ResolveAI - AI Issue Resolution Copilot";
    }
  }, [title]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex">
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-[10px] focus:bg-[var(--accent)] focus:text-[var(--accent-contrast)] focus:shadow-[var(--neu-raised-sm)]"
      >
        Skip to content
      </a>

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main content body */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setMobileSidebarOpen(true)} />
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};
