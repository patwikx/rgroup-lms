'use server'

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ApprovalLevel } from "@prisma/client";
import { EmployeeFormData, EmployeeSchema } from "@/schemas";
import { revalidatePath } from "next/cache";

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
      },
    });

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        empId: user.id,
        firstName: fields.firstName,
        lastName: fields.lastName,
        email: fields.email,
        department: fields.department,
        position: fields.position,
        isManager: fields.isManager,
        isHR: fields.isHR,
        approvalLevel: approvalLevel,
        approverId: fields.supervisorId || null, // Add this line to set the approverId
      },
    });

    // Create initial leave balances
    const leaveTypes = await prisma.leaveType.findMany();
    const currentYear = new Date().getFullYear();

    await prisma.leaveBalance.createMany({
      data: leaveTypes.map((leaveType) => ({
        employeeId: employee.id,
        leaveTypeId: leaveType.id,
        year: currentYear,
        balance: leaveType.annualAllowance,
        used: 0,
        pending: 0,
      })),
    });
    revalidatePath('/dashboard/employee-management');
    return { success: true, data: { user, employee } };
  } catch (error) {
    console.error('Employee creation error:', error);
    return { success: false, error: "Something went wrong" };
  }
}