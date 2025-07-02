import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update.users.dto';
import { AccessTokenGuard } from 'src/auth/guards/access.token.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('findById')
  async findUserById(@Body() {id}: {id: number}){    
    return this.usersService.user({
      id
    })
  }

  @UseGuards(AccessTokenGuard)
  @Post('update')
  @HttpCode(HttpStatus.OK)
  async update(@Body() userProfile: UpdateUserDto) {
    try {
      const updatedUser = await this.usersService.update(userProfile);
      return {
        id: updatedUser.id,
        email: {
          credendialPrivateEmail: updatedUser.credentialPrivateEmail,
          publicEmail: updatedUser.publicEmail,
        },
        name: updatedUser.name,
        isEmailVerified: updatedUser.isEmailVerified,
        profileImage: updatedUser.profileImage,
        phone: updatedUser.phone,
        roles: updatedUser.roles.map((r) => r.role),
        memberSince: updatedUser.memberSince,
      };
    } catch (error) {
      throw new ConflictException({
        message: 'Error during user update',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
