import { Badge } from "@/shared/components/atoms/Badge";

interface StatusBadgeProps {
  status: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({ status, activeLabel = "Hoạt động", inactiveLabel = "Vô hiệu" }: StatusBadgeProps) {
  return (
    <Badge variant={status ? "success" : "secondary"}>
      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${status ? "bg-emerald-500" : "bg-slate-400"}`} />
      {status ? activeLabel : inactiveLabel}
    </Badge>
  );
}
