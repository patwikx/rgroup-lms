import { Metadata } from 'next';

import { getUsers } from '@/actions/employee-management';
import { UserManagement } from './user-management';


export const metadata: Metadata = {
  title: 'RDHFSI User Management',
  description: 'Manage system users and their access',
};

export const revalidate = 0;

export default async function UsersPage() {
  const users = await getUsers();
  
  return (
        <div className="container max-w-2xl py-4">
          <div className="mb-4">
            <h1 className="text-3xl font-bold">Employee Management</h1>
            <p className="text-muted-foreground">Create a new employee account</p>
          </div>
          <UserManagement initialUsers={users} />
        </div>
  );
}