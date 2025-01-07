import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Badge } from '@/components/ui/badge';
  import { format } from 'date-fns';
  import type { LeaveRequest, LeaveType } from '@prisma/client';
  
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  } as const;
  
  interface LeaveRequestsTableProps {
    requests: (LeaveRequest & {
      leaveType: LeaveType;
    })[];
  }
  
  export function LeaveRequestsTable({ requests }: LeaveRequestsTableProps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>View and manage your leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.leaveType.name}</TableCell>
                  <TableCell>
                    {format(new Date(request.startDate), 'PP')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.endDate), 'PP')}
                  </TableCell>
                  <TableCell>{request.daysRequested.toString()}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[request.status]}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.createdAt), 'PP')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }