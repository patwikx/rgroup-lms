import { Metadata } from "next"
import { OvertimeHeader } from "./components/overtime-header"
import { OvertimeDataTable } from "./components/overtime-data-table"

export const metadata: Metadata = {
  title: 'RD Realty Employee Overtime',
  description: 'Manage system users and their access',
};

export default async function OvertimePage() {
  return (
    <div className="flex flex-col gap-5 p-8">
      <OvertimeHeader />
      <OvertimeDataTable />
    </div>
  )
}