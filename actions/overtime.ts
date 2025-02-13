
'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { ApprovalLevel, OvertimeStatus, Prisma } from "@prisma/client"
import { auth } from "@/auth"

type OvertimeWithRelations = Prisma.OvertimeGetPayload<{
    include: {
      employee: true
      approvals: {
        include: {
          approver: true
        }
      }
    }
  }>

// Get overtime requests for the logged-in employee
export async function getMyOvertimeRequests(): Promise<OvertimeWithRelations[]> {
    try {
      const session = await auth()
      if (!session?.user) {
        throw new Error("Unauthorized: Please sign in to continue")
      }
  
      const employee = await prisma.employee.findFirst({
        where: { employeeId: session.user.employeeId },
      })
      if (!employee) {
        throw new Error("Employee record not found")
      }
  
      return await prisma.overtime.findMany({
        where: { employeeId: employee.id },
        orderBy: [
          { date: "desc" },
          { createdAt: "desc" }
        ],
        include: {
          employee: true,
          approvals: {
            include: {
              approver: true,
            },
          },
        },
      })
    } catch (error) {
      console.error("Error fetching overtime requests:", error)
      throw new Error("Failed to fetch overtime requests")
    }
  }

  // Get overtime requests pending approval for the supervisor
export async function getPendingApprovals(): Promise<OvertimeWithRelations[]> {
    try {
      const session = await auth();
      if (!session?.user) {
        throw new Error("Unauthorized: Please sign in to continue")
      }
  
      const employee = await prisma.employee.findFirst({
        where: { employeeId: session.user.employeeId },
      })
      if (!employee) {
        throw new Error("Employee record not found")
      }
  
      // Only supervisors can see pending approvals
      if (employee.approvalLevel !== "SUPERVISOR") {
        throw new Error("Unauthorized: Only supervisors can view pending approvals")
      }
  
      return await prisma.overtime.findMany({
        where: {
          approvals: {
            some: {
              approverId: employee.id,
              status: "PENDING",
            },
          },
        },
        orderBy: [
          { date: "desc" },
          { createdAt: "desc" }
        ],
        include: {
          employee: true,
          approvals: {
            include: {
              approver: true,
            },
          },
        },
      })
    } catch (error) {
      console.error("Error fetching pending approvals:", error)
      throw new Error("Failed to fetch pending approvals")
    }
  }
  

export async function createOvertime(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in to continue")
    }

    const employee = await prisma.employee.findFirst({
      where: { employeeId: session.user.employeeId },
      include: {
        approver: true,
      },
    })
    if (!employee) {
      throw new Error("Employee record not found")
    }

    // Get and validate form data
    const date = new Date(formData.get("date") as string)
    const startTime = new Date(`${formData.get("date")}T${formData.get("startTime")}`)
    const endTime = new Date(`${formData.get("date")}T${formData.get("endTime")}`)
    const reason = formData.get("reason") as string

    // Validate inputs
    if (!date || !startTime || !endTime || !reason) {
      throw new Error("All fields are required")
    }

    if (startTime >= endTime) {
      throw new Error("End time must be after start time")
    }

    if (date.getTime() > new Date().getTime()) {
      throw new Error("Cannot file overtime for future dates")
    }

    // Calculate total hours
    const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

    // Create overtime request
    const overtime = await prisma.$transaction(async (tx) => {
      // Create the overtime record
      const overtime = await tx.overtime.create({
        data: {
          employeeId: employee.id,
          date,
          startTime,
          endTime,
          totalHours,
          reason,
          status: OvertimeStatus.PENDING,
        },
      })

      // Create approval records based on employee's approver
      if (employee.approverId) {
        await tx.overtimeApproval.create({
          data: {
            overtimeId: overtime.id,
            approverId: employee.approverId,
            level: ApprovalLevel.SUPERVISOR,
            status: "PENDING",
          },
        })
      }

      // If employee's approver is not HR/TWC, create additional approval record
      if (employee.approver && !employee.approver.isHR && !employee.approver.isTWC) {
        const hrApprover = await tx.employee.findFirst({
          where: { isHR: true },
        })

        if (hrApprover) {
          await tx.overtimeApproval.create({
            data: {
              overtimeId: overtime.id,
              approverId: hrApprover.id,
              level: ApprovalLevel.HR,
              status: "PENDING",
            },
          })
        }
      }

      return overtime
    })

    revalidatePath("/overtime")
    return overtime
  } catch (error) {
    console.error("Error creating overtime request:", error)
    throw error
  }
}

