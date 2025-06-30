import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/update.users.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async user(userProfileWhereUniqueInput: Prisma.UserProfileWhereUniqueInput) {
    return this.prisma.userProfile.findUnique({
      where: userProfileWhereUniqueInput,
      include: {
        roles: true,
      },
    });
  }

  async create(userProfileCreateInput: Prisma.UserProfileCreateInput) {
    return this.prisma.userProfile.create({
      data: userProfileCreateInput,
    });
  }

  async delete(
    userProfileWhereUniqueInput: Prisma.UserProfileWhereUniqueInput,
  ) {
    return this.prisma.userProfile.delete({
      where: userProfileWhereUniqueInput,
    });
  }

  async update(userProfile: UpdateUserDto) {
    return this.prisma.userProfile.update({
      where: { id: userProfile.id },
      data: {
        name: userProfile.name,
        phone: userProfile.phone ?? null,
        profileImage: userProfile.profileImage ?? null,
        publicEmail: userProfile.publicEmail ?? null,
      },
      include: {roles: true}
    });
  }

  async markEmailAsVerified(userId: number) {
    return this.prisma.userProfile.update({
      where: { id: userId },
      data: {
        emailVerificationToken: null,
        isEmailVerified: true,
      },
    });
  }
}
