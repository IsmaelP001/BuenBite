export function getStartAndEndOfWeek(date = new Date()) {
  // Obtener el día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const dayOfWeek = date.getDay();

  // Calcular cuántos días restar para llegar al lunes
  const daysToSubtract = (dayOfWeek + 6) % 7; // Para hacer que el lunes sea el inicio de la semana

  // Crear una nueva fecha para el inicio de la semana (lunes)
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0); // Establecer la hora al inicio del día

  // Crear una nueva fecha para el final de la semana (domingo)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sumar 6 días al lunes
  endOfWeek.setHours(23, 59, 59, 999); // Establecer la hora al final del día

  return { startOfWeek, endOfWeek };
}

// Enhanced unit types
export const unitOptions = [
  // Weight/Mass
  "grams",
  "kilograms",
  "pounds",
  "ounces",

  // Volume - Liquid
  "milliliters",
  "liters",
  "cups",
  "tablespoons",
  "teaspoons",
  "fluid_ounces",
  "pints",
  "quarts",
  "gallons",

  // Count/Pieces
  "pieces",
  "slices",
  "items",

  // Cooking specific
  "pinches",
  "dashes",
  "drops",
];

// Tipos necesarios
type MeasurementType =
  // Weight
  | "grams"
  | "kilograms"
  | "pounds"
  | "ounces"
  | "milligrams"
  | "tons"
  | "stones"
  | "troy_ounces"
  // Volume
  | "milliliters"
  | "liters"
  | "cups"
  | "tablespoons"
  | "teaspoons"
  | "fluid_ounces"
  | "pints"
  | "quarts"
  | "gallons"
  | "pinches"
  | "dashes"
  | "drops"
  | "microliters"
  | "deciliters"
  | "centiliters"
  | "hectoliters"
  | "jiggers"
  | "shots"
  | "wine_glasses"
  | "beer_bottles"
  | "cans"
  | "dessert_spoons"
  | "coffee_spoons"
  | "soup_spoons"
  // Dry Volume
  | "dry_pints"
  | "dry_quarts"
  | "dry_gallons"
  | "pecks"
  | "bushels"
  | "cups_dry"
  | "tablespoons_dry"
  | "teaspoons_dry"
  // Count
  | "pieces"
  | "slices"
  | "items"
  | "units"
  | "each"
  | "dozens"
  | "pairs"
  | "eggs"
  | "cloves"
  | "bulbs"
  | "heads"
  | "stalks"
  | "leaves"
  | "sprigs"
  | "bunches"
  | "pods"
  | "kernels"
  | "wedges"
  | "strips"
  | "cubes"
  | "squares"
  | "bars"
  | "blocks"
  | "cakes"
  | "tablets"
  | "sachets"
  | "packets"
  | "bags"
  | "bottles"
  | "cans_count"
  | "jars"
  | "containers"
  | "boxes"
  | "cartons"
  | "tubes"
  | "rolls"
  // Length
  | "millimeters"
  | "centimeters"
  | "meters"
  | "inches"
  | "feet"
  | "links"
  // Area
  | "square_millimeters"
  | "square_centimeters"
  | "square_meters"
  | "square_inches"
  | "square_feet"
  | "sheets"
  | "layers"
  // Temperature
  | "celsius"
  | "fahrenheit"
  | "kelvin"
  // Time
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months"
  | "years"
  // Percentage
  | "percent"
  | "parts_per_million"
  | "parts_per_billion"
  | "proof"
  | "alcohol_by_volume";

// Factores de conversión completos
const COMPLETE_FOOD_UNITS = {
  weight: {
    // Base: grams
    grams: 1,
    kilograms: 0.001,
    pounds: 0.00220462,
    ounces: 0.035274,
    milligrams: 1000,
    tons: 0.000001,
    stones: 0.000157473,
    troy_ounces: 0.0321507,
  },
  volume: {
    // Base: milliliters
    milliliters: 1,
    liters: 0.001,
    cups: 0.00422675, // US cup
    tablespoons: 0.067628, // US tablespoon
    teaspoons: 0.202884, // US teaspoon
    fluid_ounces: 0.033814, // US fluid ounce
    pints: 0.00211338, // US pint
    quarts: 0.00105669, // US quart
    gallons: 0.000264172, // US gallon
    pinches: 1.6, // ~0.625 ml
    dashes: 0.8, // ~1.25 ml
    drops: 20, // ~0.05 ml
    microliters: 1000,
    deciliters: 0.01,
    centiliters: 0.1,
    hectoliters: 0.00001,
    jiggers: 0.0225, // ~44.4 ml
    shots: 0.0225, // ~44.4 ml
    wine_glasses: 0.00667, // ~150 ml
    beer_bottles: 0.00285, // ~350 ml
    cans: 0.00285, // ~350 ml
    dessert_spoons: 0.1, // ~10 ml
    coffee_spoons: 0.4, // ~2.5 ml
    soup_spoons: 0.067, // ~15 ml
  },
  dry_volume: {
    // Base: milliliters (aproximado)
    dry_pints: 0.00181, // ~551 ml
    dry_quarts: 0.000909, // ~1101 ml
    dry_gallons: 0.000227, // ~4405 ml
    pecks: 0.000113, // ~8810 ml
    bushels: 0.0000283, // ~35239 ml
    cups_dry: 0.00454, // ~220 ml
    tablespoons_dry: 0.0727, // ~13.75 ml
    teaspoons_dry: 0.218, // ~4.58 ml
  },
  count: {
    // Base: pieces
    pieces: 1,
    slices: 1,
    items: 1,
    units: 1,
    each: 1,
    dozens: 0.0833, // 1/12
    pairs: 0.5,
    eggs: 1,
    cloves: 1,
    bulbs: 1,
    heads: 1,
    stalks: 1,
    leaves: 1,
    sprigs: 1,
    bunches: 1,
    pods: 1,
    kernels: 1,
    wedges: 1,
    strips: 1,
    cubes: 1,
    squares: 1,
    bars: 1,
    blocks: 1,
    cakes: 1,
    tablets: 1,
    sachets: 1,
    packets: 1,
    bags: 1,
    bottles: 1,
    cans_count: 1,
    jars: 1,
    containers: 1,
    boxes: 1,
    cartons: 1,
    tubes: 1,
    rolls: 1,
  },
  length: {
    // Base: millimeters
    millimeters: 1,
    centimeters: 0.1,
    meters: 0.001,
    inches: 0.0393701,
    feet: 0.00328084,
    links: 0.00497097,
  },
  area: {
    // Base: square millimeters
    square_millimeters: 1,
    square_centimeters: 0.01,
    square_meters: 0.000001,
    square_inches: 0.00155,
    square_feet: 0.0000107639,
    sheets: 1, // Assuming 1 sheet = 1 square unit
    layers: 1,
  },
  temperature: {
    // Special handling needed
    celsius: 1,
    fahrenheit: 1,
    kelvin: 1,
  },
  time: {
    // Base: minutes
    minutes: 1,
    hours: 0.0166667,
    days: 0.000694444,
    weeks: 0.0000992063,
    months: 0.0000228311,
    years: 0.0000019026,
  },
  percentage: {
    // Base: percent
    percent: 1,
    parts_per_million: 10000,
    parts_per_billion: 10000000,
    proof: 0.5, // US proof is 2x alcohol content
    alcohol_by_volume: 1,
  },
};

