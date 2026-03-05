"use client";
import React from "react";
import { Calendar, AlertCircle, X, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PantryItem } from "@/types/models/pantry";
import { isValidUrl } from "@/lib/utils";
import {
  categoryColors,
  categoryNamesEs,
} from "@/lib/constants/ingredient-category-colors";



interface IngredientCardProps extends PantryItem {
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onRemoveSelected?: () => void;
}

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};




const CardContent = ({
  image,
  name,
  measurementValue,
  measurementType,
  category,
  isExpiring,
  expirationDate,
  selectable,
  isSelected,
  onRemoveSelected,
  ingredientId,
}: Omit<IngredientCardProps, "id" | "onSelect"> & {
  ingredientId?: string;
}) => {
  const normalizedImage = image?.trim();
  const hasValidImage = Boolean(normalizedImage) &&
    (normalizedImage.startsWith("/") || isValidUrl(normalizedImage));

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="relative aspect-4/3 overflow-hidden">
          <Image
            width={200}
            height={200}
            src={hasValidImage ? normalizedImage : "/file.svg"}
            alt={`pantry-image-${name.es}`}
            className=" object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

        {selectable && isSelected && onRemoveSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveSelected();
            }}
            className="absolute top-3 right-3 z-20 bg-black/80 rounded-full p-2 hover:bg-black/90 transition-colors"
            aria-label="Deseleccionar"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        )}

        {isExpiring && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            <AlertCircle className="h-3 w-3" />
            <span>Expira pronto</span>
          </div>
        )}

        <div className="absolute bottom-3 left-3">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              categoryColors[category] || "bg-gray-600 text-white"
            )}
          >
            {categoryNamesEs[category] || category}
          </span>
        </div>

        {selectable && (
          <Link
            href={`pantry/${ingredientId}`}
            className="absolute right-[50%] translate-x-[50%] top-[50%] translate-y-[50%] flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-100 shadow-sm text-nowrap z-10"
          >
            <Eye className="h-4 w-4" />
            <span>Ver detalles</span>
          </Link>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-base md:text-lg mb-1 group-hover:text-primary transition-colors">
          {name.es}
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          {measurementValue?.toFixed(2) ?? 0} {measurementType}
        </p>

        {expirationDate && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{expirationDate}</span>
          </div>
        )}
      </div>
    </>
  );
};

const IngredientCard = ({
  ingredientId,
  image,
  name,
  measurementValue,
  measurementType,
  category,
  isExpiring = false,
  expirationDate,
  selectable = false,
  isSelected = false,
  onSelect,
  onRemoveSelected,
  ...rest
}: IngredientCardProps) => {
  const handleCardClick = () => {
    if (selectable && onSelect && ingredientId) {
      onSelect(ingredientId);
    }
  };

  const cardClasses = cn(
    "group bg-white rounded-2xl overflow-hidden transition-all duration-300  ",
    selectable && "cursor-pointer",
    isSelected ? "ring-2 ring-primary shadow-xl" : "shadow-md hover:shadow-xl"
  );

  const cardContent = (
    <CardContent
      image={image}
      name={name}
      measurementValue={measurementValue}
      measurementType={measurementType}
      category={category}
      isExpiring={isExpiring}
      expirationDate={expirationDate}
      selectable={selectable}
      isSelected={isSelected}
      onRemoveSelected={onRemoveSelected}
      ingredientId={ingredientId}
      {...rest}
    />
  );

  if (!selectable && ingredientId) {
    return (
      <Link href={`pantry/${ingredientId}`} className={cardClasses}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div onClick={handleCardClick} className={cardClasses}>
      {cardContent}
    </div>
  );
};

export default IngredientCard;
