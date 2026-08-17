import { z } from "zod";

export const loginSchema = z.object({
  phone: z.string().min(5, "Please enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  keepMeLoggedIn: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  phone: z.string().min(5, "Please enter a valid phone number"),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(4, "OTP must be exactly 4 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
