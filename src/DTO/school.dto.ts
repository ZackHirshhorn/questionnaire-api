import { z } from "zod";

export const schoolSchema = z.object({
  name: z
    .string({ message: "שם בית הספר הוא חובה" })
    .min(2, "שם בית הספר חייב להכיל לפחות 2 תווים")
    .max(50, "שם בית הספר יכול להכיל עד 50 תווים")
    .regex(
      /^[\u0590-\u05FF](?:['"\u0590-\u05FF ]*[\u0590-\u05FF])?$/,
      "שם בית הספר אינו תקין",
    ),
});
export type SchoolDTO = z.infer<typeof schoolSchema>;
