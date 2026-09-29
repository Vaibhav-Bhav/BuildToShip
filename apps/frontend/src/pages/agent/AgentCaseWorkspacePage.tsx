import React, { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useGetCase,
  useAddCaseMessage,
  useGenerateReply,
  useSendReply,
  useGenerateResolutionPlan,
  useUpdateCaseStatus,
  useOverrideCase,
  useAssignCase,
  useArchiveCase,
  useGetCasePromises,
  useUpdatePromiseStatus,
  getGetCaseQueryKey,
  getGetCasePromisesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  NeuButton,
  NeuCard,
  NeuBadge,
  NeuSelect,
  NeuInput,
  NeuTextarea,
  NeuCheckbox,
  NeuTimeline,
  NeuConfirm,
  NeuSkeleton,
  NeuErrorPanel,
  useToast,
} from "../../components/neu";
import { AttachmentImage } from "../../components/case/AttachmentImage";
import {
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  Archive,
  Send,
  CheckCircle2,
  Calendar,
  Layers,
  Check,
  RefreshCw,
} from "lucide-react";
import { getPriorityTone, getStatusTone } from "../../lib/status";
import { formatDateTime, formatDate, formatCurrency } from "../../lib/format";

export default function AgentCaseWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const caseId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: caseDetail, isLoading, isError, refetch } = useGetCase(caseId, {
    query: {
      queryKey: getGetCaseQueryKey(caseId),
      enabled: !Number.isNaN(caseId),
    },
  });

  const { data: promisesData } = useGetCasePromises(caseId, {
    query: {
      queryKey: getGetCasePromisesQueryKey(caseId),
      enabled: !Number.isNaN(caseId),
    },
  });

  // State
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [sendReplyConfirmOpen, setSendReplyConfirmOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyTone, setReplyTone] = useState<"professional" | "warm" | "concise">("professional");
  const [replyPolicyCited, setReplyPolicyCited] = useState<string | null>(null);
  const [replyWarnings, setReplyWarnings] = useState<string[]>([]);
  const [messageBody, setMessageBody] = useState("");

  // Override AI state
  const [overrideField, setOverrideField] = useState("recommended_action");
  const [overrideValue, setOverrideValue] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideError, setOverrideError] = useState<string | null>(null);

  // Local checklist state for resolution plan
  const [checkedPlanSteps, setCheckedPlanSteps] = useState<Record<number, boolean>>({});

  // Mutations
  const updateStatusMutation = useUpdateCaseStatus();
  const assignMutation = useAssignCase();
  const archiveMutation = useArchiveCase();
  const addMessageMutation = useAddCaseMessage();
  const generateReplyMutation = useGenerateReply();
  const sendReplyMutation = useSendReply();
  const generatePlanMutation = useGenerateResolutionPlan();
  const overrideMutation = useOverrideCase();
  const updatePromiseStatusMutation = useUpdatePromiseStatus();

  const refreshCase = () => {
    queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
    queryClient.invalidateQueries({ queryKey: getGetCasePromisesQueryKey(caseId) });
  };

  // Actions
  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate(
      {
        id: caseId,
        data: { status: newStatus as any },
      },
      {
        onSuccess: () => {
          refreshCase();
          toast(`Status updated to ${newStatus}`, "success");
        },
        onError: (err: any) => toast(err?.data?.error || "Status update failed", "error"),
      }
    );
  };

  const handleAssignToMe = () => {
    assignMutation.mutate(
      { id: caseId, data: {} },
      {
        onSuccess: () => {
          refreshCase();
          toast("Case assigned to you", "success");
        },
        onError: (err: any) => toast(err?.data?.error || "Assignment failed", "error"),
      }
    );
  };

  const handleArchive = () => {
    archiveMutation.mutate(
      { id: caseId },
      {
        onSuccess: () => {
          refreshCase();
          setArchiveConfirmOpen(false);
          toast("Case has been archived", "info");
        },
        onError: (err: any) => toast(err?.data?.error || "Archiving failed", "error"),
      }
    );
  };

  const handleSendMessage = () => {
    if (!messageBody.trim()) return;
    addMessageMutation.mutate(
      {
        id: caseId,
        data: { body: messageBody.trim() },
      },
      {
        onSuccess: () => {
          setMessageBody("");
          refreshCase();
          toast("Customer message sent", "success");
        },
        onError: (err: any) => toast(err?.data?.error || "Failed to send message", "error"),
      }
    );
  };

  const handleGenerateReply = () => {
    generateReplyMutation.mutate(
      {
        id: caseId,
        data: {
          tone: replyTone,
          body: caseDetail?.summary || "Resolution reply",
        },
      },
      {
        onSuccess: (res: any) => {
          setReplyDraft(res.draft);
          setReplyPolicyCited(res.policy_cited || null);
          setReplyWarnings(res.warnings || []);
          toast("Reply generated with policy citing!", "success");
        },
        onError: (err: any) => toast(err?.data?.error || "Draft generation failed", "error"),
      }
    );
  };

  const handleDraftAIReply = () => {
    generateReplyMutation.mutate(
      {
        id: caseId,
        data: {
          tone: "warm",
          body: caseDetail?.summary || "Resolution reply",
        },
      },
      {
        onSuccess: (res: any) => {
          setMessageBody(res.draft);
          toast("AI Draft populated in chat input!", "success");
        },
        onError: (err: any) => toast(err?.data?.error || "Draft generation failed", "error"),
      }
    );
  };

  const handleSendReply = () => {
    if (!replyDraft.trim()) return;
    if (replyWarnings.length > 0 && !sendReplyConfirmOpen) {
      setSendReplyConfirmOpen(true);
      return;
    }

    sendReplyMutation.mutate(
      {
        id: caseId,
        data: {
          body: replyDraft.trim(),
          tone: replyTone,
        },
      },
      {
        onSuccess: () => {
          setReplyDraft("");
          setReplyWarnings([]);
          setSendReplyConfirmOpen(false);
          refreshCase();
          toast("Reply sent and case status updated to Awaiting Customer", "success");
        },
        onError: (err: any) => toast(err?.data?.error || "Failed to send reply", "error"),
      }
    );
  };

  const handleGeneratePlan = () => {
    generatePlanMutation.mutate(
      { id: caseId },
      {
        onSuccess: (res: any) => {
          refreshCase();
          setCheckedPlanSteps({});
          toast(`Generated ${res.plan.length}-step resolution plan`, "success");
        },
        onError: (err: any) => toast(err?.data?.error || "Plan generation failed", "error"),
      }
    );
  };

  const handleRecordOverride = () => {
    setOverrideError(null);
    if (!overrideReason.trim()) {
      setOverrideError("A reason is required to record an AI override.");
      return;
    }
    if (!overrideValue.trim()) {
      setOverrideError("Please provide an override value.");
      return;
    }

    overrideMutation.mutate(
      {
        id: caseId,
        data: {
          field: overrideField,
          value: overrideValue.trim(),
          reason: overrideReason.trim(),
        },
      },
      {
        onSuccess: () => {
          setOverrideValue("");
          setOverrideReason("");
          refreshCase();
          toast(`AI ${overrideField} overridden successfully!`, "success");
        },
        onError: (err: any) => setOverrideError(err?.data?.error || "Override failed"),
      }
    );
  };

  const handleMarkPromiseKept = (promiseId: number) => {
    updatePromiseStatusMutation.mutate(
      {
        id: promiseId,
        data: { status: "kept" },
      },
      {
        onSuccess: () => {
          refreshCase();
          toast("Promise marked as kept!", "success");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <NeuSkeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <NeuSkeleton className="h-96 lg:col-span-7" />
          <NeuSkeleton className="h-96 lg:col-span-5" />
        </div>
      </div>
    );
  }

  if (isError || !caseDetail) {
    return (
      <div className="space-y-4">
        <Link to="/agent/cases" className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to case queue
        </Link>
        <NeuErrorPanel message="Failed to load case workspace." retry={() => refetch()} />
      </div>
    );
  }

  const resolutionPlanList: string[] = Array.isArray(caseDetail.resolution_plan)
    ? caseDetail.resolution_plan
    : [];

  const promisesList = Array.isArray(promisesData) ? promisesData : (caseDetail as any).promises || [];

  return (
    <div className="space-y-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/agent/cases"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to case queue</span>
        </Link>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-[10px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] active:shadow-[var(--neu-inset-sm)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all cursor-pointer"
          aria-label="Refresh workspace"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Header Card */}
      <NeuCard depth="raised" padding="md">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--input-border)]/40">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-[var(--accent)] tracking-wider">
                {caseDetail.case_code}
              </span>
              <NeuBadge tone={getPriorityTone(caseDetail.priority || "Low")}>
                {caseDetail.priority || "Low"}
              </NeuBadge>
              <NeuBadge tone={getStatusTone(caseDetail.status)}>
                {caseDetail.status}
              </NeuBadge>
              {caseDetail.escalation_required && (
                <NeuBadge tone="danger" dot>
                  Escalated
                </NeuBadge>
              )}
              {caseDetail.archived && (
                <NeuBadge tone="neutral">
                  Archived
                </NeuBadge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
              {caseDetail.summary}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
              <span>Customer: <b className="text-[var(--text)]">{caseDetail.customer_name || "Customer"}</b></span>
              <span>·</span>
              <span>Category: <b className="text-[var(--text)]">{caseDetail.category}</b></span>
              <span>·</span>
              <span>
                Assigned:{" "}
                <b className="text-[var(--text)]">
                  {caseDetail.assigned_agent_id ? `Agent #${caseDetail.assigned_agent_id}` : "Unassigned"}
                </b>
              </span>
            </div>
          </div>

          {/* Action Toolbar in Header */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="w-44">
              <NeuSelect
                value={caseDetail.status}
                onValueChange={handleStatusChange}
                options={[
                  { value: "New", label: "New" },
                  { value: "Investigating", label: "Investigating" },
                  { value: "Awaiting Customer", label: "Awaiting Customer" },
                  { value: "Approved", label: "Approved" },
                  { value: "Resolved", label: "Resolved" },
                  { value: "Rejected", label: "Rejected" },
                ]}
              />
            </div>

            <NeuButton
              variant="secondary"
              size="md"
              onClick={handleAssignToMe}
              icon={<UserCheck className="w-4 h-4" />}
            >
              Assign to me
            </NeuButton>

            {!caseDetail.archived && (
              <NeuButton
                variant="ghost"
                size="md"
                onClick={() => setArchiveConfirmOpen(true)}
                icon={<Archive className="w-4 h-4 text-[var(--text-muted)]" />}
              >
                Archive
              </NeuButton>
            )}
          </div>
        </div>

        {/* Order Mini-Card */}
        {caseDetail.order && (
          <div className="mt-4 p-3.5 rounded-[16px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/40 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-mono font-bold text-[var(--accent)]">{caseDetail.order.order_code}</span>
              <span className="font-semibold text-[var(--text)]">{caseDetail.order.product_name}</span>
              <span className="font-bold">{formatCurrency(caseDetail.order.price)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[var(--text-muted)]">
              <span>Ordered: {formatDate(caseDetail.order.order_date)}</span>
              <span>Delivered: {formatDate(caseDetail.order.delivery_date)}</span>
            </div>
          </div>
        )}
      </NeuCard>

      {/* Two Columns: Left (Timeline, Messages, Evidence) / Right (AI Brief, Plan, Reply, Override, Promises) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: 7 cols */}
        <div className="xl:col-span-7 space-y-6">
          {/* Messages with Customer */}
          <NeuCard depth="raised" padding="md" title="Customer Conversation" subtitle="Messages sent here are visible to the customer">
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {caseDetail.messages && caseDetail.messages.length > 0 ? (
                caseDetail.messages.map((m) => {
                  const isAgent = m.sender_type === "agent";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                          {isAgent ? "Support Agent" : (caseDetail.customer_name || "Customer")}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {formatDateTime(m.created_at)}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] p-3.5 rounded-[16px] text-xs leading-relaxed ${
                          isAgent
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[var(--neu-raised-sm)]"
                            : "bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/50 text-[var(--text)]"
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                  No conversation messages yet.
                </p>
              )}
            </div>

            {/* Quick Agent Message */}
            <div className="mt-5 pt-4 border-t border-[var(--input-border)]/40 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Direct Reply (Customer Visible)
              </span>
              <NeuTextarea
                placeholder="Type a response to the customer..."
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={2}
                disabled={addMessageMutation.isPending}
              />
              <div className="flex items-center justify-between pt-1">
                <NeuButton
                  variant="secondary"
                  size="sm"
                  onClick={handleDraftAIReply}
                  disabled={generateReplyMutation.isPending || addMessageMutation.isPending}
                  loading={generateReplyMutation.isPending}
                  icon={<Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />}
                >
                  ✨ Draft AI Reply
                </NeuButton>
                <NeuButton
                  variant="primary"
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!messageBody.trim() || addMessageMutation.isPending}
                  loading={addMessageMutation.isPending}
                  icon={<Send className="w-3.5 h-3.5" />}
                  iconPosition="right"
                >
                  Send Message
                </NeuButton>
              </div>
            </div>
          </NeuCard>

          {/* Evidence Viewer */}
          <NeuCard depth="raised" padding="md" title="Attached Evidence" subtitle="Customer uploaded photos">
            {caseDetail.attachments && caseDetail.attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-2">
                {caseDetail.attachments.map((att) => (
                  <AttachmentImage
                    key={att.id}
                    attachmentId={att.id}
                    fileName={att.file_name}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                No files uploaded for this case.
              </p>
            )}
          </NeuCard>

          {/* Decision Timeline (Agent view shows every event) */}
          <NeuCard depth="raised" padding="md" title="Decision Timeline" subtitle="Full audit trail of AI triage, overrides, and agent interventions">
            <NeuTimeline events={caseDetail.timeline || []} showActor={true} />
          </NeuCard>
        </div>

        {/* Right Column (Sticky on XL): 5 cols */}
        <aside className="xl:col-span-5 space-y-6 xl:sticky xl:top-20">
          {/* 1. AI Resolution Brief */}
          <NeuCard
            depth="raised"
            padding="md"
            title="AI Resolution Brief"
            subtitle="Autonomous diagnosis with human-in-the-loop control"
            headerAction={
              <NeuBadge tone="accent" dot>
                {caseDetail.ai_source === "groq" ? "Groq LLaMA 3.3" : "Fallback Rules"}
              </NeuBadge>
            }
          >
            {/* Fallback or Failure Warning */}
            {(caseDetail.ai_failed || caseDetail.ai_source === "fallback") && (
              <div className="mb-4 p-3 rounded-[12px] bg-[var(--danger)]/10 border border-[var(--danger)]/30 flex items-center gap-2 text-xs font-semibold text-[var(--danger)]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Needs manual review: AI triage unavailable or flagged fallback</span>
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-[12px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Sentiment</span>
                  <span className="font-semibold text-[var(--text)] mt-0.5 block">{caseDetail.sentiment || "Neutral"}</span>
                </div>
                <div className="p-2.5 rounded-[12px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Intent</span>
                  <span className="font-semibold text-[var(--text)] mt-0.5 block">{caseDetail.customer_intent || "Inquiry"}</span>
                </div>
              </div>

              <div className="p-3 rounded-[14px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/50">
                <span className="text-[10px] uppercase font-bold text-[var(--accent)] block">Recommended Action</span>
                <p className="mt-1 font-semibold text-[var(--text)] leading-relaxed">
                  {caseDetail.recommended_action || "Review order details and customer claim."}
                </p>
              </div>

              <div className="p-3 rounded-[14px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/50">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Suggested Next Step</span>
                <p className="mt-1 text-[var(--text)] leading-relaxed">
                  {caseDetail.next_step || "Check return window and request damage photos."}
                </p>
              </div>

              {caseDetail.missing_information && caseDetail.missing_information.length > 0 && (
                <div className="p-3 rounded-[14px] bg-[var(--warning)]/10 border border-[var(--warning)]/40 text-[var(--warning)]">
                  <span className="text-[10px] uppercase font-bold block mb-1">Missing Information</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {caseDetail.missing_information.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </NeuCard>

          {/* 2. Escalation Box (danger tone, only if escalated) */}
          {caseDetail.escalation_required && (
            <div className="p-4 rounded-[18px] bg-[var(--danger)]/10 border border-[var(--danger)]/40 text-xs text-[var(--danger)] space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Case Escalated to Priority Review</span>
              </div>
              <p className="leading-relaxed">
                {caseDetail.escalation_reason || "Escalation criteria met based on sentiment, high value, or repeat contacts."}
              </p>
            </div>
          )}

          {/* 3. Resolution Plan Checklist */}
          <NeuCard
            depth="raised-sm"
            padding="md"
            title="Resolution Plan"
            subtitle="Step-by-step checklist"
            headerAction={
              <NeuButton
                variant="secondary"
                size="sm"
                onClick={handleGeneratePlan}
                loading={generatePlanMutation.isPending}
                icon={<Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />}
              >
                Generate Plan
              </NeuButton>
            }
          >
            {resolutionPlanList.length > 0 ? (
              <div className="space-y-2.5 mt-3">
                {resolutionPlanList.map((step, idx) => (
                  <NeuCheckbox
                    key={idx}
                    label={step}
                    checked={Boolean(checkedPlanSteps[idx])}
                    onCheckedChange={(checked) =>
                      setCheckedPlanSteps((prev) => ({ ...prev, [idx]: Boolean(checked) }))
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] py-3 text-center">
                No checklist generated yet. Click "Generate Plan" to construct AI steps.
              </p>
            )}
          </NeuCard>

          {/* 4. Reply Drafter with Tone & Policy */}
          <NeuCard depth="raised-sm" padding="md" title="Draft Policy-Backed Reply">
            <div className="space-y-3 mt-1">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <NeuSelect
                    value={replyTone}
                    onValueChange={(val: any) => setReplyTone(val)}
                    options={[
                      { value: "professional", label: "Professional" },
                      { value: "warm", label: "Warm & Empathetic" },
                      { value: "concise", label: "Concise" },
                    ]}
                  />
                </div>
                <NeuButton
                  variant="secondary"
                  size="md"
                  onClick={handleGenerateReply}
                  loading={generateReplyMutation.isPending}
                  icon={<Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />}
                >
                  Generate
                </NeuButton>
              </div>

              {replyPolicyCited && (
                <div className="text-[11px] font-mono text-[var(--accent)] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] p-2 rounded-[10px]">
                  Cited: {replyPolicyCited}
                </div>
              )}

              {replyWarnings.length > 0 && (
                <div className="p-2.5 rounded-[12px] bg-[var(--warning)]/10 border border-[var(--warning)]/40 text-[11px] text-[var(--warning)] space-y-1">
                  <span className="font-bold block">Review Warnings:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {replyWarnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <NeuTextarea
                placeholder="Generated draft or custom reply..."
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                rows={5}
              />

              <NeuButton
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleSendReply}
                disabled={!replyDraft.trim() || sendReplyMutation.isPending}
                loading={sendReplyMutation.isPending}
                icon={<Send className="w-4 h-4" />}
                iconPosition="right"
              >
                Send Reply & Await Customer
              </NeuButton>
            </div>
          </NeuCard>

          {/* 5. Override AI */}
          <NeuCard depth="raised-sm" padding="md" title="Override AI Recommendation">
            <div className="space-y-3 mt-1 text-xs">
              <NeuSelect
                label="Target Field"
                value={overrideField}
                onValueChange={setOverrideField}
                options={[
                  { value: "category", label: "Category" },
                  { value: "priority", label: "Priority" },
                  { value: "sentiment", label: "Sentiment" },
                  { value: "customer_intent", label: "Customer Intent" },
                  { value: "summary", label: "Summary" },
                  { value: "recommended_action", label: "Recommended Action" },
                  { value: "next_step", label: "Next Step" },
                ]}
              />

              {overrideField === "priority" ? (
                <NeuSelect
                  label="New Value"
                  value={overrideValue}
                  onValueChange={setOverrideValue}
                  options={[
                    { value: "Critical", label: "Critical" },
                    { value: "High", label: "High" },
                    { value: "Medium", label: "Medium" },
                    { value: "Low", label: "Low" },
                  ]}
                />
              ) : overrideField === "category" ? (
                <NeuSelect
                  label="New Value"
                  value={overrideValue}
                  onValueChange={setOverrideValue}
                  options={[
                    { value: "Damaged Product", label: "Damaged Product" },
                    { value: "Delivery Delay", label: "Delivery Delay" },
                    { value: "Refund", label: "Refund" },
                    { value: "Return", label: "Return" },
                    { value: "Warranty", label: "Warranty" },
                    { value: "Replacement", label: "Replacement" },
                    { value: "Cancellation", label: "Cancellation" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              ) : (
                <NeuInput
                  label="New Value"
                  placeholder="Enter new value..."
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                />
              )}

              <NeuInput
                label="Reason (Required)"
                placeholder="Why are you overriding the AI proposal?..."
                value={overrideReason}
                onChange={(e) => {
                  setOverrideReason(e.target.value);
                  if (e.target.value.trim()) setOverrideError(null);
                }}
                error={overrideError || undefined}
              />

              <NeuButton
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleRecordOverride}
                loading={overrideMutation.isPending}
              >
                Record Override
              </NeuButton>
            </div>
          </NeuCard>

          {/* 6. Promises List */}
          {promisesList.length > 0 && (
            <NeuCard depth="raised-sm" padding="md" title="Case Promises">
              <div className="space-y-3 mt-2">
                {promisesList.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-[12px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[var(--text)]">{p.text}</p>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        Due {formatDateTime(p.due_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <NeuBadge
                        tone={p.status === "kept" ? "success" : p.status === "broken" ? "danger" : "warning"}
                      >
                        {p.status}
                      </NeuBadge>

                      {p.status === "pending" && (
                        <NeuButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMarkPromiseKept(p.id)}
                          icon={<Check className="w-3.5 h-3.5" />}
                        >
                          Mark kept
                        </NeuButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </NeuCard>
          )}
        </aside>
      </div>

      {/* Archive Confirmation Dialog */}
      <NeuConfirm
        open={archiveConfirmOpen}
        onOpenChange={setArchiveConfirmOpen}
        title="Archive this case?"
        description="Archiving will remove this case from the active queue. You can view it anytime by enabling the 'Include Archived' filter."
        confirmLabel="Yes, Archive Case"
        tone="danger"
        loading={archiveMutation.isPending}
        onConfirm={handleArchive}
      />

      {/* Send Reply Warning Confirm Dialog */}
      <NeuConfirm
        open={sendReplyConfirmOpen}
        onOpenChange={setSendReplyConfirmOpen}
        title="Confirm Sending Reply with Warnings"
        description="The AI diagnostic engine detected potential policy or tone risks on this case. Confirm that your drafted reply addresses these points."
        confirmLabel="Send Anyway"
        tone="primary"
        loading={sendReplyMutation.isPending}
        onConfirm={handleSendReply}
      />
    </div>
  );
}
