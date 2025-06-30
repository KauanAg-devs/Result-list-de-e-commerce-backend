import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export enum VariantStatus {
  Processing = "Processing",
  InTransit = "In-transit",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
  PaymentPendent = "Payment-pendent",
  Paid = "Paid",
  Refunded = "Refunded",
}

export class OptionValueDto {
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsNumber()
  relativeImage?: number;
}

export class OptionDto {
  @IsString()
  label: string;

  @IsString()
  type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionValueDto)
  values: OptionValueDto[];
}

export class ProductVariantAvaliationsDto {
  @IsNumber()
  star: number;

  @IsString()
  comment: string;
}

export class ProductVariantDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantAvaliationsDto)
  avaliations?: ProductVariantAvaliationsDto[];

  @IsNumber()
  stock: number;

  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsObject()
  options: Record<string, string>;
}

export class SpecDto {
  @IsString()
  label: string;

  @IsString()
  value: string;
}

export class ProductGroupedDto {
  @IsNumber() 
  ownerId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];

  @ValidateNested()
  @Type(() => ProductVariantDto)
  default: ProductVariantDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecDto)
  specs?: SpecDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];
}