export async function approveOvertime(id: string) {
    try {
      const session = await auth();
      if (!session?.user) {
        throw new Error("Unauthorized: Please sign in to continue")
      }
  
      const employee = await prisma.employee.findFirst({
        where: { employeeId: session.user.employeeId },
      })
      if (!employee) {
        throw new Error("Employee record not found")
      }
  
      // Verify the user is a supervisor
      if (employee.approvalLevel !== "SUPERVISOR") {
        throw new Error("Unauthorized: Only supervisors can approve overtime requests")
      }
  
      const overtime = await prisma.overtime.findUnique({
        where: { id },
        include: {
          employee: true,
        },
      })
  
      if (!overtime) {
        throw new Error("Overtime request not found")
      }
  
      if (overtime.status !== "PENDING") {
        throw new Error("Can only approve pending overtime requests")
      }
  
      // Verify the supervisor is the approver for this employee
      if (overtime.employee.approverId !== employee.id) {
        throw new Error("Unauthorized: You are not the supervisor for this employee")
      }
  
      // Update both the approval and overtime status
      await prisma.$transaction([
        prisma.overtimeApproval.updateMany({
          where: {
            overtimeId: id,
            approverId: employee.id,
          },
          data: {
            status: "APPROVED",
            updatedAt: new Date(),
          },
        }),
        prisma.overtime.update({
          where: { id },
          data: {
            status: "APPROVED",
            updatedAt: new Date(),
          },
        }),
      ])
  
      revalidatePath("/overtime")
    } catch (error) {
      console.error("Error approving overtime request:", error)
      throw error
    }
  }

export async function cancelOvertime(id: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in to continue")
    }

    const employee = await prisma.employee.findFirst({
      where: { employeeId: session.user.employeeId },
    })
    if (!employee) {
      throw new Error("Employee record not found")
    }

    const overtime = await prisma.overtime.findUnique({
      where: { id },
    })

    if (!overtime) {
      throw new Error("Overtime request not found")
    }

    // Only allow cancellation if it's the employee's own request or if they're HR/Manager
    if (
      overtime.employeeId !== employee.id &&
      !employee.isHR &&
      !employee.isManager &&
      !employee.isTWC
    ) {
      throw new Error("Unauthorized: Cannot cancel other employee's overtime requests")
    }

    if (overtime.status !== "PENDING") {
      throw new Error("Can only cancel pending overtime requests")
    }

    await prisma.$transaction(async (tx) => {
      // Update the overtime status
      await tx.overtime.update({
        where: { id },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
        },
      })

      // Cancel all pending approvals
      await tx.overtimeApproval.updateMany({
        where: {
          overtimeId: id,
          status: "PENDING",
        },
        data: {
          status: "REJECTED",
          updatedAt: new Date(),
        },
      })
    })

    revalidatePath("/overtime")
  } catch (error) {
    console.error("Error cancelling overtime request:", error)
    throw error
  }
}

export async function rejectOvertime(id: string) {
    try {
      const session = await auth();
      if (!session?.user) {
        throw new Error("Unauthorized: Please sign in to continue")
      }
  
      const employee = await prisma.employee.findFirst({
        where: { employeeId: session.user.employeeId },
      })
      if (!employee) {
        throw new Error("Employee record not found")
      }
  
      // Verify the user is a supervisor
      if (employee.approvalLevel !== "SUPERVISOR") {
        throw new Error("Unauthorized: Only supervisors can reject overtime requests")
      }
  
      const overtime = await prisma.overtime.findUnique({
        where: { id },
        include: {
          employee: true,
        },
      })
  
      if (!overtime) {
        throw new Error("Overtime request not found")
      }
  
      if (overtime.status !== "PENDING") {
        throw new Error("Can only reject pending overtime requests")
      }
  
      // Verify the supervisor is the approver for this employee
      if (overtime.employee.approverId !== employee.id) {
        throw new Error("Unauthorized: You are not the supervisor for this employee")
      }
  
      // Update both the approval and overtime status
      await prisma.$transaction([
        prisma.overtimeApproval.updateMany({
          where: {
            overtimeId: id,
            approverId: employee.id,
          },
          data: {
            status: "REJECTED",
            updatedAt: new Date(),
          },
        }),
        prisma.overtime.update({
          where: { id },
          data: {
            status: "REJECTED",
            updatedAt: new Date(),
          },
        }),
      ])
  
      revalidatePath("/overtime")
    } catch (error) {
      console.error("Error rejecting overtime request:", error)
      throw error
    }
  }