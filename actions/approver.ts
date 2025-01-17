'use server'

import { prisma } from "@/lib/db";


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
