"use client";



import { useCurrentRole } from "@/hooks/use-current-role";
import { FormError } from "@/components/form-error";

interface RoleGateProps {
  children: React.ReactNode;

};

export const RoleGate = ({
  children,

}: RoleGateProps) => {
  const role = useCurrentRole();

  if (role === "unauthenticated") {
    return (
      <FormError message="You do not have permission to view this content!" />
    )
  }

  return (
    <>
      {children}
    </>
  );
};
