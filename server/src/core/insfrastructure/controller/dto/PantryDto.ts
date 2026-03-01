import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import {
  pantryMeasurementTransactionType,
  PantryMeasurementTransactionType,
} from "../../../domain/pantry.model";

export class CreatePantryDto {
  @IsString()
  ingredientId!: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isRecurrent!: boolean;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) =>
    value === "null" || value === "" ? undefined : value
  )
  expirationDate?: string;

  @IsString()
  measurementType!: string;

  @IsNumber()
  @Type(() => Number)
  measurementValue!: number;
}

export class UpdatePantryMeasurementDto {
  @IsString()
  pantryId!: string;

  @IsEnum(pantryMeasurementTransactionType)
  transactionType!: PantryMeasurementTransactionType;

  @IsString()
  measurementType!: string;

  @IsNumber()
  measurementValue!: number;

  @IsOptional()
  @IsNumber()
  lowValueAlert?: number;
}
