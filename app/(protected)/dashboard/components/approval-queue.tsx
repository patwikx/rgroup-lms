'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { LeaveApproval, LeaveRequest, Employee, LeaveType } from '@prisma/client';
import { useCurrentUser } from '@/hooks/use-current-user';

interface ApprovalQueueProps {
  approvals: (LeaveApproval & {
    leaveRequest: LeaveRequest & {
      employee: Employee;
      leaveType: LeaveType;
    };
  })[];
}

export function ApprovalQueue({ approvals }: ApprovalQueueProps) {
  const user = useCurrentUser();

  const isApprover = user?.role === 'SUPERVISOR';
  const isHR = user?.role === 'HR';

  if (!isApprover && !isHR) {
    return null; // Do not render the card if the user is not a supervisor or HR
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Leave requests requiring your approval</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="space-y-1">
              <p className="font-medium">
                {approval.leaveRequest.employee.firstName}{' '}
                {approval.leaveRequest.employee.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(approval.leaveRequest.startDate), 'PP')} -{' '}
                {format(new Date(approval.leaveRequest.endDate), 'PP')}
              </p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm">
                Reject
              </Button>
              <Button size="sm">Approve</Button>
            </div>
          </div>
        ))}
        {approvals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending approvals
          </p>
        )}
      </CardContent>
    </Card>
  );
}