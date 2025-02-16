'use client'

import { Suspense, useState } from 'react';
import { useOptimistic } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PasswordChangeForm } from './password-change-form';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MoreVertical, Edit, Key, UserX, UserCheck, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Search, FileSpreadsheet, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toggleUserStatus } from '@/actions/employee-management';
import { UserDetailsForm } from './employee-details-form';
import { EmployeeRegistrationDialog } from '@/components/registration/employee-form';
import { LoadingRow } from './loading-row';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/use-current-user';
import { redirect, useRouter } from 'next/navigation';
import { ApprovalLevel } from '@prisma/client';

interface LeaveBalance {
  id: string;
  userId: string;
  leaveTypeId: string;
  year: number;
  balance: number;
  used: number;
  pending: number;
  leaveType: {
    id: string;
    name: string;
    description?: string | null;
  };
}

interface User {
  id: string;
  employeeId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  image: string | null;
  contactNo: string | null;
  address: string | null;
  emergencyContactNo: string | null;
  department: string | null;
  position: string | null;
  joiningDate: Date;
  isActive: boolean;
  isManager: boolean;
  isHR: boolean;
  isTWC: boolean;
  role: ApprovalLevel;
  approverId: string | null;
  approver: {
    firstName: string;
    lastName: string;
    position: string | null;
  } | null;
  leaveBalances: LeaveBalance[];
}

interface Props {
  initialUsers: User[];
}

const ITEMS_PER_PAGE = 10;

export const revalidate = 0;

