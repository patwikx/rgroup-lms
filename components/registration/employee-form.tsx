'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getAvailableApprovers } from "@/actions/approver";
import { Approver } from "@/types/type";
import { EmployeeFormFields } from "./employee-form-fields";
import { EmployeeFormData, EmployeeSchema } from "@/schemas";
import { createEmployee } from "@/actions/employee";

export function EmployeeRegistrationDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvers, setApprovers] = useState<Approver[]>([]);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(EmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      department: "",
      position: "",
      isManager: false,
      isHR: false,
      supervisorId: "",
      role: "USER",
    },
  });

  // Watch for changes in isHR and isManager
  const isHR = form.watch("isHR");
  const isManager = form.watch("isManager");

  // Update role when checkboxes change
  useEffect(() => {
    if (isHR) {
      form.setValue("role", "HR");
    } else if (isManager) {
      form.setValue("role", "SUPERVISOR");
    } else {
      form.setValue("role", "USER");
    }
  }, [isHR, isManager, form]);

  useEffect(() => {
    const loadApprovers = async () => {
      const data = await getAvailableApprovers();
      setApprovers(data);
    };
    loadApprovers();
  }, []);

  async function onSubmit(data: EmployeeFormData) {
    setLoading(true);
    try {
      const result = await createEmployee(data);
      
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Employee registered successfully");
      form.reset();
      setOpen(false); // Close the dialog after successful submission
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Register New Employee</DialogTitle>
        </DialogHeader>
        <EmployeeFormFields
          form={form}
          onSubmit={onSubmit}
          loading={loading}
          approvers={approvers}
        />
      </DialogContent>
    </Dialog>
  );
}