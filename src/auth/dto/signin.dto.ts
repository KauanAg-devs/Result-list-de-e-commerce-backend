import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SigninDTO {
  @IsEmail()
  credentialPrivateEmail: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
