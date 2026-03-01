// IngredientUnitConverter.ts (normalización + soporte count <-> weight/volume + conversiones estándar)

export interface Conversions {
  density?: number; // g/ml
  default_unit: string; // g/ml
  weight_per_unit?: Record<string, number>; // gramos por unidad (egg:50, cup:185, gram:1)
  volume_per_unit?: Record<string, number>; // ml por unidad (cup:240, milliliter:1, tablespoon:15)
  allowed_units?: string[];
}

export interface ConversionResult {
  success: boolean;
  value?: number;
  steps?: string[];
  error?: string;
}

export class IngredientUnitConverter {
  private static readonly UNIT_CATEGORIES: Record<string, string> = {
    'gram': 'weight','grams':'weight','g':'weight',
    'kilogram':'weight','kilograms':'weight','kg':'weight',
    'milligram':'weight','milligrams':'weight','mg':'weight',
    'ounce':'weight','ounces':'weight','oz':'weight',
    'pound':'weight','pounds':'weight','lb':'weight',

    'milliliter':'volume','milliliters':'volume','ml':'volume',
    'liter':'volume','liters':'volume','l':'volume',

    'cup':'volume','cups':'volume',
    'tablespoon':'volume','tablespoons':'volume','tbsp':'volume',
    'teaspoon':'volume','teaspoons':'volume','tsp':'volume',
    'pint':'volume','pints':'volume','quart':'volume','quarts':'volume',
    'gallon':'volume','gallons':'volume',
    'fluid_ounce':'volume','fluid_ounces':'volume'
  };

  // Factores de conversión estándar (a gramos para peso, a mililitros para volumen)
  private static readonly STANDARD_WEIGHT_FACTORS: Record<string, number> = {
    'gram': 1,
    'kilogram': 1000,
    'milligram': 0.001,
    'ounce': 28.3495,
    'pound': 453.592
  };

  private static readonly STANDARD_VOLUME_FACTORS: Record<string, number> = {
    'milliliter': 1,
    'liter': 1000,
    'cup': 240,
    'tablespoon': 15,
    'teaspoon': 5,
    'pint': 473.176,
    'quart': 946.353,
    'gallon': 3785.41,
    'fluid_ounce': 29.5735
  };

  private static readonly ALIASES: Record<string, string> = {
    g: 'gram', grams: 'gram', gram: 'gram',
    kg: 'kilogram', kilogram: 'kilogram', kilograms: 'kilogram',
    mg: 'milligram', milligram: 'milligram', milligrams: 'milligram',
    oz: 'ounce', ounce: 'ounce', ounces: 'ounce',
    lb: 'pound', pound: 'pound', pounds: 'pound',

    ml: 'milliliter', milliliter: 'milliliter', milliliters: 'milliliter',
    l: 'liter', liter: 'liter', liters: 'liter',

    cup: 'cup', cups: 'cup',
    tablespoon: 'tablespoon', tablespoons: 'tablespoon', tbsp: 'tablespoon',
    teaspoon: 'teaspoon', teaspoons: 'teaspoon', tsp: 'teaspoon',
    pint: 'pint', pints: 'pint', quart: 'quart', quarts: 'quart',
    gallon: 'gallon', gallons: 'gallon',
    fluid_ounce: 'fluid_ounce', fluid_ounces: 'fluid_ounce'
  };

  private static canonical(unit: string): string {
    if (!unit) return unit;
    const key = unit.trim().toLowerCase().replace(/\s+/g, '_');
    return this.ALIASES[key] ?? key;
  }

  private static findFactor(record?: Record<string, number>, unit?: string): number | undefined {
    if (!record || !unit) return undefined;
    if (record[unit] !== undefined) return record[unit];

    const canon = this.canonical(unit);
    if (record[canon] !== undefined) return record[canon];

    if (canon.endsWith('s')) {
      const singular = canon.slice(0, -1);
      if (record[singular] !== undefined) return record[singular];
    } else {
      const plural = canon + 's';
      if (record[plural] !== undefined) return record[plural];
    }

    for (const k of Object.keys(record)) {
      if (this.canonical(k) === canon) return record[k];
    }

    return undefined;
  }

  static convert(
    value: number,
    fromUnit: string,
    toUnit: string,
    conversions?: Conversions
  ): ConversionResult {
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      return { success: false, error: 'Valor numérico inválido' };
    }

    if (fromUnit === toUnit) {
      return { success: true, value, steps: [`${value} ${fromUnit} = ${value} ${toUnit} (sin conversión)`] };
    }

    const fromCanon = this.canonical(fromUnit);
    const toCanon = this.canonical(toUnit);

