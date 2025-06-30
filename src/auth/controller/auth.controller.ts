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
import { AuthGuard } from '../auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  signIn(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() CreateUserDTO: CreateUserDTO,
  ) {
    return this.authService.signUp(request, response, CreateUserDTO);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.validateEmail(token);
  }

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

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return this.authService.me(req);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    const logout = await this.authService.logout(req, res)
    return res
      .status(200)
      .send({ message: logout});
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    this.authService.refresh(req, res);
  }
}