// Densidades aproximadas por categoría de alimento (g/ml)
const CATEGORY_DENSITIES_G_PER_ML = {
  meats: 1.0, // Carnes - densidad similar al agua
  seafood: 1.05, // Pescados y mariscos - ligeramente más densos
  dairy: 1.03, // Lácteos - leche promedio
  grains: 0.75, // Granos - arroz, quinoa, etc.
  legumes: 0.8, // Legumbres - frijoles, lentejas, etc.
  flours_and_sugars: 0.65, // Harinas y azúcares - promedio entre harina (0.5) y azúcar (0.8)
  spices: 0.6, // Especias en polvo
  herbs: 0.2, // Hierbas secas - muy ligeras
  condiments_and_sauces: 1.1, // Condimentos y salsas - más densos que agua
  vegetables: 0.95, // Verduras - contenido alto de agua
  fruits: 0.9, // Frutas - contenido alto de agua pero algo de fibra
  nuts_and_seeds: 0.6, // Frutos secos y semillas - aceites naturales
  bakery_and_pastry: 0.5, // Productos de panadería - harina, levadura, aire
  eggs_and_derivatives: 1.03, // Huevos - similar a lácteos
  oils_and_fats: 0.9, // Aceites y grasas - menos densos que agua
  beverages_non_alcoholic: 1.0, // Bebidas no alcohólicas - base agua
  beverages_alcoholic: 0.95, // Bebidas alcohólicas - alcohol es menos denso
  supplements_and_vitamins: 0.8, // Suplementos - polvos compactos
  desserts_and_sweets: 0.7, // Postres y dulces - azúcar y aire
  frozen_foods: 0.95, // Alimentos congelados - contenido de agua
  canned_goods: 1.0, // Enlatados - conservas en líquido
  ready_to_eat: 0.9, // Comidas preparadas - mezcla variada
};

