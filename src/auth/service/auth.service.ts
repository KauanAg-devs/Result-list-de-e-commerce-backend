import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { CreateUserDTO } from '../dto/create.user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { sendEmail } from 'src/utils/send.email.verification';
import { Response, Request } from 'express';
import { SessionService } from 'src/session/session.service';

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
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  private async issueTokensAndSetCookies(
    request: Request,
    response: Response,
    user: User,
  ) {
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

    await this.sessionService.createOne(request, refreshToken, user);
  }

  async signUp(
    request: Request,
    response: Response,
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
      await this.issueTokensAndSetCookies(request, response, user);

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
    credentialPrivateEmail: string,
    password: CreateUserDTO['password'],
    request: Request,
    response: Response,
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

    await this.issueTokensAndSetCookies(request, response, user);

    return { message: 'Signed in successfully.' };
  }

  async me(req: Request) {
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

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refresh_token;
    if (!token) {
      res.status(401).json({ message: 'Refresh token ausente' });
      return;
    }

    const session = await this.sessionService.findOne(token);

    if (!session || session.revoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    const payload = {
      sub: session.user.id,
      email: session.user.credentialPrivateEmail,
    };

    const newAccessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });

    return { message: 'Token renovado com sucesso' };
  }

  async logout(req: Request, res: Response) {
    const token = req.cookies?.refresh_token;
    if (token) {
      await this.sessionService.revoke(token);
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Deslogado com sucesso' };
  }
}
