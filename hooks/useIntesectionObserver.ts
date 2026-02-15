import { useEffect, useRef } from "react";

export function useIntersectionObserver(
  onIntersect: () => void,
  enabled: boolean
) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      {
        root: null, // window
        rootMargin: "200px", // dispara ANTES de llegar al final
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [enabled, onIntersect]);

  return ref;
}
