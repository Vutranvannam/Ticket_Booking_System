import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { Button } from "@/shared/components/atoms/Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" };

export function Modal({ open, onClose, title, children, className, size = "md" }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative w-full mx-4 rounded-2xl bg-white shadow-xl", sizeMap[size], className)}>
        {title && (
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full p-1.5 h-auto">
              <X size={16} />
            </Button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
