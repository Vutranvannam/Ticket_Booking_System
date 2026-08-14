import { cn } from "@/core/utils/cn";
import { Label } from "@/shared/components/atoms/Label";

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormField({ label, error, required, children, className, id }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <Label htmlFor={id} required={required}>{label}</Label>}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
