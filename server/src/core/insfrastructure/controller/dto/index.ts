import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class ImageItem {
  @IsString()
  fieldname!: string;

  @IsString()
  originalname!: string;

  @IsString()
  encoding!: string;

  @IsString()
  mimetype!: string;

  @IsNumber()
  @Type(() => Number)
  size!: number;

  buffer!: Buffer;
}
