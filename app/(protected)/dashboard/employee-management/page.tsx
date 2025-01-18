import { Metadata } from 'next';
import { Suspense } from 'react';
import { getUsersWithLeaveBalances } from '@/actions/employee-management';
import { UserManagement } from './user-management';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'RDHFSI User Management',
  description: 'Manage system users and their access',
};

export const revalidate = 0;

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <div className="rounded-lg border">
        <Skeleton className="h-[500px]" />
      </div>
    </div>
  );
}

export default async function UsersPage() {
  const usersWithBalances = await getUsersWithLeaveBalances();
  
  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <p className="text-muted-foreground">Create a new employee account</p>
      </div>
      <Suspense fallback={<LoadingState />}>
        <UserManagement initialUsers={usersWithBalances} />
      </Suspense>
    </div>
  );
}