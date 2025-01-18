'use client'
import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '../ui/dropdown-menu'
import Link from 'next/link'
import { CircleUser, ClipboardListIcon, FileTextIcon, HomeIcon, Menu, Package2, Search, Settings, User } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import TeamSwitcher from './team-switcher'
import { SystemMenu } from './system-menu'
import { SideBarNav } from '../sidebar/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useCurrentUser } from '@/hooks/use-current-user'
import { Badge } from '../ui/badge'

export function Header () {
  const user = useCurrentUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' }); // Sign out and redirect to homepage
    router.push('/'); // Navigate to the homepage
  };

  return (
    <div className="flex w-full items-center justify-between mb-4">
      <header className="sticky top-0 flex h-16 items-center gap-6 border-b bg-background px-4 md:px-6 w-full">
        <SideBarNav />
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <SystemMenu />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
                  <TeamSwitcher className="mt-4" />
                </Link>
                <Link href="#" className="flex items-center gap-2 hover:text-foreground">
                  <HomeIcon className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ClipboardListIcon className="h-5 w-5" />
                  For Approval
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <FileTextIcon className="h-5 w-5" />
                  Payslip Management
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
        <div className="flex items-center gap-4 ml-auto">
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
  <Button variant="ghost" className="relative h-8 w-8">
    <Avatar className="h-8 w-8">
      {user?.image ? (
        <AvatarImage src={user.image} alt={`${user?.firstName} ${user?.lastName}`} />
      ) : (
        <AvatarFallback>
          {user?.firstName?.charAt(0)}
          {user?.lastName?.charAt(0)}
        </AvatarFallback>
      )}
    </Avatar>
  </Button>
</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
            
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
        </div>
      </header>
    </div>
  )
}

export default Header
