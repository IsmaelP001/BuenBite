import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface HorizontalScrollListSkeletonProps {
  title?: string;
  titleIcon?: LucideIcon;
  subTitle?: string;
  count?: number;
  itemWidth?: string;
  itemHeight?: string;
}

export function HorizontalScrollListSkeleton({
  title,
  titleIcon: Icon,
  subTitle,
  count = 5,
  itemWidth = "300px",
  itemHeight = "280px",
}: HorizontalScrollListSkeletonProps) {
  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            <h2 className="font-display text-2xl font-semibold">{title}</h2>
          </div>
          {subTitle && (
            <span className="text-sm font-medium text-primary">{subTitle}</span>
          )}
        </div>
      )}
      <div className="flex gap-6 overflow-x-auto pb-4 mx-0 scrollbar-hide">
        {Array.from({ length: count }).map((_, index) => (
          <div className="shrink-0" key={`skeleton-${index}`}>
            <Skeleton
              style={{ width: itemWidth, height: itemHeight }}
              className="rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}