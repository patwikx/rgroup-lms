'use client';

import { useEffect, useState } from "react";
import { getPendingApprovals } from "@/actions/leave-approval";
import type { PendingApprovalWithDetails } from "@/types/type";
import { ApprovalsList } from "./approval-list";
import { EmptyState } from "./empty-state";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<PendingApprovalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApprovals = async () => {
      const data = await getPendingApprovals();
      setApprovals(data);
      setLoading(false);
    };
    loadApprovals();
  }, []);

  if (loading) {
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