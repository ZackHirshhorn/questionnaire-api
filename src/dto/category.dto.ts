import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string({ message: "שם קטגוריה חובה" })
    .min(2, "שם קטגוריה חייב להכיל לפחות 2 תווים")
    .max(50, "שם קטגוריה יכול להכיל עד 50 תויים")
    .regex(
      /^[\u0590-\u05FFA-Z]+(?:[ '"\u0590-\u05FFa-z0-9]*[\u0590-\u05FFa-z0-9]+)*$/,
      "שם קטגוריה לא תקין",
    ),
});
export type CategoryDTO = z.infer<typeof categorySchema>;
