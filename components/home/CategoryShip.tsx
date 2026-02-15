import { cn } from "@/lib/utils";
import Link from "next/link";

interface CategoryChipProps {
  label: string;
  isActive?: boolean;
  count?:number
  onClick?: () => void;
  href?: string;
}

const CategoryChip = ({
  label,
  isActive = false,
  href,
  onClick,
  count
}: CategoryChipProps) => {
  const className = cn(
    "category-chip",
    isActive ? "category-chip-active" : "category-chip-inactive"
  );

  if (href) {
    return (
      <Link href={href} className={className} replace={true}>
        {label}{count ? `(${count})`:''}
      </Link>
    );
  }
  return (
    <button data-tab onClick={onClick} className={className}>
      {label}{count ? `(${count})`:''}
    </button>
  );
};

export default CategoryChip;
