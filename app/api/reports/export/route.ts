import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LeaveStatus } from '@prisma/client'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const status = searchParams.get('status') as LeaveStatus | null

  const where = {
    ...(startDate && endDate
      ? {
          startDate: {
            gte: new Date(startDate),
          },
          endDate: {
            lte: new Date(endDate),
          },
        }
      : {}),
    ...(status
      ? {
          status,
        }
      : {}),
  }

  const leaveRequests = await prisma.leaveRequest.findMany({
    where,
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          department: true,
        },
      },
      leaveType: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const csvRows = [
    [
      'Employee',
      'Department',
      'Leave Type',
      'Start Date',
      'End Date',
      'Days',
      'Status',
      'Reason',
    ],
    ...leaveRequests.map((request) => [
      `${request.employee.firstName} ${request.employee.lastName}`,
      request.employee.department,
      request.leaveType.name,
      format(request.startDate, 'PP'),
      format(request.endDate, 'PP'),
      request.daysRequested.toString(),
      request.status,
      request.reason,
    ]),
  ]

  const csv = csvRows.map((row) => row.join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=leave-reports-${format(
        new Date(),
        'yyyy-MM-dd'
      )}.csv`,
    },
  })
}