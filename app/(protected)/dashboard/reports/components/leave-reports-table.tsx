import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { format } from "date-fns"
  import { Badge } from "@/components/ui/badge"
  import { ApprovalStatus } from "@prisma/client"
  
  function getStatusBadgeColor(status: string) {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  function calculateOverallStatus(supervisorStatus?: ApprovalStatus, hrStatus?: ApprovalStatus): ApprovalStatus {
    if (supervisorStatus === 'REJECTED' || hrStatus === 'REJECTED') {
      return 'REJECTED'
    }
    
    if (supervisorStatus === 'APPROVED' && hrStatus === 'APPROVED') {
      return 'APPROVED'
    }
    
    return 'PENDING'
  }
  
  export function LeaveReportsTable({ leaves }: { leaves: any[] }) {
    return (
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Creation Date</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Supervisor Status</TableHead>
              <TableHead>HR Status</TableHead>
              <TableHead>Overall Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map((leave) => {
              const supervisorApproval = leave.approvals.find((a: { level: string; status: ApprovalStatus }) => a.level === 'SUPERVISOR')
              const hrApproval = leave.approvals.find((a: { level: string; status: ApprovalStatus }) => a.level === 'HR')
              const overallStatus = calculateOverallStatus(
                supervisorApproval?.status,
                hrApproval?.status
              )
  
              return (
                <TableRow key={leave.id}>
                  <TableCell>
                    {leave.employee.firstName} {leave.employee.lastName}
                  </TableCell>
                  <TableCell>{leave.employee.department}</TableCell>
                  <TableCell>{leave.leaveType.name}</TableCell>
                  <TableCell>{format(new Date(leave.createdAt), 'PP')}</TableCell>
                  <TableCell>{format(new Date(leave.startDate), 'PP')}</TableCell>
                  <TableCell>{format(new Date(leave.endDate), 'PP')}</TableCell>
                  <TableCell>{leave.daysRequested.toString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(supervisorApproval?.status || 'PENDING')}>
                      {supervisorApproval?.status || 'PENDING'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(hrApproval?.status || 'PENDING')}>
                      {hrApproval?.status || 'PENDING'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(overallStatus)}>
                      {overallStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
            {leaves.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  No leaves found for the selected period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    )
  }
  