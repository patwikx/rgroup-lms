import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ApproverCardProps {
  approver: {
    firstName: string;
    lastName: string;
    email: string;
    position: string | null;
    department: string | null;
    image: string | null;
  } | null;
}

export function ApproverCard({ approver }: ApproverCardProps) {
  if (!approver) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Approver</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No approver assigned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-36">
      <CardHeader>
        <CardTitle>My Approver</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={approver.image ?? ""} alt={`${approver.firstName} ${approver.lastName}`} />
            <AvatarFallback>
              {approver.firstName[0]}
              {approver.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-medium leading-none">
              {approver.firstName} {approver.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{approver.position}</p>
            <p className="text-xs text-muted-foreground">{approver.department}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}