"use client";

import Link from "next/link"
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, CalendarCheck, FileText, History, ChevronDown, Settings, Users2, FileArchive, AlertCircle, TimerIcon } from 'lucide-react';

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
import { useCurrentUser } from "@/hooks/use-current-user";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const user = useCurrentUser();

  if (!user) return null;

  const isApprover = user.role === 'SUPERVISOR';
  const isHR = user.role === 'HR';

  const routes = [
    {
      href: `/dashboard/pending-requests`,
      label: 'Pending Leave Requests',
      icon: FileText,
      active: pathname === `/dashboard/pending-requests`,
    },
    {
      href: `/dashboard/overtime`,
      label: 'Overtime Filing',
      icon: TimerIcon,
      active: pathname === `/dashboard/overtime`,
    },
    {
      href: `/dashboard/leave-history`,
      label: 'Leave History',
      icon: History,
      active: pathname === `/dashboard/leave-history`,
    },
  ];

  const approverRoutes = [
    {
      href: `/dashboard/approvals`,
      label: 'Request Approval',
      icon: AlertCircle,
      description: "Requires your approval.",
      active: pathname === `/dashboard/approvals`,
    },
  ];

  const hrRoutes = [
    {
      href: `/dashboard/pmd-approval`,
      label: 'Leave Processing',
      icon: FileText,
      description: "Manage approved leave requests.",
      active: pathname === `/dashboard/pmd-approval`,
    },
    {
      href: `/dashboard/reports`,
      label: 'Leave Reports',
      icon: FileArchive,
      description: "Pay period leave reports.",
      active: pathname === `/dashboard/reports`,
    },
    {
      href: `/dashboard/employee-management`,
      label: 'Employee Management',
      icon: Users2,
      description: "Manage employee accounts.",
      active: pathname === `/dashboard/employee-management`,
    },
    {
      href: `/dashboard/settings`,
      label: 'Settings',
      icon: Settings,
      description: "Manage website settings.",
      active: pathname === `/dashboard/settings`,
    },
  ];

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

        {/* Approver Processing - Only visible for SUPERVISOR role */}
        {isApprover && (
          <DropdownMenu open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={approverRoutes.some(route => route.active) ? "secondary" : "ghost"} 
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium transition-all",
                  "hover:bg-accent/50 hover:shadow-sm",
                  approverRoutes.some(route => route.active) 
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
              {approverRoutes.map((route) => {
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
        )}

        {/* PMD Processing - Only visible for HR role */}
        {isHR && (
          <DropdownMenu open={isSystemOpen} onOpenChange={setIsSystemOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={hrRoutes.some(route => route.active) ? "secondary" : "ghost"} 
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium transition-all",
                  "hover:bg-accent/50 hover:shadow-sm",
                  hrRoutes.some(route => route.active) 
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
              {hrRoutes.map((route) => {
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
        )}
      </div>
    </nav>
  );
}