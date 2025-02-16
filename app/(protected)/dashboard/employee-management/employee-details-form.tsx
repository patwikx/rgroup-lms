'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { updateUserDetails, getAvailableApprovers } from '@/actions/employee-management';
import { useRouter } from 'next/navigation';
import { ApprovalLevel } from '@prisma/client';

interface Approver {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  role: ApprovalLevel;
}

interface UserDetailsFormProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
    position?: string;
    approverId?: string;
    role: ApprovalLevel;
    approver?: {
      firstName: string;
      lastName: string;
      position: string | null;
    } | null;
  };
  onSuccess: (updatedUser: any) => void;
}

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  approverId: z.string().optional(),
});

export function UserDetailsForm({ user, onSuccess }: UserDetailsFormProps) {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const availableApprovers = await getAvailableApprovers(user.id);
        setApprovers(availableApprovers);
      } catch (error) {
        toast.error('Failed to fetch approvers');
      }
    };
    fetchApprovers();
  }, [user.id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department || '',
      position: user.position || '',
      approverId: user.approverId || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const result = await updateUserDetails(user.id, {
        ...values,
        role: user.role,
      });

      if (result.success) {
        const selectedApprover = values.approverId === 'no-approver' 
          ? null 
          : approvers.find(a => a.id === values.approverId);

        const updatedUser = {
          ...user,
          ...values,
          approverId: values.approverId === 'no-approver' ? null : values.approverId,
          approver: selectedApprover ? {
            firstName: selectedApprover.firstName,
            lastName: selectedApprover.lastName,
            position: selectedApprover.position,
          } : null
        };

        toast.success('User details updated successfully');
        onSuccess(updatedUser);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update user details');
      }
    } catch (error) {
      toast.error('Failed to update user details');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
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
                <Input {...field} disabled={isLoading} />
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
                <Input {...field} type="email" disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
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
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="approverId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Approver</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an approver" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-approver">No Approver</SelectItem>
                  {approvers.map((approver) => (
                    <SelectItem key={approver.id} value={approver.id}>
                      {approver.firstName} {approver.lastName} - {approver.position || 'No Position'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Details'
          )}
        </Button>
      </form>
    </Form>
  );
}