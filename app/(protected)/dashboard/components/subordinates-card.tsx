import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SubordinatesCardProps {
  subordinates: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: string;
    image: string | null;
  }[];
}

export function SubordinatesCard({ subordinates }: SubordinatesCardProps) {
  if (subordinates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No team members found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Team</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          {subordinates.map((subordinate) => (
            <div key={subordinate.id} className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={subordinate.image ?? ""}
                  alt={`${subordinate.firstName} ${subordinate.lastName}`}
                />
                <AvatarFallback>
                  {subordinate.firstName[0]}
                  {subordinate.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium leading-none">
                  {subordinate.firstName} {subordinate.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{subordinate.position}</p>
                <p className="text-xs text-muted-foreground">{subordinate.department}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}