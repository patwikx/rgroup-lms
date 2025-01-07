'use client'

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getAvailableApprovers } from "@/actions/approver";

import { Approver } from "@/types/type";
import { EmployeeFormFields } from "./employee-form-fields";
import { EmployeeFormData, EmployeeSchema } from "@/schemas";
import { createEmployee } from "@/actions/employee";

export function EmployeeRegistrationForm() {
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
      hrApproverId: "",
      role: "USER", // Add default role
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
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <EmployeeFormFields
      form={form}
      onSubmit={onSubmit}
      loading={loading}
      approvers={approvers}
    />
  );
}