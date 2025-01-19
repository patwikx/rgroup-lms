"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createLeaveType(data: {
  name: string;
  description?: string;
  annualAllowance: number;
  requiresApproval: boolean;
  isPaid: boolean;
  minNoticeDays: number;
  maxConsecutiveDays?: number;
  allowsHalfDay: boolean;
}) {
  const leaveType = await prisma.leaveType.create({
    data,
  });

  revalidatePath("/settings/leave");
  return leaveType;
}

export async function updateLeaveType(
  id: string,
  data: Partial<{
    name: string;
    description?: string;
    annualAllowance: number;
    requiresApproval: boolean;
    isPaid: boolean;
    minNoticeDays: number;
    maxConsecutiveDays?: number;
    allowsHalfDay: boolean;
  }>
) {
  const leaveType = await prisma.leaveType.update({
    where: { id },
    data,
  });

  revalidatePath("/settings/leave");
  return leaveType;
}

export async function deleteLeaveType(id: string) {
  await prisma.leaveType.delete({
    where: { id },
  });

  revalidatePath("/settings/leave");
}

export async function updateLeaveBalance(id: string, balance: number) {
  const updatedBalance = await prisma.leaveBalance.update({
    where: { id },
    data: { balance },
  });

  revalidatePath("/settings/leave");
  return updatedBalance;
}

export async function replenishLeaveBalances(year: number) {
  // Get all active employees and leave types
  const employees = await prisma.employee.findMany({
    where: { isActive: true },
  });

  const leaveTypes = await prisma.leaveType.findMany();

  // Create or update leave balances for each employee and leave type
  const updates = employees.flatMap((employee) =>
    leaveTypes.map((leaveType) =>
      prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year,
          },
        },
        create: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          year,
          balance: leaveType.annualAllowance,
          used: 0,
          pending: 0,
        },
        update: {
          balance: leaveType.annualAllowance,
          used: 0,
          pending: 0,
        },
      })
    )
  );

  await prisma.$transaction(updates);
  revalidatePath("/settings/leave");
}