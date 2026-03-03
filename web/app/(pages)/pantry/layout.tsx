import { PantryIngredientSelectionProvider } from "@/lib/context/pantryIngredientContext";
import { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <PantryIngredientSelectionProvider>
      <div>{children}</div>
    </PantryIngredientSelectionProvider>
  );
}
