import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/core/utils/cn";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className={cn("flex items-center gap-1 text-sm", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight size={14} className="text-slate-400" />}
          {item.href && index < items.length - 1 ? (
            <Link to={item.href} className="text-slate-500 hover:text-indigo-600 transition-colors">{item.label}</Link>
          ) : (
            <span className="font-medium text-slate-800">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
