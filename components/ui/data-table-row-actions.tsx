import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toast } from "sonner";
import { updateLeaveType } from "@/actions/leave-settings";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const leaveType = row.original as any;

  const handleToggleApproval = async () => {
    try {
      await updateLeaveType(leaveType.id, {
        requiresApproval: !leaveType.requiresApproval,
      });
      toast.success("Leave type updated successfully");
    } catch (error) {
      toast.error("Failed to update leave type");
    }
  };

  const handleTogglePaid = async () => {
    try {
      await updateLeaveType(leaveType.id, {
        isPaid: !leaveType.isPaid,
      });
      toast.success("Leave type updated successfully");
    } catch (error) {
      toast.error("Failed to update leave type");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleToggleApproval}>
          Toggle Approval Required
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTogglePaid}>
          Toggle Paid Status
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}