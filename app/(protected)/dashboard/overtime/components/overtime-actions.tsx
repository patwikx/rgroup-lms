'use client'

import { approveOvertime, cancelOvertime, rejectOvertime } from "@/actions/overtime"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Overtime, OvertimeStatus } from "@prisma/client"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

interface OvertimeActionsProps {
  overtime: Overtime
  isSupervisor: boolean
}

export function OvertimeActions({ overtime, isSupervisor }: OvertimeActionsProps) {
  const { toast } = useToast()
  const router = useRouter()

  async function onApprove() {
    try {
      await approveOvertime(overtime.id)
      toast({
        title: "Success",
        description: "Overtime request approved",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve overtime request",
        variant: "destructive",
      })
    }
  }

  async function onReject() {
    try {
      await rejectOvertime(overtime.id)
      toast({
        title: "Success",
        description: "Overtime request rejected",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject overtime request",
        variant: "destructive",
      })
    }
  }

  async function onCancel() {
    try {
      await cancelOvertime(overtime.id)
      toast({
        title: "Success",
        description: "Overtime request cancelled",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel overtime request",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {overtime.status === OvertimeStatus.PENDING && (
          <>
            {isSupervisor && (
              <>
                <DropdownMenuItem onClick={onApprove}>
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onReject}>
                  Reject
                </DropdownMenuItem>
              </>
            )}
            {!isSupervisor && (
              <DropdownMenuItem onClick={onCancel}>
                Cancel
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}