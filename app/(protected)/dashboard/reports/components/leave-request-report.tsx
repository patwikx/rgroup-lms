'use client'

import { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { 
  Search, 
  FileSpreadsheet, 
  Filter,
  Calendar,
  Users,
  Clock,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaveStatus } from '@prisma/client';
import { getLeaveRequests } from '@/actions/leave-reports';
import { DatePicker } from '@/components/ui/datepicker';
import { DatePickerx } from './date-picker-reports';

const ITEMS_PER_PAGE = 10;

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export function LeaveRequestsReport({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to get the latest approval comment
  const getLatestApprovalComment = (approvals: any[]) => {
    if (!approvals || approvals.length === 0) return 'No remarks';
    const sortedApprovals = [...approvals].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sortedApprovals[0].comment || 'No remarks';
  };

  // Filter requests based on search term, status, and date range
  const filteredRequests = requests.filter(request => {
    const fullName = `${request.employee.firstName} ${request.employee.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    
    // Date range filter
    let matchesDateRange = true;
    if (startDate && endDate) {
      const requestDate = new Date(request.createdAt);
      matchesDateRange = isWithinInterval(requestDate, {
        start: startOfDay(startDate),
        end: endOfDay(endDate)
      });
    }

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentRequests = filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleStatusChange = async (status: LeaveStatus | 'ALL') => {
    setStatusFilter(status);
    if (status === 'ALL') {
      const allRequests = await getLeaveRequests();
      setRequests(allRequests);
    } else {
      const filteredRequests = await getLeaveRequests(status);
      setRequests(filteredRequests);
    }
    setCurrentPage(1);
  };

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleExportToExcel = () => {
    const data = filteredRequests.map(request => ({
      'Employee': `${request.employee.firstName} ${request.employee.lastName}`,
      'Department': request.employee.department,
      'Position': request.employee.position,
      'Leave Type': request.leaveType.name,
      'Start Date': format(new Date(request.startDate), 'PP'),
      'End Date': format(new Date(request.endDate), 'PP'),
      'Days Requested': request.daysRequested,
      'Approver Status': request.status,
      'PMD Status': request.pmdStatus || 'N/A',
      'Reason': request.reason,
      'Rejection Reason': request.rejectionReason || 'N/A',
      'PMD Rejection Reason': request.pmdRejectionReason || 'N/A',
      'Approver Remarks': getLatestApprovalComment(request.approvals),
      'Approver': request.employee.approver 
        ? `${request.employee.approver.firstName} ${request.employee.approver.lastName}`
        : 'N/A',
      'Created At': format(new Date(request.createdAt), 'PPpp'),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Requests');
    XLSX.writeFile(wb, 'leave_requests_report.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => {
                const requestDate = new Date(r.createdAt);
                const now = new Date();
                return requestDate.getMonth() === now.getMonth() &&
                       requestDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-[250px]">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => handleStatusChange(value as LeaveStatus | 'ALL')}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <DatePickerx date={startDate} setDate={setStartDate} />
            <span className="text-sm text-muted-foreground">to</span>
            <DatePickerx date={endDate} setDate={setEndDate} />
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearDateFilter}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportToExcel}
            className="w-full sm:w-auto"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-muted/50 font-semibold">Employee ID</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Employee</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Department</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Leave Type</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Duration</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Days</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Approver Status</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Approver Remarks</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">PMD Status</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">PMD Remarks</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Approver</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRequests.map((request: { id: string, employee: any, leaveType: any, startDate: string, endDate: string, daysRequested: number, pmdRejectionReason: string, approvals: any[], status: keyof typeof statusColors, pmdStatus: keyof typeof statusColors, createdAt: string }) => (
                    <TableRow key={request.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>{request.employee.employeeId}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {request.employee.firstName} {request.employee.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {request.employee.position}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{request.employee.department}</TableCell>
                      <TableCell><Badge>{request.leaveType.name}</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{format(new Date(request.startDate), 'PP')}</span>
                          <span className="text-xs text-muted-foreground">
                            to {format(new Date(request.endDate), 'PP')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{request.daysRequested}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`${statusColors[request.status]} border-none`}
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {getLatestApprovalComment(request.approvals)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${statusColors[request.pmdStatus || 'PENDING']} border-none`}
                        >
                          {request.pmdStatus || 'PENDING'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {request.pmdRejectionReason || "No remarks"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {request.employee.approver ? (
                          <div className="flex flex-col">
                            <span>
                              {request.employee.approver.firstName} {request.employee.approver.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {request.employee.approver.position}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">
                            No approver assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{format(new Date(request.createdAt), 'PP')}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(request.createdAt), 'p')}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredRequests.length)} of{" "}
          {filteredRequests.length} entries
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}