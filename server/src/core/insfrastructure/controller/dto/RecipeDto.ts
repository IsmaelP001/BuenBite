import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

import { Transform, Type } from "class-transformer";
import { IsBoolean, ValidateNested } from "class-validator";
import { ImageItem } from "./index";

export class GenerateRecipeIaDto {
  @IsString()
  description!: string;

  @IsString()
  cuisineType!: string;

  @IsString()
  difficulty!: string;

  @IsNumber()
  servings!: number;

  @IsOptional()
  @IsArray()
  selectedPantryItems?: string[];

  @IsOptional()
  surpriseMe?: boolean;
}

export class InstructionDto {
  @IsString()
  step!: string;
}

export class RecipeIngredientDto {
  @IsString()
  ingredientId!: string;

  @IsString()
  measurementType!: string;

  @IsNumber()
  measurementValue!: number;

  @IsString()
  @IsOptional()
  notes!: string;
}

import { TransformFnParams } from "class-transformer";

export function transformJsonField<T = any>({ value }: TransformFnParams): T {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return Array.isArray(value) ? ([] as T) : (undefined as T);
    }
  }
  return value;
}

export class CreateRecipeDto {
  @IsString()
  userId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentRecipeId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  prepTime?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  servings?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cookTime?: number;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  isSharedCommunity?: boolean;

  @IsArray()
  @IsString({ each: true })
  @Transform(transformJsonField)
  mealTypes!: string[];

  @IsOptional()
  @IsString()
  foodType?: string;

  @IsOptional()
  @Transform(transformJsonField)
  @ValidateNested({ each: true })
  @Type(() => InstructionDto)
  instructions?: InstructionDto[];

  @Transform(transformJsonField)
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients!: RecipeIngredientDto[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Transform(transformJsonField)
  @Type(() => ImageItem)
  image?: ImageItem;
}

export class ConfirmCookRecipeDto {
  @IsString()
  pantryId!: string;

  @IsString()
  measurementType!: string;

  @IsNumber()
  measurementValue!: number;
}
