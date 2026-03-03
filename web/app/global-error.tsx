"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-3">
            <h1 className="text-2xl font-semibold">Error crítico</h1>
            <p>
              No se pudo cargar la aplicación correctamente. Intenta de nuevo.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-md border border-black/20"
            >
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
