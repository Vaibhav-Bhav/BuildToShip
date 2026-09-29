import React, { useMemo, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import {
  useGetAnalyticsSummary,
  getGetAnalyticsSummaryQueryKey,
  useGetCases,
  getGetCasesQueryKey,
  type AnalyticsSummary,
  type Case,
} from "@workspace/api-client-react";
import { useAuth } from "../../features/auth/useAuth";
import {
  NeuButton,
  NeuCard,
  NeuBadge,
  NeuStat,
  NeuAvatar,
  NeuSkeleton,
  NeuEmptyState,
  NeuErrorPanel,
} from "../../components/neu";
import { PageHeader } from "../../components/layout/PageHeader";
import {
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatRelativeTime } from "../../lib/format";
import { getPriorityTone } from "../../lib/status";

// Lazy load Recharts visuals
const CategoryBarChart = lazy(() =>
  import("../../components/charts/NeumorphicCharts").then((m) => ({ default: m.CategoryBarChart }))
);
const StatusDonutChart = lazy(() =>
  import("../../components/charts/NeumorphicCharts").then((m) => ({ default: m.StatusDonutChart }))
);
const ResolvedPerDayChart = lazy(() =>
  import("../../components/charts/NeumorphicCharts").then((m) => ({ default: m.ResolvedPerDayChart }))
);

export default function AgentDashboardPage() {
  const { user } = useAuth();
  const agentFirstName = user?.name ? user.name.split(" ")[0] : "Agent";

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const { data: analyticsData, isLoading, isError, refetch } = useGetAnalyticsSummary({
    query: {
      queryKey: getGetAnalyticsSummaryQueryKey(),
      refetchInterval: 30000,
    },
  });

  const { data: escalatedCasesData } = useGetCases(
    { escalated: true, limit: 10 },
    {
      query: {
        queryKey: getGetCasesQueryKey({ escalated: true, limit: 10 }),
        refetchInterval: 30000,
      },
    }
  );

  const escalatedCases: Case[] = (escalatedCasesData as any)?.cases || [];

  // Top 5 escalated or overdue cases requiring attention
  const needsAttentionCases = useMemo(() => {
    return escalatedCases
      .filter((c) => !["Resolved", "Rejected"].includes(c.status))
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
      .slice(0, 5);
  }, [escalatedCases]);

  const summary = analyticsData as AnalyticsSummary | undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={todayStr}
        title={`Welcome back, ${agentFirstName}`}
        body="Real-time operational triage metrics and escalated cases requiring immediate resolution."
        action={
          <NeuButton
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Metrics
          </NeuButton>
        }
      />

      {/* KPI Stats Row */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <NeuSkeleton key={i} className="h-28 rounded-[20px]" />
          ))}
        </div>
      ) : isError || !summary ? (
        <NeuErrorPanel
          message="Could not load analytics summary from server."
          retry={() => refetch()}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          <NeuStat label="Open Cases" value={summary.open_cases} tone="neutral" />
          <NeuStat label="High Priority" value={summary.high_priority} tone="warning" />
          <NeuStat label="At Risk" value={summary.at_risk} tone="danger" />
          <NeuStat label="Resolved Today" value={summary.resolved_today} tone="success" />
          <NeuStat label="Repeat Contact" value={`${summary.repeat_contact_rate}%`} tone="info" />
          <NeuStat label="Avg Resolution" value={`${summary.avg_resolution_hours}h`} tone="neutral" />
          <NeuStat
            label="Broken Promises"
            value={summary.broken_promise_rate !== null ? `${summary.broken_promise_rate}%` : "0%"}
            tone={summary.broken_promise_rate && summary.broken_promise_rate > 10 ? "danger" : "neutral"}
          />
        </div>
      )}

      {/* Needs Attention Top 5 Card */}
      <NeuCard
        depth="raised"
        padding="md"
        title="Needs Immediate Attention"
        subtitle="Top escalated or impending SLA cases"
        headerIcon={<AlertTriangle className="w-4 h-4" />}
        headerAction={
          <Link to="/agent/cases?escalated=true">
            <NeuButton variant="ghost" size="sm">
              View All Escalated
            </NeuButton>
          </Link>
        }
      >
        {needsAttentionCases.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--text-muted)] flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[var(--success)]" />
            <span>No escalated cases right now. All priority SLAs are currently within limits.</span>
          </div>
        ) : (
          <div className="divide-y divide-[var(--input-border)]/40">
            {needsAttentionCases.map((c) => {
              const isOverdue = new Date(c.due_at).getTime() < Date.now();
              return (
                <Link
                  key={c.id}
                  to={`/agent/cases/${c.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-1 hover:bg-[var(--bg)] hover:shadow-[var(--neu-raised-sm)] px-3 -mx-3 rounded-[14px] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <NeuAvatar name={c.customer_name ?? "Customer"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[var(--accent)]">
                          {c.case_code}
                        </span>
                        <span className="text-xs font-semibold text-[var(--text)]">
                          {c.customer_name || "Customer"}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                        {c.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <NeuBadge tone={getPriorityTone(c.priority || "Low")}>
                      {c.priority || "Low"}
                    </NeuBadge>
                    <span
                      className={`text-xs font-semibold flex items-center gap-1 ${
                        isOverdue ? "text-[var(--danger)]" : "text-[var(--text-muted)]"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {isOverdue ? "Overdue" : `Due ${formatRelativeTime(c.due_at)}`}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </NeuCard>

      {/* Visual Analytics Charts (Recharts Lazy Loaded) */}
      {summary && (
        <div className="space-y-6">
          <div className="text-left">
            <h2 className="text-xl font-bold text-[var(--text)]">Queue Analytics & Trends</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Live distribution of issues, status bottlenecks, and 14-day resolution rates.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NeuSkeleton className="h-72 w-full rounded-[20px]" />
                <NeuSkeleton className="h-72 w-full rounded-[20px]" />
              </div>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryBarChart data={summary.by_category} />
              <StatusDonutChart data={summary.by_status} />
            </div>

            <div className="mt-6">
              <ResolvedPerDayChart data={summary.resolved_per_day} />
            </div>
          </Suspense>
        </div>
      )}
    </div>
  );
}
