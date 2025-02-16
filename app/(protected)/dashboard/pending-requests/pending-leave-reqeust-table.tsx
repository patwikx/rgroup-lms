"use client"

import { useState } from "react"
import { LeaveRequest, LeaveType, LeaveApproval, User, LeaveDay, LeaveStatus } from "@prisma/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Calendar, MoreHorizontal, Search, AlertCircle } from 'lucide-react'
import { LeaveDetailsDialog } from "./leave-details-dialog"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation"

type PendingLeaveRequestWithRelations = LeaveRequest & {
  leaveType: LeaveType
  approvals: (LeaveApproval & {
    approver: User
  })[]
  user: User
}

interface PendingLeaveRequestsTableProps {
  leaveRequests: PendingLeaveRequestWithRelations[]
}

export default function PendingLeaveRequestsTable({
  leaveRequests,
}: PendingLeaveRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<PendingLeaveRequestWithRelations | null>(null)
  const itemsPerPage = 5

  const filteredRequests = leaveRequests.filter((request) =>
    request.leaveType.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)

  const getLeaveDayLabel = (leaveDay: LeaveDay) => {
    switch (leaveDay) {
      case "FULL":
        return "Whole day"
      case "FIRST_HALF":
        return "Morning"
      case "SECOND_HALF":
        return "Afternoon"
      default:
        return leaveDay
    }
  }

  const handleApprove = (comment: string) => {
    // Implement approval logic here
    console.log("Approved with comment:", comment)
    setSelectedRequest(null)
  }

  const handleReject = (comment: string) => {
    // Implement rejection logic here
    console.log("Rejected with comment:", comment)
    setSelectedRequest(null)
  }

  const router = useRouter()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leave type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => router.push('/dashboard/leave-request')}>
          New Leave Request
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Leave Type</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Leave Day</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approvals</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.leaveType.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(request.startDate, "MMM d, yyyy")} -{" "}
                      {format(request.endDate, "MMM d, yyyy")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{request.daysRequested}</TableCell>
                <TableCell>{getLeaveDayLabel(request.leaveDay)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{request.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {request.approvals.length} Approval{request.approvals.length !== 1 && "s"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setSelectedRequest(request)}>
                          <MagnifyingGlassIcon className="w-4 h-4 mr-2 ml-[-10px]" />View details
                        </Button>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Update request</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Cancel request</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filteredRequests.length > itemsPerPage && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((old) => Math.max(old - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((old) => Math.min(old + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
      {filteredRequests.length === 0 && (
        <div className="text-center py-4">
          <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-lg font-semibold">No matching leave requests found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search terms</p>
        </div>
      )}
      <LeaveDetailsDialog
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}