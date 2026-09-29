import React, { useState } from "react";
import { useAuth } from "../../features/auth/useAuth";
import { useUpdateMe } from "@workspace/api-client-react";
import {
  NeuButton,
  NeuCard,
  NeuInput,
  NeuBadge,
  NeuSwitch,
  useToast,
} from "../../components/neu";
import { PageHeader } from "../../components/layout/PageHeader";
import { User, Mail, Shield, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("resolveai_theme") as "light" | "dark") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  });

  const updateMeMutation = useUpdateMe();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateMeMutation.mutate(
      {
        data: { name: name.trim() },
      },
      {
        onSuccess: (updated) => {
          updateUser(updated);
          toast("Profile name updated successfully!", "success");
        },
        onError: (err: any) => {
          toast(err?.data?.error || "Failed to update profile", "error");
        },
      }
    );
  };

  const toggleTheme = (isDark: boolean) => {
    const next = isDark ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("resolveai_theme", next);
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        eyebrow="Account Settings"
        title="Your Profile"
        body="Manage your account identity, role credentials, and display preferences."
      />

      <NeuCard depth="raised" padding="lg">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <NeuInput
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="w-4 h-4" />}
            required
          />

          <NeuInput
            label="Email Address (Read-only)"
            value={user?.email || ""}
            readOnly
            disabled
            icon={<Mail className="w-4 h-4" />}
            helperText="Account email cannot be modified directly."
          />

          <div>
            <label className="text-xs font-semibold text-[var(--text)] select-none block mb-2">
              Role Authority
            </label>
            <div className="flex items-center gap-3">
              <NeuBadge tone={user?.role === "agent" ? "accent" : "info"}>
                {user?.role === "agent" ? "Support Agent" : "Customer"}
              </NeuBadge>
              <span className="text-xs text-[var(--text-muted)]">
                {user?.role === "agent"
                  ? "Full operational access to triage queue, overrides, and AI briefs."
                  : "Access to order claim submissions, timeline status, and messaging."}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--input-border)]/40 flex justify-end">
            <NeuButton
              type="submit"
              variant="primary"
              loading={updateMeMutation.isPending}
              disabled={!name.trim() || name.trim() === user?.name}
              icon={<Save className="w-4 h-4" />}
              iconPosition="right"
            >
              Save Changes
            </NeuButton>
          </div>
        </form>
      </NeuCard>

      {/* Theme preferences */}
      <NeuCard depth="raised" padding="md" title="Display Preferences">
        <div className="flex items-center justify-between p-3 rounded-[14px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/40 mt-3">
          <div>
            <span className="text-xs font-semibold text-[var(--text)] block">
              Dark Theme
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Use soft high-contrast dark palette for reduced eye strain
            </span>
          </div>
          <NeuSwitch
            checked={theme === "dark"}
            onCheckedChange={toggleTheme}
          />
        </div>
      </NeuCard>
    </div>
  );
}
