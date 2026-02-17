'use client';
import { SelectedPurchaseItemsProvider } from "@/lib/context/purchase";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SelectedPurchaseItemsProvider>
      <div>{children}</div>
    </SelectedPurchaseItemsProvider>
  );
}
