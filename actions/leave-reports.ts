'use server'

import { prisma } from "@/lib/db";
import { LeaveStatus } from "@prisma/client";

export async function getLeaveRequests(status?: LeaveStatus) {
  try {
    const requests = await prisma.leaveRequest.findMany({
      where: status ? { status } : undefined,
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
        employee: {
          select: {
            employeeId: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
            approver: {
              select: {
                firstName: true,
                lastName: true,
                position: true,
              },
            },
          },
        },
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
    console.error('Error fetching leave requests:', error);
    throw new Error('Failed to fetch leave requests');
  }
}