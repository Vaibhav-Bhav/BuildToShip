import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  useGetCases,
  getGetCasesQueryKey,
  type GetCasesParams,
  type Case,
} from "@workspace/api-client-react";
import {
  NeuButton,
  NeuBadge,
  NeuInput,
  NeuSelect,
  NeuSwitch,
  NeuAvatar,
  NeuPagination,
  NeuSkeleton,
  NeuEmptyState,
  NeuErrorPanel,
} from "../../components/neu";
import { PageHeader } from "../../components/layout/PageHeader";
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { getPriorityTone, getStatusTone } from "../../lib/status";
import { formatRelativeTime } from "../../lib/format";
import { cn } from "../../lib/cn";

export default function AgentCasesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";
  const category = searchParams.get("category") || "";
  const escalated = searchParams.get("escalated") === "true";
  const includeArchived = searchParams.get("includeArchived") === "true";
  const sort = (searchParams.get("sort") || "newest") as any;
  const page = Number(searchParams.get("page") || 1);
  const limit = 15;

  // Local debounced search input
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateQuery({ search: searchInput || undefined, page: "1" });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateQuery = (paramsToUpdate: Record<string, string | undefined>) => {
    const current = new URLSearchParams(searchParams);
    Object.entries(paramsToUpdate).forEach(([key, val]) => {
      if (val === undefined || val === "") {
        current.delete(key);
      } else {
        current.set(key, val);
      }
    });
    setSearchParams(current, { replace: true });
  };

  const queryParams: GetCasesParams = {
    search: search || undefined,
    status: status ? (status as any) : undefined,
    priority: priority ? (priority as any) : undefined,
    category: category ? (category as any) : undefined,
    escalated: escalated ? true : undefined,
    includeArchived: includeArchived ? true : undefined,
    sort,
    page,
    limit,
  };

  // Poll every 30 seconds and refetch on window focus
  const { data, isLoading, isError, refetch } = useGetCases(queryParams, {
    query: {
      queryKey: getGetCasesQueryKey(queryParams),
      refetchInterval: 30000,
      refetchOnWindowFocus: true,
    },
  });

  const casesList: Case[] = (data as any)?.cases || [];
  const totalCount: number = (data as any)?.total ?? casesList.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Triage Operations"
        title="Case Queue"
        body="Review incoming issues, inspect AI diagnostic briefs, and assign or resolve cases."
        action={
          <NeuButton
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Queue
          </NeuButton>
        }
      />

      {/* Filter and Control Toolbar */}
      <div className="p-4 sm:p-5 rounded-[20px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--input-border)]/40 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="lg:col-span-1">
            <NeuInput
              placeholder="Search code or issue..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Status */}
          <NeuSelect
            placeholder="All Statuses"
            value={status}
            onValueChange={(val) => updateQuery({ status: val === "all" ? undefined : val, page: "1" })}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "New", label: "New" },
              { value: "Investigating", label: "Investigating" },
              { value: "Awaiting Customer", label: "Awaiting Customer" },
              { value: "Approved", label: "Approved" },
              { value: "Resolved", label: "Resolved" },
              { value: "Rejected", label: "Rejected" },
            ]}
          />

          {/* Priority */}
          <NeuSelect
            placeholder="All Priorities"
            value={priority}
            onValueChange={(val) => updateQuery({ priority: val === "all" ? undefined : val, page: "1" })}
            options={[
              { value: "all", label: "All Priorities" },
              { value: "Critical", label: "Critical" },
              { value: "High", label: "High" },
              { value: "Medium", label: "Medium" },
              { value: "Low", label: "Low" },
            ]}
          />

          {/* Sort */}
          <NeuSelect
            placeholder="Sort by"
            value={sort}
            onValueChange={(val) => updateQuery({ sort: val, page: "1" })}
            options={[
              { value: "newest", label: "Newest First" },
              { value: "oldest", label: "Oldest First" },
              { value: "priority", label: "Highest Priority" },
              { value: "due_soonest", label: "Due Soonest (SLA)" },
            ]}
          />
        </div>

        {/* Toggles bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[var(--input-border)]/30">
          <div className="flex flex-wrap items-center gap-6">
            <NeuSwitch
              label="Escalated Only"
              checked={escalated}
              onCheckedChange={(checked) => updateQuery({ escalated: checked ? "true" : undefined, page: "1" })}
            />
            <NeuSwitch
              label="Include Archived"
              checked={includeArchived}
              onCheckedChange={(checked) => updateQuery({ includeArchived: checked ? "true" : undefined, page: "1" })}
            />
          </div>

          <span className="text-xs font-semibold text-[var(--text-muted)]">
            Total Cases: <span className="text-[var(--text)]">{totalCount}</span>
          </span>
        </div>
      </div>

      {/* Case Rows / Cards List */}
      {isLoading ? (
        <div className="space-y-3">
          <NeuSkeleton className="h-20 w-full" />
          <NeuSkeleton className="h-20 w-full" />
          <NeuSkeleton className="h-20 w-full" />
        </div>
      ) : isError ? (
        <NeuErrorPanel
          message="Failed to load cases queue from backend server."
          retry={() => refetch()}
        />
      ) : casesList.length === 0 ? (
        <NeuEmptyState
          icon={<FolderOpen className="w-8 h-8 text-[var(--text-muted)]" />}
          title="No cases match your filters"
          body="Try adjusting or clearing your status, priority, or search filters to view more cases."
          action={
            <NeuButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchInput("");
                setSearchParams(new URLSearchParams(), { replace: true });
              }}
            >
              Reset Filters
            </NeuButton>
          }
        />
      ) : (
        <div className="space-y-3">
          {casesList.map((c) => {
            const isOverdue = new Date(c.due_at).getTime() < Date.now();

            return (
              <div
                key={c.id}
                onClick={() => navigate(`/agent/cases/${c.id}`)}
                className="p-4 sm:p-5 rounded-[20px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--input-border)]/40 hover:shadow-[var(--neu-raised)] active:shadow-[var(--neu-inset-sm)] transition-all duration-150 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
              >
                {/* Customer info & case summary */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <NeuAvatar name={c.customer_name ?? "Customer"} size="md" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--accent)] tracking-wider">
                        {c.case_code}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text)]">
                        {c.customer_name || "Customer"}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">·</span>
                      <span className="text-xs text-[var(--text-muted)] font-medium">
                        {c.category}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-[var(--text)] truncate">
                      {c.summary}
                    </h3>
                  </div>
                </div>

                {/* Badges & SLA */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--input-border)]/30">
                  <NeuBadge tone={getPriorityTone(c.priority || "Low")}>
                    {c.priority || "Low"}
                  </NeuBadge>

                  <NeuBadge tone={getStatusTone(c.status)}>
                    {c.status}
                  </NeuBadge>

                  {c.escalation_required && (
                    <div
                      title={c.escalation_reason || "Escalation criteria met"}
                      className="cursor-help"
                    >
                      <NeuBadge tone="danger" dot>
                        Escalated
                      </NeuBadge>
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-semibold",
                      isOverdue ? "text-[var(--danger)]" : "text-[var(--text-muted)]"
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isOverdue ? "Overdue" : `Due ${formatRelativeTime(c.due_at)}`}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <div className="pt-4">
            <NeuPagination
              currentPage={page}
              totalItems={totalCount}
              itemsPerPage={limit}
              onPageChange={(newPage) => updateQuery({ page: String(newPage) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
