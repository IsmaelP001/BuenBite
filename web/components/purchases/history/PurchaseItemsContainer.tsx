"use client";
import QuantityInput from "@/components/QuantityInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import useConfirmPurchase from "@/hooks/useConfirmPurchase";
import useGetPurchaseItems from "@/hooks/useGetPurchaseItems";
import { PurchaseItemDto } from "@/types/models/purchase";
import { LoaderCircle, Printer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface PurchaseItemsContainerProps {
  status: string;
}
export default function PurchaseItemsContainer({
  status,
}: PurchaseItemsContainerProps) {
  const { id } = useParams();

  const {
    data: purchaseItems,
    purchaseItemsMap,
    updateItemQuantity,
  } = useGetPurchaseItems(id as string);
  const router = useRouter();

  const { mutateAsync: confirmPurchaseMutation, isPending: isSaving } =
    useConfirmPurchase();
  const canConfirmPurchase = status !== "confirmed";
  const printableItems = (purchaseItems ?? []).map((item) => {
    const quantity =
      purchaseItemsMap.get(item.id)?.currentQuantity ?? item.amountToBuy;

    return {
      id: item.id,
      name: item?.name?.es || "Ingrediente desconocido",
      quantity,
      measurementType: item.measurementType,
    };
  });
  const generatedDate = new Intl.DateTimeFormat("es-DO", {
    dateStyle: "long",
  }).format(new Date());

  const handlePrintPdf = () => {
    window.print();
  };

  const handleConfirmPurchase = async () => {
    const items: PurchaseItemDto[] = (purchaseItems ?? []).map((item) => ({
      ingredientId: item.id,
      amountToBuy:
        purchaseItemsMap.get(item.id)?.currentQuantity ?? item.amountToBuy,
      measurementType: item.measurementType,
      purchaseItemId: item.id,
    }));

    try {
      await confirmPurchaseMutation({
        purchaseId: id as string,
        items,
      });
      router.back();
    } catch (error) {
      console.log("err confirming", error);
      throw error;
    }
  };

  return (
    <div className="gap-y-4">
      <div className="no-print">
        <Card className="print-container mb-4">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-foreground">Lista de Ingredientes</h2>
            <Button
              type="button"
              variant="outline"
              className="no-print"
              onClick={handlePrintPdf}
              disabled={!purchaseItems?.length}
            >
              <Printer className="w-4 h-4" />
              Imprimir / Descargar PDF
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {printableItems.map((item, index) => {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0 animate-slide-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    {status === "confirmed" ? (
                      <div className="text-right">
                        <span className="font-bold text-primary">{item.quantity}</span>
                        <span className="text-muted-foreground ml-1 text-sm">
                          {item.measurementType}
                        </span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <QuantityInput
                          value={item.quantity}
                          onChange={(value) => updateItemQuantity(item.id, value)}
                          max={100000}
                          size="sm"
                        />
                        <p className="text-muted-foreground ml-1 text-sm text-center">
                          {item.measurementType}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        {canConfirmPurchase && (
          <Button
            disabled={isSaving || !purchaseItems?.length}
            onClick={handleConfirmPurchase}
            className="w-full no-print"
            variant="hero"
          >
            {isSaving ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Confirmar purchase"
            )}
          </Button>
        )}
      </div>

      <section className="ingredients-print-sheet print-only" aria-label="Documento PDF de ingredientes">
        <header className="ingredients-print-header">
          <p className="ingredients-print-brand">buenBite</p>
          <h1>Lista de ingredientes</h1>
          <p className="ingredients-print-meta">Documento generado por buenBite</p>
          <p className="ingredients-print-date">Fecha de generación: {generatedDate}</p>
        </header>

        <ol className="ingredients-print-list">
          {printableItems.map((item, index) => (
            <li key={`print-${item.id}`} className="ingredients-print-row">
              <span className="ingredients-print-item-name">
                {index + 1}. {item.name}
              </span>
              <span className="ingredients-print-item-amount">
                {item.quantity} {item.measurementType}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
