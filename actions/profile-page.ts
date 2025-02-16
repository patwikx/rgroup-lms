'use server'

import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(2, "Department is required"),
  position: z.string().min(2, "Position is required"),
  phoneNumber: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;

export async function updateProfile(data: ProfileFormValues) {
  try {
    const session = await auth();
    
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = profileSchema.parse(data);

    // Update both Employee and User models
    const [updatedEmployee, updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: {
          employeeId: session.user.employeeId,
        },
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          department: validatedData.department,
          position: validatedData.position,
          contactNo: validatedData.phoneNumber,
          emergencyContactNo: validatedData.emergencyContact,
          address: validatedData.address,
        },
      }),
      prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName
        },
      }),
    ]);

    return { success: true, data: { employee: updatedEmployee, user: updatedUser } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid data provided" };
    }
    
    console.error("[UPDATE_PROFILE]", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function changePassword(data: PasswordFormValues) {
  try {
    const session = await auth();
    
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = passwordSchema.parse(data);

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isValid = await bcrypt.compare(validatedData.currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid data provided" };
    }
    
    console.error("[CHANGE_PASSWORD]", error);
    return { success: false, error: "Something went wrong" };
  }
}