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
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { CreateUserDTO } from '../dto/create.user.dto';
import { Request, Response } from 'express';
import { SigninDTO } from '../dto/signin.dto';
import { AccessTokenGuard } from '../guards/access.token.guard';
import { RefreshTokenGuard } from '../guards/refresh.token.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  signUp(@Body() createUserDTO: CreateUserDTO) {
    return this.authService.signUp(createUserDTO);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body: { verificationCode: string },
  ) {
    return this.authService.validateEmail(
      request,
      response,
      body.verificationCode,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-email-verification')
  async resendVerificationCode(@Body() body: { email: string }) {
    return this.authService.resendVerificationCode(body.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() body: SigninDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { password, credentialPrivateEmail } = body;

    return this.authService.signin(
      credentialPrivateEmail,
      password,
      request,
      response,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return this.authService.me(req);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.logout(req, res);
    return result;
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req, res);
  }
}