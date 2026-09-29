export type FriendlyStatus = "Received" | "Being reviewed" | "We need something from you" | "Approved" | "Resolved" | "Closed";

export const STATUS_MAP: Record<string, FriendlyStatus> = {
  New: "Received",
  Investigating: "Being reviewed",
  "Awaiting Customer": "We need something from you",
  Approved: "Approved",
  Resolved: "Resolved",
  Rejected: "Closed",
};

export function getFriendlyStatus(status: string): string {
  return STATUS_MAP[status] ?? status;
}

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

export function getStatusTone(status: string): StatusTone {
  switch (status) {
    case "Resolved":
    case "Approved":
      return "success";
    case "Investigating":
      return "info";
    case "Awaiting Customer":
      return "warning";
    case "Rejected":
      return "danger";
    case "New":
    default:
      return "neutral";
  }
}

export function getPriorityTone(priority: string): StatusTone {
  switch (priority) {
    case "Critical":
      return "danger";
    case "High":
      return "warning";
    case "Medium":
      return "info";
    case "Low":
    default:
      return "neutral";
  }
}
