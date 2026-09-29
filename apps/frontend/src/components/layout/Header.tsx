import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Sun, Moon, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";
import { NeuAvatar } from "../neu/NeuAvatar";
import { NeuBadge } from "../neu/NeuBadge";
import { cn } from "../../lib/cn";

export interface HeaderProps {
  onToggleSidebar?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, className }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("resolveai_theme") as "light" | "dark") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("resolveai_theme", next);
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-8",
        "bg-[var(--bg)] border-b border-[var(--input-border)]/40 transition-colors duration-150",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2.5 rounded-[12px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] text-[var(--text)] active:shadow-[var(--neu-inset-sm)] cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="hidden sm:inline-block font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {user?.role === "agent" ? "Agent Workspace" : "Customer Portal"}
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle light or dark theme"
          className="p-2.5 rounded-[12px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] text-[var(--text)] active:shadow-[var(--neu-inset-sm)] transition-all cursor-pointer"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[var(--warning)]" />}
        </button>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[var(--bg)] shadow-[var(--neu-raised-sm)] active:shadow-[var(--neu-inset-sm)] transition-all cursor-pointer"
            aria-expanded={menuOpen}
            aria-label="User profile menu"
          >
            <NeuAvatar name={user?.name} size="sm" />
            <span className="hidden md:inline-block text-xs font-semibold text-[var(--text)] max-w-[120px] truncate">
              {user?.name}
            </span>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-56 p-2 rounded-[18px] bg-[var(--bg)] shadow-[var(--neu-raised-lg)] border border-[var(--input-border)] animate-in fade-in-50 zoom-in-95 duration-100">
                <div className="p-3 border-b border-[var(--input-border)]/50 mb-1">
                  <div className="text-xs font-bold text-[var(--text)] truncate">{user?.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{user?.email}</div>
                  <div className="mt-2">
                    <NeuBadge tone={user?.role === "agent" ? "accent" : "info"} className="text-[10px]">
                      {user?.role === "agent" ? "Support Agent" : "Customer"}
                    </NeuBadge>
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-[10px] text-[var(--text)] hover:shadow-[var(--neu-inset-sm)] active:translate-y-0.5 transition-all"
                >
                  <UserIcon className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>Your Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-[10px] text-[var(--danger)] hover:shadow-[var(--neu-inset-sm)] active:translate-y-0.5 transition-all cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
