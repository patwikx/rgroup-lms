import { LeaveDay } from "@prisma/client";

export function calculateLeaveDays(
  startDate: Date,
  endDate: Date,
  leaveDay: LeaveDay
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // If same day and half day
  if (start.getTime() === end.getTime() && leaveDay !== LeaveDay.FULL) {
    return 0.5;
  }

  // Calculate business days between dates
  let days = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }

  // Adjust for half days
  if (leaveDay !== LeaveDay.FULL) {
    days -= 0.5;
  }

  return days;
}