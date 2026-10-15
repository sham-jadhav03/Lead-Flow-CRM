import type { LeadStatus } from "./contansts";
import type { Discussion, Lead } from "./types";

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      cache: "no-store",
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError(
      "Can't reach the server. Check your connection and try again.",
    );
  }
  const data = await res.json().catch(() => null);
  if (!res.ok)
    throw new ApiError(
      data?.error?.message ?? `Request failed (${res.status})`,
    );
  return data as T;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

export const api = {
  listLeads(
    p: { status?: LeadStatus | "All"; q?: string },
    signal?: AbortSignal,
  ) {
    const qs = new URLSearchParams();
    if (p.status && p.status !== "All") qs.set("status", p.status);
    if (p.q) qs.set("q", p.q);
    return request<{ leads: Lead[] }>(`/api/leads?${qs}`, { signal });
  },
  createLead: (body: { name: string; company?: string; phone?: string }) =>
    request<{ lead: Lead }>("/api/leads", json("POST", body)),
  updateStatus: (id: string, status: LeadStatus) =>
    request<{ lead: Lead }>(
      `/api/leads/${id}/status`,
      json("PATCH", { status }),
    ),
  listDiscussions: (id: string) =>
    request<{ discussions: Discussion[] }>(`/api/leads/${id}/discussions`),
  addDiscussion: (
    id: string,
    body: { note: string; followUpAt: string | null },
  ) =>
    request<{ discussion: Discussion; lead: Lead }>(
      `/api/leads/${id}/discussions`,
      json("POST", body),
    ),
};
