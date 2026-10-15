import type { Lead } from "@/lib/types";
import { formatDateTime, formatTime, isOverdue, isToday, timeAgo } from "@/lib/dates";
import StatusBadge from "./StatusBadge";

function FollowUp({ iso }: { iso: string }) {
  let cls = "bg-paper text-ink/70";
  let text = `Follow up ${formatDateTime(iso)}`;
  if (isOverdue(iso)) {
    cls = "bg-red-100 text-red-700";
    text = `Overdue since ${formatDateTime(iso)}`;
  } else if (isToday(iso)) {
    cls = "bg-accent-tint text-accent-dark";
    text = `Follow up today at ${formatTime(iso)}`;
  }
  return <span className={`mt-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{text}</span>;
}

export default function LeadCard({ lead, pinned, onOpen }: { lead: Lead; pinned?: boolean; onOpen: () => void }) {
  const closed = lead.status === "Won" || lead.status === "Lost";
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`block w-full rounded-lg border p-4 text-left transition-colors hover:border-accent ${
        pinned ? "border-accent/40 bg-accent-tint/50" : "border-line bg-white"
      } ${closed ? "opacity-75" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-semibold">{lead.name}</span>
          {lead.company && <span className="ml-2 text-sm text-ink/55">{lead.company}</span>}
        </div>
        <StatusBadge status={lead.status} />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between gap-3 text-sm">
        <p className="min-w-0 truncate text-ink/75">
          {lead.lastNote ? <><span className="text-ink/50">Last note: </span>{lead.lastNote}</> : <span className="text-ink/45">No discussions yet</span>}
        </p>
        {lead.lastDiscussionAt && (
          <time dateTime={lead.lastDiscussionAt} className="shrink-0 text-xs text-ink/50">
            {timeAgo(lead.lastDiscussionAt)}
          </time>
        )}
      </div>
      {lead.followUpAt && <FollowUp iso={lead.followUpAt} />}
    </button>
  );
}
