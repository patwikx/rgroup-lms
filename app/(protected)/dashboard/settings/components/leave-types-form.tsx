import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createLeaveType, updateLeaveType } from "@/actions/leave-settings";
import { LeaveType } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const leaveTypeSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().nullish(),
  annualAllowance: z.number().min(0),
  requiresApproval: z.boolean(),
  isPaid: z.boolean(),
  minNoticeDays: z.number().min(0),
  maxConsecutiveDays: z.number().nullish(),
  allowsHalfDay: z.boolean(),
});

type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>;

interface LeaveTypeFormProps {
  initialData?: LeaveType;
  onSuccess?: () => void;
}

export function LeaveTypeForm({ initialData, onSuccess }: LeaveTypeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      annualAllowance: initialData?.annualAllowance ?? 0,
      requiresApproval: initialData?.requiresApproval ?? true,
      isPaid: initialData?.isPaid ?? true,
      minNoticeDays: initialData?.minNoticeDays ?? 0,
      maxConsecutiveDays: initialData?.maxConsecutiveDays ?? null,
      allowsHalfDay: initialData?.allowsHalfDay ?? true,
    },
  });

  async function onSubmit(data: LeaveTypeFormValues) {
    try {
      setIsLoading(true);
      // Convert empty string to null for optional fields
      const formattedData = {
        ...data,
        description: data.description || undefined,
        maxConsecutiveDays: data.maxConsecutiveDays ?? undefined,
      };

      if (initialData) {
        await updateLeaveType(initialData.id, formattedData);
        toast.success("Leave type updated successfully");
      } else {
        await createLeaveType(formattedData);
        toast.success("Leave type created successfully");
      }
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(initialData ? "Failed to update leave type" : "Failed to create leave type");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="annualAllowance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Allowance (days)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minNoticeDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Notice (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxConsecutiveDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Consecutive Days</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="requiresApproval"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Requires Approval</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPaid"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Paid Leave</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowsHalfDay"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Allow Half Day</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button disabled={isLoading} type="submit" className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update" : "Create"} Leave Type
        </Button>
      </form>
    </Form>
  );
}