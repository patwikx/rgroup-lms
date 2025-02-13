import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateLeaveBalance } from "@/actions/leave-settings";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface EditableLeaveBalanceProps {
  id: string;
  initialBalance: number;
}

export function EditableLeaveBalance({ id, initialBalance }: EditableLeaveBalanceProps) {
  const [value, setValue] = useState(initialBalance);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (value !== initialBalance) {
      try {
        setIsLoading(true);
        await updateLeaveBalance(id, value);
        toast.success("Leave balance updated successfully");
        setIsEditing(false);
      } catch (error) {
        toast.error("Failed to update leave balance");
        setValue(initialBalance);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          setValue(Number(e.target.value));
          setIsEditing(true);
        }}
        className="w-24"
      />
      {isEditing && (
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Save
              <Save className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}