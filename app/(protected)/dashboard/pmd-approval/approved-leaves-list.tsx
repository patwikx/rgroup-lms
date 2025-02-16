'use client';

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";
import { ApprovedLeaveDialog } from "./approved-leave-dialog";

interface ApprovedLeavesListProps {
  approvals: any[]; // You should define a proper type for this
}

export function ApprovedLeavesList({ approvals }: ApprovedLeavesListProps) {
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

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
              <TableHead>Approver Status</TableHead>
              <TableHead>PMD Status</TableHead>
              <TableHead>Approved By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvals.map((request) => {
              const hrApproval = request.approvals.find(
                (a: any) => a.level === 'HR'
              );
              const supervisorApproval = request.approvals.find(
                (a: any) => a.level === 'SUPERVISOR'
              );

              return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.user.firstName} {request.user.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={request.leaveType.isPaid ? "default" : "secondary"}>
                      {request.leaveType.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(request.startDate, 'PP')} - {format(request.endDate, 'PP')}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {request.leaveDay === 'FULL' ? 'Full Day' : 
                       request.leaveDay === 'FIRST_HALF' ? 'First Half' : 'Second Half'}
                    </span>
                  </TableCell>
                  <TableCell>{request.daysRequested.toString()}</TableCell>
                  <TableCell>
                    <Badge variant="success" className="bg-primary/10 text-primary hover:bg-primary/20">
                      Approved
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.pmdStatus ? (
                      <Badge
                        variant={request.pmdStatus === 'APPROVED' ? 'success' : 'destructive'}
                        className={request.pmdStatus === 'APPROVED' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
                      >
                        {request.pmdStatus}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">PENDING</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {supervisorApproval && (
                        <div>
                          <div className="text-xs text-muted-foreground">Supervisor</div>
                          <div className="font-medium text-sm">
                            {supervisorApproval.approver.firstName} {supervisorApproval.approver.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(supervisorApproval.updatedAt, 'PP')}
                          </div>
                        </div>
                      )}
                      {hrApproval && (
                        <div>
                          <div className="text-xs text-muted-foreground">HR</div>
                          <div className="font-medium text-sm">
                            {hrApproval.approver.firstName} {hrApproval.approver.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(hrApproval.updatedAt, 'PP')}
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ApprovedLeaveDialog
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </>
  );
}