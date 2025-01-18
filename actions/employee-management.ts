'use server'

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { ApprovalLevel } from '@prisma/client';

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { updatedAt: 'asc' },
      include: {
        employee: {
          include: {
            approver: {
              select: {
                firstName: true,
                lastName: true,
                position: true
              }
            }
          }
        }
      }
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
        approvalLevel: {
          in: [ApprovalLevel.SUPERVISOR, ApprovalLevel.HR]
        },
        id: {
          not: employeeId // Exclude the current employee
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        approvalLevel: true
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
    approverId?: string | null;
    approvalLevel: ApprovalLevel;
  }
) {
  const { firstName, lastName, email, department, position, approverId, approvalLevel } = data;

  try {
    await prisma.$transaction(async (tx) => {
      // Update user details
      await tx.user.update({
        where: { id: userId },
        data: {
          name: `${firstName} ${lastName}`, // Update the name in User model
          email,
          role: approvalLevel,
        },
      });

      // Update employee details
      await tx.employee.update({
        where: { empId: userId },
        data: {
          firstName,
          lastName,
          email,
          department,
          position,
          approverId,
          approvalLevel,
          isManager: approvalLevel === ApprovalLevel.SUPERVISOR,
          isHR: approvalLevel === ApprovalLevel.HR,
        },
      });
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

export async function getEmployeeLeaveBalances(employeeId: string) {
  try {
    const balances = await prisma.leaveBalance.findMany({
      where: {
        employeeId: employeeId,
        year: new Date().getFullYear()
      },
      include: {
        leaveType: true
      }
    });
    return balances;
  } catch (error) {
    console.error('Error fetching leave balances:', error);
    throw new Error('Failed to fetch leave balances');
  }
}

export async function getUsersWithLeaveBalances() {
  const users = await getUsers();
  const usersWithBalances = await Promise.all(
    users.map(async (user) => {
      if (user.employee) {
        const leaveBalances = await getEmployeeLeaveBalances(user.employee.id);
        return {
          ...user,
          leaveBalances
        };
      }
      return { ...user, leaveBalances: [] };
    })
  );
  return usersWithBalances;
}