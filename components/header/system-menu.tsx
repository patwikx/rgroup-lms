"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { CalendarCheck, FileArchive, FileTextIcon, Settings, Users2Icon } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import TeamSwitcher from "./team-switcher"




export function SystemMenu() {

  const user = useCurrentUser();

  const isApprover = user?.role === 'SUPERVISOR';
  const isHR = user?.role === 'HR';

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
        <TeamSwitcher />
        </NavigationMenuItem>
        <NavigationMenuItem className="ml-4">
          <Link href="/dashboard/pending-requests" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <FileTextIcon className="h-4 w-4 mr-2"/>Pending Leave Requests
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        {(isApprover && 
        <NavigationMenuItem>
        <Link href="/dashboard/approvals" legacyBehavior passHref>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <CalendarCheck className="h-4 w-4 mr-2"/>For Approval
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      )}
      
          <NavigationMenuItem>
          <Link href="/dashboard/leave-history" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <FileTextIcon className="h-4 w-4 mr-2"/>Leave History
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        {(isHR &&
        <NavigationMenuItem>
          <Link href="/dashboard/employee-management" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <FileTextIcon className="h-4 w-4 mr-2"/>Employee Management
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        )}
        {(isHR &&
        <NavigationMenuItem>
          <Link href="/dashboard/pmd-approval" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <FileTextIcon className="h-4 w-4 mr-2"/>PMD - For Approval
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        )}
        {(isHR &&
          <NavigationMenuItem>
          <Link href="/dashboard/reports" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <FileArchive className="h-4 w-4 mr-2"/>Leave Reports
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        )}
          {(isHR &&
        <NavigationMenuItem>
          <Link href="/dashboard/settings" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Settings className="h-4 w-4 mr-2"/>Settings
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
