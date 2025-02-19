import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TeamStructureProps {
  initialData: {
    approver: {
      firstName: string
      lastName: string 
      position: string | null
    } | null
    subordinates: {
      id: string
      firstName: string 
      lastName: string 
      position: string | null
    }[]
  }
}

export function TeamStructure({ initialData }: TeamStructureProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Structure</CardTitle>
        <CardDescription>View your reporting relationships and team members</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {initialData.approver && (
          <div>
            <h4 className="text-sm font-medium mb-4">Reports To</h4>
            <div className="flex items-center space-x-4 rounded-lg border p-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">
                  {initialData.approver.firstName[0]}
                  {initialData.approver.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {initialData.approver.firstName} {initialData.approver.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{initialData.approver.position}</p>
              </div>
            </div>
          </div>
        )}

        {initialData.subordinates.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-4">Team Members ({initialData.subordinates.length})</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {initialData.subordinates.map((subordinate) => (
                <div
                  key={subordinate.id}
                  className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {subordinate.firstName[0]}
                      {subordinate.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {subordinate.firstName} {subordinate.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{subordinate.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!initialData.approver && initialData.subordinates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No team relationships configured</div>
        )}
      </CardContent>
    </Card>
  )
}
