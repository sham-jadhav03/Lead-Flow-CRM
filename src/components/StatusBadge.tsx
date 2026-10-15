import type { LeadStatus } from "@/lib/constants";

const styles: Record<LeadStatus, string> = {
  New: "bg-sky-100 text-sky-800",
  Contacted: "bg-amber-100 text-amber-800",
  Qualified: "bg-violet-100 text-violet-800",
  "Proposal Sent": "bg-indigo-100 text-indigo-800",
  Won: "bg-emerald-100 text-emerald-800",
  Lost: "bg-stone-200 text-stone-600",
};

export default function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
