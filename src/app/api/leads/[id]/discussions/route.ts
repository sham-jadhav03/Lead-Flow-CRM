import { NextResponse } from "next/server";
import { handle, readJson } from "@/src/server/http";
import { createDiscussionSchema } from "@/src/server/validation";
import { addDiscussion, listDiscussions } from "@/src/server/services/discussion.service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handle<Ctx>(async (_req, { params }) => {
  const { id } = await params;
  return NextResponse.json({ discussions: await listDiscussions(id) });
});

export const POST = handle<Ctx>(async (req, { params }) => {
  const { id } = await params;
  const input = createDiscussionSchema.parse(await readJson(req));
  return NextResponse.json(await addDiscussion(id, input), { status: 201 });
});
