"use client"

import { createOvertime } from "@/actions/overtime"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useState } from "react"
import { CalendarIcon, Clock, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TimePicker } from "./time-picker"

export function OvertimeDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>()
  const [startTime, setStartTime] = useState<string>()
  const [endTime, setEndTime] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const isTimeValid = () => {
    if (!startTime || !endTime) return true
    const [startHour, startMinute] = startTime.split(":").map(Number)
    const [endHour, endMinute] = endTime.split(":").map(Number)
    return endHour > startHour || (endHour === startHour && endMinute > startMinute)
  }

  async function onSubmit(formData: FormData) {
    try {
      if (!isTimeValid()) {
        toast({
          title: "Invalid Time Selection",
          description: "End time must be after start time",
          variant: "destructive",
        })
        return
      }

      setIsSubmitting(true)
      if (date) {
        formData.set("date", format(date, "yyyy-MM-dd"))
      }
      if (startTime) {
        formData.set("startTime", startTime)
      }
      if (endTime) {
        formData.set("endTime", endTime)
      }
      await createOvertime(formData)
      setOpen(false)
      toast({
        title: "Request Submitted",
        description: "Your overtime request has been submitted successfully",
      })
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your overtime request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <Clock className="h-5 w-5 text-primary" />
              <span>File Overtime Request</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Please fill in the details of your overtime work for approval
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right text-sm font-medium">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("col-span-3 justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm font-medium">Start Time</Label>
              <div className="col-span-3">
                <TimePicker value={startTime} onChange={setStartTime} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm font-medium">End Time</Label>
              <div className="col-span-3">
                <TimePicker value={endTime} onChange={setEndTime} />
              </div>
            </div>
            {!isTimeValid() && (
              <Alert variant="destructive" className="col-span-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>End time must be after start time</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right text-sm font-medium">
                Reason
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="relative">
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Please provide a detailed reason for your overtime work..."
                    className="min-h-[100px] resize-none"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Please be specific about the tasks and reasons requiring overtime work
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !date || !startTime || !endTime || !isTimeValid()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

