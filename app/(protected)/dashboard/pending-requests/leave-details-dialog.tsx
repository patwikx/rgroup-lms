"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { Calendar, Clock, MapPin, User as UserIcon, Briefcase, AlertCircle, Check, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { LeaveRequest, LeaveType, LeaveApproval, User, LeaveStatus, ApprovalLevel, ApprovalStatus } from "@prisma/client"

type PendingLeaveRequestWithRelations = LeaveRequest & {
  leaveType: LeaveType
  approvals: (LeaveApproval & {
    approver: User
  })[]
  user: User
}

interface LeaveDetailsDialogProps {
  request: PendingLeaveRequestWithRelations | null
  onClose: () => void
  onApprove: (comment: string) => void
  onReject: (comment: string) => void
}

export function LeaveDetailsDialog({ request, onClose, onApprove, onReject }: LeaveDetailsDialogProps) {
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  if (!request) return null

  const handleApprove = () => {
    setLoading(true)
    onApprove(comment)
    setLoading(false)
  }

  const handleReject = () => {
    setLoading(true)
    onReject(comment)
    setLoading(false)
  }

  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">Leave Request Review</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Request #{request.id.slice(-8).toUpperCase()}
              </DialogDescription>
            </div>
            <Badge variant={request.leaveType.isPaid ? "default" : "secondary"} className="ml-2">
              {request.leaveType.isPaid ? "Paid Leave" : "Unpaid Leave"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Section 1: Employee Information */}
          <div>
            <h3 className="text-sm font-medium mb-2.5">Employee Details</h3>
            <div className="bg-muted/50 p-3.5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">
                    {request.user.firstName} {request.user.lastName}
                  </h4>
                  <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      {request.user.position}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {request.user.department}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Leave Details */}
          <div>
            <h3 className="text-sm font-medium mb-2.5">Leave Details</h3>
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Type</label>
                  <p className="font-medium mt-0.5">{request.leaveType.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Duration</label>
                  <p className="font-medium mt-0.5">{request.daysRequested} day(s)</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(request.startDate, 'MMM d')} - {format(request.endDate, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {request.leaveDay === 'FULL' ? 'Whole day' : 
                     request.leaveDay === 'FIRST_HALF' ? 'Morning' : 'Afternoon'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-sm text-muted-foreground block mb-1.5">Reason for Leave</label>
                <div className="text-sm">{request.reason}</div>
              </div>
            </div>
          </div>

          {/* Section 3: Approval Progress */}
          <div>
            <h3 className="text-sm font-medium mb-2.5">Approval Progress</h3>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className={cn(
                  "px-2 py-0.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5",
                  request.status === 'APPROVED' && "bg-primary/10 text-primary",
                  request.status === 'REJECTED' && "bg-destructive/10 text-destructive",
                  request.status === 'PENDING' && "bg-yellow-100 text-yellow-700"
                )}>
                  {request.status === 'PENDING' && <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                  </span>}
                  {request.status === 'APPROVED' && <Check className="h-3 w-3" />}
                  {request.status === 'REJECTED' && <X className="h-3 w-3" />}
                  {request.status}
                </div>
                {request.status === 'PENDING' && (
                  <span className="text-sm text-muted-foreground">
                    Awaiting {request.approvals.find(a => a.status === 'PENDING')?.level.toLowerCase()} approval
                  </span>
                )}
              </div>
              
              <div className="relative flex items-center justify-center max-w-[300px] mx-auto">
                {[
                  { level: 'SUPERVISOR' as ApprovalLevel, label: 'Supervisor', status: request.approvals.find(a => a.level === 'SUPERVISOR')?.status || 'PENDING' },
                  { level: 'HR' as ApprovalLevel, label: 'HR', status: request.approvals.find(a => a.level === 'HR')?.status || 'PENDING' }
                ].map((step, index) => (
                  <div key={step.level} className="flex items-center flex-1">
                    <div className="flex flex-col items-center relative">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-200",
                        step.status === 'APPROVED' && "bg-primary border-primary text-primary-foreground",
                        step.status === 'REJECTED' && "bg-destructive border-destructive text-destructive-foreground",
                        step.status === 'PENDING' && request.approvals.find(a => a.status === 'PENDING')?.level === step.level
                          ? "bg-white border-yellow-400 text-yellow-600"
                          : step.status === 'PENDING' && "bg-white border-muted-foreground/30 text-muted-foreground"
                      )}>
                        {step.status === 'APPROVED' && <Check className="h-4 w-4" />}
                        {step.status === 'REJECTED' && <X className="h-4 w-4" />}
                        {step.status === 'PENDING' && (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="mt-2 text-xs font-medium">{step.label}</div>
                      <div className={cn(
                        "mt-0.5 text-[11px]",
                        step.status === 'APPROVED' && "text-primary",
                        step.status === 'REJECTED' && "text-destructive",
                        step.status === 'PENDING' && request.approvals.find(a => a.status === 'PENDING')?.level === step.level
                          ? "text-yellow-600"
                          : "text-muted-foreground"
                      )}>
                        {step.status.charAt(0) + step.status.slice(1).toLowerCase()}
                      </div>
                    </div>
                    {index < 1 && (
                      <div className="flex-1 h-[2px] mx-3 bg-muted-foreground/20">
                        <div className={cn(
                          "h-full transition-all duration-500",
                          step.status === 'APPROVED' ? "bg-primary w-full" : 
                          step.status === 'REJECTED' ? "bg-destructive w-full" : "w-0"
                        )} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}