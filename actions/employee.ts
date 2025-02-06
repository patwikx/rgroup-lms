'use server'

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ApprovalLevel } from "@prisma/client";
import { EmployeeFormData, EmployeeSchema } from "@/schemas";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";


export async function createEmployee(data: EmployeeFormData) {
  try {
    const validatedFields = EmployeeSchema.safeParse(data);
    
    if (!validatedFields.success) {
      return { 
        success: false, 
        error: validatedFields.error.errors[0].message 
      };
    }

    const { data: fields } = validatedFields;
    
    // Check for existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: fields.email },
    });
    
    if (existingUser) {
      return { success: false, error: "Email already exists" };
    }

    const hashedPassword = await bcrypt.hash(fields.password, 12);
    
    // Determine the approval level
    let approvalLevel: ApprovalLevel = ApprovalLevel.USER;
    if (fields.isHR) {
      approvalLevel = ApprovalLevel.HR;
    } else if (fields.isManager) {
      approvalLevel = ApprovalLevel.SUPERVISOR;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: `${fields.firstName} ${fields.lastName}`,
        email: fields.email,
        password: hashedPassword,
        role: approvalLevel,
        employeeId: fields.employeeId,
      },
    });

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        empId: user.id,
        employeeId: fields.employeeId,
        firstName: fields.firstName,
        lastName: fields.lastName,
        email: fields.email,
        department: fields.department,
        position: fields.position,
        isManager: fields.isManager,
        isHR: fields.isHR,
        isTWC: fields.isTWC,
        approvalLevel: approvalLevel,
        approverId: fields.supervisorId || null,
      },
    });

    // Create initial leave balances
    const leaveTypes = await prisma.leaveType.findMany();
    const currentYear = new Date().getFullYear();

    // Create leave balances
    for (const leaveType of leaveTypes) {
      let balance = leaveType.annualAllowance;
      
      if (fields.isTWC) {
        if (leaveType.name === 'SL') {
          balance = 10; // Sick Leave is 10 days
        } else if (leaveType.name === 'VL') {
          balance = 5; // Vacation Leave is 5 days
        }
      }

      await prisma.leaveBalance.create({
        data: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          year: currentYear,
          balance: balance,
          used: 0,
          pending: 0,
        },
      });
    }

    revalidatePath('/dashboard/employee-management');
    return { success: true, data: { user, employee } };
  } catch (error) {
    console.error('Employee creation error:', error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function getEmployeeWithApproverAndSubordinates() {
  const user = await auth();
  
  if (!user?.user.email) {
    throw new Error("Unauthorized");
  }

  const employee = await prisma.employee.findFirst({
    where: {
      email: user?.user.email,
    },
    include: {
      approver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          position: true,
          department: true,
          image: true,
        },
      },
      subordinates: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          position: true,
          department: true,
          image: true,
        },
      },
    },
  });

  return employee;
}