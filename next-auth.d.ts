import { ApprovalLevel } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

// Define the Employee type based on your schema
type Employee = {
  id: string;
  empId: string;
  employeeId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
  contactNo: string | null;
  address: string | null;
  emergencyContactNo: string | null;
  department: string;
  position: string;
  joiningDate: Date;
  isActive: boolean;
  isManager: boolean;
  isHR: boolean;
  isTWC: boolean;
  approvalLevel: ApprovalLevel;
};

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  role: ApprovalLevel;
  employeeId: string | null;
  isOAuth: boolean;
  // Include employee details
  employee: Employee | null;
  // Helper properties for easy access
  isApprover: boolean;
  isHR: boolean;
  isManager: boolean;
  firstName: string;
  lastName: string;
  image: string | null;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}