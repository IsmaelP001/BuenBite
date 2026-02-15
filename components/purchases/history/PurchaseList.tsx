import { PurchaseCard } from "./PurchaseCard";
import { getUserPurchases } from "@/actions/purchase";

export default async function PurchaseList({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const activeFilter = searchParams.status || "all";  
  const purchases = await getUserPurchases();
  const filteredPurchases = purchases.data.filter((purchase) => {
    if (activeFilter === "all") return true;
    return purchase.status === activeFilter;
  });
  return (
    <div className="space-y-3">
      {purchases?.data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay compras con este estado</p>
        </div>
      ) : (
        filteredPurchases?.map((purchase, index) => (
          <div key={purchase.id} style={{ animationDelay: `${index * 50}ms` }}>
            <PurchaseCard purchase={purchase} />
          </div>
        ))
      )}
    </div>
  );
}
