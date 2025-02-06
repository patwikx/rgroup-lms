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

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  approverId: z.string().optional(),
});

interface Approver {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

interface UserDetailsFormProps {
  user: any;
  onSuccess: (updatedUser: any) => void;
}

export function UserDetailsForm({ user, onSuccess }: UserDetailsFormProps) {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        if (user?.employee?.id) {
          const availableApprovers = await getAvailableApprovers(user.employee.id);
          setApprovers(availableApprovers);
        }
      } catch (error) {
        toast.error('Failed to fetch approvers');
      }
    };
    fetchApprovers();
  }, [user?.employee?.id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.employee?.firstName || '',
      lastName: user?.employee?.lastName || '',
      email: user?.email || '',
      department: user?.employee?.department || '',
      position: user?.employee?.position || '',
      approverId: user?.employee?.approverId || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const result = await updateUserDetails(user.id, {
        ...values,
        approvalLevel: user?.employee?.approvalLevel || 'USER',
      });

      if (result.success) {
        const selectedApprover = values.approverId === 'no-approver' 
          ? null 
          : approvers.find(a => a.id === values.approverId);

        const updatedUser = {
          ...user,
          email: values.email,
          name: `${values.firstName} ${values.lastName}`,
          employee: {
            ...user.employee,
            firstName: values.firstName,
            lastName: values.lastName,
            department: values.department,
            position: values.position,
            approverId: values.approverId === 'no-approver' ? null : values.approverId,
            approver: selectedApprover ? {
              firstName: selectedApprover.firstName,
              lastName: selectedApprover.lastName,
              position: selectedApprover.position,
            } : null
          }
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
                      {approver.firstName} {approver.lastName} - {approver.position}
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
