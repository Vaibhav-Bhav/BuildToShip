import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetMyCases, type CustomerCase } from "@workspace/api-client-react";
import {
  NeuButton,
  NeuCard,
  NeuBadge,
  NeuInput,
  NeuSegmented,
  NeuSkeleton,
  NeuEmptyState,
  NeuErrorPanel,
} from "../../components/neu";
import { PageHeader } from "../../components/layout/PageHeader";
import { PlusCircle, Search, ArrowRight, RefreshCw, FolderSearch } from "lucide-react";
import { getFriendlyStatus, getStatusTone } from "../../lib/status";
import { formatRelativeTime } from "../../lib/format";

export default function CustomerCasesPage() {
  const navigate = useNavigate();
  const { data: casesData, isLoading, isError, refetch } = useGetMyCases();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSegment, setFilterSegment] = useState<"all" | "open" | "resolved">("all");

  const casesList: CustomerCase[] = useMemo(() => {
    return Array.isArray(casesData) ? casesData : [];
  }, [casesData]);

  const filteredCases = useMemo(() => {
    return casesList.filter((item) => {
      // Status filter
      if (filterSegment === "open" && ["Resolved", "Rejected"].includes(item.status)) {
        return false;
      }
      if (filterSegment === "resolved" && !["Resolved", "Rejected"].includes(item.status)) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const codeMatch = item.case_code.toLowerCase().includes(q);
        const summaryMatch = item.summary.toLowerCase().includes(q);
        const categoryMatch = item.category.toLowerCase().includes(q);
        return codeMatch || summaryMatch || categoryMatch;
      }

      return true;
    });
  }, [casesList, filterSegment, searchTerm]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer Portal"
        title="Your Support Cases"
        body="Track progress, message our resolution team, and view active order claims."
        action={
          <Link to="/customer/report">
            <NeuButton variant="primary" icon={<PlusCircle className="w-4 h-4" />}>
              Report an Issue
            </NeuButton>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[20px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--input-border)]/40">
        <div className="w-full sm:w-72">
          <NeuInput
            placeholder="Search by code or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3">
          <NeuSegmented
            value={filterSegment}
            onChange={(val) => setFilterSegment(val as "all" | "open" | "resolved")}
            options={[
              { value: "all", label: "All Cases" },
              { value: "open", label: "Open" },
              { value: "resolved", label: "Resolved" },
            ]}
          />
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-[12px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] active:shadow-[var(--neu-inset-sm)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all cursor-pointer"
            aria-label="Refresh cases"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Cases List */}
      {isLoading ? (
        <div className="space-y-4">
          <NeuSkeleton className="h-20 w-full" />
          <NeuSkeleton className="h-20 w-full" />
          <NeuSkeleton className="h-20 w-full" />
        </div>
      ) : isError ? (
        <NeuErrorPanel
          message="Failed to retrieve your support cases. Please try again."
          retry={() => refetch()}
        />
      ) : filteredCases.length === 0 ? (
        searchTerm.trim() ? (
          <NeuEmptyState
            icon={<FolderSearch className="w-8 h-8 text-[var(--text-muted)]" />}
            title="No matching cases found"
            body={`We could not find any case matching "${searchTerm}". Check the spelling or clear the filter.`}
            action={
              <NeuButton variant="secondary" size="sm" onClick={() => setSearchTerm("")}>
                Clear Search
              </NeuButton>
            }
          />
        ) : (
          <NeuEmptyState
            title="No cases reported yet"
            body="If you encountered a problem with a recent delivery, damaged item, or warranty claim, report it now to receive a swift resolution."
            action={
              <Link to="/customer/report">
                <NeuButton variant="primary">Report an Issue</NeuButton>
              </Link>
            }
          />
        )
      ) : (
        <div className="space-y-3.5">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/customer/cases/${c.id}`)}
              className="p-5 rounded-[20px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--input-border)]/40 hover:shadow-[var(--neu-raised)] active:shadow-[var(--neu-inset-sm)] transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[var(--accent)] tracking-wider">
                    {c.case_code}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">·</span>
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    {c.category}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text)] truncate">
                  {c.summary}
                </h3>
                <div className="text-xs text-[var(--text-muted)]">
                  Last updated {formatRelativeTime(c.updated_at)}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--input-border)]/30">
                <NeuBadge tone={getStatusTone(c.status)}>
                  {getFriendlyStatus(c.status)}
                </NeuBadge>
                <div className="p-2 rounded-full bg-[var(--bg)] shadow-[var(--neu-raised-sm)] text-[var(--text-muted)]">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
