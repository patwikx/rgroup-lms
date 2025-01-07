import { Suspense } from 'react';

import { getDashboardStats } from '@/actions/dashboard';
import { getLeaveBalances } from '@/actions/leave-balance';
import { getPendingApprovals } from '@/actions/leave-approval';
import { DashboardHeader } from './components/dashboard-header';
import { DashboardSkeleton } from './components/dashboard-skeleton';
import { DashboardStats } from './components/dashboard-stats';
import { LeaveBalanceCard } from './components/leave-balance-card';
import { ApprovalQueue } from './components/approval-queue';




export default async function DashboardPage() {
  const [stats, balances, approvals] = await Promise.all([
    getDashboardStats(),
    getLeaveBalances(),
    getPendingApprovals(),

  ]);


  return (
    <div className="container mx-auto space-y-6">
      <DashboardHeader />
      <Suspense fallback={<DashboardSkeleton />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardStats stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LeaveBalanceCard balances={balances} />
          </div>
          <div>
            <ApprovalQueue approvals={approvals} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}