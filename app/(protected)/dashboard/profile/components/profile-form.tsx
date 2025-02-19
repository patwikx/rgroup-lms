"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Camera, Shield, Users, Info } from "lucide-react"
import type { User } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { updateProfile } from "@/actions/profile-page"
import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ProfileHeader } from "./profile-header"
import { SecuritySettings } from "./security-settings"
import { TeamStructure } from "./team-structure"

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(2, "Department is required"),
  position: z.string().min(2, "Position is required"),
  phoneNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
  address: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  initialData: User & {
    approver: User | null
    subordinates: {
      id: string
      firstName: string
      lastName: string
      position: string | null
    }[]
  }
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      department: initialData.department || "",
      position: initialData.position || "",
      phoneNumber: initialData.contactNo || "",
      emergencyContact: initialData.emergencyContactNo || "",
      address: initialData.address || "",
    },
  })

  const { isDirty } = form.formState

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsLoading(true)
      const result = await updateProfile(data)

      if (result.success) {
        toast.success("Profile updated successfully")
        form.reset(data)
      } else {
        toast.error(result.error || "Something went wrong")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { value: "general", label: "General", icon: Camera },
    { value: "security", label: "Security", icon: Shield },
    { value: "team", label: "Team", icon: Users },
  ] 

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
          <div className="flex w-full max-w-[400px] bg-muted p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex items-center justify-center gap-2 flex-1 rounded-md py-2 px-3 text-sm font-medium transition-all",
                    activeTab === tab.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                </button>
              )
            })}
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button
              variant="outline"
              disabled={isLoading || !isDirty}
              onClick={() => form.reset()}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading || !isDirty}
              className="flex-1 sm:flex-none"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {activeTab === "general" && (
              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                {/* Profile Image */}
                <Card className="w-[200px] mb-6">
                  <CardHeader className="p-0">
                    <div className="relative h-[200px] w-[200px]">
                      {initialData.image ? (
                        <div className="relative h-[180px] w-[180px] mx-auto mt-[10px]">
                          <Image
                            src={initialData.image || "/placeholder.svg"}
                            alt={`${initialData.firstName} ${initialData.lastName}`}
                            fill
                            className="rounded-full object-cover"
                            sizes="190px"
                          />
                        </div>
                      ) : (
                        <div className="h-[190px] w-[190px] rounded-full bg-muted flex items-center justify-center mx-auto mt-[5px] text-4xl">
                          {initialData.firstName[0]}
                          {initialData.lastName[0]}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 p-1">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                              <Camera className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <div className="flex items-center">
                              <Info className="h-12 w-12 mr-2 text-yellow-600" />
                              <p className="text-sm text-yellow-600">
                                Profile picture upload functionality coming soon
                              </p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal information and contact details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" disabled />
                            </FormControl>
                            <FormDescription>This email will be used for all communications</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" />
                            </FormControl>
                            <FormDescription>Include country code (e.g., +1 234 567 8900)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>Phone number of emergency contact person</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Employment Information */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Employment Information</CardTitle>
                    <CardDescription>Your current employment details and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <FormLabel>Employee ID</FormLabel>
                        <Input value={initialData.employeeId || ""} disabled />
                      </div>
                      <div>
                        <FormLabel>Joining Date</FormLabel>
                        <Input
                          value={new Date(initialData.joiningDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          disabled
                        />
                      </div>
                      <div>
                        <FormLabel>Status</FormLabel>
                        <Badge variant={initialData.isActive ? "success" : "destructive"} className="mt-2 ml-4">
                          {initialData.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollArea>
            )}

            {activeTab === "security" && (
              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                <SecuritySettings />
              </ScrollArea>
            )}

            {activeTab === "team" && (
              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                <TeamStructure initialData={initialData} />
              </ScrollArea>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}