// Enhanced estimation matrix: [category][unit] = grams per unit
const CATEGORY_UNIT_ESTIMATIONS: Record<string, Record<string, number>> = {
  meats: {
    pieces: 120, // Piece of meat (chicken breast, steak portion)
    slices: 25, // Slice of deli meat, bacon
    items: 120, // Generic meat item
    units: 120,
    each: 120,
    fillets: 150, // Fish fillet
    steaks: 200, // Steak portion
    chops: 180, // Pork/lamb chop
    wings: 30, // Chicken wing
    drumsticks: 85, // Chicken drumstick
    thighs: 120, // Chicken thigh
  },
  seafood: {
    pieces: 150, // Piece of fish
    slices: 30, // Slice of fish (sashimi style)
    items: 150, // Generic seafood item
    units: 150,
    each: 150,
    fillets: 180, // Fish fillet
    whole: 400, // Whole small fish
    shrimp: 5, // Individual shrimp
    oysters: 15, // Individual oyster
    mussels: 8, // Individual mussel
  },
  dairy: {
    pieces: 30, // Piece of cheese
    slices: 20, // Slice of cheese
    items: 30, // Generic dairy item
    units: 30,
    each: 30,
    cubes: 15, // Cheese cube
    wedges: 40, // Cheese wedge
    sticks: 25, // String cheese
  },
  grains: {
    pieces: 2, // Individual grain (rice, wheat)
    slices: 25, // Slice of bread
    items: 25, // Generic grain item
    units: 25,
    each: 25,
    cups: 185, // Cup of cooked rice
    bowls: 200, // Bowl of grain
  },
  legumes: {
    pieces: 0.5, // Individual bean/lentil
    slices: 10, // Not common for legumes
    items: 0.5, // Generic legume item
    units: 0.5,
    each: 0.5,
    pods: 5, // Pea pod
  },
  flours_and_sugars: {
    pieces: 0.1, // Individual sugar crystal
    slices: 5, // Not common
    items: 0.1, // Generic flour/sugar item
    units: 0.1,
    each: 0.1,
    cubes: 5, // Sugar cube
    packets: 4, // Sugar packet
  },
  spices: {
    pieces: 0.1, // Individual spice particle
    slices: 1, // Not common
    items: 0.1, // Generic spice item
    units: 0.1,
    each: 0.1,
    pinches: 0.5, // Pinch of spice
    dashes: 0.3, // Dash of spice
  },
  herbs: {
    pieces: 0.05, // Individual herb leaf
    slices: 0.5, // Not common
    items: 0.05, // Generic herb item
    units: 0.05,
    each: 0.05,
    leaves: 0.1, // Individual leaf
    sprigs: 1, // Herb sprig
    bunches: 20, // Herb bunch
  },
  condiments_and_sauces: {
    pieces: 10, // Not common
    slices: 10, // Not common
    items: 10, // Generic condiment item
    units: 10,
    each: 10,
    packets: 8, // Condiment packet
    sachets: 8, // Sauce sachet
  },
  vegetables: {
    pieces: 150, // Piece of vegetable (tomato, onion)
    slices: 15, // Slice of vegetable
    items: 150, // Generic vegetable item
    units: 150,
    each: 150,
    heads: 800, // Head of lettuce/cabbage
    stalks: 60, // Celery stalk
    cloves: 4, // Garlic clove
    bulbs: 150, // Onion bulb
    pods: 8, // Pea pod
    kernels: 0.3, // Corn kernel
    leaves: 2, // Lettuce leaf
    wedges: 50, // Vegetable wedge
    strips: 10, // Vegetable strip
    cubes: 8, // Diced vegetable cube
  },
  fruits: {
    pieces: 150, // Piece of fruit (apple, orange)
    slices: 20, // Slice of fruit
    items: 150, // Generic fruit item
    units: 150,
    each: 150,
    wedges: 30, // Fruit wedge
    segments: 15, // Orange/citrus segment
    berries: 2, // Individual berry
    grapes: 3, // Individual grape
  },
  nuts_and_seeds: {
    pieces: 1.5, // Individual nut
    slices: 0.5, // Sliced almond
    items: 1.5, // Generic nut item
    units: 1.5,
    each: 1.5,
    kernels: 0.8, // Nut kernel
    halves: 2, // Walnut half
  },
  bakery_and_pastry: {
    pieces: 50, // Piece of baked good
    slices: 30, // Slice of bread/cake
    items: 50, // Generic bakery item
    units: 50,
    each: 50,
    rolls: 60, // Bread roll
    buns: 70, // Hamburger bun
    bagels: 90, // Bagel
    muffins: 80, // Muffin
    cookies: 15, // Cookie
    crackers: 5, // Individual cracker
  },
  eggs_and_derivatives: {
    pieces: 50, // Piece of egg product
    slices: 20, // Not common
    items: 50, // Generic egg item
    units: 50,
    each: 50,
    eggs: 50, // Whole egg
    yolks: 18, // Egg yolk
    whites: 33, // Egg white
  },
  oils_and_fats: {
    pieces: 5, // Not common
    slices: 5, // Pat of butter
    items: 5, // Generic oil/fat item
    units: 5,
    each: 5,
    pats: 5, // Butter pat
    sticks: 110, // Butter stick
  },
  beverages_non_alcoholic: {
    pieces: 250, // Not applicable, default serving
    slices: 250, // Not applicable
    items: 250, // Generic beverage item
    units: 250,
    each: 250,
    glasses: 240, // Glass of beverage
    cups: 240, // Cup of beverage
    bottles: 350, // Bottle of beverage
    cans: 330, // Can of beverage
  },
  beverages_alcoholic: {
    pieces: 250, // Not applicable, default serving
    slices: 250, // Not applicable
    items: 250, // Generic alcoholic beverage item
    units: 250,
    each: 250,
    glasses: 150, // Wine glass
    shots: 44, // Shot of liquor
    bottles: 750, // Wine bottle / 330 beer bottle
    cans: 330, // Beer can
  },
  supplements_and_vitamins: {
    pieces: 1, // Individual supplement
    slices: 1, // Not common
    items: 1, // Generic supplement item
    units: 1,
    each: 1,
    tablets: 0.5, // Vitamin tablet
    capsules: 0.3, // Supplement capsule
    pills: 0.5, // Generic pill
  },
  desserts_and_sweets: {
    pieces: 20, // Piece of candy
    slices: 40, // Slice of cake/pie
    items: 20, // Generic dessert item
    units: 20,
    each: 20,
    squares: 15, // Chocolate square
    bars: 45, // Candy bar
    cubes: 8, // Sugar cube in dessert context
    scoops: 60, // Ice cream scoop
  },
  frozen_foods: {
    pieces: 100, // Piece of frozen food
    slices: 30, // Not common
    items: 100, // Generic frozen item
    units: 100,
    each: 100,
    portions: 200, // Frozen meal portion
  },
  canned_goods: {
    pieces: 100, // Piece from can
    slices: 20, // Canned fruit slice
    items: 100, // Generic canned item
    units: 100,
    each: 100,
    cans: 400, // Whole can content
  },
  ready_to_eat: {
    pieces: 80, // Piece of ready meal
    slices: 30, // Slice of prepared food
    items: 80, // Generic ready-to-eat item
    units: 80,
    each: 80,
    portions: 300, // Ready meal portion
    servings: 250, // Standard serving
  },
};

export interface ConversionError {
  code: ErrorCode;
  message: string;
}

export interface ConversionResult {
  success: boolean;
  value?: number;
  error?: ConversionError;
}

