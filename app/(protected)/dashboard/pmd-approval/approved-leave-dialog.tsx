'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, User, Briefcase, Check } from 'lucide-react';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { updatePmdStatus } from "@/actions/approve-pmd-status";

interface ApprovedLeaveDialogProps {
  request: any | null; // You should define a proper type for this
  onClose: () => void;
}

export function ApprovedLeaveDialog({ request, onClose }: ApprovedLeaveDialogProps) {
  const [pmdStatus, setPmdStatus] = useState<string>(request?.pmdStatus || '');
  const [pmdRejectionReason, setPmdRejectionReason] = useState<string>(request?.pmdRejectionReason || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!request) return null;

  const hrApproval = request.approvals.find((a: any) => a.level === 'HR');
  const supervisorApproval = request.approvals.find((a: any) => a.level === 'SUPERVISOR');

  const handleSubmit = async () => {
    if (!pmdStatus) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a PMD status",
      });
      return;
    }

    if (pmdStatus === 'REJECTED' && !pmdRejectionReason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a rejection reason",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updatePmdStatus(
        request.id,
        pmdStatus as 'APPROVED' | 'REJECTED',
        pmdStatus === 'REJECTED' ? pmdRejectionReason : undefined
      );

      if (result.success) {
        toast({
          title: "Success",
          description: "PMD status updated successfully",
        });
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to update PMD status",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle className="text-base">Approved Leave Request</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Employee Information */}
          <div>
            <h3 className="font-medium mb-2">Employee Details</h3>
            <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg">
              <User className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">
                  {request.user.firstName} {request.user.lastName}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {request.user.position}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {request.user.department}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Details */}
          <div>
            <h3 className="font-medium mb-2">Leave Details</h3>
            <div className="bg-muted/30 p-3 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Type:</span> {request.leaveType.name}
                </div>
                <div>
                <Badge variant={request.leaveType.isPaid ? "default" : "secondary"}>
              {request.leaveType.isPaid ? "Paid Leave" : "Unpaid Leave"}
            </Badge>
                </div>
                <div>
                  <span className="font-medium">Days:</span> {request.daysRequested.toString()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(request.startDate, 'MMM d')} - {format(request.endDate, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {request.leaveDay === 'FULL' ? 'Whole day' :
                     request.leaveDay === 'FIRST_HALF' ? 'Morning' : 'Afternoon'}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-medium">Reason:</span> {request.reason}
              </div>
            </div>
          </div>

          {/* Approval Details */}
          <div>
            <h3 className="font-medium mb-2">Approval Details</h3>
            <div className="bg-muted/30 p-3 rounded-lg space-y-3">
              <Badge variant="success" className="text-primary">
                <Check className="h-3 w-3 mr-1" />
                APPROVED
              </Badge>

              {supervisorApproval && (
                <div className="grid grid-cols-[auto,1fr] gap-x-4 text-sm">
                  <div className="font-medium">Approver:</div>
                  <div>{supervisorApproval.approver.firstName} {supervisorApproval.approver.lastName}</div>
                  {supervisorApproval.comment && (
                    <>
                      <div className="font-medium">Remarks:</div>
                      <div>{supervisorApproval.comment}</div>
                    </>
                  )}
                  <div className="font-medium">Date of Approval:</div>
                  <div>{format(supervisorApproval.updatedAt, 'PPp')}</div>
                </div>
              )}

              {hrApproval && (
                <>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-[auto,1fr] gap-x-4 text-sm">
                    <div className="font-medium">Approver:</div>
                    <div>{hrApproval.approver.firstName} {hrApproval.approver.lastName}</div>
                    {hrApproval.comment && (
                      <>
                        <div className="font-medium">Remarks:</div>
                        <div>{hrApproval.comment}</div>
                      </>
                    )}
                    <div className="font-medium">Date:</div>
                    <div>{format(hrApproval.updatedAt, 'PPp')}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* PMD Status Update */}
          <div>
            <h3 className="font-medium mb-2">PMD Status</h3>
            <div className="bg-muted/30 p-3 rounded-lg">
              <Select value={pmdStatus} onValueChange={setPmdStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select PMD status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Approve</SelectItem>
                  <SelectItem value="REJECTED">Reject</SelectItem>
                </SelectContent>
              </Select>
              {pmdStatus === 'REJECTED' && (
                <Textarea
                  value={pmdRejectionReason}
                  onChange={(e) => setPmdRejectionReason(e.target.value)}
                  placeholder="Rejection reason"
                  className="resize-none mt-2 h-12"
                />
              )}
              <Button
                onClick={handleSubmit}
                disabled={!pmdStatus || (pmdStatus === 'REJECTED' && !pmdRejectionReason) || isSubmitting}
                className="w-full mt-3"
              >
                {isSubmitting ? 'Updating...' : 'Update Leave Request'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

