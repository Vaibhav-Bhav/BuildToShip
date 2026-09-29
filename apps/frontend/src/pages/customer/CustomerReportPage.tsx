import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  useGetMyOrders,
  useCreateCase,
  type Order,
} from "@workspace/api-client-react";
import {
  NeuButton,
  NeuCard,
  NeuSelect,
  NeuTextarea,
  NeuDropzone,
  useToast,
  type SelectedFile,
} from "../../components/neu";
import { PageHeader } from "../../components/layout/PageHeader";
import { ArrowLeft, CheckCircle2, ShieldCheck, Clock, Send } from "lucide-react";

export default function CustomerReportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: ordersData, isLoading: isOrdersLoading } = useGetMyOrders();

  const [selectedOrderId, setSelectedOrderId] = useState<string>("none");
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState<string | null>(null);
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const createCaseMutation = useCreateCase();

  const ordersList: Order[] = Array.isArray(ordersData) ? ordersData : [];

  const orderOptions = [
    { value: "none", label: "Not sure / another order" },
    ...ordersList.map((order) => ({
      value: String(order.id),
      label: `${order.order_code} - ${order.product_name} ($${order.price.toLocaleString()})`,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessageError(null);

    if (message.trim().length < 10) {
      setMessageError("Please enter at least 10 characters describing the issue.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create the case
      const parsedOrderId = selectedOrderId === "none" ? null : Number(selectedOrderId);
      const createdCase = await createCaseMutation.mutateAsync({
        data: {
          message: message.trim(),
          order_id: parsedOrderId,
        },
      });

      // 2. Upload any attachments as multipart FormData
      let uploadFailure = false;
      if (files.length > 0) {
        for (const item of files) {
          try {
            const formData = new FormData();
            formData.append("file", item.file);

            // Fetch directly with auth token or standard multipart POST
            const token = localStorage.getItem("resolveai_token");
            const res = await fetch(`/api/cases/${createdCase.id}/attachments`, {
              method: "POST",
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                // Do NOT set Content-Type header manually so boundary is generated
              },
              body: formData,
            });

            if (!res.ok) {
              uploadFailure = true;
            }
          } catch {
            uploadFailure = true;
          }
        }
      }

      if (uploadFailure) {
        toast("Case created, but one or more attachments failed to upload. You can retry on the case page.", "warning");
      } else {
        toast(`Case ${createdCase.case_code} submitted successfully!`, "success");
      }

      navigate(`/customer/cases/${createdCase.id}`);
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || "Failed to submit case";
      setMessageError(msg);
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/customer/cases"
        className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to my cases</span>
      </Link>

      <PageHeader
        eyebrow="Support Request"
        title="Report an Issue"
        body="Provide the details of your issue. Our AI resolution system and support agents will review it promptly."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Main form */}
        <NeuCard depth="raised" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <NeuSelect
              label="Select Affected Order"
              helperText="Choose the order this issue relates to, or select 'Not sure / another order'"
              value={selectedOrderId}
              onValueChange={setSelectedOrderId}
              options={orderOptions}
              disabled={isOrdersLoading || submitting}
            />

            <NeuTextarea
              label="Describe What Happened"
              placeholder="Please explain the damage, transit delay, or reason for return in detail (min 10 characters)..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (e.target.value.length >= 10) setMessageError(null);
              }}
              error={messageError || undefined}
              maxLength={4000}
              showCount
              helperText="Include serial numbers or transit packaging notes if available."
              rows={6}
              disabled={submitting}
            />

            <div>
              <label className="text-xs font-semibold text-[var(--text)] select-none block mb-2">
                Attach Photo Evidence (Optional)
              </label>
              <NeuDropzone
                files={files}
                onFilesChange={setFiles}
                disabled={submitting}
              />
            </div>

            <div className="pt-4 border-t border-[var(--input-border)]/40 flex justify-end">
              <NeuButton
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting || createCaseMutation.isPending}
                icon={<Send className="w-4 h-4" />}
                iconPosition="right"
              >
                Submit Support Case
              </NeuButton>
            </div>
          </form>
        </NeuCard>

        {/* What Happens Next side card */}
        <aside className="space-y-4">
          <NeuCard depth="raised-sm" padding="md" title="What happens next?">
            <div className="space-y-4 mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[var(--bg)] shadow-[var(--neu-inset-sm)] text-[var(--accent)] shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <b className="text-[var(--text)] block mb-0.5">1. Instant Triage</b>
                  Our diagnostic engine validates order eligibility, warranty policy, and transit history.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[var(--bg)] shadow-[var(--neu-inset-sm)] text-[var(--accent)] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <b className="text-[var(--text)] block mb-0.5">2. Evidence Verification</b>
                  Any attached photos are uploaded to private storage for agent inspection.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[var(--bg)] shadow-[var(--neu-inset-sm)] text-[var(--accent)] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <b className="text-[var(--text)] block mb-0.5">3. Fast Resolution</b>
                  An agent reviews the proposed resolution and sends an update directly to your case thread.
                </div>
              </div>
            </div>
          </NeuCard>
        </aside>
      </div>
    </div>
  );
}
