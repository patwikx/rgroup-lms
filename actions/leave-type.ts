'use server'

import { prisma } from "@/lib/db";


export async function getLeaveTypes() {
  try {
    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        requiresApproval: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return leaveTypes;
  } catch (error) {
    console.error('Error fetching leave types:', error);
    return [];
  }
}

export async function createInitialLeaveBalances(employeeId: string) {
  try {
    const leaveTypes = await prisma.leaveType.findMany();
    const currentYear = new Date().getFullYear();

    const leaveBalances = await Promise.all(
      leaveTypes.map((leaveType) =>
        prisma.leaveBalance.create({
          data: {
            employeeId,
            leaveTypeId: leaveType.id,
            year: currentYear,
            balance: leaveType.annualAllowance,
            used: 0,
            pending: 0,
          },
        })
      )
    );

    return { success: true, data: leaveBalances };
  } catch (error) {
    console.error('Error creating leave balances:', error);
    return { success: false, error: 'Failed to create leave balances' };
  }
}