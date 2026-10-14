import { z } from "zod";

const optionalText = (max: number) =>
  z.string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

export const updateStatusSchema = z.object({
    
})