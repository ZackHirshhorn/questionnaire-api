import { z } from "zod";

export const questionnaireSchema = z.object({
  name: z
    .string({ message: "שם השאלון הוא חובה" })
    .min(2, "שם השאלון חייב להכיל לפחות 2 תווים")
    .max(50, "שם השאלון יכול להכיל עד 50 תווים")
    .regex(
      /^[\u0590-\u05FFA-Z](?:['"\u0590-\u05FF a-z0-9]*[\u0590-\u05FFa-z0-9])?$/,
      "שם השאלון לא תקין",
    ),
  userPhone: z
    .string()
    .min(9, "טלפון המשתמש חייב להכיל לפחות 9 ספרות")
    .max(10, "טלפון המשתמש יכול להכיל עד 10 ספרות")
    .regex(/^[0-9]{9,10}$/, "טלפון המשתמש אינו תקין")
    .optional(),
});
export type QuestionnaireDTO = z.infer<typeof questionnaireSchema>;
