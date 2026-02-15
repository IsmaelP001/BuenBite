import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Printer, Share2, Calendar, Package, Hash } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PurchaseData, PurchaseItem } from "@/types/models/purchase";
import { StatusBadge } from "./StatusBadge";

interface PurchaseDetailProps {
  purchase: PurchaseData;
  items: PurchaseItem[];
  onBack: () => void;
}

export function PurchaseDetail({ purchase, items, onBack }: PurchaseDetailProps) {

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `Lista de compras #${purchase.totalItems}`,
      text: `Lista de compras con ${purchase.totalItems} artículos`,
      url: window.location.href,
    };

  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <div className="flex gap-2">
          <Button variant="icon" size="icon" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="icon" size="icon" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Order Info Card */}
      <Card className="print-container">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Lista de Compras
              </h1>
              <p className="text-muted-foreground mt-1">
                Orden #{purchase.id}
              </p>
            </div>
            <StatusBadge status={purchase.status as any} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-primary">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Número de orden</p>
                <p className="font-semibold">{purchase.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-primary">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha de compra</p>
                <p className="font-semibold">
                  {format(new Date(purchase.purchaseDate), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-primary">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total artículos</p>
                <p className="font-semibold">{purchase.totalItems}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card className="print-container">
        <CardHeader>
          <h2 className="text-lg font-bold text-foreground">
            Lista de Ingredientes
          </h2>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0 animate-slide-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground text-sm font-semibold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-foreground">
                    {item?.name.es || "Ingrediente desconocido"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-primary">
                    {item.amountToBuy}
                  </span>
                  <span className="text-muted-foreground ml-1 text-sm">
                    {item.measurementType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
