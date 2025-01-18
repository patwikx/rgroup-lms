"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, ChevronDown, FileText, CalendarCheck, FileArchive, Settings, Users2 } from 'lucide-react'
import { signOut } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCurrentUser } from "@/hooks/use-current-user"


export function SideBarNav() {
  const user = useCurrentUser();
  const pathname = usePathname()

  if (!user) return null

  const isApprover = user.role === 'SUPERVISOR';
  const isHR = user.role === 'HR';

  const navigationItems = [
    {
      title: 'Main Menu',
      items: [
        {
          href: "/dashboard/pending-requests",
          label: 'Pending Leave Requests',
          icon: FileText,
          description: "View pending leave requests"
        },
        {
          href: "/dashboard/leave-history",
          label: 'Leave History',
          icon: FileText,
          description: "View your leave history"
        },
      ]
    },
    ...(isApprover ? [{
      title: 'Approver Actions',
      items: [
        {
          href: "/dashboard/approvals",
          label: 'For Approval',
          icon: CalendarCheck,
          description: "Approve pending leave requests"
        },
      ]
    }] : []),
    ...(isHR ? [{
      title: 'HR Actions',
      items: [
        {
          href: "/dashboard/employee-management",
          label: 'Employee Management',
          icon: Users2,
          description: "Manage employee information"
        },
        {
          href: "/dashboard/pmd-approval",
          label: 'PMD - For Approval',
          icon: FileText,
          description: "Approve PMD requests"
        },
        {
          href: "/dashboard/reports",
          label: 'Leave Reports',
          icon: FileArchive,
          description: "Generate and view leave reports"
        },
      ]
    }] : []),
    {
      title: 'Profile',
      items: [
        {
          href: "/dashboard/profile",
          label: 'Employee Profile',
          icon: Users2,
          description: "Manage your account profile"
        },
      ]
    },
    
    ...(isHR ? [{
      title: 'Settings',
      items: [
        {
          href: "/dashboard/settings",
          label: 'Settings',
          icon: Settings,
          description: "Manage your account settings"
        },
      ]
    }] : []),
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-4 pt-6 pb-4 border-b">
            <div className="flex items-center space-x-3">
              <Image src="/assets/rdh.webp" alt="Logo" width={40} height={40} className="rounded-lg" />
              <div>
                <SheetTitle className="text-md">RD Hardware & Fishing Supply, Inc.</SheetTitle>
                <p className="text-sm text-muted-foreground">Leave Management System</p>
              </div>
            </div>
          </SheetHeader>
          
          <div className="flex-1 overflow-auto">
            <div className="space-y-6 py-4">
              {navigationItems.map((section, i) => (
                <div key={i} className="px-4 space-y-3">
                  <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                    {section.title}
                  </h2>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            isActive ? "bg-accent/60 text-accent-foreground shadow-sm" : "text-muted-foreground",
                            "transition-all duration-200 ease-in-out"
                          )}
                        >
                          <Icon className={cn(
                            "mr-3 h-5 w-5",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                          )} />
                          <div className="flex flex-col">
                            <span>{item.label}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t px-4 py-4">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {user.name
                    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                    : '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={() => signOut()}
            >
              <ChevronDown className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
