import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  User,
  PlusCircle,
  ShieldCheck,
  X,
  FileQuestion,
} from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";
import { cn } from "../../lib/cn";

export interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  className,
}) => {
  const { user } = useAuth();
  const isAgent = user?.role === "agent";

  const agentLinks = [
    { to: "/agent/dashboard", label: "Overview", icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { to: "/agent/cases", label: "Case Queue", icon: <Inbox className="w-5 h-5 shrink-0" /> },
    { to: "/profile", label: "Profile", icon: <User className="w-5 h-5 shrink-0" /> },
  ];

  const customerLinks = [
    { to: "/customer/cases", label: "My Cases", icon: <Inbox className="w-5 h-5 shrink-0" /> },
    { to: "/customer/report", label: "Report an Issue", icon: <PlusCircle className="w-5 h-5 shrink-0" /> },
    { to: "/profile", label: "Profile", icon: <User className="w-5 h-5 shrink-0" /> },
  ];

  const links = isAgent ? agentLinks : customerLinks;

  const content = (
    <div className="flex flex-col h-full justify-between p-5 select-none">
      <div>
        {/* Brand logo & title */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[var(--input-border)]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[var(--neu-raised-sm)] flex items-center justify-center font-bold font-mono text-sm shrink-0">
              R
            </div>
            <div className="hidden xl:block min-w-0">
              <span className="font-bold text-base tracking-tight text-[var(--text)]">
                Resolve<span className="text-[var(--accent)]">AI</span>
              </span>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
                Resolution Copilot
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-[10px] text-[var(--text-muted)] hover:text-[var(--text)] active:shadow-[var(--neu-inset-sm)] cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="space-y-3" aria-label="Main sidebar navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/agent/dashboard" || link.to === "/customer/cases"}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3.5 px-3.5 py-3 rounded-[14px] text-xs font-semibold transition-all duration-150",
                  isActive
                    ? "bg-[var(--bg)] text-[var(--accent)] shadow-[var(--neu-inset-sm)] font-bold border border-[var(--input-border)]/60"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:shadow-[var(--neu-raised-sm)]",
                  "focus-visible:outline-[2px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[2px]"
                )
              }
            >
              {link.icon}
              <span className="hidden xl:inline-block">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer info badge */}
      <div className="pt-6 border-t border-[var(--input-border)]/40 hidden xl:block">
        <div className="p-3 rounded-[14px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/40">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text)]">
            <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
            <span>Autonomous AI Triage</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-normal">
            Groq LLaMA 3.3 70B analysis with human-in-the-loop decisions.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop and Tablet Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 h-screen sticky top-0 z-40 transition-all duration-200",
          "w-[80px] xl:w-[260px] bg-[var(--bg)] shadow-[var(--neu-raised)] border-r border-[var(--input-border)]/40",
          className
        )}
      >
        {content}
      </aside>

      {/* Mobile Drawer (under 1024px) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-50 w-72 h-full bg-[var(--bg)] shadow-[var(--neu-raised-lg)] border-r border-[var(--input-border)] animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
