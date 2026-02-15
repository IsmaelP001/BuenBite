import { ChefTitle } from "@/types/models/social";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const rarityStyles: Record<string, { bg: string; text: string; border: string }> = {
  common: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-300", border: "border-gray-300 dark:border-gray-600" },
  rare: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-300", border: "border-blue-300 dark:border-blue-700" },
  epic: { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-300", border: "border-purple-300 dark:border-purple-700" },
  legendary: { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-300", border: "border-amber-300 dark:border-amber-700" },
};

interface ChefTitleSelectorProps {
  titles: ChefTitle[];
  selectedTitleId: string | null;
  onSelect: (titleId: string | null) => void;
  editable?: boolean;
}

export default function ChefTitleSelector({
  titles,
  selectedTitleId,
  onSelect,
  editable = false,
}: ChefTitleSelectorProps) {
  const selectedTitle = titles.find((t) => t.id === selectedTitleId);

  if (!editable && selectedTitle) {
    const rarity = rarityStyles[selectedTitle.rarity];
    return (
      <span className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border",
        rarity.bg, rarity.text, rarity.border
      )}>
        {selectedTitle.icon} {selectedTitle.name}
      </span>
    );
  }

  if (!editable && !selectedTitle) {
    return null;
  }

  return (
    <Select
      value={selectedTitleId ?? "none"}
      onValueChange={(val) => onSelect(val === "none" ? null : val)}
    >
      <SelectTrigger className="h-7 w-auto min-w-[140px] text-xs rounded-full border-dashed gap-1.5" aria-label="Seleccionar título de chef">
        <SelectValue placeholder="Elegir título" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none" className="text-xs text-muted-foreground">
          Sin título
        </SelectItem>
        {titles.map((title) => {
          const rarity = rarityStyles[title.rarity];
          return (
            <SelectItem key={title.id} value={title.id} className="text-xs">
              <span className={cn("inline-flex items-center gap-1", rarity.text)}>
                {title.icon} {title.name}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
