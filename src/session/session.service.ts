import { Injectable } from '@nestjs/common';
import { UserProfile } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createOne(
    req: Request,
    refreshToken: string,
    user: UserProfile,
  ) {
    return this.prisma.sessions.create({
      data: {
        userId: user.id,
        refreshToken,
        ipAddress: req.ip!,
        userAgent: req.headers['user-agent'] || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
    });
  }
  async findOne(refreshToken: string) {
    return this.prisma.sessions.findUnique({
      where: { refreshToken },
      include: { user: true },
    });
  }

  async revoke(refreshToken: string) {
    try {
      return await this.prisma.sessions.update({
        where: { refreshToken },
        data: { revoked: true },
      });
    } catch (err) {
      console.warn('Tentativa de revogar token inexistente');
      return null;
    }
  }
}
