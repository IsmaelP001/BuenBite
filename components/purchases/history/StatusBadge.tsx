import { Badge } from "@/components/ui/badge";
import { PurchaseStatus } from "@/types/models/purchase";
import { Clock, CheckCircle2 } from "lucide-react";

interface StatusBadgeProps {
  status: PurchaseStatus;
}

const statusConfig: Record<
  PurchaseStatus,
  {
    label: string;
    className: string;
    icon: React.ReactNode;
  }
> = {
  pending: {
    label: "Pendiente",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <Clock className="w-3 h-3" />,
  },
  confirmed: {
    label: "Completado",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) return null;

  return (
    <Badge
      variant="outline"
      className={`gap-1 ${config.className}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}

