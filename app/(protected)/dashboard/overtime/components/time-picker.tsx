"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  className?: string
  minTime?: string
}

const QuickTimeOptions = [
  { label: "Start of Day", time: "09:00" },
  { label: "Lunch Time", time: "12:00" },
  { label: "End of Day", time: "17:00" },
]

export function TimePicker({ value, onChange, className, minTime }: TimePickerProps) {
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"))
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"))

  const [selectedHour, selectedMinute] = value?.split(":") || []
  const [isOpen, setIsOpen] = React.useState(false)
  const [isPM, setIsPM] = React.useState(() => {
    if (!selectedHour) return true // Update: Default to true if no selected hour
    return Number.parseInt(selectedHour) >= 12
  })

  const [minHour, minMinute] = minTime?.split(":") || ["00", "00"]

  const isTimeDisabled = (hour: string, minute = "00", pm: boolean) => {
    if (!minTime) return false

    const h = pm ? (hour === "12" ? 12 : Number.parseInt(hour) + 12) : hour === "12" ? 0 : Number.parseInt(hour)
    const timeValue = h * 60 + Number.parseInt(minute)
    const minTimeValue = Number.parseInt(minHour) * 60 + Number.parseInt(minMinute)

    return timeValue < minTimeValue
  }

  const handleTimeChange = (hour: string, minute: string) => {
    const h = isPM
      ? hour === "12"
        ? "12"
        : (Number.parseInt(hour) + 12).toString().padStart(2, "0")
      : hour === "12"
        ? "00"
        : hour.padStart(2, "0")

    if (!isTimeDisabled(hour, minute, isPM)) {
      onChange?.(`${h}:${minute}`)
    }
  }

  const formatTimeDisplay = (hour: string, minute: string) => {
    const h = Number.parseInt(hour)
    const displayHour = h === 0 ? "12" : h > 12 ? (h - 12).toString() : h.toString()
    const meridiem = h >= 12 ? "PM" : "AM"
    return `${displayHour}:${minute} ${meridiem}`
  }

  const handleMeridiemChange = (pm: boolean) => {
    setIsPM(pm)
    if (selectedHour && selectedMinute) {
      const currentHour = Number.parseInt(selectedHour)
      let newHour: number

      if (pm && currentHour < 12) {
        newHour = currentHour + 12
      } else if (!pm && currentHour >= 12) {
        newHour = currentHour - 12
      } else {
        return // No change needed
      }

      const newHourStr = (newHour === 0 ? "12" : newHour.toString()).padStart(2, "0")
      if (!isTimeDisabled(newHourStr, selectedMinute, pm)) {
        handleTimeChange(newHourStr, selectedMinute)
      }
    }
  }

  // Get the current selected hour in 12-hour format
  const currentHour12 = React.useMemo(() => {
    if (!selectedHour) return "12"
    const h = Number.parseInt(selectedHour)
    if (h === 0) return "12"
    if (h > 12) return (h - 12).toString().padStart(2, "0")
    return selectedHour
  }, [selectedHour])

  // Format min time for display
  const minTimeDisplay = React.useMemo(() => {
    if (!minTime) return null
    const [h, m] = minTime.split(":")
    const hour = Number.parseInt(h)
    const meridiem = hour >= 12 ? "PM" : "AM"
    const displayHour = hour === 0 ? "12" : hour > 12 ? (hour - 12).toString() : hour.toString()
    return `${displayHour}:${m} ${meridiem}`
  }, [minTime])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal hover:bg-accent hover:text-accent-foreground",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTimeDisplay(selectedHour, selectedMinute) : "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Separator className="my-2" />
        <div className="grid grid-cols-3 gap-4 p-4 pt-2">
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground text-center">Hour</h4>
            <ScrollArea className="h-[280px] rounded-md border">
              <div className="p-2">
                {hours.map((hour) => {
                  const isDisabled = isTimeDisabled(hour, selectedMinute || "00", isPM)

                  return (
                    <Button
                      key={hour}
                      variant="ghost"
                      disabled={isDisabled}
                      className={cn(
                        "w-full justify-center font-normal mb-1",
                        currentHour12 === hour && "bg-accent text-accent-foreground",
                        isDisabled && "opacity-50 cursor-not-allowed",
                      )}
                      onClick={() => handleTimeChange(hour, selectedMinute || "00")}
                    >
                      {hour}
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground text-center">Minute</h4>
            <ScrollArea className="h-[280px] rounded-md border">
              <div className="p-2">
                {minutes.map((minute) => {
                  const isDisabled = isTimeDisabled(currentHour12, minute, isPM)

                  return (
                    <Button
                      key={minute}
                      variant="ghost"
                      disabled={isDisabled}
                      className={cn(
                        "w-full justify-center font-normal mb-1",
                        selectedMinute === minute && "bg-accent text-accent-foreground",
                        isDisabled && "opacity-50 cursor-not-allowed",
                      )}
                      onClick={() => handleTimeChange(currentHour12, minute)}
                    >
                      {minute}
                    </Button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground text-center">AM/PM</h4>
            <div className="flex flex-col gap-2 p-2">
              <Button
                variant="ghost"
                disabled={isTimeDisabled(currentHour12, selectedMinute || "00", false)}
                className={cn(
                  "w-full justify-center font-normal",
                  !isPM && "bg-accent text-accent-foreground",
                  isTimeDisabled(currentHour12, selectedMinute || "00", false) && "opacity-50 cursor-not-allowed",
                )}
                onClick={() => handleMeridiemChange(false)}
              >
                AM
              </Button>
              <Button
                variant="ghost"
                disabled={isTimeDisabled(currentHour12, selectedMinute || "00", true)}
                className={cn(
                  "w-full justify-center font-normal",
                  isPM && "bg-accent text-accent-foreground",
                  isTimeDisabled(currentHour12, selectedMinute || "00", true) && "opacity-50 cursor-not-allowed",
                )}
                onClick={() => handleMeridiemChange(true)}
              >
                PM
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4 pt-0">
          <Button className="w-full" onClick={() => setIsOpen(false)}>
            Confirm Selection
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

