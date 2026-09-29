import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { NeuCard } from "../neu/NeuCard";
import { NeuEmptyState } from "../neu/NeuEmptyState";
import { PieChart as PieIcon, BarChart2, TrendingUp } from "lucide-react";

export interface AnalyticsPoint {
  label: string;
  value: number;
}

// Custom readable Neumorphic Tooltip
const CustomNeuTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-[12px] bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--input-border)] text-xs text-[var(--text)] select-none">
        <span className="font-bold text-[var(--text)] block mb-0.5">{label || payload[0].name}</span>
        <span className="font-semibold text-[var(--accent)]">{payload[0].value} cases</span>
      </div>
    );
  }
  return null;
};

// Chart 1: Category horizontal bar chart
export const CategoryBarChart: React.FC<{ data: AnalyticsPoint[] }> = ({ data }) => {
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <NeuCard depth="raised" padding="md" title="Cases by Category">
        <div className="neu-chart-well flex items-center justify-center min-h-[260px]">
          <NeuEmptyState
            icon={<BarChart2 className="w-6 h-6 text-[var(--text-muted)]" />}
            title="No Category Data"
            body="No cases categorized in current timeframe."
          />
        </div>
      </NeuCard>
    );
  }

  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 6);

  return (
    <NeuCard depth="raised" padding="md" title="Cases by Category" subtitle="Top issue classifications">
      <div
        className="neu-chart-well"
        aria-label="Horizontal bar chart illustrating case distribution across product issue categories"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 30, bottom: 5 }}
            >
              <CartesianGrid stroke="var(--shadow-dark)" strokeOpacity={0.25} horizontal={false} />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                width={100}
              />
              <Tooltip content={<CustomNeuTooltip />} />
              <Bar dataKey="value" fill="var(--accent)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Visually hidden screen reader table */}
        <table className="sr-only-table">
          <caption>Cases by Category</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Count</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((d, i) => (
              <tr key={i}>
                <td>{d.label}</td>
                <td>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </NeuCard>
  );
};

// Chart 2: Status Donut with center total and legend
export const StatusDonutChart: React.FC<{ data: AnalyticsPoint[] }> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <NeuCard depth="raised" padding="md" title="Queue by Status">
        <div className="neu-chart-well flex items-center justify-center min-h-[260px]">
          <NeuEmptyState
            icon={<PieIcon className="w-6 h-6 text-[var(--text-muted)]" />}
            title="No Status Data"
            body="No active cases recorded in queue."
          />
        </div>
      </NeuCard>
    );
  }

  const colors = [
    "var(--accent)",
    "var(--info)",
    "var(--warning)",
    "var(--success)",
    "var(--danger)",
    "var(--text-muted)",
  ];

  return (
    <NeuCard depth="raised" padding="md" title="Queue by Status" subtitle="Active resolution stages">
      <div
        className="neu-chart-well flex flex-col sm:flex-row items-center justify-between gap-4"
        aria-label="Donut chart showing breakdown of open and resolved cases by status"
      >
        <div className="relative w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={52}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                nameKey="label"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="var(--bg)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomNeuTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-xl font-bold text-[var(--text)]">{total}</span>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Cases</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 flex-1 min-w-0 w-full text-xs">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center justify-between gap-2 py-0.5">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-[var(--text-muted)] truncate">{item.label}</span>
              </div>
              <span className="font-bold text-[var(--text)]">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Visually hidden screen reader table */}
        <table className="sr-only-table">
          <caption>Queue by Status</caption>
          <thead>
            <tr>
              <th scope="col">Status</th>
              <th scope="col">Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{d.label}</td>
                <td>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </NeuCard>
  );
};

// Chart 3: Resolved cases per day (last 14 days, zero-filled, chronological)
export const ResolvedPerDayChart: React.FC<{ data: AnalyticsPoint[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <NeuCard depth="raised" padding="md" title="Resolution Pulse (Last 14 Days)">
        <div className="neu-chart-well flex items-center justify-center min-h-[260px]">
          <NeuEmptyState
            icon={<TrendingUp className="w-6 h-6 text-[var(--text-muted)]" />}
            title="No Activity Data"
            body="No resolutions recorded in the past 14 days."
          />
        </div>
      </NeuCard>
    );
  }

  return (
    <NeuCard
      depth="raised"
      padding="md"
      title="Resolution Pulse"
      subtitle="Cases successfully resolved per day (Last 14 Days)"
    >
      <div
        className="neu-chart-well"
        aria-label="Area line chart tracking resolved cases day by day over the past 14 days"
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--success)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--shadow-dark)" strokeOpacity={0.25} vertical={false} />
              <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomNeuTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--success)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#resolvedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Visually hidden screen reader table */}
        <table className="sr-only-table">
          <caption>Resolved Cases Per Day (14 Days)</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Resolved Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td>{d.label}</td>
                <td>{d.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </NeuCard>
  );
};
