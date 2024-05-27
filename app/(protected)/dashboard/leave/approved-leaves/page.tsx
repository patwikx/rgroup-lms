'use client'
import { Suspense, useEffect, useState } from 'react';
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import axios from 'axios'; // Import Axios
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowUpRight, CheckCheckIcon, Hourglass, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ApprovedLeavePage() {
  const [leaves, setLeaves] = useState([]);
  const user = useCurrentUser();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.post('/api/fetch-leaves-approved', { userId: user?.id }); // THis get's the leave requests of the logged in user, change to approverId if you want to get the for approval of leave requests.
  
        if (!response.data) {
          throw new Error('Failed to fetch leave data');
        }
  
        setLeaves(response.data.leaves);
      } catch (error) {
        toast.error('There was an error in fetching leave requests.');
      }
    }
  
    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
    <div className="flex-1 flex flex-col p-4 mt-[-10px]">
    <h2 className="text-2xl font-bold tracking-tight">Approved leave requests.</h2>
        <p className="text-muted-foreground mt-[-4px]">
          This is where you can manage your approved leave requests.
        </p>
      <div className="flex-1 overflow-auto mt-8">
      <Card>
            <CardHeader className='font-semibold'>
              Leave Details
            </CardHeader>
            <CardContent>
            <Suspense fallback={<Skeleton />}>
            <DataTable data={leaves} columns={columns} />
          </Suspense>
            </CardContent>
  
          </Card>
 
      </div>
    </div>
  </div>
  )
}
