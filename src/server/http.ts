import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "./db";

export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

const fail = (status: number, message: string, details?: unknown) =>
  NextResponse.json({ error: { message, details } }, { status });

export function errorResponse(e: unknown) {
  if (e instanceof AppError) return fail(e.status, e.message, e.details);
  if (e instanceof ZodError) {
    const details = e.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return fail(400, details[0]?.message ?? "Validation failed", details);
  }
  console.error(e);
  return fail(500, "Internal server error");
}

export async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new AppError(400, "Request body must be valid JSON");
  }
}

/** Connects to DB, runs the handler, and maps any thrown error to a JSON response. */
export function handle<C = unknown>(
  fn: (req: NextRequest, ctx: C) => Promise<Response>,
) {
  return async (req: NextRequest, ctx: C) => {
    try {
      await connectDB();
      return await fn(req, ctx);
    } catch (e) {
      return errorResponse(e);
    }
  };
}
