"use client";
import { STATUSES, type LeadStatus } from "@/lib/constants";
import { inputCls } from "@/lib/ui";

export type Filter = LeadStatus | "All";

interface Props {
  filter: Filter;
  onFilter: (f: Filter) => void;
  search: string;
  onSearch: (s: string) => void;
}

export default function FilterBar({ filter, onFilter, search, onSearch }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="lead-search" className="sr-only">Search leads by name</label>
        <input
          id="lead-search"
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search leads by name"
          className={`${inputCls} sm:max-w-xs`}
        />
      </div>
      <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
        {(["All", ...STATUSES] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => onFilter(f)}
            className={`rounded-full border px-3.5 py-1 text-sm font-medium transition-colors ${
              filter === f ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/80 hover:border-ink/40"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
