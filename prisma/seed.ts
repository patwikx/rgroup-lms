// seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash the password
  const hashedPassword = await bcrypt.hash('OJQNTDMHOQ', 10);

  // Create the admin user and employee
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@company.com', // You can customize this email
      password: hashedPassword,
      role: 'USER', // You can change this to 'SUPERVISOR' or 'HR' if needed
      employee: {
        create: {
          employeeId: 'ADMIN',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@company.com', // Ensure employee email is the same as user email
          department: 'Management', // Update department if necessary
          position: 'Admin',
          isActive: true,
          isManager: true,
          isHR: true,
          isTWC: false,
        },
      },
    },
  });

  console.log('Admin account created:', adminUser);
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
