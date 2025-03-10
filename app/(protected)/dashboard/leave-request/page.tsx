import { getLeaveTypes } from "@/actions/leave-type";
import { LeaveRequestForm } from "./form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'RD Realty Employee Leave Requests',
  description: 'Manage system users and their access',
};

export default async function LeaveRequestPage() {
  const leaveTypes = await getLeaveTypes();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Submit Leave Request</h1>
      <LeaveRequestForm leaveTypes={leaveTypes} />
    </div>
  );
}