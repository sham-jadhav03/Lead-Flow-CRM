import type { LeadStatus } from "./contansts";

export interface Lead {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  status: LeadStatus;
  followUpAt: string | null;
  lastNote: string | null;
  lastDiscussionAt: string | null;
  createdAt: string;
}

export interface Discussion {
  id: string;
  leadId: string;
  note: string;
  followUpAt: string | null;
  createdAt: string;
}
