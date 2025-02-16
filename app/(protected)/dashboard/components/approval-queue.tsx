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
import { PendingApprovalWithDetails } from '@/types/type';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ApprovalLevel } from '@prisma/client';

interface ApprovalQueueProps {
  approvals: PendingApprovalWithDetails[];
}

export function ApprovalQueue({ approvals }: ApprovalQueueProps) {
  const user = useCurrentUser();
  const router = useRouter();

  const isApprover = user?.role === ApprovalLevel.SUPERVISOR;
  const isHR = user?.role === ApprovalLevel.HR;

  if (!isApprover && !isHR) {
    return null; // Do not render the card if the user is not a supervisor or HR
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Leave requests requiring your approval</CardDescription>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard/approvals')}
        >
          <Eye className='h-4 w-4 mr-2' />View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="space-y-1">
              <p className="font-medium">
                {approval.leaveRequest.user.firstName}{' '}
                {approval.leaveRequest.user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(approval.leaveRequest.startDate), 'PP')} -{' '}
                {format(new Date(approval.leaveRequest.endDate), 'PP')}
              </p>
            </div>
            <div className="space-x-2">
              <Badge>{approval.leaveRequest.leaveType.name}</Badge>
              <Badge className="bg-purple-500 text-white">{approval.status}</Badge>
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