export enum ErrorCode {
  INVALID_VALUE = "INVALID_VALUE",
  UNKNOWN_UNIT = "UNKNOWN_UNIT",
  UNKNOWN_CATEGORY = "UNKNOWN_CATEGORY",
  CONVERSION_FACTORS_NOT_FOUND = "CONVERSION_FACTORS_NOT_FOUND",
  CONVERSION_BETWEEN_CATEGORIES_NOT_SUPPORTED = "CONVERSION_BETWEEN_CATEGORIES_NOT_SUPPORTED",
  CATEGORY_REQUIRED = "CATEGORY_REQUIRED",
  UNKNOWN_TEMPERATURE_UNIT = "UNKNOWN_TEMPERATURE_UNIT",
}

export class UnitConverter {
  private static readonly CONVERSION_FACTORS = COMPLETE_FOOD_UNITS;

  private static readonly UNIT_CATEGORIES = {
    weight: [
      "grams",
      "kilograms",
      "pounds",
      "ounces",
      "milligrams",
      "tons",
      "stones",
      "troy_ounces",
    ],
    volume: [
      "milliliters",
      "liters",
      "cups",
      "tablespoons",
      "teaspoons",
      "fluid_ounces",
      "pints",
      "quarts",
      "gallons",
      "pinches",
      "dashes",
      "drops",
      "microliters",
      "deciliters",
      "centiliters",
      "hectoliters",
      "jiggers",
      "shots",
      "wine_glasses",
      "beer_bottles",
      "cans",
      "dessert_spoons",
      "coffee_spoons",
      "soup_spoons",
    ],
    dry_volume: [
      "dry_pints",
      "dry_quarts",
      "dry_gallons",
      "pecks",
      "bushels",
      "cups_dry",
      "tablespoons_dry",
      "teaspoons_dry",
    ],
    count: [
      "pieces",
      "slices",
      "items",
      "units",
      "each",
      "dozens",
      "pairs",
      "eggs",
      "cloves",
      "bulbs",
      "heads",
      "stalks",
      "leaves",
      "sprigs",
      "bunches",
      "pods",
      "kernels",
      "wedges",
      "strips",
      "cubes",
      "squares",
      "bars",
      "blocks",
      "cakes",
      "tablets",
      "sachets",
      "packets",
      "bags",
      "bottles",
      "cans_count",
      "jars",
      "containers",
      "boxes",
      "cartons",
      "tubes",
      "rolls",
    ],
    length: ["millimeters", "centimeters", "meters", "inches", "feet", "links"],
    area: [
      "square_millimeters",
      "square_centimeters",
      "square_meters",
      "square_inches",
      "square_feet",
      "sheets",
      "layers",
    ],
    temperature: ["celsius", "fahrenheit", "kelvin"],
    time: ["minutes", "hours", "days", "weeks", "months", "years"],
    percentage: [
      "percent",
      "parts_per_million",
      "parts_per_billion",
      "proof",
      "alcohol_by_volume",
    ],
  };

  // Original basic estimation (fallback)
  private static readonly ESTIMATED_GRAMS_PER_UNIT: Record<string, number> = {
    pieces: 30,
    slices: 25,
    items: 30,
    units: 30,
    each: 30,
    dozens: 360,
    pairs: 60,
    eggs: 50,
    cloves: 5,
    bulbs: 80,
    heads: 300,
    stalks: 70,
    leaves: 1,
    sprigs: 1,
    bunches: 150,
    pods: 10,
    kernels: 0.3,
    wedges: 40,
    strips: 20,
    cubes: 15,
    squares: 10,
    bars: 50,
    blocks: 200,
    cakes: 400,
    tablets: 1,
    sachets: 5,
    packets: 10,
    bags: 500,
    bottles: 1000,
    cans_count: 400,
    jars: 500,
    containers: 500,
    boxes: 750,
    cartons: 1000,
    tubes: 100,
    rolls: 250,
  };

  /**
   * Enhanced method to estimate grams per unit based on food category and unit type
   * @param unit - The measurement unit
   * @param foodCategory - The food category (optional, uses generic estimation if not provided)
   * @returns Estimated grams per unit or null if not applicable
   */
  public static estimateGramsPerUnit(unit: MeasurementType, foodCategory?: string): number | null {
    const categoryResult = this.getUnitCategory(unit);
    if (!categoryResult.success || categoryResult.value !== "count") {
      return null;
    }

    // If food category is provided and exists in our enhanced estimations
    if (foodCategory && CATEGORY_UNIT_ESTIMATIONS[foodCategory]) {
      const categoryEstimations = CATEGORY_UNIT_ESTIMATIONS[foodCategory];
      
      // Try exact unit match first
      if (categoryEstimations[unit] !== undefined) {
        return categoryEstimations[unit];
      }
      
      // Try common unit aliases
      const unitAliases: Record<string, string[]> = {
        pieces: ['piece', 'pcs', 'pc'],
        slices: ['slice', 'sl'],
        items: ['item', 'itm'],
        units: ['unit', 'u'],
        each: ['ea'],
      };
      
      for (const [baseUnit, aliases] of Object.entries(unitAliases)) {
        if (aliases.includes(unit) && categoryEstimations[baseUnit] !== undefined) {
          return categoryEstimations[baseUnit];
        }
      }
    }

    // Fallback to generic estimation
    return this.ESTIMATED_GRAMS_PER_UNIT[unit] ?? null;
  }

  /**
   * Get all available food categories that have specific unit estimations
   * @returns Array of available food categories
   */
  public static getAvailableFoodCategories(): string[] {
    return Object.keys(CATEGORY_UNIT_ESTIMATIONS);
  }

