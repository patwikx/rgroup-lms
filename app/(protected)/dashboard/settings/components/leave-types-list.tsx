'use client'

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { columns } from "./columns";
import { LeaveType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { LeaveTypeForm } from "./leave-types-form";
import { DataTable } from "@/components/ui/data-table";

interface LeaveTypesListProps {
  leaveTypes: LeaveType[];
}

export function LeaveTypesList({ leaveTypes }: LeaveTypesListProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Leave Types</CardTitle>
            <CardDescription>
              Manage the different types of leave available in your organization
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Leave Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Leave Type</DialogTitle>
                <DialogDescription>
                  Add a new type of leave to your organization
                </DialogDescription>
              </DialogHeader>
              <LeaveTypeForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={leaveTypes}
        />
      </CardContent>
    </Card>
  );
}