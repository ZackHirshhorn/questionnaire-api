import { z } from "zod";

export const questionColSchema = z.object({
  name: z
    .string({ message: "שם אסופת השאלות הוא חובה" })
    .min(2, "שם אסופת השאלות חייב להכיל לפחות 2 תווים")
    .max(50, "שם אסופת השאלות יכול להכיל עד 50 תויים")
    .regex(
      /^[\u0590-\u05FFA-Z]+(?:[ '"\u0590-\u05FFa-z0-9]*[\u0590-\u05FFa-z0-9]+)*$/,
      "שם אסופת השאלות לא תקין",
    ),
});
export type QuestionColDTO = z.infer<typeof questionColSchema>;
