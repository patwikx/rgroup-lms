import { ApprovalLevel, LeaveDay } from "@prisma/client";
import { prisma } from "@/lib/db";
import * as z from "zod";



export const SettingsSchema = z.object({
  name: z.optional(z.string()),
  isTwoFactorEnabled: z.optional(z.boolean()),
  email: z.optional(z.string().email()),
  password: z.optional(z.string().min(6)),
  newPassword: z.optional(z.string().min(6)),
})
  .refine((data) => {
    if (data.password && !data.newPassword) {
      return false;
    }

    return true;
  }, {
    message: "New password is required!",
    path: ["newPassword"]
  })
  .refine((data) => {
    if (data.newPassword && !data.password) {
      return false;
    }

    return true;
  }, {
    message: "Password is required!",
    path: ["password"]
  })

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum of 6 characters required",
  }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const LoginSchema = z.object({
  employeeId: z.string().min(1, {
    message: "Employee ID is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  })
});

export const EmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  isManager: z.boolean().default(false),
  isHR: z.boolean().default(false),
  isTWC: z.boolean().default(false),
  supervisorId: z.string().optional(),
  role: z.nativeEnum(ApprovalLevel).default(ApprovalLevel.USER),
  employeeId: z.string().optional(),
  contactNo: z.string().optional(),
  address: z.string().optional(),
  emergencyContactNo: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof EmployeeSchema>;


export const LeaveRequestSchema = z.object({
  leaveTypeId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  leaveDay: z.enum(["FULL", "FIRST_HALF", "SECOND_HALF"]),
  reason: z.string().min(1, "Reason is required"),
}).refine((data) => {
  return data.startDate <= data.endDate;
}, {
  message: "End date cannot be earlier than start date",
  path: ["endDate"],
});

export type LeaveRequestFormData = z.infer<typeof LeaveRequestSchema>;