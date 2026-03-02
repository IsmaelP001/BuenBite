import { Inject, Injectable } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ERROR_SUBCODES, ValidationError } from "../../../errors/customErrors";
import { ScannedIngredientWithMatches } from "../../domain/ia.model";
import { DishAnalysisWithIngredients } from "../../domain/recipe.model";
import { CreateRecipeDto } from "../../insfrastructure/controller/dto/RecipeDto";
import { GenerateRecipeIaDto } from "../dto";
import { IaFacade, IaService } from "../services/interfaces/ia";
import { ProcessScannedIngredientsUseCase } from "../use-cases/ingredient/scanned-ingredient-with-matches.use-case";

@Injectable()
export class IAFacadeImpl implements IaFacade {
  constructor(
    @Inject("RecipeAIService")
    private iaService: IaService,
    private processScannedIngredientsUseCase: ProcessScannedIngredientsUseCase,
  ) {}
  generateRecipe(prompt: GenerateRecipeIaDto): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async scanReceipt(image: any): Promise<ScannedIngredientWithMatches[]> {
    const scanResultIngredients = await this.iaService.scanReceipt(image);
    return await this.processScannedIngredientsUseCase.execute(
      scanResultIngredients,
    );
  }

  async scanFood(image: any): Promise<DishAnalysisWithIngredients> {
    const result = await this.iaService.scanFood(image);
    const ingredients = await this.processScannedIngredientsUseCase.execute(
      result.ingredients,
    );

    return { ...result, ingredients };
  }

  generateRecipeFromParams(params: GenerateRecipeIaDto): string {
    const {
      description,
      cuisineType,
      difficulty,
      servings,
      selectedPantryItems = [],
      surpriseMe = false,
    } = params;

    let prompt = `Quiero una receta de cocina tipo ${cuisineType}, dificultad ${difficulty}, para ${servings} porciones. ${description}`;

    if (selectedPantryItems.length > 0) {
      const itemsList = selectedPantryItems.join(", ");
      prompt += `. Solo puedes usar ingredientes de la siguiente lista: [${itemsList}]. No incluyas ingredientes fuera de esa lista.`;
    }

    if (surpriseMe) {
      prompt +=
        " Sé creativo, sorpréndeme con algo original dentro de esos parámetros.";
    }

    prompt += `

El resultado de la receta debe estar en español.

⚠️ Instrucciones estrictas para el formato del JSON:
- No incluyas ninguna explicación, saludo, título o introducción.
- No uses markdown (\`\`\`json) ni ningún tipo de formato adicional.
- El resultado debe ser únicamente un objeto JSON que comience con { y termine con }.
- El JSON no debe estar envuelto en comillas ni como cadena.
- No uses ninguna propiedad llamada "json", solo el objeto directamente.

Importante: Para cada ingrediente, el campo "measurementType" debe usar exclusivamente una unidad de la siguiente lista (en inglés, exactamente como está):
[grams, kilograms, pounds, ounces, milligrams, tons, stones, troy_ounces, milliliters, liters, cups, tablespoons, teaspoons, fluid_ounces, pints, quarts, gallons, pinches, dashes, drops, microliters, deciliters, centiliters, hectoliters, jiggers, shots, wine_glasses, beer_bottles, cans, dessert_spoons, coffee_spoons, soup_spoons, dry_pints, dry_quarts, dry_gallons, pecks, bushels, cups_dry, tablespoons_dry, teaspoons_dry, pieces, slices, items, units, each, dozens, pairs, eggs, cloves, bulbs, heads, stalks, leaves, sprigs, bunches, pods, kernels, wedges, strips, cubes, squares, bars, blocks, cakes, tablets, sachets, packets, bags, bottles, cans_count, jars, containers, boxes, cartons, tubes, rolls, millimeters, centimeters, meters, inches, feet, links, square_millimeters, square_centimeters, square_meters, square_inches, square_feet, sheets, layers, celsius, fahrenheit, kelvin, minutes, hours, days, weeks, months, years, percent, parts_per_million, parts_per_billion, proof, alcohol_by_volume]

Importante: el campo "category" de cada ingrediente debe ser un string (no un array), y debe ser exactamente uno de los siguientes valores (en inglés y en minúsculas):
["meats", "seafood", "dairy", "grains", "legumes", "flours_and_sugars", "spices", "herbs", "condiments_and_sauces", "vegetables", "fruits", "nuts_and_seeds", "bakery_and_pastry", "eggs_and_derivatives", "oils_and_fats", "beverages_non_alcoholic", "beverages_alcoholic", "supplements_and_vitamins", "desserts_and_sweets", "frozen_foods", "canned_goods"]

🚧 Estructura del JSON que debes devolver:

{
  "name": string,
  "nutritionalInfo": {
    "calories": number,
    "protein": string,
    "carbs": string,
    "fat": string
  },
  "mealTypes": ["breakfast", "lunch", "dinner", "snack", "dessert", "drink"],
  "description": string,
  "servings": number,
  "prepTime": number,
  "ingredients": [
    {
      "category": string,
      "ingredientName": string,
      "measurementType": string,
      "measurementValue": number
    }
  ], 
  "instructions": [
    {
      "step": "Instrucción paso 1"
    },
    {
      "step": "Instrucción paso 2"
    }
  ],
  "notes": string
}`;

    return prompt;
  }

  async generateRecipe(prompt: GenerateRecipeIaDto): Promise<any> {
    const promptText = this.generateRecipeFromParams({
      description: prompt.description,
      cuisineType: prompt.cuisineType,
      difficulty: prompt.difficulty,
      servings: prompt.servings,
      selectedPantryItems: prompt.selectedPantryItems,
      surpriseMe: prompt.surpriseMe,
      userId: prompt.userId,
    });

    const recipeGenerated = await this.iaService.generateRecipe(promptText);

    const recipe = plainToInstance(CreateRecipeDto, {
      ...recipeGenerated,
      userId: prompt.userId,
    });

    const errors = await validate(recipe);

    if (errors.length > 0) {
      throw new ValidationError(
        "Error validating the generated recipe",
        ERROR_SUBCODES.VALIDATION.FIELD_INVALID,
        {
          severity: "high",
        },
      );
    }

    return recipe;
  }
}
