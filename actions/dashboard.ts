'use server'

import { auth } from '@/auth';
import { prisma } from '@/lib/db';


export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const employee = await prisma.user.findUnique({
    where: { employeeId: session.user.employeeId }
  });
  if (!employee) throw new Error('Employee not found');

  const currentYear = new Date().getFullYear();

  const leaveBalances = await prisma.leaveBalance.findMany({
    where: {
      userId: employee.id,
      year: currentYear,
      leaveType: {
        name: { in: ['ML', 'SL', 'VL'] }
      }
    },
    select: {
      balance: true,
      used: true,
      pending: true
    }
  });

  const availableDays = leaveBalances.reduce(
    (sum, balance) => sum + Number(balance.balance) - Number(balance.used) - Number(balance.pending),
    0
  );


  const pendingRequests = await prisma.leaveRequest.count({
    where: {
      userId: employee.id,
      status: 'PENDING'
    }
  });

  const approvedLeaves = await prisma.leaveRequest.count({
    where: {
      userId: employee.id,
      status: 'APPROVED'
    }
  });

  const pendingApprovals = await prisma.leaveApproval.count({
    where: {
      approverId: employee.id,
      status: 'PENDING'
    }
  });

  return {
    availableDays,
    pendingRequests,
    approvedLeaves,
    pendingApprovals
  };
}