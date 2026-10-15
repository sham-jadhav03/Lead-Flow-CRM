"use client";
import { useState, type FormEvent } from "react";
import { toLocalInputValue } from "@/lib/dates";
import { btnPrimary, inputCls } from "@/lib/ui";

interface Props {
  onSave: (note: string, followUpAt: string | null) => Promise<void>;
}

export default function DiscussionForm({ onSave }: Props) {
  const [note, setNote] = useState("");
  const [withFollowUp, setWithFollowUp] = useState(false);
  const [when, setWhen] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggleFollowUp(checked: boolean) {
    setWithFollowUp(checked);
    if (checked && !when) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(10, 0, 0, 0);
      setWhen(toLocalInputValue(d));
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return setError("Write a note before saving.");
    let followUpAt: string | null = null;
    if (withFollowUp) {
      const d = new Date(when);
      if (!when || isNaN(d.getTime())) return setError("Pick a valid follow-up date and time.");
      followUpAt = d.toISOString();
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(note.trim(), followUpAt);
      setNote("");
      setWithFollowUp(false);
      setWhen("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3 border-t border-line bg-paper/60 px-5 py-4">
      <div>
        <label htmlFor="discussion-note" className="sr-only">New discussion note</label>
        <textarea
          id="discussion-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Log a new discussion…"
          className={`${inputCls} resize-none`}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={withFollowUp} onChange={(e) => toggleFollowUp(e.target.checked)} className="size-4 accent-accent" />
          Set follow-up
        </label>
        {withFollowUp && (
          <>
            <label htmlFor="follow-up-at" className="sr-only">Follow-up date and time</label>
            <input id="follow-up-at" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={`${inputCls} !w-auto`} />
          </>
        )}
        <button type="submit" className={`${btnPrimary} ml-auto`} disabled={saving}>{saving ? "Saving…" : "Save note"}</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
