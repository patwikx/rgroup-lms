'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPendingApprovals } from "@/actions/leave-approval";
import type { PendingApprovalWithDetails } from "@/types/type";
import { ApprovalsList } from "./approval-list";
import { EmptyState } from "./empty-state";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<PendingApprovalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const session = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      if (session.role !== 'SUPERVISOR' && session.role !== 'HR') {
        router.push('/dashboard');
        return;
      }

      const loadApprovals = async () => {
        const data = await getPendingApprovals();
        setApprovals(data);
        setLoading(false);
      };
      loadApprovals();
    }
  }, [session, router]);

  if (!session || loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Leave Requests for Approval</h1>
      
      {approvals.length > 0 ? (
        <ApprovalsList approvals={approvals} />
      ) : (
        <EmptyState 
          title="No pending approvals"
          description="You have no leave requests waiting for your approval."
        />
      )}
    </div>
  );
}

