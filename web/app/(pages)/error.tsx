"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function PagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Pages segment error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg text-center space-y-3">
        <h2 className="text-xl font-semibold">No se pudo cargar esta página</h2>
        <p className="text-muted-foreground">
          Ocurrió un problema al obtener la información. Intenta nuevamente.
        </p>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </div>
  );
}
