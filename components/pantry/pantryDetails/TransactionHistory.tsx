'use client'
import {
  ChefHat,
  Clock,
  Edit,
  History,
  Plus,
  ShoppingCart,
} from "lucide-react";
import useGetPantryTransactions from "@/hooks/useGetPantryTransactions";
import { Transaction } from "@/types/models/pantry";
const getTransactionIcon = (type: Transaction["transactionType"]) => {
  switch (type) {
    case "add":
      return <Plus className="w-4 h-4 text-green-600" />;
    case "used":
      return <ChefHat className="w-4 h-4 text-blue-600" />;
    case "update":
      return <Edit className="w-4 h-4 text-yellow-600" />;
    case "purchased":
      return <ShoppingCart className="w-4 h-4 text-purple-600" />;
    case "pendingForPurchase":
      return <Clock className="w-4 h-4 text-orange-600" />;
    default:
      return <History className="w-4 h-4 text-gray-600" />;
  }
};

const getTransactionLabel = (type: Transaction["transactionType"]) => {
  const labels = {
    add: "Añadido",
    used: "Usado en receta",
    update: "Actualizado",
    purchased: "Comprado",
    pendingForPurchase: "Pendiente de compra",
  };
  return labels[type];
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function TransactionHistory() {
  const { data: pantryTransactions } = useGetPantryTransactions();

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-semibold">Historial de Uso</h2>
      </div>

      <div className="space-y-3">
        {pantryTransactions?.map((tx) => (
          <div
            key={tx.id}
            className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg border border-border/50"
          >
            <div className="p-2 rounded-full bg-background">
              {getTransactionIcon(tx.transactionType)}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-sm">
                  {getTransactionLabel(tx.transactionType)}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(tx.createdAt)}
                </span>
              </div>
              {tx.recipeName && (
                <p className="text-sm text-muted-foreground mb-1">
                  Receta: {tx.recipeName}
                </p>
              )}
              <p className="text-sm">
                <span
                  className={
                    tx.measurementValue < 0
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {tx.measurementValue < 0 ? "-" : "+"}
                  {Math.abs(tx.measurementValue)} {tx.measurementType}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
