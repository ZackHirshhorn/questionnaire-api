import { z } from "zod";

export const questionnaireSchema = z.object({
  name: z
    .string({ message: "Questionnaire's name is required" })
    .min(2, "Questionnaire's name must be at least 2 characters")
    .max(50, "Questionnaire's name must be less than 50 characters")
    .regex(
      /^[\u0590-\u05FFA-Z](?:[\u0590-\u05FF a-z]*[\u0590-\u05FFa-z])?$/,
      "Questionnaire's name is not valid",
    ),
  userPhone: z
    .string({ message: "User's phone number is required" })
    .min(9, "User's phone number must be at least 9 digits")
    .max(10, "User's phone number must be less than 10 digits")
    .regex(/^[0-9]{9,10}$/, "User's phone number is not valid"),
});
export type QuestionnaireDTO = z.infer<typeof questionnaireSchema>;
