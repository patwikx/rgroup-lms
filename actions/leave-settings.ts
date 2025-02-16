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
  revalidatePath("/dashboard/settings");
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

  revalidatePath("/dashboard/settings");
  return leaveType;
}

export async function deleteLeaveType(id: string) {
  await prisma.leaveType.delete({
    where: { id },
  });

  revalidatePath("/dashboard/settings");
}

export async function updateLeaveBalance(id: string, balance: number) {
  const updatedBalance = await prisma.leaveBalance.update({
    where: { id },
    data: { balance },
  });

  revalidatePath("/dashboard/settings");
  return updatedBalance;
}

export async function replenishLeaveBalances(year: number) {
  // Get all active users
  const users = await prisma.user.findMany({
    where: { 
      isActive: true,
    },
  });

  // Get all leave types
  const leaveTypes = await prisma.leaveType.findMany();

  // Get current year balances for SL and VL
  const currentBalances = await prisma.leaveBalance.findMany({
    where: {
      year: year - 1,
      leaveType: {
        name: {
          in: ['Sick Leave', 'Vacation Leave', 'SL', 'VL']
        }
      }
    },
    include: {
      leaveType: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
          isTWC: true
        }
      }
    }
  });

  // Create a map of current balances for quick lookup
  const currentBalanceMap = new Map();
  currentBalances.forEach(balance => {
    // Store by both user ID and leave type ID to ensure unique mapping
    const key = `${balance.userId}-${balance.leaveTypeId}`;
    // The balance field already represents the remaining balance
    const remainingBalance = balance.balance;
    currentBalanceMap.set(key, remainingBalance);
    
    // Debug log for each balance
    console.log(`Previous Year Balance for ${balance.user.firstName}:`);
    console.log(`  Leave Type: ${balance.leaveType.name}`);
    console.log(`  Total Balance: ${balance.balance}`);
    console.log(`  Used: ${balance.used}`);
    console.log(`  Pending: ${balance.pending}`);
    console.log(`  Remaining Balance: ${remainingBalance}`);
  });

  // Create or update leave balances for each user and leave type
  const updates = users.flatMap(user =>
    leaveTypes.map(leaveType => {
      const normalizedTypeName = leaveType.name.toLowerCase();
      const isCarryOverType = ['sick leave', 'vacation leave', 'sl', 'vl'].includes(normalizedTypeName);
      
      // Get remaining balance from previous year for carry-over types
      const balanceKey = `${user.id}-${leaveType.id}`;
      const remainingBalance = isCarryOverType ? (currentBalanceMap.get(balanceKey) || 0) : 0;

      // Calculate initial balance based on user type (TWC or regular)
      let initialBalance = leaveType.annualAllowance;
      if (user.isTWC) {
        if (normalizedTypeName === 'sl' || normalizedTypeName === 'sick leave') {
          initialBalance = 10; // Sick Leave is 10 days for TWC
        } else if (normalizedTypeName === 'vl' || normalizedTypeName === 'vacation leave') {
          initialBalance = 5; // Vacation Leave is 5 days for TWC
        }
      }

      return prisma.leaveBalance.upsert({
        where: {
          userId_leaveTypeId_year: {
            userId: user.id,
            leaveTypeId: leaveType.id,
            year,
          },
        },
        create: {
          userId: user.id,
          leaveTypeId: leaveType.id,
          year,
          balance: isCarryOverType 
            ? initialBalance + remainingBalance 
            : initialBalance,
          used: 0,
          pending: 0,
        },
        update: {
          balance: isCarryOverType 
            ? initialBalance + remainingBalance 
            : initialBalance,
          used: 0,
          pending: 0,
        },
      });
    })
  );

  await prisma.$transaction(updates);
  revalidatePath("/dashboard/settings");
}