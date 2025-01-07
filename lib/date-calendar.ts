import { LeaveDay } from "@prisma/client";

export function calculateLeaveDuration(
  startDate: Date | undefined,
  endDate: Date | undefined,
  leaveDay: LeaveDay
): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate the difference in days
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Adjust based on leave day type
  switch (leaveDay) {
    case "FIRST_HALF":
    case "SECOND_HALF":
      return 0.5;
    case "FULL":
    default:
      return diffDays;
  }
}