'use client'
import useGetPantryItems from "@/hooks/useGetPantryItems";
import Link from "next/link";


const PantrySummary = () => {
  const {ungroupedPantryItems}=useGetPantryItems({})
  return (
    <div className="bg-orange-light rounded-2xl  text-center">
      <h3 className="font-display font-semibold text-lg mb-2">Tu Despensa</h3>
      <p className="text-4xl font-display font-bold text-primary mb-1">{ungroupedPantryItems?.length ?? 0}</p>
      <p className="text-sm text-muted-foreground mb-4">ingredientes disponibles</p>
      <Link
        href="/pantry"
        className="text-sm font-medium text-primary hover:underline"
      >
        Ver Todo
      </Link>
    </div>
  );
};

export default PantrySummary;
