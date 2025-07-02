import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductPaginationDTO {
  @IsOptional()
  @IsString()
  lastProductReceived?: string;
  @IsNumber()
  productsPerPage: number = 4;
}
