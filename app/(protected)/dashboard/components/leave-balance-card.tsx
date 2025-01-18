import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { Progress } from '@/components/ui/progress';
  import type { LeaveBalance, LeaveType } from '@prisma/client';
  
  interface LeaveBalanceCardProps {
    balances: (LeaveBalance & {
      leaveType: LeaveType;
    })[];
  }
  
  export function LeaveBalanceCard({ balances }: LeaveBalanceCardProps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leave Balances</CardTitle>
          <CardDescription>Your current leave balances by type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {balances.map((balance) => (
            <div key={balance.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{balance.leaveType.name}</span>
                <span className="font-medium">
                  {balance.balance} / {balance.leaveType.annualAllowance} days
                </span>
              </div>
              <Progress 
                value={(Number(balance.balance) / Number(balance.leaveType.annualAllowance)) * 100} 
              />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }