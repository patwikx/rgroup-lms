"use server"

import { prisma } from "@/lib/db"


export async function getLeaves(from?: string, to?: string) {
  const fromDate = from ? new Date(from) : undefined
  const toDate = to ? new Date(to) : undefined

  // If toDate is provided, set it to the end of the day
  if (toDate) {
    toDate.setHours(23, 59, 59, 999)
  }

  const dateFilter = {
    ...(fromDate && toDate
      ? {
          createdAt: {
            gte: fromDate,
            lte: toDate,
          },
        }
      : {}),
  }

  return prisma.leaveRequest.findMany({
    where: dateFilter,
    include: {
      user: true,
      leaveType: true,
      approvals: {
        include: {
          approver: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}
