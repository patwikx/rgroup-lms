'use server'

import { prisma } from "@/lib/db";
import { ApprovalLevel, PrismaClient } from "@prisma/client";

export async function getAvailableApprovers() {
  try {
    const approvers = await prisma.employee.findMany({
      where: {
        OR: [
          { isManager: true },
          { isHR: true }
        ],
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        isManager: true,
        isHR: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });
    
    return approvers;
  } catch (error) {
    console.error('Error fetching approvers:', error);
    return [];
  }
}


type CreateApproversParams = {
  employeeId: string;
  supervisorId: string;
  hrApproverId: string;
};

export async function createApprovers(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">,
  params: CreateApproversParams
) {
  return tx.leaveApprover.createMany({
    data: [
      {
        employeeId: params.employeeId,
        approverId: params.supervisorId,
        approvalLevel: ApprovalLevel.SUPERVISOR,
      },
      {
        employeeId: params.employeeId,
        approverId: params.hrApproverId,
        approvalLevel: ApprovalLevel.HR,
      },
    ],
  });
}