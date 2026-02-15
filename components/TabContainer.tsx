"use client";
import { useState, useEffect, useRef } from "react";
import CategoryChip from "./home/CategoryShip";

interface TabItem {
  id: string;
  label: string;
  count?:number
}

interface TabContainerProps {
  items: TabItem[];
  activeId: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export default function TabContainer({
  items,
  activeId,
  onTabChange,
  className = "",
}: TabContainerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleItemsCount, setVisibleItemsCount] = useState(items.length);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;

    const updateVisibleCount = () => {
      const container = containerRef.current;
      if (!container) return;

      // Limpiar timer anterior para debounce
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        // Temporalmente mostrar todos para medir correctamente
        const wasExpanded = isExpanded;
        setIsExpanded(true);
        
        requestAnimationFrame(() => {
          const MORE_BUTTON_WIDTH = 100;
          const GAP = 12;
          const containerWidth = container.offsetWidth;
          const tabs = Array.from(container.querySelectorAll<HTMLElement>('[data-tab]'));
          
          let totalWidth = 0;
          let count = 0;

          for (let i = 0; i < tabs.length; i++) {
            const tabWidth = tabs[i].offsetWidth;
            const widthNeeded = totalWidth + tabWidth + (i > 0 ? GAP : 0);
            
            // Si no es el último tab, necesitamos espacio para el botón "Más"
            const needsMoreButton = i < tabs.length - 1;
            const finalWidth = needsMoreButton ? widthNeeded + GAP + MORE_BUTTON_WIDTH : widthNeeded;
            
            if (finalWidth <= containerWidth) {
              totalWidth = widthNeeded;
              count++;
            } else {
              break;
            }
          }

          const newCount = Math.max(1, count);
          setVisibleItemsCount(newCount);
          
          // Si no todos caben, colapsar (a menos que el usuario lo expandió manualmente)
          if (newCount < items.length && !wasExpanded) {
            setIsExpanded(false);
          }
        });
      }, 100); // Debounce de 100ms
    };

    const timer = setTimeout(updateVisibleCount, 0);
    window.addEventListener('resize', updateVisibleCount);

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', updateVisibleCount);
    };
  }, [items.length]);

  const visibleItems = isExpanded ? items : items.slice(0, visibleItemsCount);
  const hiddenCount = items.length - visibleItemsCount;
  const shouldShowMoreButton = !isExpanded && hiddenCount > 0;

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className={`flex gap-3 ${isExpanded ? 'flex-wrap' : ''}`}
      >
        {visibleItems.map((item) => (
          <CategoryChip
            key={item.id}
            label={item.label}
            count={item?.count}
            isActive={activeId === item.id}
            onClick={() => onTabChange(item.id)}
          />
        ))}

        {shouldShowMoreButton && (
          <button
            onClick={() => setIsExpanded(true)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            Más +{hiddenCount}
          </button>
        )}

        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            Menos
          </button>
        )}
      </div>
    </div>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      data-tab
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium
        transition-colors whitespace-nowrap
        ${
          isActive
            ? 'bg-orange-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      {label}
    </button>
  );
}
