'use client'

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { createLeaveRequest } from "@/actions/leave-request";
import { toast } from "sonner";
import { LeaveRequestSchema } from "@/schemas";
import { cn } from "@/lib/utils";
import type { LeaveType } from "@prisma/client";
import { calculateLeaveDuration } from "@/lib/date-calendar";
import { useRouter } from "next/navigation";

// Philippines is UTC+8
const PH_OFFSET = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

function toPhilippinesTime(date: Date): Date {
  // Create a new date object to avoid modifying the original
  const newDate = new Date(date);
  // Set the time to noon (12:00:00) to avoid any DST issues
  newDate.setHours(12, 0, 0, 0);
  return newDate;
}

interface LeaveRequestFormProps {
  leaveTypes: LeaveType[];
}

type FormValues = {
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  leaveDay: "FULL" | "FIRST_HALF" | "SECOND_HALF";
  reason: string;
};

export function LeaveRequestForm({ leaveTypes }: LeaveRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [leaveDays, setLeaveDays] = useState(0);
  const [isHalfDayDisabled, setIsHalfDayDisabled] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [minNoticeDate, setMinNoticeDate] = useState<Date | null>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(LeaveRequestSchema),
    defaultValues: {
      leaveDay: "FULL",
    },
  });

  useEffect(() => {
    if (selectedLeaveType?.name === "VL" || selectedLeaveType?.name === "ML") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setMinNoticeDate(addDays(today, 3));
    } else {
      setMinNoticeDate(null);
    }
  }, [selectedLeaveType]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "startDate" || name === "endDate" || name === "leaveDay") {
        const startDate = form.getValues("startDate");
        const endDate = form.getValues("endDate");
        const leaveDay = form.getValues("leaveDay");

        const days = calculateLeaveDuration(startDate, endDate, leaveDay);
        setLeaveDays(days);

        if (days > 1) {
          setIsHalfDayDisabled(true);
          if (leaveDay !== "FULL") {
            form.setValue("leaveDay", "FULL");
          }
        } else {
          setIsHalfDayDisabled(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("leaveTypeId", values.leaveTypeId);
      
      // Ensure dates are in the correct format with time set to noon
      const startDate = toPhilippinesTime(values.startDate);
      const endDate = toPhilippinesTime(values.endDate);
      
      formData.append("startDate", startDate.toISOString());
      formData.append("endDate", endDate.toISOString());
      formData.append("leaveDay", values.leaveDay);
      formData.append("reason", values.reason);
  
      const result = await createLeaveRequest(formData);
  
      if (!result.success) {
        toast.error(result.error);
        return;
      }
  
      toast.success("Leave request submitted successfully");
      form.reset();
  
      // Add a 2-second delay before navigating
      await new Promise((resolve) => setTimeout(resolve, 2000));
  
      router.push("/dashboard");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="leaveTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leave Type</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  const leaveType = leaveTypes.find(lt => lt.id === value);
                  setSelectedLeaveType(leaveType || null);
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.description} ({type.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
              {minNoticeDate && (
                <p className="text-sm text-muted-foreground mt-2 text-red-500">
                  Note: This leave type requires at least 3 days notice. 
                  Earliest possible start date is {format(minNoticeDate, "PPP")}.
                </p>
              )}
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        if (minNoticeDate) {
                          return date < today || date < minNoticeDate;
                        }
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < (form.watch("startDate") || new Date())
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {leaveDays > 0 && (
          <div className="text-sm text-muted-foreground">
            Total leave days: <span className="font-medium">{leaveDays}</span>
          </div>
        )}

        <FormField
          control={form.control}
          name="leaveDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day Type</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isHalfDayDisabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day type..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FULL">Whole Day (1)</SelectItem>
                  <SelectItem value="FIRST_HALF" disabled={isHalfDayDisabled}>
                    Half Day (0.5)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please provide a detailed reason for your leave request"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit Leave Request"}
        </Button>
      </form>
    </Form>
  );
}