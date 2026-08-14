import { cn } from "@/core/utils/cn";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

export function Avatar({ src, alt = "", fallback, size = "md", className }: AvatarProps) {
  const initials = fallback
    ? fallback.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className={cn("relative inline-flex shrink-0 overflow-hidden rounded-full", sizeMap[size], className)}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-indigo-700 font-semibold">
          {initials}
        </div>
      )}
    </div>
  );
}
