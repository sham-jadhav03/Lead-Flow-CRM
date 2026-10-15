"use client";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { Lead } from "@/lib/types";
import { btnGhost, btnPrimary, inputCls } from "@/lib/ui";
import Modal from "./Modal";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (lead: Lead) => void;
}

export default function AddLeadDialog({ open, onOpenChange, onCreated }: Props) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function close(next: boolean) {
    if (!next) {
      setName(""); setCompany(""); setPhone(""); setError(null);
    }
    onOpenChange(next);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter the lead's name.");
    setSaving(true);
    setError(null);
    try {
      const { lead } = await api.createLead({
        name: name.trim(),
        company: company.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      onCreated(lead);
      close(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={close} title="Add new lead">
      <form onSubmit={submit} noValidate className="space-y-4 overflow-y-auto px-5 py-5">
        <div>
          <label htmlFor="lead-name" className="mb-1 block text-sm font-medium">Full name <span className="text-red-600" aria-hidden>*</span></label>
          <input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} required aria-required placeholder="e.g. Jane Doe" className={inputCls} autoFocus />
        </div>
        <div>
          <label htmlFor="lead-company" className="mb-1 block text-sm font-medium">Company <span className="font-normal text-ink/50">(optional)</span></label>
          <input id="lead-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Stark Industries" className={inputCls} />
        </div>
        <div>
          <label htmlFor="lead-phone" className="mb-1 block text-sm font-medium">Phone <span className="font-normal text-ink/50">(optional)</span></label>
          <input id="lead-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 555-0123" className={inputCls} />
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={btnGhost} onClick={() => close(false)}>Cancel</button>
          <button type="submit" className={btnPrimary} disabled={saving}>{saving ? "Saving…" : "Save lead"}</button>
        </div>
      </form>
    </Modal>
  );
}
