'use server'

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { ApprovalLevel } from '@prisma/client';

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        approver: {
          select: {
            firstName: true,
            lastName: true,
            position: true
          }
        }
      }
    });
    return users;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
}

export async function getAvailableApprovers(userId: string) {
  try {
    const approvers = await prisma.user.findMany({
      where: {
        isActive: true,
        role: {
          in: [ApprovalLevel.SUPERVISOR, ApprovalLevel.HR]
        },
        id: {
          not: userId // Exclude the current user
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        role: true
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
    role: ApprovalLevel;
  }
) {
  const { firstName, lastName, email, department, position, approverId, role } = data;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
        department,
        position,
        approverId,
        role,
        isManager: role === ApprovalLevel.SUPERVISOR,
        isHR: role === ApprovalLevel.HR,
      },
      include: {
        approver: {
          select: {
            firstName: true,
            lastName: true,
            position: true,
          }
        },
        leaveBalances: {
          include: {
            leaveType: true,
          }
        }
      }
    });

    revalidatePath('/dashboard/employee-management');
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('Update error:', error);
    return { success: false, error: 'Failed to update user details' };
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
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    revalidatePath('/dashboard/employee-management');
    return { success: true };
  } catch (error) {
    console.error('Toggle status error:', error);
    throw new Error('Failed to update user status');
  }
}

export async function getUserLeaveBalances(userId: string) {
  try {
    const balances = await prisma.leaveBalance.findMany({
      where: {
        userId: userId,
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
      const leaveBalances = await getUserLeaveBalances(user.id);
      return {
        ...user,
        leaveBalances
      };
    })
  );
  return usersWithBalances;
}