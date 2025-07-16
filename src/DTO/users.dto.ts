import { z } from "zod";

export const registerSchema = z.object({
  email: z.string({ message: "אימייל הוא חובה" }).email("אימייל לא תקין"),
  name: z
    .string({ message: "שם משתמש הוא חובה" })
    .min(2, "שם המשתמש חייב להכיל לפחות 2 תווים")
    .max(50, "שם המשתמש יכול להכיל עד 50 תווים")
    .regex(
      /^[\u0590-\u05FF](?:[\u0590-\u05FF ]*[\u0590-\u05FF])?$/,
      "שם המשתמש יכול להכיל רק אותיות בעברית",
    ),
  password: z
    .string({ message: "סיסמא היא חובה" })
    .min(8, "הסיסמא חייב להכיל לפחות 8 תווים")
    .max(50, "הסיסמא יכולה להכיל עד 50 תווים")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      "הסיסמה חייבת להכיל לפחות אות גדולה אחת, אות קטנה אחת, מספר אחד ותו מיוחד אחד",
    ),
});
export type RegisterDTO = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string({ message: "אימייל הוא חובה" }).email("אימייל לא תקין"),
  password: z
    .string({ message: "סיסמא היא חובה" })
    .min(8, "הסיסמא חייב להכיל לפחות 8 תווים")
    .max(50, "הסיסמא יכולה להכיל עד 50 תווים")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      "הסיסמה חייבת להכיל לפחות אות גדולה אחת, אות קטנה אחת, מספר אחד ותו מיוחד אחד",
    ),
});
export type LoginDTO = z.infer<typeof loginSchema>;
