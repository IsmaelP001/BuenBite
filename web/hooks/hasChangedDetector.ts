import { useMemo } from 'react';

/**
 * Hook para detectar cambios entre datos originales y actuales
 * 
 * @example
 * const { hasChanges, changes } = useChangesDetector({
 *   original: originalIngredients,
 *   current: ingredients,
 *   fields: ['measurementValue', 'measurementType'],
 *   idField: 'id'
 * });
 */

interface UseChangesDetectorOptions<T> {
  /** Datos originales (desde base de datos) */
  original: T[];
  /** Datos actuales (estado modificado) */
  current: T[];
  /** Campos a evaluar para detectar cambios */
  fields: (keyof T)[];
  /** Campo que identifica únicamente cada elemento (default: 'id') */
  idField?: keyof T;
}

interface ChangesResult<T> {
  /** Indica si hay algún cambio */
  hasChanges: boolean;
  /** Total de cambios detectados */
  totalChanges: number;
  /** Elementos removidos */
  removed: T[];
  /** Elementos modificados con sus cambios específicos */
  modified: {
    item: T;
    changes: Partial<Record<keyof T, { from: any; to: any }>>;
  }[];
  /** Cantidad de elementos removidos */
  removedCount: number;
  /** Cantidad de elementos modificados */
  modifiedCount: number;
  /** Indica si cambió la cantidad de elementos */
  countChanged: boolean;
}

export function useChangesDetector<T extends Record<string, any>>({
  original,
  current,
  fields,
  idField = 'id' as keyof T,
}: UseChangesDetectorOptions<T>): ChangesResult<T> {
  
  return useMemo(() => {
    // Detectar cambio en cantidad
    const countChanged = original.length !== current.length;

    // Crear mapa de items originales por ID para búsqueda O(1)
    const originalMap = new Map<any, T>(
      original.map(item => [item[idField], item])
    );

    // Crear set de IDs actuales para detección rápida
    const currentIds = new Set(current.map(item => item[idField]));

    // Detectar elementos removidos
    const removed = original.filter(item => !currentIds.has(item[idField]));

    // Detectar elementos modificados
    const modified: ChangesResult<T>['modified'] = [];

    for (const currentItem of current) {
      const originalItem = originalMap.get(currentItem[idField]);
      
      if (!originalItem) continue; // Item nuevo (no debería pasar en este caso)

      const itemChanges: Partial<Record<keyof T, { from: any; to: any }>> = {};

      // Comparar cada campo especificado
      for (const field of fields) {
        const originalValue = originalItem[field];
        const currentValue = currentItem[field];

        // Comparación profunda para objetos/arrays o simple para primitivos
        const hasChanged = JSON.stringify(originalValue) !== JSON.stringify(currentValue);

        if (hasChanged) {
          itemChanges[field] = {
            from: originalValue,
            to: currentValue,
          };
        }
      }

      // Si hay cambios en este item, agregarlo a la lista
      if (Object.keys(itemChanges).length > 0) {
        modified.push({
          item: currentItem,
          changes: itemChanges,
        });
      }
    }

    const totalChanges = removed.length + modified.length;
    const hasChanges = countChanged || totalChanges > 0;

    return {
      hasChanges,
      totalChanges,
      removed,
      modified,
      removedCount: removed.length,
      modifiedCount: modified.length,
      countChanged,
    };
  }, [original, current, fields, idField]);
}