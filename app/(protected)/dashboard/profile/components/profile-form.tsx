"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Camera, Shield, Users } from "lucide-react";
import { Employee, User } from "@prisma/client";
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
import { updateProfile } from "@/actions/profile-page";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: Employee & {
    user: User;
    approver: Employee | null;
    subordinates: {
      id: string;
      firstName: string;
      lastName: string;
      position: string;
    }[];
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      department: initialData.department,
      position: initialData.position,
      phoneNumber: initialData.contactNo || "",
      emergencyContact: initialData.emergencyContactNo || "",
      address: initialData.address || "",
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
            <Card className="w-[200px] items-center">
              <CardHeader className="p-0">
                <div className="relative h-[200px] w-[200px]">
                  <Avatar className="h-[190px] w-[190px] ml-[5px] mt-[5px]">
                    <AvatarImage src={initialData.image || ""} />
                    <AvatarFallback className="text-2xl">
                      {initialData.firstName[0]}
                      {initialData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 p-1">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                          <Camera className="h-4 w-4" />
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <p className="text-sm">
                          Profile picture upload functionality coming soon
                        </p>
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
                    <Input value={initialData.empId} disabled />
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
                    <Button variant="outline">Update</Button>
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