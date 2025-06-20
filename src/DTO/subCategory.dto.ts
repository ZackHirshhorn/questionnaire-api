import { z } from "zod";

export const sybCategorySchema = z.object({
  name: z
    .string({ message: "Sub-Category's name is required" })
    .min(2, "Sub-Category's name must be at least 2 characters")
    .max(50, "Sub-Category's name must be less than 50 characters")
    .regex(
      /^[\u0590-\u05FFA-Z]+(?:[ '"\u0590-\u05FFa-z]*[\u0590-\u05FFa-z]+)*$/,
      "Sub-Category's name is not valid",
    ),
});
export type SubCategoryDTO = z.infer<typeof sybCategorySchema>;