  /**
   * Get estimated grams for specific category and unit combinations
   * @param foodCategory - The food category
   * @returns Object with unit -> grams mappings for the category
   */
  public static getCategoryUnitEstimations(foodCategory: string): Record<string, number> | null {
    return CATEGORY_UNIT_ESTIMATIONS[foodCategory] || null;
  }

  /**
   * Get all units that have estimations for a specific food category
   * @param foodCategory - The food category
   * @returns Array of units with estimations for this category
   */
  public static getEstimatedUnitsForCategory(foodCategory: string): string[] {
    const estimations = CATEGORY_UNIT_ESTIMATIONS[foodCategory];
    return estimations ? Object.keys(estimations) : [];
  }

  /**
   * Check if a unit can be estimated to grams for nutritional data extraction
   * @param unit - The measurement unit
   * @param foodCategory - Optional food category for enhanced estimation
   * @returns true if the unit can be estimated to grams
   */
  public static canEstimateToGrams(unit: MeasurementType, foodCategory?: string): boolean {
    return this.estimateGramsPerUnit(unit, foodCategory) !== null;
  }

  /**
   * Convert a count-based measurement to grams using category-specific estimation
   * @param value - The numeric value
   * @param unit - The count-based unit
   * @param foodCategory - The food category for enhanced estimation
   * @returns Estimated weight in grams or null if conversion not possible
   */
  public static convertCountToGrams(
    value: number, 
    unit: MeasurementType, 
    foodCategory?: string
  ): number | null {
    const gramsPerUnit = this.estimateGramsPerUnit(unit, foodCategory);
    if (gramsPerUnit === null) {
      return null;
    }
    return value * gramsPerUnit;
  }

  private static readonly ERROR_MESSAGES = {
    [ErrorCode.INVALID_VALUE]: "Value must be a valid number",
    [ErrorCode.UNKNOWN_UNIT]: "Unknown unit",
    [ErrorCode.UNKNOWN_CATEGORY]: "Category not recognized",
    [ErrorCode.CONVERSION_FACTORS_NOT_FOUND]:
      "Conversion factors not found for category",
    [ErrorCode.CONVERSION_BETWEEN_CATEGORIES_NOT_SUPPORTED]:
      "Cannot convert between these categories",
    [ErrorCode.CATEGORY_REQUIRED]:
      "Food category required for conversion between weight and volume",
    [ErrorCode.UNKNOWN_TEMPERATURE_UNIT]: "Unknown temperature unit",
  };

  /**
   * Converts a value from one unit to another
   * @param value - The numeric value to convert
   * @param fromUnit - The source unit
   * @param toUnit - The target unit
   * @param categoryValue - Food category for conversions between weight and volume
   * @returns ConversionResult with success status and value or error
   */
  public static convert(
    value: number,
    fromUnit: MeasurementType,
    toUnit: MeasurementType,
    categoryValue?: string
  ): ConversionResult {
    // Validate input
    if (typeof value !== "number" || isNaN(value)) {
      return {
        success: false,
        error: {
          code: ErrorCode.INVALID_VALUE,
          message: this.ERROR_MESSAGES[ErrorCode.INVALID_VALUE],
        },
      };
    }

    // If same unit, return original value
    if (fromUnit === toUnit) {
      return { success: true, value };
    }

    // Special case: temperature
    if (this.isTemperatureUnit(fromUnit) && this.isTemperatureUnit(toUnit)) {
      return this.convertTemperature(value, fromUnit, toUnit);
    }

    // Get unit categories
    const fromCategoryResult = this.getUnitCategory(fromUnit);
    if (!fromCategoryResult.success) {
      return fromCategoryResult;
    }

    const toCategoryResult = this.getUnitCategory(toUnit);
    if (!toCategoryResult.success) {
      return toCategoryResult;
    }

    const fromCategory = fromCategoryResult.value!;
    const toCategory = toCategoryResult.value!;

    console.log(
      `Converting ${value} ${fromUnit} (${fromCategory}) to ${toUnit} (${toCategory})`
    );

    // If in same category, direct conversion
    if (fromCategory === toCategory) {
      return this.convertWithinCategory(value, fromUnit, toUnit, fromCategory);
    }

    // Conversion between different categories (requires density)
    if (categoryValue) {
      const density =
        CATEGORY_DENSITIES_G_PER_ML[
          categoryValue as keyof typeof CATEGORY_DENSITIES_G_PER_ML
        ];

      if (density == null) {
        return {
          success: false,
          error: {
            code: ErrorCode.UNKNOWN_CATEGORY,
            message: `${
              this.ERROR_MESSAGES[ErrorCode.UNKNOWN_CATEGORY]
            }. Available categories: ${Object.keys(
              CATEGORY_DENSITIES_G_PER_ML
            ).join(", ")}`,
          },
        };
      }

      console.log(
        `Using density ${density} g/ml for category "${categoryValue}"`
      );

      // VOLUME → WEIGHT
      if (fromCategory === "volume" && toCategory === "weight") {
        const millilitersResult = this.convertWithinCategory(
          value,
          fromUnit,
          "milliliters",
          "volume"
        );
        if (!millilitersResult.success) {
          return millilitersResult;
        }

        const milliliters = millilitersResult.value!;
        const grams = milliliters * density;
        console.log(`${milliliters} ml × ${density} g/ml = ${grams} g`);

        if (toUnit === "grams") {
          return { success: true, value: Math.round(grams * 1000) / 1000 };
        } else {
          return this.convertWithinCategory(grams, "grams", toUnit, "weight");
        }
      }

      // WEIGHT → VOLUME
      if (fromCategory === "weight" && toCategory === "volume") {
        const gramsResult = this.convertWithinCategory(
          value,
          fromUnit,
          "grams",
          "weight"
        );
        if (!gramsResult.success) {
          return gramsResult;
        }

        const grams = gramsResult.value!;
        console.log(`${value} ${fromUnit} = ${grams} g`);

        const milliliters = grams / density;
        console.log(`${grams} g ÷ ${density} g/ml = ${milliliters} ml`);

        if (toUnit === "milliliters") {
          return {
            success: true,
            value: Math.round(milliliters * 1000) / 1000,
          };
        } else {
          return this.convertWithinCategory(
            milliliters,
            "milliliters",
            toUnit,
            "volume"
          );
        }
      }

      return {
        success: false,
        error: {
          code: ErrorCode.CONVERSION_BETWEEN_CATEGORIES_NOT_SUPPORTED,
          message: `${
            this.ERROR_MESSAGES[
              ErrorCode.CONVERSION_BETWEEN_CATEGORIES_NOT_SUPPORTED
            ]
          } between ${fromCategory} and ${toCategory} for category "${categoryValue}"`,
        },
      };
    }

    // If we get here, we need categoryValue for conversion
    return {
      success: false,
      error: {
        code: ErrorCode.CATEGORY_REQUIRED,
        message: `${
          this.ERROR_MESSAGES[ErrorCode.CATEGORY_REQUIRED]
        } from ${fromUnit} (${fromCategory}) to ${toUnit} (${toCategory}). Available categories: ${Object.keys(
          CATEGORY_DENSITIES_G_PER_ML
        ).join(", ")}`,
      },
    };
  }

