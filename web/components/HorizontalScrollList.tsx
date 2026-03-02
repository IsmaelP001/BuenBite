import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type SubTitleProps =
  | string
  | {
      text: string;
      href?: string;
      onPress?: () => void;
    };

interface HorizontalListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  title?: string;
  titleIcon?: LucideIcon;
  subTitle?: SubTitleProps;
  isLoading?: boolean;
  skeletonCount?: number;
  skeletonWidth?: number | string;
  skeletonHeight?: number | string;
}

function SubTitle({ subTitle }: { subTitle: SubTitleProps }) {
  if (typeof subTitle === "string") {
    return <span>{subTitle}</span>;
  }
  if (subTitle?.href) {
    return (
      <Link
        href={subTitle.href}
        className="text-sm font-medium text-primary hover:underline"
      >
        {subTitle.text}
      </Link>
    );
  }
  return <span onClick={subTitle?.onPress}>{subTitle?.text}</span>;
}

export default function HorizontalScrollList<T>({
  data,
  renderItem,
  title,
  subTitle,
  titleIcon: Icon,
  isLoading = false,
  skeletonCount = 4,
  skeletonWidth = 300,
  skeletonHeight = 200,
}: HorizontalListProps<T>) {
  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            <h2 className="font-display text-2xl font-semibold">{title}</h2>
          </div>
          {subTitle && <SubTitle subTitle={subTitle} />}
        </div>
      )}
      <div className="flex gap-6 overflow-x-auto pb-4 mx-0 scrollbar-hide">
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <div className="shrink-0" key={`skeleton-${index}`}>
                <Skeleton
                  style={{
                    width: typeof skeletonWidth === "number" ? `${skeletonWidth}px` : skeletonWidth,
                    height: typeof skeletonHeight === "number" ? `${skeletonHeight}px` : skeletonHeight,
                  }}
                  className="rounded-lg"
                />
              </div>
            ))
          : data.map((item, index) => (
              <div className="shrink-0" key={index}>
                {renderItem(item)}
              </div>
            ))}
      </div>
    </div>
  );
}