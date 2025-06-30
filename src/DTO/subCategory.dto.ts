import { z } from "zod";

export const sybCategorySchema = z.object({
  name: z
    .string({ message: "תת קטגוריה היא חובה" })
    .min(2, "שם תת הקטגוריה חייב להכיל לפחות 2 תווים")
    .max(50, "שם תת הקטגוריה יכול להכיל עד 50 תווים")
    .regex(
      /^[\u0590-\u05FFA-Z]+(?:[ '"\u0590-\u05FFa-z0-9]*[\u0590-\u05FFa-z0-9]+)*$/,
      "שם תת הקטגוריה לא תקין",
    ),
});
export type SubCategoryDTO = z.infer<typeof sybCategorySchema>;
