"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Row } from "@tanstack/react-table";
import { useEffect, useState, useTransition } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Leaves } from "../data/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Controller, useForm } from "react-hook-form";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApproveLeaveSchema, ApprovePMDSchema } from "@/schemas";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { Statuses } from "@prisma/client";
import { ApproveLeaveRequest } from "@/actions/approve-leave";
import { Badge } from "@/components/ui/badge";
import { ApprovePMDRequest } from "@/actions/approve-leave-pmd";

type RowData = Row<Leaves>;
const CellComponent = ({ row }: { row: RowData }) => {
  const leaves = row.original;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLeaves, setSelectedLeaves] = useState<Leaves | null>(null);


  const handleOpenModal = () => {
    setSelectedLeaves(leaves);
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLeaves(null);
    setIsOpen(false);
  };

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const user = useCurrentUser();

  if (!user) {
    return <p className='flex flex-col items-center justify-center text-center'>Unauthorized access.</p>;
  }

  const isAdmin = user?.role === 'Administrator';
  const isApprover = user?.role === 'Approver'
  const isPMD = user?.role === 'PMD';

  if (!isAdmin && !isPMD && !isApprover) {
    return <p className='flex flex-col items-center justify-center text-center'>Unauthorized access.</p>;
  }

  const form = useForm<z.infer<typeof ApprovePMDSchema>>({
    resolver: zodResolver(ApprovePMDSchema),
    defaultValues: {
      status: undefined,
      pmdStatus: undefined,
      pmdRemarks: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ApprovePMDSchema>) => {
    setError("");
    setSuccess("");
  
    // Check if selectedLeaves is not null and selectedLeaves.id is a string
    if (selectedLeaves?.id) {
      startTransition(() => {
        // Determine the status based on pmdStatus
        let newStatus: "Approved" | "Declined";
  
        if (values.pmdStatus === Statuses.Declined) {
          newStatus = "Declined";
        } else {
          newStatus = "Approved"; // Default to "Approved" if pmdStatus is not "Declined"
        }
  
        // Include the updated status in the request
        ApprovePMDRequest({ ...values, id: selectedLeaves.id, status: newStatus })
          .then((data) => {
            setError(data.error);
            setSuccess(data.success);
  
            if (!data.error) {
              form.reset();
            }
          })
          .finally(() => {
            setTimeout(() => {
              setError(undefined);
              setSuccess(undefined);
            }, 5000);
          });
      });
    } else {
      setError("Selected leave is not valid");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className="w-8 h-8 p-0">
            <MoreHorizontal className="h-4 w-4"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleOpenModal}>
              View Leave Details
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex justify-center items-center z-50">
        <Dialog open={isOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="sm:max-w-[550px]">
            <CardTitle>Leave Details
              <CardDescription className="mb-4">Fill in the form below to update tenant details.</CardDescription>

              <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
          {( isApprover || isAdmin || isPMD ) && ( 
            <div className="flex space-x-4">
          
              <div className="w-1/2">
                <div>
                <FormLabel className="font-semibold">Name</FormLabel>
                      <Input
                        value={`${selectedLeaves?.user.firstName || ''} ${selectedLeaves?.user.lastName || ''}`}
                        disabled={isPending}
                        readOnly
                      />
                </div>
              </div>
              <div className="w-1/2">
              <FormLabel className="font-semibold">Leave Type</FormLabel>
                            <Select>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={selectedLeaves?.leaveType} aria-readonly />
                              </SelectTrigger>
                            </Select>
              </div>
              
            </div>
            )}
             {( isApprover || isAdmin || isPMD ) && ( 
            <div className="flex space-x-4 mt-4">
              <div className="w-1/2">
              <FormLabel className="font-semibold">Start Date</FormLabel>
                        <Input value={selectedLeaves?.startDate} readOnly />
              </div>
              <div className="w-1/2">
              <FormLabel className="font-semibold">End Date</FormLabel>
                        <Input value={selectedLeaves?.endDate} readOnly />
              </div>
            </div>
             )}
  {( isApprover || isAdmin || isPMD ) && ( 
            <div className="mt-4 mb-4">
            <FormLabel className="font-semibold">Reason</FormLabel>
                      <Textarea
                        value={selectedLeaves?.reason}
                        disabled
                        placeholder="Enter reason here..."
                        className="h-[100px]"
                        readOnly
                      />
            </div>
             )}
            <div className="flex space-x-4">
              <div className="w-1/2">
              <FormLabel className="font-semibold">Approver Status</FormLabel>
                        <Input value={selectedLeaves?.status} readOnly className="mt-2" />
              </div>
              
              <div className="w-1/2">
              <FormLabel className="font-semibold">Approver Remarks</FormLabel>
                        <Input value={selectedLeaves?.approverRemarks} readOnly className="mt-2" />
              </div>
            </div>
            
            <div className="mt-4 mb-4">
            {( isAdmin || isPMD ) && (
              <FormField
                control={form.control}
                name="pmdStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">PMD Status</FormLabel>
                    <FormControl>
                      <Controller
                        name="pmdStatus"
                        control={form.control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isPending}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={Statuses.Approved}>Approve</SelectItem>
                              <SelectItem value={Statuses.Declined}>Decline</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              )}
            </div>
            {( isAdmin || isPMD ) && (
            <div className="mt-4 mb-4">
              <FormField
                control={form.control}
                name="pmdRemarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">PMD Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isPending}
                        placeholder="Enter approver remarks here..."
                        className="h-[70px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            )}
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button disabled={isPending} type="submit" className="w-full mt-4">
              Update Leave Request
            </Button>
          </form>
        </Form>
            </CardTitle>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export const columns: ColumnDef<Leaves>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "user.image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="" />
    ),
  },
  {
    id: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <span>
        {row.original.user.firstName} {row.original.user.lastName}
      </span>
    ),
  },
  {
    accessorKey: "leaveType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Leave Type" />
    ),
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
  },

  {
    accessorKey: "reason",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reason" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Approver Status" />
    ),
    // Use a custom cell renderer to display the content as a badge
    cell: ({ row }) => {
      const status = row.original.status; // Accessing the status value from the row data
  
      // Determine badge color based on status
      let badgeColor;
      switch (status) {
        case 'Pending':
          badgeColor = 'warning';
          break;
        case 'Approved':
          badgeColor = 'success';
          break;
        case 'Rejected':
          badgeColor = 'danger';
          break;
        default:
          badgeColor = 'primary';
      }
  
      return (
        <Badge color={badgeColor}>{status}</Badge>
      );
    }
  },
  {
    accessorKey: "approverRemarks",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Approver Remarks" />
    ),
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: CellComponent, // Use the component you defined above
  },
];
