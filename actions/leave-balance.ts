'use server'

import { auth } from '@/auth';
import { prisma } from '@/lib/db';


export async function getLeaveBalances() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const employee = await prisma.user.findUnique({
    where: { employeeId: session.user.employeeId }
  });
  if (!employee) throw new Error('Employee not found');

  const currentYear = new Date().getFullYear();

  return prisma.leaveBalance.findMany({
    where: {
      userId: employee.id,
      year: currentYear
    },
    include: {
      leaveType: true
    }
  });
}