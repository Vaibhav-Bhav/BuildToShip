import React from "react";
import {
  FileText,
  Sparkles,
  AlertTriangle,
  UserCheck,
  MessageSquare,
  Paperclip,
  Send,
  RefreshCw,
  CheckCircle2,
  Sliders,
  ListTodo,
  Calendar,
  Archive,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { formatDateTime } from "../../lib/format";

export interface TimelineEventItem {
  id: number;
  event_type: string;
  description: string;
  actor_type: string;
  actor_id?: number | null;
  created_at: string;
  metadata?: Record<string, unknown>;
  visible_to_customer?: boolean;
}

export interface NeuTimelineProps {
  events: TimelineEventItem[];
  className?: string;
  showActor?: boolean;
}

export const NeuTimeline: React.FC<NeuTimelineProps> = ({
  events,
  className,
  showActor = true,
}) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "CASE_CREATED":
        return <FileText className="w-4 h-4 text-[var(--accent)]" />;
      case "AI_CLASSIFIED":
        return <Sparkles className="w-4 h-4 text-[var(--info)]" />;
      case "ESCALATED":
        return <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />;
      case "AGENT_ASSIGNED":
        return <UserCheck className="w-4 h-4 text-[var(--accent)]" />;
      case "AGENT_REVIEW":
        return <MessageSquare className="w-4 h-4 text-[var(--warning)]" />;
      case "EVIDENCE_SUBMITTED":
        return <Paperclip className="w-4 h-4 text-[var(--info)]" />;
      case "REPLY_SENT":
        return <Send className="w-4 h-4 text-[var(--accent)]" />;
      case "STATUS_CHANGED":
        return <RefreshCw className="w-4 h-4 text-[var(--warning)]" />;
      case "RESOLVED":
        return <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />;
      case "AI_OVERRIDDEN":
        return <Sliders className="w-4 h-4 text-[var(--warning)]" />;
      case "PLAN_GENERATED":
        return <ListTodo className="w-4 h-4 text-[var(--info)]" />;
      case "PROMISE_MADE":
      case "PROMISE_KEPT":
      case "PROMISE_BROKEN":
        return <Calendar className="w-4 h-4 text-[var(--accent)]" />;
      case "CASE_ARCHIVED":
        return <Archive className="w-4 h-4 text-[var(--text-muted)]" />;
      default:
        return <FileText className="w-4 h-4 text-[var(--text-muted)]" />;
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-[var(--text-muted)]">
        No timeline events recorded yet.
      </div>
    );
  }

  return (
    <div className={cn("relative pl-6 space-y-6 before:content-[''] before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--input-border)]/70", className)}>
      {events.map((event) => (
        <div key={event.id} className="relative flex items-start gap-4 group">
          <div className="absolute -left-6 top-0 flex items-center justify-center w-7 h-7 rounded-full bg-[var(--bg)] shadow-[var(--neu-raised-sm)] border border-[var(--input-border)]/50 shrink-0">
            {getEventIcon(event.event_type)}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--text)]">
                {event.description}
              </span>
              <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                {formatDateTime(event.created_at)}
              </span>
            </div>
            {showActor && (
              <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--text-muted)]">
                <span className="capitalize font-medium">{event.actor_type}</span>
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <>
                    <span>·</span>
                    <span className="truncate">
                      {event.metadata.reason ? `Reason: ${String(event.metadata.reason)}` : ""}
                      {event.metadata.old && event.metadata.new
                        ? `${String(event.metadata.old)} → ${String(event.metadata.new)}`
                        : ""}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
