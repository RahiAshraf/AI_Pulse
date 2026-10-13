import { z } from "zod";

export const branches = [
  "B.Tech - Computer Science & Engineering",
  "B.Tech - CSE (Artificial Intelligence and Data Science)",
  "B.Tech - CSE (Artificial Intelligence and Machine Learning)",
  "B.Tech - CSE (Artificial Intelligence and Robotics)",
  "B.Tech - CSE (Cyber Security)",
  "B.Tech - Electronics & Communication Engineering",
  "B.Tech - Electrical and Electronics Engineering",
  "B.Tech - Mechanical Engineering",
  "B.Tech - Civil Engineering",
  "B.Tech - Bioinformatics",
  "B.B.A. - Management Studies",
  "B.C.A. - Computer Applications",
] as const;

export const years = ["1", "2", "3", "4"] as const;
export const sections = ["A", "B", "C", "D", "E"] as const;
export const meetingStatuses = ["upcoming", "completed", "cancelled"] as const;

export const registrationSchema = z
  .object({
    fullName: z.string().trim().min(3, "Enter your full name").max(100),
    rollNumber: z.string().trim().min(6, "Enter a valid roll number").max(20),
    email: z
      .string()
      .trim()
      .email("Enter a valid college email")
      .max(255)
      .refine((value) => value.toLowerCase().endsWith("@mits.ac.in"), {
        message: "Use your MITS college email ending with @mits.ac.in",
      }),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9]{10}$/, "Enter a 10-digit phone number"),
    branch: z.string().min(1, "Select your programme/branch"),
    year: z.string().min(1, "Select your year"),
    section: z.string().trim().min(1, "Select your section").max(4),
    password: z.string().min(6, "Password must be at least 6 characters").max(72),
    confirmPassword: z.string().min(6, "Confirm your password").max(72),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(255)
    .refine((value) => value.toLowerCase().endsWith("@mits.ac.in"), {
      message: "Use your MITS college email ending with @mits.ac.in",
    }),
  password: z.string().min(1, "Enter your password").max(72),
});

export const meetingSchema = z.object({
  title: z.string().trim().min(3, "Enter a meeting title").max(120),
  description: z.string().trim().min(10, "Add a short description").max(1000),
  date: z.string().min(1, "Select a date"),
  startTime: z.string().min(1, "Select a start time"),
  endTime: z.string().min(1, "Select an end time"),
  venue: z.string().trim().min(2, "Enter a venue").max(120),
  classroom: z.string().trim().max(60),
  speaker: z.string().trim().max(120),
  status: z.enum(meetingStatuses),
});

export const eventRegistrationSchema = z.object({
  fullName: z.string().trim().min(3, "Enter your full name").max(100),
  rollNumber: z.string().trim().min(2, "Enter your roll number").max(20),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a 10-digit phone number"),
  branch: z.string().trim().min(1, "Select your programme/branch"),
  year: z.string().trim().min(1, "Select your year"),
  section: z.string().trim().min(1, "Select your section").max(4),
});

export type RegistrationValues = z.infer<typeof registrationSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type MeetingValues = z.infer<typeof meetingSchema>;
export type EventRegistrationValues = z.infer<typeof eventRegistrationSchema>;
