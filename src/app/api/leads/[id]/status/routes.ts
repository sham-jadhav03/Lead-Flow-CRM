import { NextResponse } from "next/server";
import { handle, readJson } from "@/src/server/http";
import { updateStatusSchema } from "@/src/server/validation";
import { updateStatus } from "@/src/server/services/lead.service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handle<Ctx>(async (req, { params }) => {
  const { id } = await params;
  const { status } = updateStatusSchema.parse(await readJson(req));
  return NextResponse.json({ lead: await updateStatus(id, status) });
});
