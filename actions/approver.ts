'use server'

import { prisma } from "@/lib/db";


export async function getAvailableApprovers() {
  try {
    const approvers = await prisma.user.findMany({
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
        department: true,
        position: true,
        isManager: true,
        isHR: true,
        isTWC: true,
        role: true
      }
    });

    return approvers;
  } catch (error) {
    console.error('Error fetching approvers:', error);
    throw new Error('Failed to fetch approvers');
  }
}
