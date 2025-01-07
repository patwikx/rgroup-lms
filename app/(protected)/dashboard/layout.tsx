import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { prisma } from "@/lib/db";

import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/header/header';

export const metadata = {
  title: 'RD Group LMS',
  description: 'RD Group Leave Management System',
}


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
 
  })

  if (!user) {
    redirect('/')
  }
  return (
    <>
    <Header />
      {children}
      <Toaster />
    </>
  )
}