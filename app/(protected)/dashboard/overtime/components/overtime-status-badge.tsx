import { Badge } from "@/components/ui/badge"
import { OvertimeStatus } from "@prisma/client"

interface OvertimeStatusBadgeProps {
  status: OvertimeStatus
}

export function OvertimeStatusBadge({ status }: OvertimeStatusBadgeProps) {
  const statusConfig = {
    [OvertimeStatus.PENDING]: {
      label: "Pending",
      variant: "default",
    },
    [OvertimeStatus.APPROVED]: {
      label: "Approved",
      variant: "success",
    },
    [OvertimeStatus.REJECTED]: {
      label: "Rejected",
      variant: "destructive",
    },
    [OvertimeStatus.CANCELLED]: {
      label: "Cancelled",
      variant: "secondary",
    },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant as any}>
      {config.label}
    </Badge>
  )
}