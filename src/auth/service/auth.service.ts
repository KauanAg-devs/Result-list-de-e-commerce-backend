import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { CreateUserDTO } from '../dto/create.user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { sendEmail } from 'src/utils/send.email.verification';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserProfileDTO: CreateUserDTO) {
    try {
      const hashedPassword = await bcrypt.hash(
        createUserProfileDTO.password,
        10,
      );

      const verificationToken = await this.jwtService.signAsync(
        { sub: createUserProfileDTO.email.credentialPrivateEmail },
        {
          expiresIn: '30m',
          secret: process.env.JWT_EMAIL_VERIFICATION_SECRET,
        },
      );

      const data: Prisma.UserProfileCreateInput = {
        credentialPrivateEmail:
          createUserProfileDTO.email.credentialPrivateEmail,
        publicEmail: createUserProfileDTO.email.publicEmail,
        password: hashedPassword,
        memberSince: new Date(),
        emailVerificationToken: verificationToken,
      };

      const user = await this.usersService.create(data);
      const payload = { sub: user.id, email: user.credentialPrivateEmail };

      const access_token = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      });

      const refresh_token = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET_KEY,
      });

      await sendEmail(user.credentialPrivateEmail, verificationToken)

      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email is already registered.');
        }
      }

      console.error(error);
      throw new InternalServerErrorException('Error during account creation.');
    }
  }

  async validateEmail(token: string){
     if (!token) throw new BadRequestException('Token ausente');

    let email: string;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_EMAIL_VERIFICATION_SECRET,
      });

      email = payload.sub;
    } catch (err) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const user = await this.usersService.user({credentialPrivateEmail: email});

    if (!user) throw new BadRequestException('Usuário não encontrado');

    await this.usersService.markEmailAsVerified(user.id)

    return { message: 'Email verificado com sucesso!' };
  }
}
