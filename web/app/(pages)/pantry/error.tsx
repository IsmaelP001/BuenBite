"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Pantry route error:", error);
  }, [error]);

  return (
    <div className="p-4 space-y-3">
      <p>Error al mostrar sección</p>
      <Button onClick={reset} variant="outline">
        Reintentar
      </Button>
    </div>
  );
}
