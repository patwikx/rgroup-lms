import { getUserLeaveHistory } from "@/actions/leave-history";
import { LeaveHistory } from "./components/leave-history";


export default async function LeaveHistoryPage() {
  const initialRequests = await getUserLeaveHistory();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">My Leave History</h1>
      <LeaveHistory initialRequests={initialRequests} />
    </div>
  );
}