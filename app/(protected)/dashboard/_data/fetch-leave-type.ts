import { prisma } from "@/lib/db";

export const fetchLeaveType = async () => {
  try {
    const leaveTypes = await prisma.leaveType.findMany({
    });
    return leaveTypes;
  } catch (error) {
    console.error('Error fetching leave data:', error);
    return [];
  }
};
