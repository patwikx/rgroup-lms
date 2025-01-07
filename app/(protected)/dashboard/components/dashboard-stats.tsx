'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/use-current-user';

interface DashboardStatsProps {
  stats: {
    availableDays: number;
    pendingRequests: number;
    approvedLeaves: number;
    pendingApprovals: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const user = useCurrentUser();

  const isApprover = user?.role === 'SUPERVISOR';
  const isHR = user?.role === 'HR';

  const statCards = [
    {
      title: 'Available Leave Days',
      value: stats.availableDays,
      description: 'Total across all leave types',
      visible: true, // Always visible
    },
    {
      title: 'Pending Leave Requests',
      value: stats.pendingRequests,
      description: 'Awaiting approval',
      visible: true, // Always visible
    },
    {
      title: 'Approved Leaves',
      value: stats.approvedLeaves,
      description: 'This year',
      visible: true, // Always visible
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      description: 'Requires your attention',
      visible: isApprover || isHR, // Only visible to approvers and HR
    },
  ];

  return (
    <>
      {statCards
        .filter((stat) => stat.visible) // Filter based on visibility
        .map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
    </>
  );
}