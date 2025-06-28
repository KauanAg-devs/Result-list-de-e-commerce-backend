import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsStrongPassword,
} from 'class-validator';
import { Type } from 'class-transformer';

class EmailDTO {
  @IsEmail()
  @IsNotEmpty()
  credentialPrivateEmail: string;

  @IsEmail()
  @IsOptional()
  publicEmail?: string;
}

export class CreateUserDTO {
  @IsStrongPassword({
    minLength: 7,
    minNumbers: 4,
    minSymbols: 1,
  })
  password: string
  
  @ValidateNested()
  @Type(() => EmailDTO)
  email: EmailDTO;
}
