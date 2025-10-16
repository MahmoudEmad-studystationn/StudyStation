import { z } from "zod";

export const signupSchema = z
    .object({
        firstName: z
            .string()
            .nonempty("First name is required")
            .min(2, "First name must be at least 2 characters long"),
        lastName: z
            .string()
            .nonempty("Last name is required")
            .min(2, "Last name must be at least 2 characters long"),
        email: z
            .string()
            .nonempty("Email is required")
            .email("Please enter a valid email address"),
        password: z
            .string()
            .nonempty("Password is required")
            .min(8, "Password must be at least 8 characters long")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character (e.g., !, @, #)"),
        confirmPassword: z
            .string()
            .nonempty("Confirm password is required"),
        dateOfBirth: z
            .string()
            .nonempty("Date of birth is required")
            .refine(
                (val) => {
                    const date = new Date(val);
                    const today = new Date();
                    const minAge = 13;
                    const maxAge = 120;
                    const age = today.getFullYear() - date.getFullYear();
                    return !isNaN(date) && age >= minAge && age <= maxAge;
                },
                { message: "Please enter a valid date of birth (must be older than 13)" }
            ),
        gender: z
            .string()
            .nonempty("Gender is required")
            .refine((val) => ["male", "female", "other"].includes(val), {
                message: "Please select a valid gender",
            }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });