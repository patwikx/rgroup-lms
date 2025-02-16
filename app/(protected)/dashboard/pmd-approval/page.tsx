import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ApprovedLeavesList } from "./approved-leaves-list";
import { auth } from "@/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'RD Realty Employee PMD Approval',
  description: 'Manage system users and their access',
};

export default async function ApprovedLeavesPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'HR') {
    redirect('/dashboard');
  }

  const approvedLeaves = await prisma.leaveRequest.findMany({
    where: {
      OR: [
        { status: 'APPROVED' },
        {
          approvals: {
            some: {
              status: 'APPROVED',
              level: 'HR',
            },
          },
        },
      ],
      NOT: {
        AND: [
          { status: 'APPROVED' },
          { pmdStatus: 'APPROVED' },
        ],
      },
      pmdStatus: { not: 'REJECTED' }, // Exclude rejected PMD status
    },
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
      updatedAt: 'desc',
    },
  });

  // Check if there are any pending leave requests for PMD approval
  const pendingForPMDApproval = await prisma.leaveRequest.findMany({
    where: {
      pmdStatus: 'PENDING',
      status: 'APPROVED', // Ensure the leave request is approved
    },
  });

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Approved Leave Requests</h1>
        <p className="text-muted-foreground mt-2">
          View all approved leave requests across the organization.
        </p>
      </div>

      {/* Show a more polished message if there are no pending PMD approval leave requests */}
      {pendingForPMDApproval.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md flex items-start">
          <svg
            className="h-6 w-6 text-yellow-400 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8v4M12 16h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"></path>
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-yellow-800">
              No Pending Leave Requests for PMD Approval
            </h2>
            <p className="mt-2 text-yellow-700">
              Currently, there are no leave requests awaiting approval from PMD. Keep up the great work in managing the leave process!
            </p>
          </div>
        </div>
      ) : (
        <ApprovedLeavesList approvals={approvedLeaves} />
      )}
    </div>
  );
}