export function UserManagement({ initialUsers }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isStatusLoading, setIsStatusLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const session = useCurrentUser();

  if (!session || session.role !== ApprovalLevel.HR) {
    redirect('/dashboard');
  }

  const [optimisticUsers, updateOptimisticUsers] = useOptimistic(
    users,
    (state, updatedUser: User) =>
      state.map(user => user.id === updatedUser.id ? updatedUser : user)
  );

  // Get unique leave types from all users' leave balances
  const uniqueLeaveTypes = new Set(
    users.flatMap(user => 
      user.leaveBalances?.map(balance => balance.leaveType.name) ?? []
    )
  );

  // Filter users based on search term
  const filteredUsers = optimisticUsers.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Helper function to get balance for a specific leave type
  const getLeaveBalance = (user: User, leaveTypeName: string) => {
    const balance = user.leaveBalances?.find(b => b.leaveType.name === leaveTypeName);
    return balance ? `${balance.balance}` : '-';
  };

  const handleExportToExcel = () => {
    const data = filteredUsers.map(user => ({
      'EmployeeID': user.employeeId || '',
      'Name': `${user.firstName} ${user.lastName}`,
      'Email': user.email,
      'Department': user.department || '',
      'Position': user.position || '',
      'Contact': user.contactNo || '',
      'Emergency Contact': user.emergencyContactNo || '',
      'Joining Date': user.joiningDate.toLocaleDateString(),
      'Approver': user.approver 
        ? `${user.approver.firstName} ${user.approver.lastName} (${user.approver.position || 'No Position'})`
        : 'No approver assigned',
      'Status': user.isActive ? 'Active' : 'Inactive',
      'Role': user.role,
      ...Array.from(uniqueLeaveTypes).reduce((acc, type) => ({
        ...acc,
        [type]: getLeaveBalance(user, type)
      }), {})
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'employee_management_report.xlsx');
  };

  const handlePrint = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const leaveTypesArray = Array.from(uniqueLeaveTypes);

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Employee Management Report</title>
          <style>
              @page {
                  size: landscape;
                  margin: 0;
              }
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.4;
                  color: #333;
                  margin: 0;
                  padding: 0;
                  background-color: #fff;
              }
              .container {
                  width: 100%;
                  max-width: 1400px;
                  margin: 0 auto;
                  padding: 20px;
                  box-sizing: border-box;
              }
              .header {
                  text-align: center;
                  margin-bottom: 20px;
                  padding: 10px;
                  background-color: #f0f0f0;
                  border-bottom: 2px solid #333;
              }
              .header h1 {
                  margin: 0;
                  font-size: 24px;
                  color: #333;
              }
              .header h2 {
                  margin: 5px 0;
                  font-size: 18px;
                  color: #666;
              }
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 20px;
                  font-size: 12px;
              }
              th, td {
                  border: 1px solid #ccc;
                  padding: 8px;
                  text-align: left;
              }
              th {
                  background-color: #e6e6e6;
                  font-weight: bold;
              }
              tr:nth-child(even) {
                  background-color: #f9f9f9;
              }
              .footer {
                  text-align: right;
                  font-size: 12px;
                  color: #666;
                  margin-top: 20px;
              }
              .print-button {
                  background-color: #4CAF50;
                  color: white;
                  padding: 10px 20px;
                  border: none;
                  cursor: pointer;
                  font-size: 14px;
              }
              .print-button:hover {
                  background-color: #45a049;
              }
              @media print {
                  .print-button {
                      display: none;
                  }
                  .header {
                      background-color: #fff;
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                  }
                  th {
                      background-color: #e6e6e6 !important;
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>RD HARDWARE & FISHING SUPPLY, INC.</h1>
                  <h2>LEAVE MANAGEMENT SYSTEM - EMPLOYEE REPORT</h2>
              </div>
              <table>
                  <thead>
                      <tr>
                          <th>Employee ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Department</th>
                          <th>Position</th>
                          <th>Approver</th>
                          <th>Status</th>
                          ${leaveTypesArray.map(type => `<th>${type}</th>`).join('')}
                      </tr>
                  </thead>
                  <tbody>
                      ${filteredUsers.map(user => `
                          <tr>
                              <td>${user.employeeId || ''}</td>
                              <td>${user.firstName} ${user.lastName}</td>
                              <td>${user.email}</td>
                              <td>${user.department || ''}</td>
                              <td>${user.position || ''}</td>
                              <td>${user.approver 
                                  ? `${user.approver.firstName} ${user.approver.lastName}`
                                  : 'No approver assigned'}</td>
                              <td>${user.isActive ? 'Active' : 'Inactive'}</td>
                              ${leaveTypesArray.map(type => 
                                  `<td>${getLeaveBalance(user, type)}</td>`
                              ).join('')}
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
              <div class="footer">
                  <p>Generated on: ${new Date().toLocaleDateString()}</p>
                  <button class="print-button" onclick="window.print()">Print Report</button>
              </div>
          </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      setIsStatusLoading(userId);
      
      const result = await toggleUserStatus(userId, !currentStatus);
      
      if (result.success) {
        setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              isActive: !currentStatus
            };
          }
          return user;
        }));
        toast.success('User status updated successfully');
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setIsStatusLoading(null);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    updateOptimisticUsers(updatedUser);
    setIsEditOpen(false);
    setSelectedUser(null);
    router.refresh();
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="relative w-[200px]">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportToExcel}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
        <EmployeeRegistrationDialog />
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
                    <TableHead className="bg-muted/50 font-semibold">Name</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Email</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Department</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Approver</TableHead>
                    <TableHead className="bg-muted/50 font-semibold">Status</TableHead>
                    {Array.from(uniqueLeaveTypes).map(type => (
                      <TableHead key={type} className="bg-muted/50 font-semibold">{type}</TableHead>
                    ))}
                    <TableHead className="bg-muted/50 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <Suspense fallback={
                    <>
                      {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                        <LoadingRow key={i} columns={7 + uniqueLeaveTypes.size} />
                      ))}
                    </>
                  }>
                    {currentUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="max-w-[200px] truncate">
                          {user.employeeId}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {user.position}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {user.email}
                        </TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          {user.approver ? (
                            <div className="flex flex-col">
                              <span>
                                {user.approver.firstName} {user.approver.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {user.approver.position || 'No Position'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">
                              No approver assigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.isActive ? "success" : "destructive"}
                            className="whitespace-nowrap"
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        {Array.from(uniqueLeaveTypes).map(type => (
                          <TableCell key={type} className="text-center font-medium">
                            {getLeaveBalance(user, type)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-muted">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditOpen(true);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsPasswordOpen(true);
                                }}
                              >
                                <Key className="mr-2 h-4 w-4" />
                                Change Password
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusToggle(user.id, user.isActive)}
                                disabled={isStatusLoading === user.id}
                                className={user.isActive ? "text-destructive" : "text-success"}
                              >
                                {isStatusLoading === user.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                  </>
                                ) : user.isActive ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </Suspense>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of{" "}
          {filteredUsers.length} entries
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="hidden sm:inline-flex"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="hidden sm:inline-flex"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserDetailsForm 
              user={{
                id: selectedUser.id,
                firstName: selectedUser.firstName,
                lastName: selectedUser.lastName,
                email: selectedUser.email,
                department: selectedUser.department || undefined,
                position: selectedUser.position || undefined,
                approverId: selectedUser.approverId || undefined,
                role: selectedUser.role,
                approver: selectedUser.approver
              }}
              onSuccess={handleUserUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <PasswordChangeForm
              userId={selectedUser.id}
              onSuccess={() => {
                setIsPasswordOpen(false);
                setSelectedUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}