'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { replenishLeaveBalances } from "@/actions/leave-settings";
import { balanceColumns } from "./leave-balances-columns";


interface LeaveBalanceManagementProps {
  initialBalances: any[];
}

export function LeaveBalanceManagement({ initialBalances }: LeaveBalanceManagementProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const router = useRouter();

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  const handleReplenish = async () => {
    try {
      await replenishLeaveBalances(selectedYear);
      router.refresh();
      toast.success("Leave balances replenished successfully");
    } catch (error) {
      toast.error("Failed to replenish leave balances");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Leave Balances</CardTitle>
            <CardDescription>
              Manage employee leave balances for different leave types
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => {
                setSelectedYear(Number(value));
                router.refresh();
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default">Replenish Balances</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Replenish Leave Balances</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset and replenish all employee leave balances for {selectedYear}.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReplenish}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={balanceColumns}
          data={initialBalances}
        />
      </CardContent>
    </Card>
  );
}