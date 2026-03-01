import {
  IsString,
  IsArray,
  IsOptional,
  IsDateString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseItemDto {
  @IsOptional()
  @IsString()
  pantryId?: string;

  @IsString()
  ingredientName!: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsString()
  measurementType!: string;

  @IsNumber()
  amountToBuy!: number;
}

export class CreatePurchaseDto {
  @IsString()
  userId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  purchaseItems!: PurchaseItemDto[];
}


export class ConfirmPurchaseItemDto {
  @IsString()
  orderId!: string;

  @IsOptional()
  @IsString()
  purchaseItemId?: string;

  @IsNumber()
  measurementValue!: number;

  @IsString()
  measurementType!: string;
}
