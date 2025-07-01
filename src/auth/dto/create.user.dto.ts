import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsStrongPassword,
} from 'class-validator';
import { Type } from 'class-transformer';

function getPasswordRequirements(password: string): string[] {
  const missing: string[] = [];

  if (!password || password.length < 7) {
    missing.push(`at least 7 characters`);
  }

  const numbers = password?.match(/\d/g)?.length || 0;
  if (numbers < 4) {
    missing.push(`at least 4 numbers`);
  }

  const symbols = password?.match(/[^a-zA-Z0-9]/g)?.length || 0;
  if (symbols < 1) {
    missing.push(`at least 1 symbol`);
  }

  return missing;
}

class EmailDTO {
  @IsEmail()
  @IsNotEmpty()
  credentialPrivateEmail: string;

  @IsEmail()
  @IsOptional()
  publicEmail?: string;
}

export class CreateUserDTO {
  @IsStrongPassword(
    {
      minLength: 7,
      minNumbers: 4,
      minSymbols: 1,
    },
    {
      message: (validationArguments) => {
        const password = validationArguments.value;
        const missing = getPasswordRequirements(password);

        if (missing.length > 0) {
          return `Password is missing: ${missing.join(', ')}`;
        }

        return 'Password must have at least 7 characters, 4 numbers, and 1 symbol';
      },
    },
  )
  password: string;

  @ValidateNested()
  @Type(() => EmailDTO)
  email: EmailDTO;
}