"use client";

import Link from "next/link"
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, ChevronDown, ImageDown, Home, FolderTree, Package, ShoppingCart, Settings, Ruler, Palette, Scale, User, Menu, X, Users, FileCheck, GanttChart, BarChart, CalendarCheck, Hourglass, HourglassIcon, AlertCircle, History, InfoIcon, HistoryIcon, Activity, LogOut, Users2, FileText, FileArchive } from 'lucide-react';

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "./ui/separator";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/use-current-user";
import { FcProcess } from "react-icons/fc";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { signOut } from "@/auth";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useCurrentUser();

  if (!user) return null

  const routes = [
    {
      href: `/dashboard/pending-requests`,
      label: 'Pending Leave Requests',
      icon: InfoIcon,
      active: pathname === `/dashboard/pending-requests`,
    },
    {
      href: `/dashboard/leave-history`,
      label: 'Leave History',
      icon: History,
      active: pathname === `/dashboard/leave-history`,
    },
  ]

  const systemRoutes = [
    ...(user?.role === 'HR' ? [{
        href: `/dashboard/pmd-approval`,
        label: 'Leave Processing',
        icon: FileCheck,
        description: "Manage approved leave requests.",
        active: pathname === `/dashboard/pmd-approval`,
      }] : []),
      ...(user?.role === 'HR' ? [{
        href: `/dashboard/reports`,
        label: 'Leave Reports',
        icon: BarChart,
        description: "Pay period leave reports.",
        active: pathname === `/dashboard/reports`,
      }] : []),
    ...(user?.role === 'HR' ? [{
      href: `/dashboard/employee-management`,
      label: 'Employee Management',
      icon: Users,
      description: "Manage employee accounts.",
      active: pathname === `/dashboard/employee-management`,
    }] : []),
    ...(user?.role === 'HR' ? [{
      href: `/dashboard/settings`,
      label: 'Settings',
      icon: Settings,
      description: "Manage website settings.",
      active: pathname === `/dashboard/settings`,
    }] : []),
  ]

  const catalogRoutes = [
    {
      href: `/dashboard/approvals`,
      label: 'Request Approval',
      icon: AlertCircle,
      description: "Requires your approval.",
      active: pathname === `/dashboard/approvals`,
    },
    {
      href: `/dashboard/approval-history`,
      label: 'Approval History',
      icon: HistoryIcon,
      description: 'View your approval history.',
      active: pathname === `/dashboard/approval-history`,
    },
  ]

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
          icon: History,
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
    <nav
      className={cn("flex items-center space-x-1 lg:space-x-2", className)}
      {...props}
    >
      <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
        {routes.map((route) => {
          const Icon = route.icon;
          return (
            <Link
              key={route.href}
              href={route.href}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all',
                  'hover:bg-accent/50 hover:shadow-sm',
                  route.active 
                    ? 'bg-accent/60 text-accent-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-accent-foreground'
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                {route.label}
              </motion.div>
            </Link>
          );
        })}
        <DropdownMenu open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={catalogRoutes.some(route => route.active) ? "secondary" : "ghost"} 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium transition-all",
                "hover:bg-accent/50 hover:shadow-sm",
                catalogRoutes.some(route => route.active) 
                  ? 'bg-accent/60 text-accent-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-accent-foreground'
              )}
            >
              <Activity className="w-4 h-4 mr-2" />
              Approver Processing
              <motion.div
                animate={{ rotate: isCatalogOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-2 inline-block"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-[220px] p-2"
            sideOffset={8}
          >
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Approval Management
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {catalogRoutes.map((route) => {
              const Icon = route.icon;
              return (
                <DropdownMenuItem key={route.href} asChild>
                  <Link href={route.href} className="w-full">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'flex flex-col w-full rounded-md p-2 transition-all',
                        'hover:bg-accent/50',
                        route.active 
                          ? 'bg-accent/60 text-accent-foreground' 
                          : 'text-muted-foreground hover:text-accent-foreground'
                      )}
                    >
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-2" />
                        <span className="font-medium">{route.label}</span>
                      </div>
                      <span className="ml-6 text-xs text-muted-foreground">
                        {route.description}
                      </span>
                    </motion.div>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu open={isSystemOpen} onOpenChange={setIsSystemOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={systemRoutes.some(route => route.active) ? "secondary" : "ghost"} 
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium transition-all",
                "hover:bg-accent/50 hover:shadow-sm",
                systemRoutes.some(route => route.active) 
                  ? 'bg-accent/60 text-accent-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-accent-foreground'
              )}
            >
              <CalendarCheck className="w-4 h-4 mr-2" />
              PMD Processing
              <motion.div
                animate={{ rotate: isSystemOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-2 inline-block"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-[220px] p-2"
            sideOffset={8}
          >
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Leave Management
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.role === 'HR' ? (
              systemRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <DropdownMenuItem key={route.href} asChild>
                    <Link href={route.href} className="w-full">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'flex flex-col w-full rounded-md p-2 transition-all',
                          'hover:bg-accent/50',
                          route.active 
                            ? 'bg-accent/60 text-accent-foreground' 
                            : 'text-muted-foreground hover:text-accent-foreground'
                        )}
                      >
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          <span className="font-medium">{route.label}</span>
                        </div>
                        <span className="ml-6 text-xs text-muted-foreground">
                          {route.description}
                        </span>
                      </motion.div>
                    </Link>
                  </DropdownMenuItem>
                );
              })
            ) : (
              <div className="text-center py-2 text-sm text-muted-foreground">
                You&apos;re not authorized to view this
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

