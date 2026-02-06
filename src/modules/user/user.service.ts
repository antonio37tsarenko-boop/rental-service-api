import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { USER_DOESNT_EXIST_ERROR } from "../auth/auth.constants";
import { ICreateUserData } from "./interfaces/create-user-data.interface";
import { DeleteUserDto } from "./dto/delete-user.dto";
import { IJwtPayload } from "./interfaces/jwt-payload.interface";
import { UserRoles } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userData: ICreateUserData) {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async deleteUser({ email }: DeleteUserDto, currentUser: IJwtPayload) {
    const { role } = currentUser;
    const currentUserEmail = currentUser.email;

    if (email !== currentUserEmail || role !== UserRoles.ADMIN) {
      throw new ForbiddenException();
    }

    const deletedUser = await this.prisma.user.delete({
      where: {
        email: email,
      },
    });
    if (!deletedUser) {
      throw new BadRequestException(USER_DOESNT_EXIST_ERROR);
    }

    return {
      status: "done",
      id: deletedUser.id,
    };
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
