import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/db";
import { LeaveTypesList } from "./components/leave-types-list";
import { LeaveBalanceManagement } from "./components/leave-balance-management";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LeaveSettingsPage() {

    const session = await auth();
    
    if (!session || session.user.role !== 'HR') {
      redirect('/dashboard');
    }

  const leaveTypes = await prisma.leaveType.findMany({
    orderBy: { name: "asc" },
  });

  const currentYear = new Date().getFullYear();
  const leaveBalances = await prisma.leaveBalance.findMany({
    where: { year: currentYear },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      leaveType: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { employee: { firstName: "asc" } },
      { leaveType: { name: "asc" } },
    ],
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
    
      
      <Tabs defaultValue="types" className="space-y-6">
        <TabsList>
          <TabsTrigger value="types">Leave Types</TabsTrigger>
          <TabsTrigger value="balances">Leave Balances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="types" className="space-y-6">
          <LeaveTypesList leaveTypes={leaveTypes} />
        </TabsContent>
        
        <TabsContent value="balances" className="space-y-6">
          <LeaveBalanceManagement initialBalances={leaveBalances} />
        </TabsContent>
      </Tabs>
    </div>
  );
}