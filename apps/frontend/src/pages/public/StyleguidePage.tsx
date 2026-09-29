import React, { useState } from "react";
import {
  NeuButton,
  NeuCard,
  NeuInput,
  NeuTextarea,
  NeuSelect,
  NeuBadge,
  NeuTabs,
  NeuTabsList,
  NeuTabsTrigger,
  NeuTabsContent,
  NeuSegmented,
  NeuSwitch,
  NeuCheckbox,
  NeuConfirm,
  NeuStat,
  NeuProgress,
  NeuStepper,
  NeuTimeline,
  NeuDropzone,
  NeuAvatar,
  NeuPagination,
  NeuSkeleton,
  NeuEmptyState,
  NeuErrorPanel,
  useToast,
  type SelectedFile,
} from "../../components/neu";
import { Sun, Moon, Sparkles, Check, AlertTriangle, Shield, Heart } from "lucide-react";

export default function StyleguidePage() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
  });
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    step1: true,
    step2: false,
    step3: false,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [segmentedValue, setSegmentedValue] = useState("all");
  const [selectValue, setSelectValue] = useState("option1");
  const [currentPage, setCurrentPage] = useState(1);
  const [dropzoneFiles, setDropzoneFiles] = useState<SelectedFile[]>([]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const sampleEvents = [
    {
      id: 1,
      event_type: "CASE_CREATED",
      description: "Case RF9812 created from customer issue",
      actor_type: "customer",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 2,
      event_type: "AI_CLASSIFIED",
      description: "AI classified issue as Damaged Product with High priority",
      actor_type: "ai",
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 3,
      event_type: "ESCALATED",
      description: "Customer sentiment is frustrated; order over $500",
      actor_type: "system",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 4,
      event_type: "REPLY_SENT",
      description: "Agent sent a resolution offer to the customer",
      actor_type: "agent",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  return (
    <main role="main" className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-6 sm:p-10 max-w-6xl mx-auto space-y-12">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--input-border)]/50">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-[var(--accent)]">
            Dev Styleguide
          </span>
          <h1 className="text-3xl font-bold mt-1 text-[var(--text)]">Neumorphic Component System</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Visual verification and contrast testing across Light and Dark Soft UI themes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NeuButton
            variant="secondary"
            onClick={toggleTheme}
            icon={theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          >
            {theme === "light" ? "Switch to Dark" : "Switch to Light"}
          </NeuButton>
          <NeuButton
            variant="primary"
            onClick={() => toast("Sample notification triggered!", "success", "System Active")}
          >
            Trigger Toast
          </NeuButton>
        </div>
      </div>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Buttons & States</h2>
        <div className="flex flex-wrap items-center gap-4">
          <NeuButton variant="primary">Primary Action</NeuButton>
          <NeuButton variant="secondary">Secondary Action</NeuButton>
          <NeuButton variant="ghost">Ghost Action</NeuButton>
          <NeuButton variant="danger">Danger Action</NeuButton>
          <NeuButton variant="primary" loading>Loading</NeuButton>
          <NeuButton variant="secondary" disabled>Disabled</NeuButton>
          <NeuButton variant="primary" icon={<Sparkles className="w-4 h-4" />}>
            With Icon
          </NeuButton>
          <NeuButton size="sm">Small</NeuButton>
          <NeuButton size="md">Medium</NeuButton>
          <NeuButton size="lg">Large</NeuButton>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Badges (Mandatory Dot + Text)</h2>
        <div className="flex flex-wrap items-center gap-3">
          <NeuBadge tone="neutral">Received</NeuBadge>
          <NeuBadge tone="info">Being reviewed</NeuBadge>
          <NeuBadge tone="warning">We need info</NeuBadge>
          <NeuBadge tone="success">Approved</NeuBadge>
          <NeuBadge tone="danger">Closed / Escalated</NeuBadge>
          <NeuBadge tone="accent">AI Agent</NeuBadge>
        </div>
      </section>

      {/* Cards and Depths */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Cards & Surface Depths</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NeuCard depth="raised" title="Raised Card" subtitle="depth='raised' (default)">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Standard interactive container surface with dual light and dark neumorphic shadows.
            </p>
          </NeuCard>

          <NeuCard depth="inset" title="Inset Well" subtitle="depth='inset'">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Recessed surface used for wells, input groups, and specialized chart cavities.
            </p>
          </NeuCard>

          <NeuCard depth="flat" title="Flat Row" subtitle="depth='flat'">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Border-only neutral plane used inside cards to prevent nesting multiple raised levels.
            </p>
          </NeuCard>
        </div>
      </section>

      {/* Inputs and Forms */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Form Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <NeuInput
              label="Customer Email Address"
              placeholder="e.g. alex@example.com"
              helperText="We will never share your address."
            />
            <NeuInput
              label="Order Code"
              placeholder="ORD-7819"
              error="Order not found in customer history"
            />
            <NeuSelect
              label="Issue Category"
              value={selectValue}
              onValueChange={setSelectValue}
              options={[
                { value: "option1", label: "Damaged Product" },
                { value: "option2", label: "Delivery Delay" },
                { value: "option3", label: "Refund Request" },
              ]}
            />
          </div>
          <div className="space-y-4">
            <NeuTextarea
              label="Describe what happened"
              placeholder="Enter at least 10 characters..."
              maxLength={200}
              showCount
              helperText="Be as specific as possible regarding defects or serial numbers."
            />
            <div className="flex items-center justify-between p-4 rounded-[16px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--input-border)]/40">
              <NeuSwitch
                label="Dark Mode Setting"
                helperText="Synced with system appearance"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs & Segmented */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Tabs & Segmented Filters</h2>
        <div className="space-y-6">
          <NeuSegmented
            value={segmentedValue}
            onChange={setSegmentedValue}
            options={[
              { value: "all", label: "All Cases" },
              { value: "open", label: "Open Only" },
              { value: "resolved", label: "Resolved" },
            ]}
          />

          <NeuTabs defaultValue="tab1">
            <NeuTabsList>
              <NeuTabsTrigger value="tab1">Timeline</NeuTabsTrigger>
              <NeuTabsTrigger value="tab2">Conversation</NeuTabsTrigger>
              <NeuTabsTrigger value="tab3">Evidence</NeuTabsTrigger>
            </NeuTabsList>
            <NeuTabsContent value="tab1" className="p-4 rounded-[16px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)]">
              Timeline view content inside recessed container.
            </NeuTabsContent>
            <NeuTabsContent value="tab2" className="p-4 rounded-[16px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)]">
              Messages thread view content.
            </NeuTabsContent>
            <NeuTabsContent value="tab3" className="p-4 rounded-[16px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)]">
              Uploaded files and evidence thumbnails.
            </NeuTabsContent>
          </NeuTabs>
        </div>
      </section>

      {/* Checklist & Dialogs */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Checklist & Modals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NeuCard title="AI Resolution Plan Checklist">
            <div className="space-y-3 mt-3">
              <NeuCheckbox
                label="Verify original delivery timestamp with carrier"
                checked={checklist.step1}
                onCheckedChange={(checked) => setChecklist((prev) => ({ ...prev, step1: Boolean(checked) }))}
              />
              <NeuCheckbox
                label="Inspect uploaded damage photos for packaging integrity"
                checked={checklist.step2}
                onCheckedChange={(checked) => setChecklist((prev) => ({ ...prev, step2: Boolean(checked) }))}
              />
              <NeuCheckbox
                label="Authorize replacement dispatch under warranty guidelines"
                checked={checklist.step3}
                onCheckedChange={(checked) => setChecklist((prev) => ({ ...prev, step3: Boolean(checked) }))}
              />
            </div>
          </NeuCard>

          <NeuCard title="Destructive Actions & Confirm">
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Trigger accessible modal confirmation before irreversible modifications.
            </p>
            <NeuButton variant="danger" onClick={() => setConfirmOpen(true)}>
              Archive Case (Confirm Modal)
            </NeuButton>
            <NeuConfirm
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Archive Case RF9812?"
              description="This will remove the case from the active triage queue and mark it as archived. You can still access it via the archived filter."
              tone="danger"
              confirmLabel="Yes, Archive"
              onConfirm={() => {
                setConfirmOpen(false);
                toast("Case RF9812 was archived", "info");
              }}
            />
          </NeuCard>
        </div>
      </section>

      {/* KPI Stats & Progress */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Stats & Steppers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <NeuStat label="Open Cases" value={14} tone="neutral" hint="Active queue" />
          <NeuStat label="High Priority" value={3} tone="warning" hint="Requires agent review" />
          <NeuStat label="At Risk" value={2} tone="danger" hint="SLA warning" />
          <NeuStat label="Resolved Today" value={8} tone="success" hint="+2 from yesterday" />
        </div>

        <NeuCard title="Resolution Progress" className="mt-4">
          <NeuProgress value={65} max={100} tone="accent" className="my-2" />
          <NeuStepper
            steps={[
              { id: "1", label: "Received", description: "Report filed" },
              { id: "2", label: "Under Review", description: "Agent investigating" },
              { id: "3", label: "Action Taken", description: "Solution proposed" },
              { id: "4", label: "Resolved", description: "Case closed" },
            ]}
            currentStepIndex={1}
          />
        </NeuCard>
      </section>

      {/* Timeline */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Decision Timeline</h2>
        <NeuCard>
          <NeuTimeline events={sampleEvents} />
        </NeuCard>
      </section>

      {/* Dropzone */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Dropzone & Evidence</h2>
        <NeuDropzone files={dropzoneFiles} onFilesChange={setDropzoneFiles} />
      </section>

      {/* Avatar & Pagination */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Avatars & Pagination</h2>
        <div className="flex flex-wrap items-center gap-4">
          <NeuAvatar name="Sarah Connor" size="sm" />
          <NeuAvatar name="Marcus Wright" size="md" />
          <NeuAvatar name="Elena Rostova" size="lg" />
        </div>
        <NeuCard className="mt-4">
          <NeuPagination
            currentPage={currentPage}
            totalItems={45}
            itemsPerPage={10}
            onPageChange={setCurrentPage}
          />
        </NeuCard>
      </section>

      {/* Skeleton, Empty State, Error Panel */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text)]">Feedback States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NeuCard title="Skeleton Loaders">
            <div className="space-y-3 mt-3">
              <NeuSkeleton className="h-6 w-3/4" />
              <NeuSkeleton className="h-4 w-full" />
              <NeuSkeleton className="h-4 w-5/6" />
              <div className="flex items-center gap-3 pt-2">
                <NeuSkeleton shape="circle" className="w-10 h-10" />
                <div className="space-y-1.5 flex-1">
                  <NeuSkeleton className="h-3 w-1/2" />
                  <NeuSkeleton className="h-3 w-1/3" />
                </div>
              </div>
            </div>
          </NeuCard>

          <NeuEmptyState
            title="No Open Cases"
            body="You have reached inbox zero! There are no open or pending customer issues requiring your attention."
          />

          <NeuErrorPanel
            message="Failed to load remote metrics from the server. Check network connection."
            retry={() => toast("Retrying...", "info")}
          />
        </div>
      </section>
    </main>
  );
}
