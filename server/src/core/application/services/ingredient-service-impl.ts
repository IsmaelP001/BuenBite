import { Inject, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { ScannedIngredient, ScanReceipt } from "../../domain/ia.model";
import {
  DEFAULT_UNITS_BY_CATEGORY,
  Ingredient,
  IngredientsFilter,
} from "../../domain/ingredients.model";
import { IngredientRepository } from "../../domain/repositories";
import { IngredientMatcherDomainService } from "../../domain/services/ingredient-matcher.domain-service";
import { IngredientDto } from "../dto";
import { CacheKeys, CacheTTL } from "../../../shared/cache-keys-const";
import { RedisCacheService } from "./redis-cache.service";
import { IngredientService } from "./interfaces/ingredient";

@Injectable()
export class IngredientServiceImpl implements IngredientService {
  constructor(
    @Inject("IngredientRepository")
    private ingredientRepository: IngredientRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}
  searchByFilter(
    ingredients: Ingredient[],
    filter: IngredientsFilter
  ): Ingredient[] {
    return IngredientMatcherDomainService.filterIngredients(ingredients, filter);
  }

  calculateMatchScore(search: string, target: string): number {
    return IngredientMatcherDomainService.calculateMatchScore(search, target);
  }

  findBestMatch(
    ingredients: Ingredient[],
    searchTerm: string
  ): { ingredient: Ingredient; score: number } | null {
    return IngredientMatcherDomainService.findBestMatch(ingredients, searchTerm);
  }

  async getMatchedScannedIngredients(
    scanReceipt: ScanReceipt[]
  ): Promise<ScannedIngredient[]> {
    const ingredientNames = scanReceipt?.map((item) => item.standardName) ?? [];
    const allIngredients = await this.ingredientRepository.getAll({
      ingredientNames,
    });
    return this.mapScannedIngredients(scanReceipt, allIngredients);
  }

  mapScannedIngredients(
    scanIaIngredients: ScanReceipt[],
    ingredients: Ingredient[]
  ): ScannedIngredient[] {
    return scanIaIngredients.map((scannedItem) => {
      const cleanName = scannedItem.standardName.trim();

      const matchResult = this.findBestMatch(ingredients, cleanName);

      const foundIngredient = matchResult?.ingredient || null;
      const existsInDatabase = matchResult !== null;
      const matchScore = matchResult?.score || 0;

      const measurementType =
        foundIngredient && foundIngredient?.conversions?.allowed_units
          ? foundIngredient.conversions.allowed_units.includes(
              scannedItem.measurementType
            )
            ? scannedItem.measurementType
            : foundIngredient.conversions.default_unit
          : scannedItem.measurementType;

      return {
        id: uuidv4(),
        scannedName: scannedItem.standardName,
        originalText: scannedItem?.raw || scannedItem.standardName,
        existsInDatabase,
        measurementType: measurementType,
        measurementValue: Number(scannedItem.measurementValue),
        ingredientData: foundIngredient,
        matchScore,
      };
    });
  }

  async createIngredient(
    dto: IngredientDto | IngredientDto[]
  ): Promise<Ingredient[]> {
    const ingrArr = Array.isArray(dto) ? dto : [dto];
    const data: Ingredient[] = ingrArr.map((item) => {
      const units = DEFAULT_UNITS_BY_CATEGORY?.[
            item.category.toLocaleLowerCase()! as keyof typeof DEFAULT_UNITS_BY_CATEGORY
          ]
      const allowed_units = units
        ? units
        : DEFAULT_UNITS_BY_CATEGORY.all;
        console.log('allowed_units',item.category)

        console.log('allowed_units',allowed_units)
      return {
        id: uuidv4(),
        ...item,
        category: item.category ?? "scan",
        name_en: item.name_en ?? item.name_es ?? item.name_fr,
        name_es: item.name_en ?? item.name_es ?? item.name_fr,
        name_fr: item.name_en ?? item.name_es ?? item.name_fr,
        alias: [],
        creationType: "scan",
        isApproved:false,
        calories_100g: item.calories_100g ?? 0,
        protein_100g: item.protein_100g ?? 0,
        fat_100g: item.fat_100g ?? 0,
        carbohydrates_100g: item.carbohydrates_100g ?? 0,
        conversions: {
          allowed_units,
          default_unit: allowed_units[0],
        } as any,
      };
    });

    console.log('ing contr',data)
    const result = await this.ingredientRepository.create(data);
    await this.redisCacheService.invalidatePrefix(CacheKeys.INGREDIENT.PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.INGREDIENT.FILTER_ACTIVE_PREFIX);
    return result;
  }

  getAllIngredient(filter: IngredientsFilter): Promise<Ingredient[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.INGREDIENT.ALL(filter),
      CacheKeys.INGREDIENT.PREFIX,
      () => this.ingredientRepository.getAll(filter),
      CacheTTL.LONG,
    );
  }

  getFilterActiveIngredient(): Promise<Ingredient[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.INGREDIENT.FILTER_ACTIVE(),
      CacheKeys.INGREDIENT.FILTER_ACTIVE_PREFIX,
      () => this.ingredientRepository.getAll({
        isFilterActive: true,
        limit: 15,
      }),
      CacheTTL.LONG,
    );
  }
}
