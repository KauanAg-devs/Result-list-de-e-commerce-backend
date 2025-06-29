import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string | null;
  
  @IsOptional()
  @IsString()
  profileImage?: string | null;
  
  @IsOptional()
  @IsEmail()
  publicEmail?: string | null;
}
