import { forwardRef, useState } from "react";
import { cn } from "@/core/utils/cn";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
  errorMessage?: string;
  isPassword?: boolean;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, errorMessage, isPassword, className, id, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [hasBlurred, setHasBlurred] = useState(false);
    const [internalValue, setInternalValue] = useState(props.value || props.defaultValue || "");
    
    const hasValue = Boolean(internalValue);
    const isSuccess = hasValue && hasBlurred && !error;
    
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setHasBlurred(true);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        <label
          htmlFor={id ?? label}
          className={cn(
            "text-[13px] font-semibold transition-colors duration-200 flex items-center gap-2",
            error ? "text-red-600" : isSuccess ? "text-emerald-600" : "text-text-primary"
          )}
        >
          {label}
          {error && (
            <span className="text-[12px] font-medium text-red-500 flex items-center gap-1 animate-in fade-in ml-0.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMessage}
            </span>
          )}
          {isSuccess && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 animate-in fade-in ml-0.5" />
          )}
        </label>
        
        <div className="relative">
          <input
            ref={ref}
            id={id ?? label}
            type={inputType}
            className={cn(
              "block w-full rounded-lg border px-4 py-2.5 text-sm text-text-primary",
              "transition-colors duration-200 ease-in-out bg-background",
              "focus-visible:outline-none focus-visible:ring-[3px]",
              error 
                ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-400/20 pr-10" 
                : isSuccess 
                  ? "border-emerald-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20 pr-10"
                  : "border-border hover:border-border-hover focus-visible:border-indigo-600 focus-visible:ring-indigo-600/15",
              isPassword && "pr-10",
              className
            )}
            placeholder={`Nhập ${label.toLowerCase()}`}
            {...props}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          
          {/* Status / Action Icons inside input */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {!isPassword && error && <AlertCircle className="w-4 h-4 text-red-500 pointer-events-none" />}
            {!isPassword && isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500 pointer-events-none" />}
            
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "transition-colors focus:outline-none",
                  error ? "text-red-400 hover:text-red-600" : "text-text-muted hover:text-text-primary"
                )}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
