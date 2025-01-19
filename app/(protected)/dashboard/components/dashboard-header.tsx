'use client';

import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { CalendarDays } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const router = useRouter();
  const session = useCurrentUser();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mt-4">Welcome to your Dashboard, {session?.firstName}!</h1>
        <p className="text-muted-foreground">
          Manage your leave requests and approvals
        </p>
      </div>
      <Button onClick={() => router.push('/dashboard/leave-request')}>
        <CalendarDays className='h-4 w-4 mr-2' />New Leave Request
      </Button>
    </div>
  );
}