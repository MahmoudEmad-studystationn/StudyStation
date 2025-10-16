import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .nonempty("Email is required")
        .email("Please enter a valid email address"),

    password: z
        .string()
        .nonempty("Password is required")
        .min(6, "Password must be at least 6 characters"),
});