  /**
   * Special handling for temperature conversion
   */
  private static convertTemperature(
    value: number,
    fromUnit: MeasurementType,
    toUnit: MeasurementType
  ): ConversionResult {
    // Convert first to Celsius
    let celsius: number;

    switch (fromUnit) {
      case "celsius":
        celsius = value;
        break;
      case "fahrenheit":
        celsius = ((value - 32) * 5) / 9;
        break;
      case "kelvin":
        celsius = value - 273.15;
        break;
      default:
        return {
          success: false,
          error: {
            code: ErrorCode.UNKNOWN_TEMPERATURE_UNIT,
            message: `${
              this.ERROR_MESSAGES[ErrorCode.UNKNOWN_TEMPERATURE_UNIT]
            }: ${fromUnit}`,
          },
        };
    }

    // Convert from Celsius to target unit
    switch (toUnit) {
      case "celsius":
        return { success: true, value: Math.round(celsius * 100) / 100 };
      case "fahrenheit":
        return {
          success: true,
          value: Math.round(((celsius * 9) / 5 + 32) * 100) / 100,
        };
      case "kelvin":
        return {
          success: true,
          value: Math.round((celsius + 273.15) * 100) / 100,
        };
      default:
        return {
          success: false,
          error: {
            code: ErrorCode.UNKNOWN_TEMPERATURE_UNIT,
            message: `${
              this.ERROR_MESSAGES[ErrorCode.UNKNOWN_TEMPERATURE_UNIT]
            }: ${toUnit}`,
          },
        };
    }
  }

  /**
   * Checks if a unit is a temperature unit
   */
  private static isTemperatureUnit(unit: MeasurementType): boolean {
    return ["celsius", "fahrenheit", "kelvin"].includes(unit);
  }

