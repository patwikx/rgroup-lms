
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

import { Metadata } from "next";
import { auth } from "@/auth";
import ProfileForm from "./components/profile-form";

export const metadata: Metadata = {
  title: "Profile Settings | Employee Portal",
  description: "Manage your profile settings and personal information",
};

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  const employee = await prisma.employee.findUnique({
    where: {
      empId: session.user.id,
    },
    include: {
      user: true,
      approver: true,
      subordinates: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          position: true,
        },
      },
    },
  });

  if (!employee) {
    return <div>Employee not found</div>;
  }

  return (
    <div className="container max-w-6xl py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-8 mt-[-25px]">My Profile</h1>
      <ProfileForm initialData={employee} />
    </div>
  );
}