'use server'

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ApprovalLevel } from "@prisma/client";
import { EmployeeFormData, EmployeeSchema } from "@/schemas";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createEmployee(data: EmployeeFormData) {
  try {
    const validatedFields = EmployeeSchema.safeParse(data);
    
    if (!validatedFields.success) {
      return { 
        success: false, 
        error: validatedFields.error.errors[0].message 
      };
    }

    const { data: fields } = validatedFields;
    
    // Check for existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: fields.email },
    });
    
    if (existingUser) {
      return { success: false, error: "Email already exists" };
    }

    const hashedPassword = await bcrypt.hash(fields.password, 12);
    
    // Determine the approval level
    let role: ApprovalLevel = ApprovalLevel.USER;
    if (fields.isHR) {
      role = ApprovalLevel.HR;
    } else if (fields.isManager) {
      role = ApprovalLevel.SUPERVISOR;
    }

    // Create user with all employee fields
    const user = await prisma.user.create({
      data: {
        employeeId: fields.employeeId,
        email: fields.email,
        password: hashedPassword,
        firstName: fields.firstName,
        lastName: fields.lastName,
        department: fields.department,
        position: fields.position,
        isManager: fields.isManager,
        isHR: fields.isHR,
        isTWC: fields.isTWC,
        role,
        approverId: fields.supervisorId || null,
      },
    });

    // Create initial leave balances
    const leaveTypes = await prisma.leaveType.findMany();
    const currentYear = new Date().getFullYear();

    // Create leave balances
    for (const leaveType of leaveTypes) {
      let balance = leaveType.annualAllowance;
      
      if (fields.isTWC) {
        if (leaveType.name === 'SL') {
          balance = 10; // Sick Leave is 10 days
        } else if (leaveType.name === 'VL') {
          balance = 5; // Vacation Leave is 5 days
        }
      }

      await prisma.leaveBalance.create({
        data: {
          userId: user.id,
          leaveTypeId: leaveType.id,
          year: currentYear,
          balance: balance,
          used: 0,
          pending: 0,
        },
      });
    }

    revalidatePath('/dashboard/employee-management');
    return { success: true, data: { user } };
  } catch (error) {
    console.error('Employee creation error:', error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function getEmployeeWithApproverAndSubordinates() {
  const session = await auth();
  
  if (!session?.user.email) {
    throw new Error("Unauthorized");
  }

  const employee = await prisma.user.findFirst({
    where: {
      email: session.user.email,
    },
    include: {
      approver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          position: true,
          department: true,
          image: true,
        },
      },
      subordinates: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          position: true,
          department: true,
          image: true,
        },
      },
    },
  });

  return employee;
}

export async function getUserWithApproverAndSubordinates(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            position: true,
            image: true,
          }
        },
        subordinates: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            position: true,
            image: true,
          }
        }
      }
    });

    return user;
  } catch (error) {
    console.error('Error fetching user with approver and subordinates:', error);
    throw new Error('Failed to fetch user details');
  }
}