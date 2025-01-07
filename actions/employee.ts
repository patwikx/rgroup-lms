'use server'

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ApprovalLevel } from "@prisma/client";
import { EmployeeFormData, EmployeeSchema } from "@/schemas";

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
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name: `${fields.firstName} ${fields.lastName}`,
        email: fields.email,
        password: hashedPassword,
        role: fields.role === "HR" ? "HR" : fields.role === "SUPERVISOR" ? "SUPERVISOR" : "USER",
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
      },
    });

    // Create leave approvers
    await prisma.leaveApprover.createMany({
      data: [
        {
          employeeId: employee.id,
          approverId: fields.supervisorId,
          approvalLevel: ApprovalLevel.SUPERVISOR,
        },
        {
          employeeId: employee.id,
          approverId: fields.hrApproverId,
          approvalLevel: ApprovalLevel.HR,
        },
      ],
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

    return { success: true, data: { user, employee } };
  } catch (error) {
    console.error('Employee creation error:', error);
    return { success: false, error: "Something went wrong" };
  }
}