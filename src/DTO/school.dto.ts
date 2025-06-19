import { z } from "zod";

export const schoolSchema = z.object({
  name: z
    .string({ message: "School's name is required" })
    .min(2, "School's name must be at least 2 characters")
    .max(50, "School's name must be less than 50 characters")
    .regex(
      /^[\u0590-\u05FF](?:[\u0590-\u05FF ]*[\u0590-\u05FF])?$/,
      "School's name is not valid",
    ),
});
export type SchoolDTO = z.infer<typeof schoolSchema>;