  /**
   * Gets the category (weight, volume, count, etc.) for a given unit
   */
  private static getUnitCategory(
    unit: MeasurementType
  ): ConversionResult & { value?: string } {
    for (const [category, units] of Object.entries(this.UNIT_CATEGORIES)) {
      if (units.includes(unit)) {
        return { success: true, value: category as any };
      }
    }
    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_UNIT,
        message: `${this.ERROR_MESSAGES[ErrorCode.UNKNOWN_UNIT]}: ${unit}`,
      },
    };
  }

  /**
   * Converts units within the same category
   */
  private static convertWithinCategory(
    value: number,
    fromUnit: MeasurementType,
    toUnit: MeasurementType,
    category: string
  ): ConversionResult {
    const factors =
      this.CONVERSION_FACTORS[category as keyof typeof this.CONVERSION_FACTORS];

    if (!factors) {
      return {
        success: false,
        error: {
          code: ErrorCode.CONVERSION_FACTORS_NOT_FOUND,
          message: `${
            this.ERROR_MESSAGES[ErrorCode.CONVERSION_FACTORS_NOT_FOUND]
          }: ${category}`,
        },
      };
    }

    const fromFactor = factors[fromUnit as keyof typeof factors];
    const toFactor = factors[toUnit as keyof typeof factors];

    if (fromFactor === undefined || toFactor === undefined) {
      return {
        success: false,
        error: {
          code: ErrorCode.CONVERSION_FACTORS_NOT_FOUND,
          message: `${
            this.ERROR_MESSAGES[ErrorCode.CONVERSION_FACTORS_NOT_FOUND]
          } for ${fromUnit} or ${toUnit} in category ${category}`,
        },
      };
    }

    // Convert to base unit, then to target unit
    const baseValue = value / fromFactor;
    const convertedValue = baseValue * toFactor;

    return {
      success: true,
      value: Math.round(convertedValue * 100000) / 100000,
    };
  }

  /**
   * Gets all compatible units for conversion from a given unit
   */
  public static getCompatibleUnits(unit: MeasurementType): MeasurementType[] {
    const categoryResult = this.getUnitCategory(unit);
    if (!categoryResult.success) {
      return [unit];
    }
    return this.UNIT_CATEGORIES[
      categoryResult.value! as keyof typeof this.UNIT_CATEGORIES
    ] as MeasurementType[];
  }

  /**
   * Checks if two units can be converted to each other
   */
  public static canConvert(
    fromUnit: MeasurementType,
    toUnit: MeasurementType,
    categoryValue?: string
  ): boolean {
    const fromCategoryResult = this.getUnitCategory(fromUnit);
    const toCategoryResult = this.getUnitCategory(toUnit);

    if (!fromCategoryResult.success || !toCategoryResult.success) {
      return false;
    }

    const fromCategory = fromCategoryResult.value!;
    const toCategory = toCategoryResult.value!;

    // Same category can always be converted
    if (fromCategory === toCategory) {
      return true;
    }

    // Different categories require categoryValue and density
    if (
      categoryValue &&
      CATEGORY_DENSITIES_G_PER_ML[
        categoryValue as keyof typeof CATEGORY_DENSITIES_G_PER_ML
      ]
    ) {
      return (
        (fromCategory === "weight" && toCategory === "volume") ||
        (fromCategory === "volume" && toCategory === "weight")
      );
    }

    return false;
  }

  /**
   * Gets a readable description of the conversion ratio between two units
   */
  public static getConversionRatio(
    fromUnit: MeasurementType,
    toUnit: MeasurementType,
    categoryValue?: string
  ): string {
    if (!this.canConvert(fromUnit, toUnit, categoryValue)) {
      return "Cannot convert between these units";
    }

    const result = this.convert(1, fromUnit, toUnit, categoryValue);
    if (!result.success) {
      return `Error: ${result.error!.message}`;
    }

    return `1 ${fromUnit} = ${result.value} ${toUnit}`;
  }

  /**
   * Validates if a unit exists in the system
   */
  public static isValidUnit(unit: string): boolean {
    const result = this.getUnitCategory(unit as MeasurementType);
    return result.success;
  }

  /**
   * Gets the base unit for a given category
   */
  public static getBaseUnit(unit: MeasurementType): MeasurementType | null {
    const categoryResult = this.getUnitCategory(unit);
    if (!categoryResult.success) {
      return null;
    }

    const baseUnits = {
      weight: "grams",
      volume: "milliliters",
      dry_volume: "milliliters",
      count: "pieces",
      length: "millimeters",
      area: "square_millimeters",
      temperature: "celsius",
      time: "minutes",
      percentage: "percent",
    };

    return baseUnits[
      categoryResult.value! as keyof typeof baseUnits
    ] as MeasurementType;
  }

  /**
   * Gets available food categories
   */
  public static getAvailableCategories(): string[] {
    return Object.keys(CATEGORY_DENSITIES_G_PER_ML);
  }

  /**
   * Gets error message for a specific error code
   */
  public static getErrorMessage(code: ErrorCode): string {
    return this.ERROR_MESSAGES[code];
  }
}

// Función legacy para compatibilidad hacia atrás
export const convertUnits = (
  value: number,
  fromUnit: MeasurementType,
  toUnit: MeasurementType,
  categoryValue?: string
): ConversionResult => {
  return UnitConverter.convert(value, fromUnit, toUnit, categoryValue);
};

// Usage examples for enhanced estimation:
/*
// Enhanced category-based estimation
console.log(UnitConverter.estimateGramsPerUnit('pieces', 'meats')); // 120g per piece of meat
console.log(UnitConverter.estimateGramsPerUnit('slices', 'meats')); // 25g per slice of meat
console.log(UnitConverter.estimateGramsPerUnit('pieces', 'fruits')); // 150g per piece of fruit
console.log(UnitConverter.estimateGramsPerUnit('slices', 'vegetables')); // 15g per slice of vegetable

// Convert count-based measurements to grams for nutritional analysis
console.log(UnitConverter.convertCountToGrams(2, 'pieces', 'meats')); // 240g (2 pieces of meat)
console.log(UnitConverter.convertCountToGrams(5, 'slices', 'bakery_and_pastry')); // 150g (5 slices of bread)
console.log(UnitConverter.convertCountToGrams(3, 'items', 'fruits')); // 450g (3 fruits)

// Check if unit can be estimated for nutritional data extraction
console.log(UnitConverter.canEstimateToGrams('pieces', 'vegetables')); // true
console.log(UnitConverter.canEstimateToGrams('grams')); // false (already a weight unit)

// Get available categories and their unit estimations
console.log(UnitConverter.getAvailableFoodCategories()); 
// ['meats', 'seafood', 'dairy', 'grains', 'legumes', ...]

console.log(UnitConverter.getCategoryUnitEstimations('vegetables'));
// { pieces: 150, slices: 15, items: 150, heads: 800, stalks: 60, ... }

console.log(UnitConverter.getEstimatedUnitsForCategory('bakery_and_pastry'));
// ['pieces', 'slices', 'items', 'units', 'each', 'rolls', 'buns', 'bagels', ...]

// Basic conversion still works as before
const result1 = UnitConverter.convert(1000, 'grams', 'kilograms'); // 1
const result2 = UnitConverter.convert(2, 'cups', 'milliliters'); // 473.176
*/

/**
 * A class for handling value unit conversions across various unit dimensions
 */

type UnitDefinition = {
  dimension: string;
  conversion: number;
};

type TempConversionMap = {
  [key: string]: (value: number) => number;
};

class ValueUnits {
  private value: number;
  private units: string;

  static unitsMap: Record<string, UnitDefinition>;
  static tempConversions: TempConversionMap;

