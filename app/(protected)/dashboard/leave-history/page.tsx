import { getUserLeaveHistory } from "@/actions/leave-history";
import { LeaveHistory } from "./components/leave-history";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'RD Realty Employee Leave History',
  description: 'Manage system users and their access',
};

export default async function LeaveHistoryPage() {
  const initialRequests = await getUserLeaveHistory();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">My Leave History</h1>
      <LeaveHistory initialRequests={initialRequests} />
    </div>
  );
}