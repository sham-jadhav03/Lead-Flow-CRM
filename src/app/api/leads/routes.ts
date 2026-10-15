import { NextResponse } from "next/server";
import { handle, readJson } from "@/src/server/http";
import { createLeadSchema, listQuerySchema } from "@/src/server/validation";
import { createLead, listLeads } from "@/src/server/services/lead.service";

export const GET = handle(async (req) => {
  const params = Object.fromEntries(req.nextUrl.searchParams);
  const query = listQuerySchema.parse(params);
  return NextResponse.json({ leads: await listLeads(query) });
});

export const POST = handle(async (req) => {
  const input = createLeadSchema.parse(await readJson(req));
  return NextResponse.json({ lead: await createLead(input) }, { status: 201 });
});
