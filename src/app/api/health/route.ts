import { NextResponse } from "next/server";
import { handle } from "@/src/server/http";

export const GET = handle(async () =>
  NextResponse.json({ status: "ok" }),
);
