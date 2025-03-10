import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import { Metadata } from "next"
import PendingLeaveRequestsTable from "./pending-leave-reqeust-table"

export const metadata: Metadata = {
  title: 'RD Realty Employee Pending Requests',
  description: 'Manage system users and their access',
}

export default async function PendingLeaveRequestsPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const userEmail = session.user.email
  if (!userEmail) {
    return <div>User email not found.</div>
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  if (!user) {
    return <div>Employee not found.</div>
  }

  const pendingLeaveRequests = await prisma.leaveRequest.findMany({
    where: {
      userId: user.id,
      status: "PENDING",
    },
    include: {
      leaveType: true,
      approvals: {
        include: {
          approver: true,
        },
      },
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingLeaveRequests.length > 0 ? (
            <PendingLeaveRequestsTable leaveRequests={pendingLeaveRequests} />
          ) : (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>No pending requests</AlertTitle>
              <AlertDescription>
                You currently have no pending leave request applications.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}