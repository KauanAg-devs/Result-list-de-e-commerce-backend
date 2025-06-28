import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async user(userProfileWhereUniqueInput: Prisma.UserProfileWhereUniqueInput) {
    return this.prisma.userProfile.findUnique({
      where: userProfileWhereUniqueInput,
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

  async update(
    userProfileWhereUniqueInput: Prisma.UserProfileWhereUniqueInput,
    userProfileUpdateInput: Prisma.UserProfileUpdateInput,
  ) {
    return this.prisma.userProfile.update({
      where: userProfileWhereUniqueInput,
      data: userProfileUpdateInput,
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
