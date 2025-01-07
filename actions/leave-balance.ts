import { auth } from '@/auth';
import { prisma } from '@/lib/db';


export async function getLeaveBalances() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const employee = await prisma.employee.findUnique({
    where: { empId: session.user.id }
  });
  if (!employee) throw new Error('Employee not found');

  const currentYear = new Date().getFullYear();

  return prisma.leaveBalance.findMany({
    where: {
      employeeId: employee.id,
      year: currentYear
    },
    include: {
      leaveType: true
    }
  });
}