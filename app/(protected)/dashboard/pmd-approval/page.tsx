
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { ApprovedLeavesList } from "./approved-leaves-list";
import { auth } from "@/auth";

export default async function ApprovedLeavesPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'HR') {
    redirect('/');
  }

  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: {
      OR: [
        { status: 'APPROVED' },
        {
          approvals: {
            some: {
              status: 'APPROVED',
              level: 'HR'
            }
          }
        }
      ]
    },
    include: {
      employee: true,
      leaveType: true,
      approvals: {
        include: {
          approver: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Approved Leave Requests</h1>
        <p className="text-muted-foreground mt-2">
          View all approved leave requests across the organization.
        </p>
      </div>

      <ApprovedLeavesList approvals={approvedLeaves} />
    </div>
  );
}