import { forwardRef } from "react";
import { cn } from "@/core/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary",
        "placeholder:text-text-muted transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 focus-visible:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-2",
        error
          ? "border-danger focus-visible:ring-danger"
          : "border-border hover:border-border-hover",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
