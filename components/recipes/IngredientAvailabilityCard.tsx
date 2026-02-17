import { CheckCircle2, Circle, XCircle, AlertCircle } from 'lucide-react';
import { getIngredientStatusColor } from '@/lib/utils';
import { AnalyzedIngredient, BaseIngredientForAnalysis } from '@/types/models/pantry';

interface IngredientAvailabilityCardProps<T extends BaseIngredientForAnalysis> {
  ingredient: AnalyzedIngredient<T>;
  className?: string;
}

const IngredientAvailabilityCard = <T extends BaseIngredientForAnalysis>({ 
  ingredient,
  className = ''
}: IngredientAvailabilityCardProps<T>) => {
  const colors = getIngredientStatusColor(ingredient.availabilityStatus);
  const isPantryNotProvided = ingredient.availabilityStatus === "PANTRY_NOT_PROVIDED";


  const renderIcon = () => {
    // Si no se proporcionó despensa, mostrar ícono genérico
    if (isPantryNotProvided) {
      return <Circle className="h-4 w-4 shrink-0 text-gray-400" />;
    }

    switch (ingredient.availabilityStatus) {
      case "COMPLETE":
        return <CheckCircle2 className={`h-4 w-4 shrink-0 ${colors.icon}`} />;
      case "MISSING":
        return <XCircle className={`h-4 w-4 shrink-0 ${colors.icon}`} />;
      case "NO_STOCK":
        return <AlertCircle className={`h-4 w-4 shrink-0 ${colors.icon}`} />;
      default:
        return <Circle className={`h-4 w-4 shrink-0 ${colors.icon}`} />;
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-colors border ${
        isPantryNotProvided ? 'bg-muted/30 border-border' : colors.bg
      } ${className}`}
    >
      <div className="flex items-center gap-2 flex-1">
        {renderIcon()}
        
        <div className="flex-1">
          <span className={`text-sm font-medium ${isPantryNotProvided ? 'text-foreground' : colors.text}`}>
            {ingredient?.name?.es}
          </span>
          
          {/* Solo mostrar información de despensa si NO es PANTRY_NOT_PROVIDED */}
          {!isPantryNotProvided && (
            <>
              {/* Estado MISSING - No existe en despensa */}
              {ingredient.availabilityStatus === "MISSING" && !ingredient.isAvailableInPantry && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                  No está en tu despensa
                </p>
              )}

              {/* Estado NO_STOCK - Existe en despensa pero sin stock */}
              {ingredient.availabilityStatus === "NO_STOCK" && ingredient.isAvailableInPantry && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                  Sin stock en despensa
                </p>
              )}

              {/* Estado PARTIAL - mostrar disponible vs requerido */}
              {ingredient.availabilityStatus === "PARTIAL" && ingredient.availableConvertedQuantity && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  Disponible:{" "}
                  {ingredient.availableConvertedQuantity.toFixed(2)}{" "}
                  de {ingredient.measurementValue.toFixed(2)}{" "}
                  {ingredient.measurementType}
                </p>
              )}

              {/* Estado UNSUCCESSFUL_CONVERSION - mostrar cantidad original de despensa */}
              {ingredient.availabilityStatus === "UNSUCCESSFUL_CONVERSION" && ingredient.originalPantryQuantity > 0 && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  En despensa:{" "}
                  {ingredient.originalPantryQuantity.toFixed(2)}{" "}
                  {ingredient.pantryMeasurementType}
                </p>
              )}

              {/* Estado COMPLETE - mostrar cantidad convertida si existe */}
              {ingredient.availabilityStatus === "COMPLETE" && ingredient.availableConvertedQuantity && ingredient.availableConvertedQuantity > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Tienes:{" "}
                  {ingredient.availableConvertedQuantity.toFixed(2)}{" "}
                  {ingredient.measurementType}
                </p>
              )}

              {/* Estado COMPLETE sin conversión - fallback a cantidad original */}
              {ingredient.availabilityStatus === "COMPLETE" && (!ingredient.availableConvertedQuantity || ingredient.availableConvertedQuantity === 0) && ingredient.originalPantryQuantity > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Tienes:{" "}
                  {ingredient.originalPantryQuantity.toFixed(2)}{" "}
                  {ingredient.pantryMeasurementType}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Cantidad requerida o faltante */}
      <div className="text-right ml-2">
        {!isPantryNotProvided &&
        ingredient.isSuccessConvertion &&
        ingredient.missingAmount &&
        ingredient.missingAmount > 0 &&
        ingredient.availableConvertedQuantity &&
        ingredient.availableConvertedQuantity > 0 ? (
          <span className="text-sm font-medium">
            Faltan: {ingredient.missingAmount.toFixed(2)}{" "}
            {ingredient.measurementType}
          </span>
        ) : (
          <span className="text-sm font-medium">
            {ingredient.measurementValue.toFixed(2)}{" "}
            {ingredient.measurementType}
          </span>
        )}
      </div>
    </div>
  );
};

export default IngredientAvailabilityCard;