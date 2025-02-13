import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { auth } from "@/auth"
import { OvertimeDialog } from "./overtime-dialog";


export async function OvertimeHeader() {
  const session = await auth();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overtime Management</h1>
        <p className="text-muted-foreground">
          File and manage your overtime requests
        </p>
      </div>
      {session?.user && (
        <OvertimeDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            File Overtime
          </Button>
        </OvertimeDialog>
      )}
    </div>
  )
}