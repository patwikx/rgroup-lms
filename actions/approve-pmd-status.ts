'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updatePmdStatus(
  requestId: string,
  status: 'APPROVED' | 'REJECTED',
  reason?: string
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and has HR role
    if (!session || session.user.role !== 'HR') {
      throw new Error('Unauthorized');
    }

    // If status is REJECTED, reason is required
    if (status === 'REJECTED' && !reason) {
      throw new Error('Rejection reason is required');
    }

    // Update the leave request
    const updatedLeaveRequest = await prisma.leaveRequest.update({
        where: {
          id: requestId,
        },
        data: {
          pmdStatus: status,
          pmdRejectionReason: status === 'REJECTED' ? reason : null,
          status: status === 'REJECTED' ? 'REJECTED' : 'APPROVED',
        },
      });

    revalidatePath('/approved-leaves');
    return { success: true, data: updatedLeaveRequest };
  } catch (error) {
    console.error('Error updating PMD status:', error);
    return { success: false, error: (error as Error).message };
  }
}