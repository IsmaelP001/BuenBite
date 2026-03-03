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
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <h2 className="text-xl font-semibold">Algo salió mal</h2>
        <p className="text-muted-foreground">
          Ocurrió un error inesperado. Intenta recargar esta sección.
        </p>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </div>
  );
}
