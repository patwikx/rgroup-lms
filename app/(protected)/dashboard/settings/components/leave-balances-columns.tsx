import { ColumnDef } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { updateLeaveBalance } from "@/actions/leave-settings";


export const balanceColumns: ColumnDef<any>[] = [
  {
    accessorKey: "employee.firstName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
  },
  {
    accessorKey: "employee.lastName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
  },
  {
    accessorKey: "leaveType.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Leave Type" />
    ),
  },
  {
    accessorKey: "balance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Balance" />
    ),
    cell: ({ row }) => (
      <Input
        type="number"
        defaultValue={row.original.balance}
        className="w-24"
        onChange={(e) => {
          // Handle balance update through server action
          const newBalance = parseFloat(e.target.value);
          if (!isNaN(newBalance)) {
            updateLeaveBalance(row.original.id, newBalance);
          }
        }}
      />
    ),
  },
  {
    accessorKey: "used",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Used" />
    ),
  },
  {
    accessorKey: "pending",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pending" />
    ),
  },
];