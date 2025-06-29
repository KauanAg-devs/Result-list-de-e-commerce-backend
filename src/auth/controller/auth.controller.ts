import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { CreateUserDTO } from '../dto/create.user.dto';
import { Request, Response } from 'express';
import { SigninDTO } from '../dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() CreateUserDTO: CreateUserDTO,
  ) {
    return this.authService.signUp(response, CreateUserDTO);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.validateEmail(token);
  }

  @Post('signin')
  async signin(
    @Body() body: SigninDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const {password, credentialPrivateEmail} = body
    return this.authService.signin(credentialPrivateEmail, password, response);
  }

  @Get('me')
  async me(@Req() req: Request) {
   return this.authService.me(req)
  }
}
