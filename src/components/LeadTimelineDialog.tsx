"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { STATUSES, type LeadStatus } from "@/lib/constants";
import { formatDateTime, timeAgo } from "@/lib/dates";
import type { Discussion, Lead } from "@/lib/types";
import DiscussionForm from "./DiscussionForm";
import Modal from "./Modal";

interface Props {
  lead: Lead;
  onClose: () => void;
  onLeadChange: (lead: Lead) => void;
}

export default function LeadTimelineDialog({ lead, onClose, onLeadChange }: Props) {
  const [items, setItems] = useState<Discussion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    setLoadError(null);
    api.listDiscussions(lead.id)
      .then((r) => !cancelled && setItems(r.discussions))
      .catch((e: Error) => !cancelled && setLoadError(e.message));
    return () => { cancelled = true; };
  }, [lead.id]);

  async function changeStatus(status: LeadStatus) {
    setStatusSaving(true);
    setStatusError(null);
    try {
      onLeadChange((await api.updateStatus(lead.id, status)).lead);
    } catch (e) {
      setStatusError((e as Error).message);
    } finally {
      setStatusSaving(false);
    }
  }

  async function saveNote(note: string, followUpAt: string | null) {
    const { discussion, lead: updated } = await api.addDiscussion(lead.id, { note, followUpAt });
    setItems((prev) => [discussion, ...(prev ?? [])]); // newest first
    onLeadChange(updated); // list reflects it immediately
  }

  const statusSelect = (
    <div className="shrink-0">
      <label htmlFor="lead-status" className="sr-only">Lead status</label>
      <select
        id="lead-status"
        value={lead.status}
        disabled={statusSaving}
        onChange={(e) => changeStatus(e.target.value as LeadStatus)}
        className="rounded-md border border-line bg-white px-2 py-1.5 text-sm font-medium"
      >
        {STATUSES.map((s) => <option key={s}>{s}</option>)}
      </select>
    </div>
  );

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title={lead.company ? `${lead.name} (${lead.company})` : lead.name}
      description={lead.phone || "No phone number"}
      actions={statusSelect}
    >
      {statusError && <p role="alert" className="border-b border-line px-5 py-2 text-sm text-red-700">{statusError}</p>}

      <div className="min-h-[8rem] flex-1 overflow-y-auto px-5 py-4">
        {loadError ? (
          <p role="alert" className="text-sm text-red-700">{loadError}</p>
        ) : items === null ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading discussions">
            {[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-md bg-paper" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink/55">No discussions yet. Log the first one below.</p>
        ) : (
          <ol className="relative ml-1.5 space-y-5 border-l border-line pl-5">
            {items.map((d) => (
              <li key={d.id} className="relative">
                <span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full bg-accent ring-4 ring-white" aria-hidden />
                <div className="flex flex-wrap items-baseline gap-x-2 text-xs text-ink/55">
                  <time dateTime={d.createdAt}>{formatDateTime(d.createdAt)}</time>
                  <span>{timeAgo(d.createdAt)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap rounded-md bg-paper px-3 py-2 text-sm">{d.note}</p>
                {d.followUpAt && (
                  <p className="mt-1 text-xs font-medium text-accent-dark">Follow-up set for {formatDateTime(d.followUpAt)}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <DiscussionForm onSave={saveNote} />
    </Modal>
  );
}
