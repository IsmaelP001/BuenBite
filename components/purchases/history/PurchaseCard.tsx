import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { ShoppingCart, Calendar, Package } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { PurchaseData } from "@/types/models/purchase";
import clsx from "clsx";

interface PurchaseCardProps {
  purchase: PurchaseData;
}

import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { PurchaseStatus } from "@/types/models/purchase";

export const statusConfig: Record<
  PurchaseStatus,
  {
    label: string;
    badge: string;
    icon: React.ReactNode;
  }
> = {
  pending: {
    label: "Pendiente",
    badge:
      "bg-amber-100 text-amber-700 border-amber-200 " +
      "dark:bg-amber-900/30 dark:text-amber-400",
    icon: <Clock className="w-3 h-3" />,
  },
  confirmed: {
    label: "Completado",
    badge:
      "bg-emerald-100 text-emerald-700 border-emerald-200 " +
      "dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelado",
    badge:
      "bg-red-100 text-red-700 border-red-200 " +
      "dark:bg-red-900/30 dark:text-red-400",
    icon: <XCircle className="w-3 h-3" />,
  },
};


export function PurchaseCard({ purchase }: PurchaseCardProps) {
  return (
    <Link href={`/purchases/history/${purchase.id}`}>
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  "flex items-center justify-center w-12 h-12 rounded-xl transition-colors",
                  purchase.status === "pending" &&
                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30",
                  purchase.status === "confirmed" &&
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30",
                  purchase.status === "cancelled" &&
                    "bg-red-100 text-red-700 dark:bg-red-900/30"
                )}
              >
                <ShoppingCart className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-bold text-foreground">
                  Orden #{purchase?.orderNumber}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {format(
                      new Date(purchase.purchaseDate),
                      "d 'de' MMMM, yyyy",
                      {
                        locale: es,
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>
            <StatusBadge status={purchase.status as any} />
          </div>

          <div className="flex items-center gap-1.5 mt-4 text-sm text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>{purchase.totalItems} artículos</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
