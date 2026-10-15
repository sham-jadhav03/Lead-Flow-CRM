"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { isToday } from "@/lib/dates";
import type { Lead } from "@/lib/types";
import { btnPrimary } from "@/lib/ui";
import AddLeadDialog from "./AddLeadDialog";
import FilterBar, { type Filter } from "./FilterBar";
import LeadList from "./LeadList";
import LeadTimelineDialog from "./LeadTimelineDialog";

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const activity = (l: Lead) => new Date(l.lastDiscussionAt ?? l.createdAt).getTime();

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search.trim(), 300);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const ctl = new AbortController();
    setLoading(true);
    setError(null);
    api.listLeads({ status: filter, q: debouncedSearch }, ctl.signal)
      .then((r) => setLeads(r.leads))
      .catch((e: Error) => e.name !== "AbortError" && setError(e.message))
      .finally(() => !ctl.signal.aborted && setLoading(false));
    return () => ctl.abort();
  }, [filter, debouncedSearch, reloadKey]);

  const upsert = (lead: Lead) =>
    setLeads((prev) => (prev.some((l) => l.id === lead.id) ? prev.map((l) => (l.id === lead.id ? lead : l)) : [lead, ...prev]));

  // Today's follow-ups are pinned (soonest first); everything else follows by recent activity.
  const { pinned, rest } = useMemo(() => {
    const sorted = [...leads].sort((a, b) => activity(b) - activity(a));
    const pinned = sorted.filter((l) => isToday(l.followUpAt)).sort((a, b) => +new Date(a.followUpAt!) - +new Date(b.followUpAt!));
    const rest = sorted.filter((l) => !isToday(l.followUpAt));
    return { pinned, rest };
  }, [leads]);

  const selected = leads.find((l) => l.id === selectedId) ?? null;
  const filtering = filter !== "All" || debouncedSearch !== "";

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <header className="flex items-center justify-between py-6">
        <h1 className="text-xl font-bold tracking-tight text-accent-dark">LeadFlow</h1>
        <button type="button" className={btnPrimary} onClick={() => setAddOpen(true)}>Add new lead</button>
      </header>

      <FilterBar filter={filter} onFilter={setFilter} search={search} onSearch={setSearch} />

      <main className="mt-6" aria-busy={loading}>
        {error ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p>{error}</p>
            <button type="button" className="mt-2 font-semibold underline" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
          </div>
        ) : loading && leads.length === 0 ? (
          <div className="space-y-2" aria-label="Loading leads">
            {[0, 1, 2].map((i) => <div key={i} className="h-[74px] animate-pulse rounded-lg bg-white" />)}
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-white px-6 py-12 text-center">
            <p className="font-medium">{filtering ? "No leads match your filters" : "No leads yet"}</p>
            <p className="mt-1 text-sm text-ink/60">
              {filtering ? "Try a different status or search term." : "Add your first lead to start logging discussions."}
            </p>
            {!filtering && <button type="button" className={`${btnPrimary} mt-4`} onClick={() => setAddOpen(true)}>Add new lead</button>}
          </div>
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""}>
            <LeadList pinned={pinned} rest={rest} onOpen={setSelectedId} />
          </div>
        )}
      </main>

      <AddLeadDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={(lead) => {
          // Show the new lead even if a filter would hide it.
          setFilter("All");
          setSearch("");
          upsert(lead);
          setReloadKey((k) => k + 1);
        }}
      />

      {selected && (
        <LeadTimelineDialog
          lead={selected}
          onLeadChange={upsert}
          onClose={() => {
            setSelectedId(null);
            if (filtering) setReloadKey((k) => k + 1); // re-apply filters after status changes
          }}
        />
      )}
    </div>
  );
}
