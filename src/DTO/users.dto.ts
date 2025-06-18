import { z } from "zod";

export const registerSchema = z.object({
  email: z.string({ message: "Email is required" }).email("Email is invalid"),
  name: z
    .string({ message: "name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(
      /^[\u0590-\u05FF](?:[\u0590-\u05FF ]*[\u0590-\u05FF])?$/,
      "Name must contain only Hebrew letters and spaces",
    ),
  password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be less than 50 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
  phone: z
    .string({ message: "Phone is required" })
    .min(9, "Phone must be at least 9 characters")
    .max(10, "Phone must be less than 10 characters")
    .regex(/^[0-9]+$/, "Phone must contain only numbers"),
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
