
import { DateRangePicker } from "./components/date-range-picker";
import { LeaveReportsTable } from "./components/leave-reports-table"

import { getLeaves } from "@/actions/get-leaves";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { from?: string; to?: string }
}) {
  const leaves = await getLeaves(searchParams?.from, searchParams?.to)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Leave Reports</h1>
      <DateRangePicker />
      <LeaveReportsTable leaves={leaves} />
    </div>
  )
}

