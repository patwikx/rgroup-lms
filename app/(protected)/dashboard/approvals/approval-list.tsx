'use client';

import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateLeaveApproval } from "@/actions/leave-approval";
import { toast } from "sonner";
import { ApprovalDialog } from "./approval-dialog";
import type { PendingApprovalWithDetails } from "@/types/type";

interface ApprovalsListProps {
  approvals: PendingApprovalWithDetails[];
}

export function ApprovalsList({ approvals }: ApprovalsListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PendingApprovalWithDetails | null>(null);

  const handleAction = async (approvalId: string, status: 'APPROVED' | 'REJECTED', comment?: string) => {
    setLoading(approvalId);
    try {
      const result = await updateLeaveApproval({
        approvalId,
        status,
        comment
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Leave request ${status.toLowerCase()} successfully`);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
      setSelectedRequest(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvals.map((approval) => (
              <TableRow key={approval.id}>
                <TableCell className="font-medium">
                  {approval.leaveRequest.employee.firstName} {approval.leaveRequest.employee.lastName}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {approval.leaveRequest.leaveType.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(approval.leaveRequest.startDate, 'PP')} - {format(approval.leaveRequest.endDate, 'PP')}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {approval.leaveRequest.leaveDay === 'FULL' ? 'Full Day' : 
                     approval.leaveRequest.leaveDay === 'FIRST_HALF' ? 'First Half' : 'Second Half'}
                  </span>
                </TableCell>
                <TableCell>{approval.leaveRequest.daysRequested.toString()}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {approval.leaveRequest.reason}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => setSelectedRequest(approval)}
                    disabled={!!loading}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ApprovalDialog
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onApprove={(comment) => selectedRequest && handleAction(selectedRequest.id, 'APPROVED', comment)}
        onReject={(comment) => selectedRequest && handleAction(selectedRequest.id, 'REJECTED', comment)}
        loading={!!loading}
      />
    </>
  );
}