import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/core/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:     "bg-primary-600 text-white shadow-sm hover:bg-primary-700",
        secondary:   "bg-surface-2 text-text-primary hover:bg-surface-1",
        outline:     "border border-border bg-background text-text-primary hover:bg-surface-1",
        ghost:       "text-text-secondary hover:bg-surface-1",
        destructive: "bg-danger text-white shadow-sm hover:bg-danger/90",
        success:     "bg-success text-white shadow-sm hover:bg-success/90",
        link:        "text-primary-600 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base",
      },
      fullWidth: { true: "w-full" },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
