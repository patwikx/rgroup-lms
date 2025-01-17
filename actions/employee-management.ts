'use server'

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        employee: {
          include: {
            hasApprovers: {
              include: {
                approver: true
              }
            }
          }
        },
      },
        orderBy: { updatedAt: 'asc' }
    });
    return users;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
}

export async function getAvailableApprovers(employeeId: string) {
  try {
    const approvers = await prisma.employee.findMany({
      where: {
        isActive: true,
        isManager: true,
        id: {
          not: employeeId // Exclude the current employee
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true
      }
    });
    return approvers;
  } catch (error) {
    throw new Error('Failed to fetch approvers');
  }
}

export async function updateUserDetails(
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
    approverId?: string;
  }
) {
  const { firstName, lastName, email, department, position, approverId } = data;

  try {
    await prisma.$transaction(async (tx) => {
      // Update user and employee details
      await tx.user.update({
        where: { id: userId },
        data: {
          email,
          employee: {
            update: {
              firstName,
              lastName,
              email,
              department,
              position,
            },
          },
        },
      });

      if (approverId) {
        // Get the employee record
        const employee = await tx.employee.findFirst({
          where: { empId: userId },
        });

        if (employee) {
          // Update or create the approver relationship
          await tx.leaveApprover.upsert({
            where: {
              employeeId_approverId: {
                employeeId: employee.id,
                approverId: approverId,
              },
            },
            create: {
              employeeId: employee.id,
              approverId: approverId,
              approvalLevel: 'SUPERVISOR',
            },
            update: {},
          });
        }
      }
    });

    revalidatePath('/dashboard/employee-management');
    return { success: true };
  } catch (error) {
    console.error('Update error:', error);
    throw new Error('Failed to update user details');
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const hashedPassword = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return { success: true };
  } catch (error) {
    throw new Error('Failed to update password');
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  try {
    const employee = await prisma.employee.findFirst({
      where: { empId: userId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    await prisma.employee.update({
      where: { id: employee.id },
      data: { isActive },
    });

    revalidatePath('/dashboard/employee-management');
    return { success: true };
  } catch (error) {
    console.error('Toggle status error:', error);
    throw new Error('Failed to update user status');
  }
}