    // Validar unidades permitidas si se especifican
    if (conversions?.allowed_units) {
      const allowed = conversions.allowed_units.map(u => this.canonical(u));
      if (allowed.length > 0) {
        if (!allowed.includes(fromCanon)) return { success: false, error: `Unidad "${fromUnit}" no permitida` };
        if (!allowed.includes(toCanon)) return { success: false, error: `Unidad "${toUnit}" no permitida` };
      }
    }

    const fromCategory = this.UNIT_CATEGORIES[fromCanon] ??
      (this.findFactor(conversions?.weight_per_unit, fromUnit) ? 'count' :
       this.findFactor(conversions?.volume_per_unit, fromUnit) ? 'count' : undefined);

    const toCategory = this.UNIT_CATEGORIES[toCanon] ??
      (this.findFactor(conversions?.weight_per_unit, toUnit) ? 'count' :
       this.findFactor(conversions?.volume_per_unit, toUnit) ? 'count' : undefined);

    if (!fromCategory || !toCategory) return { success: false, error: 'Unidad no reconocida en el sistema' };

    const steps: string[] = [];

    // Si son la misma categoría
    if (fromCategory === toCategory) {
      return this.convertSameCategory(value, fromUnit, toUnit, fromCategory, conversions, steps);
    }

    // Conversiones entre categorías diferentes
    try {
      // weight <-> volume (necesita density)
      if ((fromCategory === 'weight' && toCategory === 'volume') || (fromCategory === 'volume' && toCategory === 'weight')) {
        return this._weightVolumeConversion(value, fromUnit, toUnit, fromCategory, toCategory, conversions, steps);
      }

      // weight <-> count
      if ((fromCategory === 'weight' && toCategory === 'count') || (fromCategory === 'count' && toCategory === 'weight')) {
        return this._weightCountConversion(value, fromUnit, toUnit, fromCategory, toCategory, conversions, steps);
      }

      // volume <-> count
      if ((fromCategory === 'volume' && toCategory === 'count') || (fromCategory === 'count' && toCategory === 'volume')) {
        return this._volumeCountConversion(value, fromUnit, toUnit, fromCategory, toCategory, conversions, steps);
      }

      return { success: false, error: `Conversión no soportada entre ${fromCategory} y ${toCategory}` };
    } catch (err: any) {
      return { success: false, error: `Error en conversión: ${err?.message ?? String(err)}` };
    }
  }

  private static convertSameCategory(
    value: number,
    fromUnit: string,
    toUnit: string,
    category: string,
    conversions: Conversions | undefined,
    steps: string[]
  ): ConversionResult {
    if (category === 'weight') {
      // Intentar primero con factores personalizados
      const fromFactor = this.findFactor(conversions?.weight_per_unit, fromUnit);
      const toFactor = this.findFactor(conversions?.weight_per_unit, toUnit);

      // Si no hay factores personalizados, usar estándar
      const fromCanon = this.canonical(fromUnit);
      const toCanon = this.canonical(toUnit);
      
      const fromStd = fromFactor ?? this.STANDARD_WEIGHT_FACTORS[fromCanon];
      const toStd = toFactor ?? this.STANDARD_WEIGHT_FACTORS[toCanon];

      if (fromStd === undefined || toStd === undefined) {
        return { success: false, error: `Factor de conversión no encontrado para ${fromUnit} o ${toUnit}` };
      }

      const grams = value * fromStd;
      const result = grams / toStd;
      steps.push(`${value} ${fromUnit} × ${fromStd} = ${grams}g`);
      steps.push(`${grams}g ÷ ${toStd} = ${result.toFixed(3)} ${toUnit}`);
      return { success: true, value: result, steps };

    } else if (category === 'volume') {
      // Intentar primero con factores personalizados
      const fromFactor = this.findFactor(conversions?.volume_per_unit, fromUnit);
      const toFactor = this.findFactor(conversions?.volume_per_unit, toUnit);

      // Si no hay factores personalizados, usar estándar
      const fromCanon = this.canonical(fromUnit);
      const toCanon = this.canonical(toUnit);
      
      const fromStd = fromFactor ?? this.STANDARD_VOLUME_FACTORS[fromCanon];
      const toStd = toFactor ?? this.STANDARD_VOLUME_FACTORS[toCanon];

      if (fromStd === undefined || toStd === undefined) {
        return { success: false, error: `Factor de conversión no encontrado para ${fromUnit} o ${toUnit}` };
      }

      const ml = value * fromStd;
      const result = ml / toStd;
      steps.push(`${value} ${fromUnit} × ${fromStd} = ${ml}ml`);
      steps.push(`${ml}ml ÷ ${toStd} = ${result.toFixed(3)} ${toUnit}`);
      return { success: true, value: result, steps };

    } else { // count -> count (usa weight_per_unit preferido)
      const fromW = this.findFactor(conversions?.weight_per_unit, fromUnit);
      const toW = this.findFactor(conversions?.weight_per_unit, toUnit);
      if (fromW === undefined || toW === undefined) {
        return { success: false, error: `Equivalencia no encontrada para ${fromUnit} o ${toUnit}` };
      }
      const totalW = value * fromW;
      const result = totalW / toW;
      steps.push(`${value} ${fromUnit} × ${fromW}g = ${totalW}g`);
      steps.push(`${totalW}g ÷ ${toW}g = ${result.toFixed(3)} ${toUnit}`);
      return { success: true, value: result, steps };
    }
  }

  // weight <-> volume
  private static _weightVolumeConversion(
    value: number,
    fromUnit: string,
    toUnit: string,
    fromCategory: string,
    toCategory: string,
    conversions: Conversions | undefined,
    steps: string[]
  ): ConversionResult {
    let grams: number;

    // PRIORIDAD 1: Si existe weight_per_unit para la unidad de origen, úsala directamente
    if (fromCategory === 'volume' && toCategory === 'weight') {
      const directWeightFactor = this.findFactor(conversions?.weight_per_unit, fromUnit);
      if (directWeightFactor !== undefined) {
        // Conversión directa sin usar densidad
        grams = value * directWeightFactor;
        steps.push(`${value} ${fromUnit} × ${directWeightFactor}g = ${grams}g`);
        
        const toF = this.findFactor(conversions?.weight_per_unit, toUnit) ?? 
                    this.STANDARD_WEIGHT_FACTORS[this.canonical(toUnit)];
        if (toF === undefined) return { success: false, error: `Factor de peso no encontrado para ${toUnit}` };
        
        const finalValue = grams / toF;
        steps.push(`${grams}g ÷ ${toF} = ${finalValue.toFixed(3)} ${toUnit}`);
        return { success: true, value: finalValue, steps };
      }
    }

    // PRIORIDAD 2: Si existe weight_per_unit para la unidad destino, úsala directamente
    if (fromCategory === 'weight' && toCategory === 'volume') {
      const directWeightFactor = this.findFactor(conversions?.weight_per_unit, toUnit);
      if (directWeightFactor !== undefined) {
        // Obtener gramos del origen
        const fromFactor = this.findFactor(conversions?.weight_per_unit, fromUnit) ?? 
                           this.STANDARD_WEIGHT_FACTORS[this.canonical(fromUnit)];
        if (fromFactor === undefined) return { success: false, error: `Factor de peso no encontrado para ${fromUnit}` };
        
        grams = value * fromFactor;
        steps.push(`${value} ${fromUnit} × ${fromFactor} = ${grams}g`);
        
        // Conversión directa sin usar densidad
        const finalValue = grams / directWeightFactor;
        steps.push(`${grams}g ÷ ${directWeightFactor}g = ${finalValue.toFixed(3)} ${toUnit}`);
        return { success: true, value: finalValue, steps };
      }
    }

    // PRIORIDAD 3: Usar densidad como fallback
    const density = conversions?.density;
    if (!density) return { success: false, error: 'Densidad no disponible y no hay equivalencia directa en weight_per_unit' };

    let ml: number;

    if (fromCategory === 'weight') {
      const fromFactor = this.findFactor(conversions?.weight_per_unit, fromUnit) ?? 
                         this.STANDARD_WEIGHT_FACTORS[this.canonical(fromUnit)];
      if (fromFactor === undefined) return { success: false, error: `Factor de peso no encontrado para ${fromUnit}` };
      
      grams = value * fromFactor;
      ml = grams / density;
      steps.push(`${value} ${fromUnit} × ${fromFactor} = ${grams}g`);
      steps.push(`${grams}g ÷ ${density} g/ml = ${ml.toFixed(3)}ml`);
    } else {
      const fromFactor = this.findFactor(conversions?.volume_per_unit, fromUnit) ?? 
                         this.STANDARD_VOLUME_FACTORS[this.canonical(fromUnit)];
      if (fromFactor === undefined) return { success: false, error: `Factor de volumen no encontrado para ${fromUnit}` };
      
      ml = value * fromFactor;
      grams = ml * density;
      steps.push(`${value} ${fromUnit} × ${fromFactor} = ${ml}ml`);
      steps.push(`${ml}ml × ${density} g/ml = ${grams.toFixed(3)}g`);
    }

    if (toCategory === 'weight') {
      const toF = this.findFactor(conversions?.weight_per_unit, toUnit) ?? 
                  this.STANDARD_WEIGHT_FACTORS[this.canonical(toUnit)];
      if (toF === undefined) return { success: false, error: `Factor de peso no encontrado para ${toUnit}` };
      
      const finalValue = grams / toF;
      steps.push(`${grams.toFixed(3)}g ÷ ${toF} = ${finalValue.toFixed(3)} ${toUnit}`);
      return { success: true, value: finalValue, steps };
    } else {
      const toF = this.findFactor(conversions?.volume_per_unit, toUnit) ?? 
                  this.STANDARD_VOLUME_FACTORS[this.canonical(toUnit)];
      if (toF === undefined) return { success: false, error: `Factor de volumen no encontrado para ${toUnit}` };
      
      const finalValue = ml / toF;
      steps.push(`${ml.toFixed(3)}ml ÷ ${toF} = ${finalValue.toFixed(3)} ${toUnit}`);
      return { success: true, value: finalValue, steps };
    }
  }

  // weight <-> count
  private static _weightCountConversion(
    value: number,
    fromUnit: string,
    toUnit: string,
    fromCategory: string,
    toCategory: string,
    conversions: Conversions | undefined,
    steps: string[]
  ): ConversionResult {
    const weightPer = conversions?.weight_per_unit;
    if (!weightPer) return { success: false, error: 'Equivalencias de peso no disponibles' };

    if (fromCategory === 'weight' && toCategory === 'count') {
      const fromFactor = this.findFactor(weightPer, fromUnit) ?? 
                         this.STANDARD_WEIGHT_FACTORS[this.canonical(fromUnit)];
      if (fromFactor === undefined) return { success: false, error: `Factor de peso no encontrado para ${fromUnit}` };
      
      const grams = value * fromFactor;
      const toUnitWeight = this.findFactor(weightPer, toUnit);
      if (toUnitWeight === undefined) return { success: false, error: `Equivalencia por unidad no encontrada para ${toUnit}` };
      
      const result = grams / toUnitWeight;
      steps.push(`${value} ${fromUnit} × ${fromFactor} = ${grams}g`);
      steps.push(`${grams}g ÷ ${toUnitWeight}g = ${result.toFixed(3)} ${toUnit}`);
      return { success: true, value: result, steps };
    } else {
      const fromUnitWeight = this.findFactor(weightPer, fromUnit);
      if (fromUnitWeight === undefined) return { success: false, error: `Equivalencia por unidad no encontrada para ${fromUnit}` };
      
      const grams = value * fromUnitWeight;
      const toFactor = this.findFactor(weightPer, toUnit) ?? 
                       this.STANDARD_WEIGHT_FACTORS[this.canonical(toUnit)];
      if (toFactor === undefined) return { success: false, error: `Factor de peso no encontrado para ${toUnit}` };
      
      const result = grams / toFactor;
      steps.push(`${value} ${fromUnit} × ${fromUnitWeight}g = ${grams}g`);
      steps.push(`${grams}g ÷ ${toFactor} = ${result.toFixed(3)} ${toUnit}`);
      return { success: true, value: result, steps };
    }
  }

  // volume <-> count
  private static _volumeCountConversion(
    value: number,
    fromUnit: string,
    toUnit: string,
    fromCategory: string,
    toCategory: string,
    conversions: Conversions | undefined,
    steps: string[]
  ): ConversionResult {
    const volumePer = conversions?.volume_per_unit;
    if (!volumePer) return { success: false, error: 'Equivalencias de volumen no disponibles' };

    if (fromCategory === 'volume' && toCategory === 'count') {
      const fromFactor = this.findFactor(volumePer, fromUnit) ?? 
                         this.STANDARD_VOLUME_FACTORS[this.canonical(fromUnit)];
      if (fromFactor === undefined) return { success: false, error: `Factor de volumen no encontrado para ${fromUnit}` };
      
      const ml = value * fromFactor;
      const toUnitVolume = this.findFactor(volumePer, toUnit);
      if (toUnitVolume === undefined) return { success: false, error: `Equivalencia por unidad no encontrada para ${toUnit}` };
      
      const result = ml / toUnitVolume;
      steps.push(`${value} ${fromUnit} × ${fromFactor} = ${ml}ml`);
      steps.push(`${ml}ml ÷ ${toUnitVolume}ml = ${result.toFixed(3)} ${toUnit}`);
      return { success: true, value: result, steps };
    } else {
      const fromUnitVolume = this.findFactor(volumePer, fromUnit);
      if (fromUnitVolume === undefined) return { success: false, error: `Equivalencia por unidad no encontrada para ${fromUnit}` };
      
      const ml = value * fromUnitVolume;
      const toFactor = this.findFactor(volumePer, toUnit) ?? 
                       this.STANDARD_VOLUME_FACTORS[this.canonical(toUnit)];
      if (toFactor === undefined) return { success: false, error: `Factor de volumen no encontrado para ${toUnit}` };
      
      const result = ml / toFactor;
      steps.push(`${value} ${fromUnit} × ${fromUnitVolume}ml = ${ml}ml`);
      steps.push(`${ml}ml ÷ ${toFactor} = ${result.toFixed(3)} ${toUnit}`);
      return { success: true, value: result, steps };
    }
  }
}