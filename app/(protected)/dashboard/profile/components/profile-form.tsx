"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Camera, Shield, Users, Info } from "lucide-react";
import { User } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { updateProfile, changePassword } from "@/actions/profile-page";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(2, "Department is required"),
  position: z.string().min(2, "Position is required"),
  phoneNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ProfileFormProps {
  initialData: User & {
    approver: User | null;
    subordinates: {
      id: string;
      firstName: string;
      lastName: string;
      position: string | null;
    }[];
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

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
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { isDirty } = form.formState;

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsLoading(true);
      const result = await updateProfile(data);
      
      if (result.success) {
        toast.success("Profile updated successfully");
        form.reset(data);
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    try {
      setIsLoading(true);
      const result = await changePassword(data);
      
      if (result.success) {
        toast.success("Password changed successfully");
        passwordForm.reset();
        setIsPasswordDialogOpen(false);
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <div className="flex items-center justify-between">
        <TabsList className="grid w-full max-w-[400px] grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            disabled={isLoading || !isDirty} 
            onClick={() => form.reset()}
            className="ml-4"
          >
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading || !isDirty}
            size='sm'
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <TabsContent value="general" className="space-y-6">
            {/* Profile Image */}
            <Card className="w-[200px]">
              <CardHeader className="p-0">
                <div className="relative h-[200px] w-[200px]">
                  {initialData.image ? (
                    <div className="relative h-[180px] w-[180px] mx-auto mt-[10px]">
                      <Image
                        src={initialData.image}
                        alt={`${initialData.firstName} ${initialData.lastName}`}
                        fill
                        className="rounded object-cover"
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
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
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
                        <FormDescription>
                          This email will be used for all communications
                        </FormDescription>
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
                        <FormDescription>
                          Include country code (e.g., +1 234 567 8900)
                        </FormDescription>
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
                        <FormDescription>
                          Phone number of emergency contact person
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Employment Information</CardTitle>
                <CardDescription>
                  Your current employment details and status
                </CardDescription>
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
                    <Input value={initialData.employeeId || ''} disabled />
                  </div>
                  <div>
                    <FormLabel>Joining Date</FormLabel>
                    <Input 
                      value={new Date(initialData.joiningDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} 
                      disabled 
                    />
                  </div>
                  <div>
                    <FormLabel>Status</FormLabel>
                    <Badge 
                      variant={initialData.isActive ? "success" : "destructive"}
                      className="mt-2 ml-4"
                    >
                      {initialData.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security preferences and active sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Change Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Update your password regularly to keep your account secure
                      </p>
                    </div>
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Update</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and choose a new one
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...passwordForm}>
                          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                            <FormField
                              control={passwordForm.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>New Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm New Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPasswordDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Change Password
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Active Sessions</h4>
                      <p className="text-sm text-muted-foreground">
                        View and manage your active login sessions
                      </p>
                    </div>
                    <Button variant="outline">View All</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Structure</CardTitle>
                <CardDescription>
                  View your reporting relationships and team members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {initialData.approver && (
                  <div>
                    <h4 className="text-sm font-medium mb-4">Reports To</h4>
                    <div className="flex items-center space-x-4 rounded-lg border p-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg">
                          {initialData.approver.firstName[0]}
                          {initialData.approver.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {initialData.approver.firstName} {initialData.approver.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {initialData.approver.position}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {initialData.subordinates.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-4">Team Members ({initialData.subordinates.length})</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      {initialData.subordinates.map((subordinate) => (
                        <div
                          key={subordinate.id}
                          className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {subordinate.firstName[0]}
                              {subordinate.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {subordinate.firstName} {subordinate.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {subordinate.position}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!initialData.approver && initialData.subordinates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No team relationships configured
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </form>
      </Form>
    </Tabs>
  );
}