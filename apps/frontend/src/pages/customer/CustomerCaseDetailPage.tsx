import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useGetCase,
  useAddCaseMessage,
  getGetCaseQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  NeuButton,
  NeuCard,
  NeuBadge,
  NeuStepper,
  NeuTimeline,
  NeuTextarea,
  NeuSkeleton,
  NeuErrorPanel,
  NeuDialog,
  NeuDialogContent,
  NeuDialogHeader,
  NeuDialogTitle,
  NeuDropzone,
  useToast,
  type SelectedFile,
} from "../../components/neu";
import { AttachmentImage } from "../../components/case/AttachmentImage";
import {
  ArrowLeft,
  Calendar,
  Send,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
  Paperclip,
} from "lucide-react";
import { getFriendlyStatus, getStatusTone } from "../../lib/status";
import { formatDateTime, formatDate, formatCurrency } from "../../lib/format";

export default function CustomerCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const caseId = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: caseDetail, isLoading, isError, refetch } = useGetCase(caseId, {
    query: {
      queryKey: getGetCaseQueryKey(caseId),
      enabled: !Number.isNaN(caseId),
    },
  });

  const [messageBody, setMessageBody] = useState("");
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [newFiles, setNewFiles] = useState<SelectedFile[]>([]);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  const addMessageMutation = useAddCaseMessage();

  const handleSendMessage = () => {
    if (!messageBody.trim() || addMessageMutation.isPending) return;

    addMessageMutation.mutate(
      {
        id: caseId,
        data: { body: messageBody.trim() },
      },
      {
        onSuccess: () => {
          setMessageBody("");
          queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
          toast("Message sent!", "success");
        },
        onError: (err: any) => {
          toast(err?.data?.error || "Failed to send message", "error");
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUploadMoreEvidence = async () => {
    if (newFiles.length === 0) return;
    setIsUploadingEvidence(true);

    try {
      const token = localStorage.getItem("resolveai_token");
      for (const item of newFiles) {
        const formData = new FormData();
        formData.append("file", item.file);

        await fetch(`/api/cases/${caseId}/attachments`, {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });
      }

      setNewFiles([]);
      setEvidenceDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
      toast("Evidence uploaded successfully!", "success");
    } catch {
      toast("Failed to upload evidence files", "error");
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  // Status Stepper calculation
  const stepperSteps = [
    { id: "1", label: "Received" },
    { id: "2", label: "Under Review" },
    { id: "3", label: "Action Taken" },
    { id: "4", label: "Resolved" },
  ];

  const currentStepIndex = useMemo(() => {
    if (!caseDetail) return 0;
    switch (caseDetail.status) {
      case "New":
        return 0;
      case "Investigating":
      case "Awaiting Customer":
        return 1;
      case "Approved":
        return 2;
      case "Resolved":
      case "Rejected":
        return 3;
      default:
        return 1;
    }
  }, [caseDetail]);

  // Find active promise if any
  const pendingPromise = useMemo(() => {
    const promises = (caseDetail as any)?.promises;
    if (Array.isArray(promises)) {
      return promises.find((p: any) => p.status === "pending");
    }
    return null;
  }, [caseDetail]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <NeuSkeleton className="h-8 w-48" />
        <NeuSkeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <NeuSkeleton className="h-96 lg:col-span-2" />
          <NeuSkeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (isError || !caseDetail) {
    return (
      <div className="space-y-4">
        <Link
          to="/customer/cases"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to my cases</span>
        </Link>
        <NeuErrorPanel
          message="Case not found or you do not have permission to view it."
          retry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/cases"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All my cases</span>
        </Link>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-[10px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] active:shadow-[var(--neu-inset-sm)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all cursor-pointer"
          aria-label="Refresh case"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Header Card */}
      <NeuCard depth="raised" padding="md">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--input-border)]/40">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-[var(--accent)] tracking-wider">
              {caseDetail.case_code}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              · {caseDetail.category} · Opened {formatDate(caseDetail.created_at)}
            </span>
          </div>
          <NeuBadge tone={getStatusTone(caseDetail.status)}>
            {getFriendlyStatus(caseDetail.status)}
          </NeuBadge>
        </div>

        <div className="pt-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
            {caseDetail.summary}
          </h1>

          {caseDetail.order && (
            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-[12px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/40 text-xs text-[var(--text)]">
              <span className="font-mono font-semibold">{caseDetail.order.order_code}</span>
              <span>·</span>
              <span>{caseDetail.order.product_name}</span>
              <span>·</span>
              <span className="font-bold">{formatCurrency(caseDetail.order.price)}</span>
            </div>
          )}

          {/* Stepper */}
          <div className="mt-6 pt-4 border-t border-[var(--input-border)]/40">
            <NeuStepper steps={stepperSteps} currentStepIndex={currentStepIndex} />
          </div>
        </div>
      </NeuCard>

      {/* Promise Banner (if pending promise exists) */}
      {pendingPromise && (
        <div className="p-4 rounded-[16px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--accent)]/40 flex items-center gap-3.5">
          <div className="p-2.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] shrink-0 shadow-sm">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-xs text-[var(--text)]">
            <span className="font-bold text-[var(--accent)] block sm:inline mr-2">
              Agent Commitment:
            </span>
            <span>{pendingPromise.text}</span>
            <span className="text-[var(--text-muted)] ml-2">
              (Expect update by {formatDateTime(pendingPromise.due_at)})
            </span>
          </div>
        </div>
      )}

      {/* Two Column Layout: Left conversation & timeline, Right Next step & Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        {/* Left Column: Messages & Safe Timeline */}
        <div className="space-y-6">
          {/* Messages Thread */}
          <NeuCard depth="raised" padding="md" title="Case Conversation" subtitle="Direct messages with our resolution team">
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {caseDetail.messages && caseDetail.messages.length > 0 ? (
                caseDetail.messages.map((m) => {
                  const isCustomer = m.sender_type === "customer";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                          {isCustomer ? "You" : "Support Team"}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {formatDateTime(m.created_at)}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] p-3.5 rounded-[16px] text-xs leading-relaxed ${
                          isCustomer
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
                  No messages exchanged yet.
                </p>
              )}
            </div>

            {/* Composer */}
            <div className="mt-5 pt-4 border-t border-[var(--input-border)]/40 space-y-2">
              <NeuTextarea
                placeholder="Write a message to our support team (Ctrl+Enter to send)..."
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                disabled={addMessageMutation.isPending}
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[var(--text-muted)]">
                  Press <kbd className="font-mono bg-[var(--bg)] shadow-[var(--neu-inset-sm)] px-1.5 py-0.5 rounded-[6px]">Ctrl</kbd> + <kbd className="font-mono bg-[var(--bg)] shadow-[var(--neu-inset-sm)] px-1.5 py-0.5 rounded-[6px]">Enter</kbd>
                </span>
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

          {/* Safe Timeline */}
          <NeuCard depth="raised" padding="md" title="Case Timeline" subtitle="Customer-visible milestones and actions">
            <NeuTimeline events={caseDetail.timeline || []} showActor={false} />
          </NeuCard>
        </div>

        {/* Right Column: Your Next Step & Evidence Gallery */}
        <aside className="space-y-6">
          {/* Your Next Step */}
          <NeuCard depth="raised-sm" padding="md" title="Your Next Step">
            <div className="p-3.5 rounded-[14px] bg-[var(--bg)] shadow-[var(--neu-inset-sm)] border border-[var(--input-border)]/50 mt-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] mb-1">
                <Clock className="w-4 h-4" />
                <span>Current Status</span>
              </div>
              <p className="text-xs text-[var(--text)] leading-relaxed">
                {caseDetail.status === "Awaiting Customer"
                  ? "Our team has replied and requested more information. Please review the conversation and send your response."
                  : caseDetail.status === "Resolved"
                  ? "This case is resolved. If you need further help with this order, you can add another message above."
                  : caseDetail.status === "Approved"
                  ? "Your request has been approved by the resolution specialist. Next shipment or refund steps are in progress."
                  : "Our team is reviewing your report and evidence photos. We will update you here as soon as an agent analyzes your case."}
              </p>
            </div>
          </NeuCard>

          {/* Evidence Gallery */}
          <NeuCard
            depth="raised-sm"
            padding="md"
            title="Attached Evidence"
            subtitle={`${(caseDetail.attachments || []).length} files attached`}
            headerAction={
              <NeuButton
                variant="secondary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setEvidenceDialogOpen(true)}
              >
                Add
              </NeuButton>
            }
          >
            {caseDetail.attachments && caseDetail.attachments.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {caseDetail.attachments.map((att) => (
                  <AttachmentImage
                    key={att.id}
                    attachmentId={att.id}
                    fileName={att.file_name}
                  />
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                <Paperclip className="w-6 h-6 mx-auto mb-2 text-[var(--text-muted)] opacity-60" />
                No photos attached yet.
              </div>
            )}
          </NeuCard>
        </aside>
      </div>

      {/* Add More Evidence Modal */}
      <NeuDialog open={evidenceDialogOpen} onOpenChange={setEvidenceDialogOpen}>
        <NeuDialogContent className="max-w-md">
          <NeuDialogHeader>
            <NeuDialogTitle>Add Evidence Photos</NeuDialogTitle>
          </NeuDialogHeader>
          <div className="space-y-4 py-2">
            <NeuDropzone files={newFiles} onFilesChange={setNewFiles} disabled={isUploadingEvidence} />
            <div className="flex justify-end gap-2 pt-2">
              <NeuButton
                variant="ghost"
                onClick={() => setEvidenceDialogOpen(false)}
                disabled={isUploadingEvidence}
              >
                Cancel
              </NeuButton>
              <NeuButton
                variant="primary"
                onClick={handleUploadMoreEvidence}
                disabled={newFiles.length === 0 || isUploadingEvidence}
                loading={isUploadingEvidence}
              >
                Upload Evidence
              </NeuButton>
            </div>
          </div>
        </NeuDialogContent>
      </NeuDialog>
    </div>
  );
}
