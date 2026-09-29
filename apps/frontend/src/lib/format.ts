export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const now = Date.now();
  const diffMs = date.getTime() - now;
  const isPast = diffMs < 0;
  const absSeconds = Math.round(Math.abs(diffMs) / 1000);

  if (absSeconds < 60) return "just now";
  const absMinutes = Math.round(absSeconds / 60);
  if (absMinutes < 60) return isPast ? `${absMinutes}m ago` : `in ${absMinutes}m`;
  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) return isPast ? `${absHours}h ago` : `in ${absHours}h`;
  const absDays = Math.round(absHours / 24);
  if (absDays < 30) return isPast ? `${absDays}d ago` : `in ${absDays}d`;

  return formatDate(dateStr);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
