import { PantryIngredientSelectionProvider } from "@/lib/context/pantryIngredientContext";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <PantryIngredientSelectionProvider>
      <div>{children}</div>
    </PantryIngredientSelectionProvider>
  );
}
