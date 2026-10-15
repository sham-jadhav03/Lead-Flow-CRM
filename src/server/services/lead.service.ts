import { isValidObjectId } from "mongoose";
import leadModel, { type ILead } from "../models/Leads";
import { AppError } from "../http";
import type { LeadStatus } from "../../lib/contansts";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function assertId(id: string) {
  if (!isValidObjectId(id)) throw new AppError(400, "Invalid lead id");
}

export async function listLeads(opts: { status?: LeadStatus; q?: string }) {
  const filter: Record<string, unknown> = {};
  if (opts.status) filter.status = opts.status;
  if (opts.q) filter.name = { $regex: escapeRegex(opts.q), $options: "i" };
  const leads = await leadModel.find(filter);
  // Same ordering as the client: most recent activity first.
  const key = (l: (typeof leads)[number]) =>
    (l.lastDiscussionAt ?? l.createdAt ?? new Date(0)).getTime();
  return leads.sort(
    (a: (typeof leads)[number], b: (typeof leads)[number]) => key(b) - key(a),
  );
}

export async function createLead(input: {
  name: string;
  company?: string;
  phone?: string;
}) {
  return leadModel.create(input);
}

export async function updateStatus(id: string, status: LeadStatus) {
  assertId(id);
  const lead = await leadModel.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );
  if (!lead) throw new AppError(404, "Lead not found");
  return lead;
}
