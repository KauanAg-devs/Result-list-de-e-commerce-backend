import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { CreateUserDTO } from '../dto/create.user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { sendEmail } from 'src/utils/send.email.verification';
import { Response, Request } from 'express';

type User = {
  id: number;
  name: string | null;
  password: string;
  credentialPrivateEmail: string;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  publicEmail: string | null;
  phone: string | null;
  profileImage: string | null;
  memberSince: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async issueTokensAndSetCookies(user: User, response: Response) {
    const payload = { sub: user.id, email: user.credentialPrivateEmail };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET_KEY,
    });

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'lax',
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
    });
  }

  async signUp(
    @Res({ passthrough: true }) response: Response,
    createUserProfileDTO: CreateUserDTO,
  ) {
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
        roles: {
          create: [
            {
              role: 'User',
            },
          ],
        },
      };

      const user = await this.usersService.create(data);

      await sendEmail(user.credentialPrivateEmail, verificationToken);
      await this.issueTokensAndSetCookies(user, response);

      return {
        message: 'Account created successfully. Please verify your email.',
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email is already registered.');
      }

      console.error(error);
      throw new InternalServerErrorException('Error during account creation.');
    }
  }

  async validateEmail(token: string) {
    if (!token) throw new BadRequestException('Token is missing.');

    let email: string;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_EMAIL_VERIFICATION_SECRET,
      });

      email = payload.sub;
    } catch (err) {
      throw new BadRequestException('Invalid or expired token.');
    }

    const user = await this.usersService.user({
      credentialPrivateEmail: email,
    });

    if (!user) throw new BadRequestException('User not found.');

    await this.usersService.markEmailAsVerified(user.id);

    return { message: 'Email successfully verified.' };
  }

  async signin(
    credentialPrivateEmail: CreateUserDTO['email']['credentialPrivateEmail'],
    password: CreateUserDTO['password'],
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.usersService.user({ credentialPrivateEmail });

    if (!user) {
      throw new NotFoundException({ message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        message: 'Invalid signin credentials.',
      });
    }

    await this.issueTokensAndSetCookies(user, response);

    return { message: 'Signed in successfully.' };
  }

  async me(@Req() req: Request) {
    try {
      const token = req.cookies['access_token'];
      if (!token) throw new UnauthorizedException('No access token found');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.usersService.user({ id: payload.sub });
      if (!user) throw new UnauthorizedException('User not found');

      return {
        id: user.id,
        email: {
          credendialPrivateEmail: user.credentialPrivateEmail,
          publicEmail: user.publicEmail,
        },
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage,
        phone: user.phone,
        roles: user.roles.map((r) => r.role),
        memberSince: user.memberSince,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
