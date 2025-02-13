import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { LeaveType } from "@prisma/client";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";



export const columns: ColumnDef<LeaveType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "annualAllowance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Annual Allowance" />
    ),

  },
  {
    accessorKey: "isPaid",
    header: "Paid Leave",
    cell: ({ row }) => (
      <Badge variant={row.original.isPaid ? "default" : "secondary"}>
        {row.original.isPaid ? "Paid" : "Unpaid"}
      </Badge>
    ),
  },
  {
    accessorKey: "requiresApproval",
    header: "Approval Required",
    cell: ({ row }) => (
      <Badge variant={row.original.requiresApproval ? "default" : "secondary"}>
        {row.original.requiresApproval ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];