'use server'

import { PrismaClient } from "@prisma/client";

type CreateUserParams = {
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
  department?: string;
  position?: string;
  isManager?: boolean;
  isHR?: boolean;
};

export async function createUser(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">,
  params: CreateUserParams
) {
  const user = await tx.user.create({
    data: {
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      password: params.hashedPassword,
      department: params.department,
      position: params.position,
      isManager: params.isManager ?? false,
      isHR: params.isHR ?? false,
      role: params.isHR ? 'HR' : params.isManager ? 'SUPERVISOR' : 'USER',
    },
  });

  // Create default leave balances for the new user
  const leaveTypes = await tx.leaveType.findMany();
  const currentYear = new Date().getFullYear();

  await tx.leaveBalance.createMany({
    data: leaveTypes.map(leaveType => ({
      userId: user.id,
      leaveTypeId: leaveType.id,
      year: currentYear,
      balance: leaveType.annualAllowance,
    })),
  });

  return user;
}

export async function assignApprover(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">,
  userId: string,
  approverId: string
) {
  return await tx.user.update({
    where: { id: userId },
    data: { approverId },
  });
}

export async function updateUserRole(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">,
  userId: string,
  isManager: boolean,
  isHR: boolean
) {
  return await tx.user.update({
    where: { id: userId },
    data: {
      isManager,
      isHR,
      role: isHR ? 'HR' : isManager ? 'SUPERVISOR' : 'USER',
    },
  });
}