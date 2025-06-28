import { Body, Controller, Post, HttpCode, HttpStatus, BadRequestException, Get, Query } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { CreateUserDTO } from '../dto/create.user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  signIn(@Body() CreateUserDTO: CreateUserDTO) {
    return this.authService.signUp(CreateUserDTO)
  }

    @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
   return this.authService.validateEmail(token)
  }
}
