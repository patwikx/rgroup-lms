import { PrismaClient } from "@prisma/client";

type CreateUserParams = {
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
  department: string;
  position: string;
  isManager: boolean;
  isHR: boolean;
};

export async function createUserAndEmployee(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">,
  params: CreateUserParams
) {
  const user = await tx.user.create({
    data: {
      name: `${params.firstName} ${params.lastName}`,
      email: params.email,
      password: params.hashedPassword,
    },
  });

  const employee = await tx.employee.create({
    data: {
      empId: user.id,
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      department: params.department,
      position: params.position,
      isManager: params.isManager,
      isHR: params.isHR,
    },
  });

  return { user, employee };
}