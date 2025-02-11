"use client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import Link from "next/link"
import { ClipboardListIcon, HomeIcon, LogOut, Menu, Settings, User } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import TeamSwitcher from "./team-switcher"
import { SideBarNav } from "../sidebar/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useCurrentUser } from "@/hooks/use-current-user"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { MainNav } from "../new-system-header"

export function Header() {
  const user = useCurrentUser()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" }) // Sign out and redirect to homepage
    router.push("/") // Navigate to the homepage
  }

  return (
    <div className="flex w-full items-center justify-between mb-4">
      <header className="sticky top-0 flex h-16 items-center gap-6 border-b bg-background px-4 md:px-6 w-full">
        <SideBarNav />
        <div className="hidden md:block">
          <TeamSwitcher />
        </div>
        <MainNav />
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
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
                <Link href="#" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <ClipboardListIcon className="h-5 w-5" />
                  For Approval
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
                <Link href="#" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 px-3 py-2 h-12">
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
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
                <CaretSortIcon className="ml-2 h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                  Profile
                  <DropdownMenuShortcut>
                    <User className="h-5 w-5" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Log out
                <DropdownMenuShortcut>
                  <LogOut className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  )
}

export default Header
