'use client'

import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Employee {
  empId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  isActive: boolean;
  approver: {
    firstName: string;
    lastName: string;
    position: string;
  } | null;
  approvalLevel: string;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  employee: Employee | null;
}

interface Props {
  initialUsers: User[];
}

const ITEMS_PER_PAGE = 10;

export function UserManagement({ initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isStatusLoading, setIsStatusLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [optimisticUsers, updateOptimisticUsers] = useOptimistic(
    users,
    (state, updatedUser: User) =>
      state.map(user => user.id === updatedUser.id ? updatedUser : user)
  );

  // Filter users based on search term
  const filteredUsers = optimisticUsers.filter(user => {
    const fullName = `${user.employee?.firstName} ${user.employee?.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handleExportToExcel = () => {
    const data = filteredUsers.map(user => ({
      'Name': `${user.employee?.firstName} ${user.employee?.lastName}`,
      'Email': user.email,
      'Department': user.employee?.department,
      'Position': user.employee?.position,
      'Approver': user.employee?.approver 
        ? `${user.employee.approver.firstName} ${user.employee.approver.lastName}`
        : 'No approver assigned',
      'Status': user.employee?.isActive ? 'Active' : 'Inactive',
      'Approval Level': user.employee?.approvalLevel
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, 'user_management_report.xlsx');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>User Management Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 18px; }
            .header h2 { margin: 5px 0; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RD HARDWARE & FISHING SUPPLY, INC.</h1>
            <h2>LEAVE MANAGEMENT SYSTEM</h2>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Approver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.map(user => `
                <tr>
                  <td>${user.employee?.firstName} ${user.employee?.lastName}</td>
                  <td>${user.email}</td>
                  <td>${user.employee?.department}</td>
                  <td>${user.employee?.position}</td>
                  <td>${user.employee?.isActive ? 'Active' : 'Inactive'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button onclick="window.print()">Print</button>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      setIsStatusLoading(userId);
      
      const result: { success: boolean; error?: string } = await toggleUserStatus(userId, !currentStatus);
      
      if (result.success) {
        setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === userId && user.employee) {
            return {
              ...user,
              employee: {
                ...user.employee,
                isActive: !currentStatus
              }
            };
          }
          return user;
        }));
        toast.success('User status updated successfully');
      } else {
        toast.error(result.error || 'Failed to update user status');
      }
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setIsStatusLoading(null);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
<div>


        <div className="flex items-center justify-between mb-4">
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              
              <Input
                placeholder="Search by name... "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export to Excel
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

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Approver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
  {currentUsers.map((user) => (
    <TableRow key={user.id}>
      <TableCell>
        {user.employee?.firstName} {user.employee?.lastName}
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.employee?.department}</TableCell>
      <TableCell>{user.employee?.position}</TableCell>
      <TableCell>
        {user.employee?.approver ? (
          `${user.employee.approver.firstName} ${user.employee.approver.lastName} (${user.employee.approver.position})`
        ) : (
          'No approver assigned'
        )}
      </TableCell>
      <TableCell>
        <Badge 
          variant={user.employee?.isActive ? "success" : "destructive"}
        >
          {user.employee?.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                        onClick={() => handleStatusToggle(
                          user.id,
                          user.employee?.isActive || false
                        )}
                        disabled={isStatusLoading === user.id}
                      >
                        {isStatusLoading === user.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : user.employee?.isActive ? (
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
          </TableBody>
        </Table>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of{" "}
            {filteredUsers.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
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
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit User Details</DialogTitle>
            </DialogHeader>
            <UserDetailsForm 
              user={selectedUser} 
              onSuccess={() => {
                setIsEditOpen(false);
                setSelectedUser(null);
                window.location.reload();
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <PasswordChangeForm
              userId={selectedUser?.id}
              onSuccess={() => {
                setIsPasswordOpen(false);
                setSelectedUser(null);
              }}
            />
          </DialogContent>
        </Dialog>
        </div>
  );
}

