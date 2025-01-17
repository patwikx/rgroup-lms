'use client';

import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
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