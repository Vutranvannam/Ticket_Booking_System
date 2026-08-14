import { forwardRef } from "react";
import { cn } from "@/core/utils/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900",
      "placeholder:text-slate-400 transition-colors resize-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
      "disabled:cursor-not-allowed disabled:opacity-50",
      error ? "border-red-400" : "border-slate-300 hover:border-slate-400",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
