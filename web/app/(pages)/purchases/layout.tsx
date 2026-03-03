import { SelectedPurchaseItemsProvider } from "@/lib/context/purchase";
import React from "react";

export const dynamic = "force-dynamic";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SelectedPurchaseItemsProvider>
      <div>{children}</div>
    </SelectedPurchaseItemsProvider>
  );
}
