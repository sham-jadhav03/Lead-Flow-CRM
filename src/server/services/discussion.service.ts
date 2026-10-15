import leadModel from "../models/Leads";
import discussionModel from "../models/Discussion";
import { AppError } from "../http";
import { assertId } from "./lead.service";

async function requireLead(id: string) {
  assertId(id);
  const lead = await leadModel.findById(id);
  if (!lead) throw new AppError(404, "Lead not found");
  return lead;
}

export async function listDiscussions(leadId: string) {
  await requireLead(leadId);
  return discussionModel.find({ leadId }).sort({ createdAt: -1 });
}

/** Creates a note and keeps the lead's denormalized fields in sync. */
export async function addDiscussion(
  leadId: string,
  input: { note: string; followUpAt: Date | null },
) {
  const lead = await requireLead(leadId);
  const discussion = await discussionModel.create({ leadId, ...input });

  lead.lastNote = discussion.note;
  lead.lastDiscussionAt = discussion.createdAt ?? new Date();
  if (input.followUpAt) lead.followUpAt = input.followUpAt;
  await lead.save();

  return { discussion, lead };
}
