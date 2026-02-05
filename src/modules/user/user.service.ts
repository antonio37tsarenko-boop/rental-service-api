import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { USER_DOESNT_EXIST_ERROR } from "../auth/auth.constants";
import { ICreateUserData } from "./interfaces/create-user-data.interface";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userData: ICreateUserData) {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  async deleteUserOrThrow(userId: string) {
    const deletedUser = await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
    if (!deletedUser) {
      throw new BadRequestException(USER_DOESNT_EXIST_ERROR);
    }
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findUserByEmailOrThrow(email: string) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException(USER_DOESNT_EXIST_ERROR);
    }
    return user;
  }
}
