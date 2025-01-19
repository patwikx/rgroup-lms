import { useState } from "react";
import { Input } from "@/components/ui/input";
import { updateLeaveType } from "@/actions/leave-settings";
import { toast } from "sonner";
import { LeaveType } from "@prisma/client";

interface EditableAnnualAllowanceProps {
  leaveType: LeaveType;
}

export function EditableAnnualAllowance({ leaveType }: EditableAnnualAllowanceProps) {
  const [value, setValue] = useState(leaveType.annualAllowance);
  const [isEditing, setIsEditing] = useState(false);

  const handleBlur = async () => {
    if (value !== leaveType.annualAllowance) {
      try {
        await updateLeaveType(leaveType.id, { annualAllowance: value });
        toast.success("Annual allowance updated successfully");
      } catch (error) {
        toast.error("Failed to update annual allowance");
        setValue(leaveType.annualAllowance);
      }
    }
    setIsEditing(false);
  };

  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => setValue(Number(e.target.value))}
      onFocus={() => setIsEditing(true)}
      onBlur={handleBlur}
      className="w-24"
    />
  );
}