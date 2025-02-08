'use server'

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { calculateLeaveDays } from "@/lib/leave-calculator";
import { LeaveRequestFormData, LeaveRequestSchema } from "@/schemas";
import { LeaveStatus, ApprovalStatus, ApprovalLevel } from "@prisma/client";

export async function createLeaveRequest(data: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const employee = await prisma.employee.findFirst({
      where: { empId: session.user.id },
      include: { approver: true },
    });

    if (!employee) {
      return { success: false, error: "Employee not found" };
    }

    if (!employee.approverId) {
      return { success: false, error: "No approver assigned to this employee" };
    }

    // Get the raw date strings from FormData
    const startDateStr = data.get('startDate') as string;
    const endDateStr = data.get('endDate') as string;

    // Create dates and set them to noon UTC to avoid timezone issues
    const startDate = new Date(startDateStr);
    startDate.setUTCHours(12, 0, 0, 0);
    
    const endDate = new Date(endDateStr);
    endDate.setUTCHours(12, 0, 0, 0);

    const rawData = {
      leaveTypeId: data.get('leaveTypeId'),
      startDate,
      endDate,
      leaveDay: data.get('leaveDay'),
      reason: data.get('reason'),
    };

    const validatedFields = LeaveRequestSchema.safeParse(rawData);
    
    if (!validatedFields.success) {
      return { 
        success: false, 
        error: validatedFields.error.errors[0].message 
      };
    }

    const { data: fields } = validatedFields;

    // Calculate leave days
    const daysRequested = calculateLeaveDays(
      fields.startDate,
      fields.endDate,
      fields.leaveDay
    );

    // Get current leave balance
    const currentYear = new Date().getFullYear();
    const leaveBalance = await prisma.leaveBalance.findFirst({
      where: {
        employeeId: employee.id,
        leaveTypeId: fields.leaveTypeId as string,
        year: currentYear
      }
    });

    if (!leaveBalance) {
      return { success: false, error: "Leave balance not found" };
    }

    // Check if enough balance available
    if (Number(leaveBalance.balance) < daysRequested) {
      return { success: false, error: "Insufficient leave balance" };
    }

    // Create leave request and update balance in a transaction
    const [leaveRequest] = await prisma.$transaction([
      // Create leave request with initial supervisor approval
      prisma.leaveRequest.create({
        data: {
          employeeId: employee.id,
          leaveTypeId: fields.leaveTypeId as string,
          startDate: fields.startDate,
          endDate: fields.endDate,
          leaveDay: fields.leaveDay,
          daysRequested,
          reason: fields.reason,
          status: LeaveStatus.PENDING,
          approvals: {
            create: [
              {
                approverId: employee.approverId,
                level: employee.approver?.approvalLevel || ApprovalLevel.SUPERVISOR,
                status: ApprovalStatus.PENDING,
              },
            ],
          },
        },
        include: {
          approvals: true
        }
      }),
      // Update leave balance
      prisma.leaveBalance.update({
        where: { id: leaveBalance.id },
        data: {
          balance: Number(leaveBalance.balance) - daysRequested,
          pending: Number(leaveBalance.pending) + daysRequested
        }
      })
    ]);

    return { success: true, data: leaveRequest };
  } catch (error) {
    console.error('Leave request creation error:', error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function validateLeaveRequest(data: LeaveRequestFormData) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minNoticeDate = new Date(today);
  minNoticeDate.setDate(today.getDate() + 3);

  const leaveType = await prisma.leaveType.findUnique({
    where: { id: data.leaveTypeId }
  });

  if (leaveType && (leaveType.name === "VL" || leaveType.name === "ML")) {
    if (data.startDate < minNoticeDate) {
      return {
        success: false,
        error: "VL and ML requests must be filed at least 3 days before the leave date"
      };
    }
  }

  return { success: true };
}