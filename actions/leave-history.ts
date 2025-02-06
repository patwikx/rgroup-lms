
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { LeaveStatus } from "@prisma/client";

export async function getUserLeaveHistory(status?: LeaveStatus) {
  try {
    const session = await auth();
    if (!session?.user.email) {
      throw new Error('Unauthorized');
    }

    // Get employee details from user email
    const employee = await prisma.employee.findFirst({
      where: {
        email: session.user.email
      }
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const requests = await prisma.leaveRequest.findMany({
      where: {
        employeeId: employee.id,
        ...(status && { status })
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        leaveDay: true,
        daysRequested: true,
        status: true,
        pmdStatus: true,
        reason: true,
        rejectionReason: true,
        pmdRejectionReason: true,
        createdAt: true,
        updatedAt: true,
        leaveType: {
          select: {
            name: true,
            description: true,
          },
        },
        approvals: {
          select: {
            id: true,
            level: true,
            status: true,
            comment: true,
            createdAt: true,
            updatedAt: true,
            approver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
                department: true,
                isManager: true,
                isHR: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests;
  } catch (error) {
    console.error('Error fetching leave history:', error);
    throw new Error('Failed to fetch leave history');
  }
}