import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/core/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:   "bg-indigo-100 text-indigo-800",
        secondary: "bg-slate-100 text-slate-700",
        success:   "bg-success text-white shadow-sm",
        warning:   "bg-warning text-white shadow-sm",
        danger:    "bg-danger text-white shadow-sm",
        outline:   "border border-slate-300 text-slate-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
