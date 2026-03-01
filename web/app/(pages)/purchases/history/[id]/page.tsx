import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ArrowLeft,
  Printer,
  Share2,
  Calendar,
  Package,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StatusBadge } from "@/components/purchases/history/StatusBadge";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
import Link from "next/link";
import { getQueryClient } from "@/lib/queryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { ErrorWrapper } from "@/components/ErrorWraper";
import { getPurchaseItems, getPurchaseOrder } from "@/actions/purchase";
const PurchaseItemsContainer = lazy(()=>import("@/components/purchases/history/PurchaseItemsContainer"))

export default async function PurchaseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: purchase } = await getPurchaseOrder(
    id
  );

  const queryClient = getQueryClient();
  queryClient.prefetchQuery({
    queryKey: ["user_purchases_items", id],
    queryFn: async () => await getPurchaseItems(id),
  });


  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MaxWidthWrapper className="py-3">
        <div className="space-y-3 animate-fade-in purchase-history-page">
          <div className="flex items-center justify-between flex-wrap no-print purchase-page-header">
           <Link href='/purchases/history'>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
           </Link>
            <div className="flex gap-2 ml-auto">
              <Button size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button size="icon">
                <Printer className="w-4 h-4" />
              </Button>
              <Link href={`/purchases/history/${id}/add`}>
                <Button variant="hero">Añadir ingredientes</Button>
              </Link>
            </div>
          </div>

          <Card className="print-container no-print">
            <CardHeader >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Lista de Compras
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Orden #{purchase.orderNumber}
                  </p>
                </div>
                <StatusBadge status={purchase.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg  text-primary">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Número de orden
                    </p>
                    <p className="font-semibold">{purchase.orderNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg  text-primary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Fecha de compra
                    </p>
                    <p className="font-semibold">
                      {format(
                        new Date(purchase.purchaseDate),
                        "d 'de' MMMM, yyyy",
                        {
                          locale: es,
                        }
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg  text-primary">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total artículos
                    </p>
                    <p className="font-semibold">{purchase.totalItems}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <ErrorWrapper>
            <Suspense fallback={<div>
              cargando...
            </div>}>
              <PurchaseItemsContainer status={purchase.status} />
            </Suspense>
          </ErrorWrapper>
        </div>
      </MaxWidthWrapper>
    </HydrationBoundary>
  );
}
