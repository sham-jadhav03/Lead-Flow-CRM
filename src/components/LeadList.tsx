import type { Lead } from "@/lib/types";
import LeadCard from "./LeadCard";

interface Props {
  pinned: Lead[];
  rest: Lead[];
  onOpen: (id: string) => void;
}

export default function LeadList({ pinned, rest, onOpen }: Props) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="today-heading">
        <h2 id="today-heading" className="mb-3 text-sm font-semibold text-accent-dark">
          Today&apos;s follow-ups ({pinned.length})
        </h2>
        {pinned.length > 0 ? (
          <ul className="space-y-2">
            {pinned.map((l) => (
              <li key={l.id}><LeadCard lead={l} pinned onOpen={() => onOpen(l.id)} /></li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink/60">No follow-ups today</p>
        )}
      </section>
      {rest.length > 0 && (
        <section aria-labelledby="all-heading">
          <h2 id="all-heading" className="mb-3 text-sm font-semibold text-ink/60">All leads ({rest.length})</h2>
          <ul className="space-y-2">
            {rest.map((l) => (
              <li key={l.id}><LeadCard lead={l} onOpen={() => onOpen(l.id)} /></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
