import { LeaveDay } from "@prisma/client";
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
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  })
});

export const EmployeeSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().min(2, "Department is required"),
  position: z.string().min(2, "Position is required"),
  isManager: z.boolean().default(false),
  isHR: z.boolean().default(false),
  supervisorId: z.string().min(1, "Supervisor is required"),
  hrApproverId: z.string().min(1, "HR approver is required"),
  role: z.enum(["USER", "HR", "SUPERVISOR"], {
    required_error: "Role is required",
  }),
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