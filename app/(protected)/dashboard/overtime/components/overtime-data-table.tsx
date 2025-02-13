import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { format } from "date-fns"
  import { OvertimeActions } from "./overtime-actions"
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
  import { prisma } from "@/lib/db"
  import { OvertimeStatusBadge } from "./overtime-status-badge"
  import { auth } from "@/auth"
  import { getMyOvertimeRequests, getPendingApprovals } from "@/actions/overtime"
  import { 
    Clock, 
    Calendar, 
    User2, 
    AlarmClock, 
    Timer, 
    MessageSquare,
    ClipboardList,
    InboxIcon,
    AlertCircle
  } from "lucide-react"
  
  export async function OvertimeDataTable() {
    try {
      const session = await auth();
      const employee = session?.user ? await prisma.employee.findFirst({
        where: { employeeId: session.user.employeeId },
      }) : null
  
      if (!employee) {
        throw new Error("Employee not found")
      }
  
      const isSupervisor = employee?.approvalLevel === "SUPERVISOR"
      const myOvertimes = await getMyOvertimeRequests()
      const pendingApprovals = isSupervisor ? await getPendingApprovals() : []
  
      return (
        <div className="space-y-8">
          <Tabs defaultValue="my-requests" className="w-full">
            <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
              <TabsTrigger 
                value="my-requests" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                My Requests
              </TabsTrigger>
              {isSupervisor && (
                <TabsTrigger 
                  value="pending-approvals"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                >
                  <InboxIcon className="mr-2 h-4 w-4" />
                  Pending Approvals
                </TabsTrigger>
              )}
            </TabsList>
  
            <TabsContent value="my-requests" className="mt-6">
              <div className="rounded-xl border border-border/40 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 bg-muted/50">
                      <TableHead className="py-4">
                        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Date</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <AlarmClock className="h-4 w-4" />
                          <span>Start Time</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>End Time</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <Timer className="h-4 w-4" />
                          <span>Hours</span>
                        </div>
                      </TableHead>
                      <TableHead>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Status
                        </span>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          <span>Reason</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-right">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Actions
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myOvertimes.length === 0 ? (
                      <TableRow>
                        <TableCell 
                          colSpan={7} 
                          className="h-[200px] text-center"
                        >
                          <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                            <ClipboardList className="h-12 w-12 opacity-20" />
                            <p className="text-sm font-medium">No overtime requests found</p>
                            <p className="text-xs">Create a new request to get started</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      myOvertimes.map((overtime) => (
                        <TableRow 
                          key={overtime.id} 
                          className="border-b border-border/50 transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="py-4 font-medium">
                            {format(new Date(overtime.date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(overtime.startTime), "hh:mm a")}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(overtime.endTime), "hh:mm a")}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium tabular-nums">
                              {overtime.totalHours}
                            </span>
                            <span className="text-muted-foreground">h</span>
                          </TableCell>
                          <TableCell>
                            <OvertimeStatusBadge status={overtime.status} />
                          </TableCell>
                          <TableCell>
                            <p className="max-w-[200px] truncate text-sm text-muted-foreground">
                              {overtime.reason}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <OvertimeActions overtime={overtime} isSupervisor={false} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
  
            {isSupervisor && (
              <TabsContent value="pending-approvals" className="mt-6">
                <div className="rounded-xl border border-border/40 bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/50 bg-muted/50">
                        <TableHead className="py-4">
                          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <User2 className="h-4 w-4" />
                            <span>Employee</span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Date</span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <AlarmClock className="h-4 w-4" />
                            <span>Start Time</span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>End Time</span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <Timer className="h-4 w-4" />
                            <span>Hours</span>
                          </div>
                        </TableHead>
                        <TableHead>
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Status
                          </span>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            <span>Reason</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-right">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Actions
                          </span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApprovals.length === 0 ? (
                        <TableRow>
                          <TableCell 
                            colSpan={8} 
                            className="h-[200px] text-center"
                          >
                            <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                              <InboxIcon className="h-12 w-12 opacity-20" />
                              <p className="text-sm font-medium">No pending approvals</p>
                              <p className="text-xs">All overtime requests have been processed</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingApprovals.map((overtime) => (
                          <TableRow 
                            key={overtime.id} 
                            className="border-b border-border/50 transition-colors hover:bg-muted/50"
                          >
                            <TableCell className="py-4">
                              <div className="font-medium">
                                {overtime.employee.firstName} {overtime.employee.lastName}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(overtime.date), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(overtime.startTime), "hh:mm a")}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(overtime.endTime), "hh:mm a")}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium tabular-nums">
                                {overtime.totalHours}
                              </span>
                              <span className="text-muted-foreground">h</span>
                            </TableCell>
                            <TableCell>
                              <OvertimeStatusBadge status={overtime.status} />
                            </TableCell>
                            <TableCell>
                              <p className="max-w-[200px] truncate text-sm text-muted-foreground">
                                {overtime.reason}
                              </p>
                            </TableCell>
                            <TableCell className="text-right">
                              <OvertimeActions overtime={overtime} isSupervisor={true} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )
    } catch (error) {
      console.error("Error in OvertimeDataTable:", error)
      return (
        <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-red-200 bg-red-50/50">
          <div className="flex flex-col items-center justify-center space-y-3 px-4 py-8 text-center">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-red-900">Failed to load overtime data</h3>
              <p className="text-sm text-red-600">Please try again later or contact support if the issue persists.</p>
            </div>
          </div>
        </div>
      )
    }
  }