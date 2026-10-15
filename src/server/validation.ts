import { z } from "zod";
import { STATUSES } from "../lib/contansts";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

export const createLeadSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "name is required")
    .max(100),
  company: optionalText(100),
  phone: optionalText(30),
});

export const updateStatusSchema = z.object({
  status: z.enum(
    [...STATUSES] as [
      (typeof STATUSES)[number],
      ...(typeof STATUSES)[number][],
    ],
    {
      error: () => `Status must be one of: ${STATUSES.join(", ")}`,
    },
  ),
});

export const createDiscussionSchema = z.object({
  note: z
    .string({ error: "Note is required" })
    .trim()
    .min(1, "Note is required")
    .max(2000),
  followUpAt: z
    .string()
    .datetime({ offset: true, message: "followUpAt must be an ISO date-time" })
    .nullish()
    .transform((v) => (v ? new Date(v) : null)),
});

export const listQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  q: z.string().trim().max(100).optional(),
});