  constructor(value: number | string, units?: string) {
    let parsedValue: number;
    let parsedUnits: string = "";

    if (typeof value === "number" && units) {
      parsedValue = value;
      parsedUnits = units;
    } else if (typeof value === "string") {
      if (units) {
        parsedValue = parseFloat(value);
        parsedUnits = units;
      } else {
        const parts = value.replace(/\s+/g, " ").trim().split(" ");

        if (parts.length < 1 || parts.length > 2) {
          throw new Error(
            `Invalid format: "${value}". Expected "number unit" or just "number".`
          );
        }

        parsedValue = parseFloat(parts[0]);
        parsedUnits = parts.length > 1 ? parts[1] : "";

        if (isNaN(parsedValue)) {
          throw new Error(`Invalid numeric value: "${parts[0]}"`);
        }
      }
    } else {
      throw new Error("Invalid arguments passed to ValueUnits constructor");
    }

    this.value = parsedValue;
    this.units = parsedUnits;
  }

  toUnits(targetUnits: string): ValueUnits {
    if (!ValueUnits.unitsMap[targetUnits]) {
      throw new Error(`Unknown target unit: "${targetUnits}"`);
    }

    if (!this.units) {
      if (ValueUnits.unitsMap[targetUnits].dimension === "number") {
        this.units = targetUnits;
        if (targetUnits === "%") {
          this.value *= 100;
        }
        return this;
      } else {
        throw new Error(`Cannot convert dimensionless value to ${targetUnits}`);
      }
    }

    const sourceDimension = this.unitsDimension();
    const targetDimension = ValueUnits.unitsMap[targetUnits].dimension;

    if (sourceDimension !== targetDimension) {
      throw new Error(
        `Cannot convert between different dimensions: ${sourceDimension} to ${targetDimension}`
      );
    }

    const sourceConversion = ValueUnits.unitsMap[this.units].conversion;
    const targetConversion = ValueUnits.unitsMap[targetUnits].conversion;

    const baseValue = this.value * sourceConversion;
    this.value = parseFloat((baseValue / targetConversion).toFixed(10));
    this.units = targetUnits;

    return this;
  }

  unitsDimension(): string {
    return this.units ? ValueUnits.unitsMap[this.units].dimension : "number";
  }

  getValue(): number {
    return this.value;
  }

  getUnits(): string {
    return this.units;
  }

  toString(): string {
    return `${this.value}${this.units ? " " + this.units : ""}`;
  }

  static canConvert(fromUnit: string, toUnit: string): boolean {
    if (!ValueUnits.unitsMap[fromUnit] || !ValueUnits.unitsMap[toUnit]) {
      return false;
    }
    return (
      ValueUnits.unitsMap[fromUnit].dimension ===
      ValueUnits.unitsMap[toUnit].dimension
    );
  }

  static getUnitsForDimension(dimension: string): string[] {
    return Object.entries(ValueUnits.unitsMap)
      .filter(([_, data]) => data.dimension === dimension)
      .map(([unit]) => unit);
  }
}

// Unit definitions with improved organization and accuracy
ValueUnits.unitsMap = {
  // Dimensionless
  "": { dimension: "number", conversion: 1 },
  "%": { dimension: "number", conversion: 0.01 },

  // Length units
  pts: { dimension: "length", conversion: 1 },
  px: { dimension: "length", conversion: 0.75 }, // 72/96 pts in modern browsers
  in: { dimension: "length", conversion: 72 },
  '"': { dimension: "length", conversion: 72 },
  ft: { dimension: "length", conversion: 864 }, // 72 * 12
  "'": { dimension: "length", conversion: 864 },
  cm: { dimension: "length", conversion: 28.3465 }, // 72/2.54
  mm: { dimension: "length", conversion: 2.83465 }, // 72/25.4
  m: { dimension: "length", conversion: 2834.65 }, // 72/0.0254

  // Inverse length units
  "/pts": { dimension: "/length", conversion: 1 },
  "/in": { dimension: "/length", conversion: 0.01388889 }, // 1/72
  "/px": { dimension: "/length", conversion: 1.33333333 }, // 96/72

  // Volume units (base: liter)
  l: { dimension: "volume", conversion: 1 },
  dl: { dimension: "volume", conversion: 0.1 },
  cl: { dimension: "volume", conversion: 0.01 },
  ml: { dimension: "volume", conversion: 0.001 },
  "fl oz": { dimension: "volume", conversion: 0.0295735 }, // US fluid ounce
  gal: { dimension: "volume", conversion: 3.78541 }, // US gallon
  qt: { dimension: "volume", conversion: 0.946353 }, // US quart
  pt: { dimension: "volume", conversion: 0.473176 }, // US pint
  tbs: { dimension: "volume", conversion: 0.0147868 }, // US tablespoon
  tsp: { dimension: "volume", conversion: 0.00492892 }, // US teaspoon
  cup: { dimension: "volume", conversion: 0.24 }, // US cup (metric)

  // Mass units (base: gram)
  g: { dimension: "mass", conversion: 1 },
  kg: { dimension: "mass", conversion: 1000 },
  mg: { dimension: "mass", conversion: 0.001 },
  oz: { dimension: "mass", conversion: 28.3495 },
  lb: { dimension: "mass", conversion: 453.592 },
  t: { dimension: "mass", conversion: 1000000 }, // metric ton

  // Temperature units
  "°C": { dimension: "temperature", conversion: 1 },
  "°F": { dimension: "temperature", conversion: 1 }, // Special conversion needed
  K: { dimension: "temperature", conversion: 1 }, // Special conversion needed

  // Time units (base: second)
  s: { dimension: "time", conversion: 1 },
  min: { dimension: "time", conversion: 60 },
  h: { dimension: "time", conversion: 3600 },
  day: { dimension: "time", conversion: 86400 },
  week: { dimension: "time", conversion: 604800 },
};

