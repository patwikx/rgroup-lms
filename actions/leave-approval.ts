'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ApprovalStatus, LeaveStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";


export async function getPendingApprovals() {
  try {
    const session = await auth();
    if (!session?.user?.employeeId) {
      return [];
    }

    const user = await prisma.user.findFirst({
      where: { employeeId: session.user.employeeId }
    });

    if (!user) {
      return [];
    }

    const pendingApprovals = await prisma.leaveApproval.findMany({
      where: {
        approverId: user.id,
        status: ApprovalStatus.PENDING,
        leaveRequest: {
          status: LeaveStatus.PENDING
        }
      },
      include: {
        leaveRequest: {
          include: {
            user: true,
            leaveType: true,
            approvals: {
              include: {
                approver: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return pendingApprovals;
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return [];
  }
}

export async function updateLeaveApproval({
  approvalId,
  status,
  comment
}: {
  approvalId: string;
  status: 'APPROVED' | 'REJECTED';
  comment?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await prisma.user.findFirst({
      where: { employeeId: session.user.employeeId }
    });

    if (!user) {
      return { success: false, error: "user not found" };
    }

    // Get the approval with leave request details
    const approval = await prisma.leaveApproval.findFirst({
      where: {
        id: approvalId,
        approverId: user.id,
        status: ApprovalStatus.PENDING
      },
      include: {
        leaveRequest: {
          include: {
            approvals: true
          }
        }
      }
    });

    if (!approval) {
      return { success: false, error: "Approval not found" };
    }

    // Update the approval status
    await prisma.leaveApproval.update({
      where: { id: approvalId },
      data: {
        status: status as ApprovalStatus,
        comment
      }
    });

    // If rejected, update leave request status to rejected
    if (status === 'REJECTED') {
      await prisma.leaveRequest.update({
        where: { id: approval.leaveRequestId },
        data: {
          status: LeaveStatus.REJECTED,
          rejectionReason: comment
        }
      });
    }
    // If approved and all approvals are complete, update leave request status
    else if (status === 'APPROVED') {
      const allApprovals = approval.leaveRequest.approvals;
      const pendingApprovals = allApprovals.filter(
        a => a.id !== approvalId && a.status === ApprovalStatus.PENDING
      );

      if (pendingApprovals.length === 0) {
        await prisma.leaveRequest.update({
          where: { id: approval.leaveRequestId },
          data: {
            status: LeaveStatus.APPROVED
          }
        });
      }
    }

    revalidatePath('/dashboard/approvals');
    return { success: true };
  } catch (error) {
    console.error('Error updating leave approval:', error);
    return { success: false, error: "Something went wrong" };
  }
}