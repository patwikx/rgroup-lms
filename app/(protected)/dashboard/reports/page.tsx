import { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getLeaveRequests } from '@/actions/leave-reports';
import { LeaveRequestsReport } from './components/leave-request-report';

export const metadata: Metadata = {
  title: 'RDHFSI Leave Requests Report',
  description: 'View and manage leave request reports',
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

export default async function LeaveRequestsPage() {
  const requests = await getLeaveRequests();
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Leave Requests Report</h1>
        <p className="text-muted-foreground">View and analyze leave request data</p>
      </div>
      <Suspense fallback={<LoadingState />}>
        <LeaveRequestsReport initialRequests={requests} />
      </Suspense>
    </div>
  );
}