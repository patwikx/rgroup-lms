'use server'

import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

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

export type ProfileFormValues = z.infer<typeof profileSchema>;

export async function updateProfile(data: ProfileFormValues) {
  try {
    const session = await auth();
    
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = profileSchema.parse(data);

    // Update both Employee and User models
    const [updatedEmployee, updatedUser] = await prisma.$transaction([
      prisma.employee.update({
        where: {
          empId: session.user.id,
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
          name: `${validatedData.firstName} ${validatedData.lastName}`,
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
