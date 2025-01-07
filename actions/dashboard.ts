import { auth } from '@/auth';
import { prisma } from '@/lib/db';


export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const employee = await prisma.employee.findUnique({
    where: { empId: session.user.id }
  });
  if (!employee) throw new Error('Employee not found');

  const currentYear = new Date().getFullYear();

  // Get total available days
  const leaveBalances = await prisma.leaveBalance.findMany({
    where: {
      employeeId: employee.id,
      year: currentYear
    },
    select: {
      balance: true
    }
  });

  const availableDays = leaveBalances.reduce(
    (sum, balance) => sum + Number(balance.balance),
    0
  );

  // Get pending requests count
  const pendingRequests = await prisma.leaveRequest.count({
    where: {
      employeeId: employee.id,
      status: 'PENDING'
    }
  });

  // Get approved leaves count for current year
  const approvedLeaves = await prisma.leaveRequest.count({
    where: {
      employeeId: employee.id,
      status: 'APPROVED',
      startDate: {
        gte: new Date(currentYear, 0, 1)
      },
      endDate: {
        lte: new Date(currentYear, 11, 31)
      }
    }
  });

  // Get pending approvals count if user is a manager or HR
  const pendingApprovals = employee.isManager || employee.isHR
    ? await prisma.leaveApproval.count({
        where: {
          approverId: employee.id,
          status: 'PENDING'
        }
      })
    : 0;

  return {
    availableDays,
    pendingRequests,
    approvedLeaves,
    pendingApprovals
  };
}