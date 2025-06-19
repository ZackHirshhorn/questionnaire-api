import { z } from "zod";

export const registerSchema = z.object({
  email: z.string({ message: "Email is required" }).email("Email is invalid"),
  name: z
    .string({ message: "User's name is required" })
    .min(2, "User's name must be at least 2 characters")
    .max(50, "User's name must be less than 50 characters")
    .regex(
      /^[\u0590-\u05FF](?:[\u0590-\u05FF ]*[\u0590-\u05FF])?$/,
      "User's name must contain only Hebrew letters and spaces",
    ),
  password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be less than 50 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
});
export type RegisterDTO = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string({ message: "Email is required" }).email("Email is invalid"),
  password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be less than 50 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
});
export type LoginDTO = z.infer<typeof loginSchema>;
