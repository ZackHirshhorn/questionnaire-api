import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string({ message: "Category's name is required" })
    .min(2, "Category's name must be at least 2 characters")
    .max(50, "Category's name must be less than 50 characters")
    .regex(
      /^[\u0590-\u05FFA-Z]+(?:[ '"\u0590-\u05FFa-z]*[\u0590-\u05FFa-z]+)*$/,
      "Category's name is not valid",
    ),
});
export type CategoryDTO = z.infer<typeof categorySchema>;
