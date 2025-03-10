"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { Calendar, Clock, MapPin, User, Briefcase, AlertCircle, Check, X } from "lucide-react"
import type { PendingApprovalWithDetails } from "@/types/type"
import { cn } from "@/lib/utils"

interface ApprovalDialogProps {
  request: PendingApprovalWithDetails | null
  onClose: () => void
  onApprove: (comment: string) => void
  onReject: (comment: string) => void
  loading: boolean
}

// Helper function to safely format dates
const formatDate = (date: string | Date | null) => {
  if (!date) return ""
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return format(dateObj, "MMM d, yyyy")
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Invalid date"
  }
}

export function ApprovalDialog({ request, onClose, onApprove, onReject, loading }: ApprovalDialogProps) {
  const [comment, setComment] = useState("")
  const [approvalStatus, setApprovalStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    if (approvalStatus === "success") {
      const timer = setTimeout(() => {
        onClose()
        setApprovalStatus("idle")
        setComment("") // Reset comment when dialog closes
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [approvalStatus, onClose])

  // Reset comment when dialog opens with new request
  useEffect(() => {
    if (request) {
      setComment("")
      setApprovalStatus("idle")
    }
  }, [request])

  if (!request?.leaveRequest) return null
  const { leaveRequest } = request

  const handleApprove = async () => {
    try {
      setApprovalStatus("idle")
      await onApprove(comment)
      setApprovalStatus("success")
    } catch (error) {
      console.error("Approval error:", error)
      setApprovalStatus("error")
    }
  }

  const handleReject = async () => {
    try {
      setApprovalStatus("idle")
      await onReject(comment)
      setApprovalStatus("success")
    } catch (error) {
      console.error("Rejection error:", error)
      setApprovalStatus("error")
    }
  }

  return (
    <Dialog open={!!request} onOpenChange={() => {
      if (!loading) {
        onClose()
        setComment("")
        setApprovalStatus("idle")
      }
    }}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">Leave Request Review</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                Request #{request.id ? request.id.slice(-8).toUpperCase() : "N/A"}
              </DialogDescription>
            </div>
            <Badge variant={leaveRequest.leaveType?.isPaid ? "default" : "secondary"} className="ml-2">
              {leaveRequest.leaveType?.isPaid ? "Paid Leave" : "Unpaid Leave"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Section 1: Employee Information */}
          <div>
            <h3 className="text-sm font-medium mb-2">Employee Details</h3>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">
                    {leaveRequest.user?.firstName} {leaveRequest.user?.lastName}
                  </h4>
                  <div className="text-sm text-muted-foreground flex items-center gap-4 mt-0.5">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      {leaveRequest.user?.position || "N/A"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {leaveRequest.user?.department || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Leave Details */}
          <div>
            <h3 className="text-sm font-medium mb-2">Leave Details</h3>
            <div className="bg-muted/30 p-3 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Type</label>
                  <p className="font-medium mt-0.5">{leaveRequest.leaveType?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Duration</label>
                  <p className="font-medium mt-0.5">{leaveRequest.daysRequested?.toString() || "N/A"} day(s)</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatDate(leaveRequest.startDate)} - {formatDate(leaveRequest.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {leaveRequest.leaveDay === "FULL"
                      ? "Whole day"
                      : leaveRequest.leaveDay === "FIRST_HALF"
                        ? "Morning"
                        : "Afternoon"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Reason for Leave</label>
                <Textarea readOnly>{leaveRequest.reason || "No reason provided"}</Textarea>
              </div>
            </div>
          </div>

          {/* Section 3: Approval Progress */}
          <div>
            <h3 className="text-sm font-medium mb-2">Approval Progress</h3>
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={cn(
                    "px-2 py-0.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5",
                    leaveRequest.status === "APPROVED" && "bg-primary/10 text-primary",
                    leaveRequest.status === "REJECTED" && "bg-destructive/10 text-destructive",
                    leaveRequest.status === "PENDING" && "bg-yellow-100 text-yellow-700",
                  )}
                >
                  {leaveRequest.status === "PENDING" && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                    </span>
                  )}
                  {leaveRequest.status === "APPROVED" && <Check className="h-3 w-3" />}
                  {leaveRequest.status === "REJECTED" && <X className="h-3 w-3" />}
                  {leaveRequest.status}
                </div>
                {leaveRequest.status === "PENDING" && leaveRequest.approvals && (
                  <span className="text-sm text-muted-foreground">
                    Awaiting{" "}
                    {leaveRequest.approvals.find((a) => a.status === "PENDING")?.level?.toLowerCase() || "approval"}
                  </span>
                )}
              </div>

              <div className="relative flex items-center justify-center max-w-[300px] mx-auto">
                {[
                  {
                    level: "SUPERVISOR",
                    label: "Supervisor",
                    status: leaveRequest.approvals?.find((a) => a.level === "SUPERVISOR")?.status || "PENDING",
                  },
                  {
                    level: "HR",
                    label: "HR",
                    status: leaveRequest.approvals?.find((a) => a.level === "HR")?.status || "PENDING",
                  },
                ].map((step, index) => (
                  <div key={step.level} className="flex items-center flex-1">
                    <div className="flex flex-col items-center relative">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors duration-200",
                          step.status === "APPROVED" && "bg-primary border-primary text-primary-foreground",
                          step.status === "REJECTED" && "bg-destructive border-destructive text-destructive-foreground",
                          step.status === "PENDING" &&
                            leaveRequest.approvals?.find((a) => a.status === "PENDING")?.level === step.level
                            ? "bg-white border-yellow-400 text-yellow-600"
                            : step.status === "PENDING" && "bg-white border-muted-foreground/30 text-muted-foreground",
                        )}
                      >
                        {step.status === "APPROVED" && <Check className="h-4 w-4" />}
                        {step.status === "REJECTED" && <X className="h-4 w-4" />}
                        {step.status === "PENDING" && <span className="text-xs font-medium">{index + 1}</span>}
                      </div>
                      <div className="mt-1.5 text-xs font-medium">{step.label}</div>
                      <div
                        className={cn(
                          "mt-0.5 text-[11px]",
                          step.status === "APPROVED" && "text-primary",
                          step.status === "REJECTED" && "text-destructive",
                          step.status === "PENDING" &&
                            leaveRequest.approvals?.find((a) => a.status === "PENDING")?.level === step.level
                            ? "text-yellow-600"
                            : "text-muted-foreground",
                        )}
                      >
                        {step.status.charAt(0) + step.status.slice(1).toLowerCase()}
                      </div>
                    </div>
                    {index < 1 && (
                      <div className="flex-1 h-[2px] mx-3 bg-muted-foreground/20">
                        <div
                          className={cn(
                            "h-full transition-all duration-500",
                            step.status === "APPROVED"
                              ? "bg-primary w-full"
                              : step.status === "REJECTED"
                                ? "bg-destructive w-full"
                                : "w-0",
                          )}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Comment */}
          <div>
            <h3 className="text-sm font-medium mb-2">Your Comment</h3>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your remarks..."
              className="min-h-[60px] text-sm"
              disabled={loading || approvalStatus !== "idle"}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mr-2" />
            Your decision cannot be changed once submitted
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={loading || approvalStatus !== "idle"}
              className="px-5"
            >
              Reject
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={loading || approvalStatus !== "idle"} 
              className="px-5"
            >
              {loading ? "Processing..." : approvalStatus === "success" ? "Approved" : "Approve"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}