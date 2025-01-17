import { prisma } from "@/lib/db"

export async function getDepartments() {
    const departments = await prisma.employee.findMany({
      select: {
        department: true,
      },
      distinct: ['department'],
    })
    return departments.map(d => ({ label: d.department, value: d.department }))
  }
  
  export async function getLeaveTypes() {
    const types = await prisma.leaveType.findMany({
      select: {
        id: true,
        name: true,
      },
    })
    return types.map(type => ({ label: type.name, value: type.id }))
  }