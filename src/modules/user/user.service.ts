import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Query,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ICreateUserData } from "./interfaces/create-user-data.interface";
import { IJwtPayload } from "./interfaces/jwt-payload.interface";
import { Prisma, User, UserRoles } from "@prisma/client";
import { ResStatusesEnum } from "../../enums/res-statuses.enum";
import { UserDoesntExistException } from "../../common/exceptions/user-doesnt-exist.excep";
import { HashService } from "../hash/hash.service";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async createUser(userData: ICreateUserData) {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async deleteUser(userId: string, currentUser: IJwtPayload) {
    const { role } = currentUser;
    const currentUserId = currentUser.id;

    if (userId.trim() !== currentUserId.trim() && role !== UserRoles.ADMIN) {
      throw new ForbiddenException();
    }
    let deletedUser: User;

    try {
      deletedUser = await this.prisma.user.delete({
        where: {
          id: userId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new UserDoesntExistException();
        }
      }
      throw new InternalServerErrorException(
        "Unknown User service prisma error",
      );
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
      throw new UserDoesntExistException();
    }
    return user;
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findUserByIdOrThrow(id: string) {
    const user = await this.findUserById(id);
    if (!user) {
      throw new UserDoesntExistException();
    }

    return user;
  }

  private async changeUserProperty<
    K extends keyof typeof Prisma.UserScalarFieldEnum,
  >(userId: string, propertyType: K, value: User[K]) {
    const updatedUser = await this.prisma.user.updateMany({
      where: {
        id: userId,
      },
      data: {
        [propertyType]: value,
      },
    });
    if (updatedUser.count == 0) {
      throw new UserDoesntExistException();
    }

    return {
      status: ResStatusesEnum.DONE,
      id: userId,
    };
  }

  async changePassword(
    { userId, newPassword }: ChangePasswordDto,
    currentUser: IJwtPayload,
  ) {
    const { role } = currentUser;
    const currentUserId = currentUser.id;

    if (userId.trim() !== currentUserId.trim() && role !== UserRoles.ADMIN) {
      throw new ForbiddenException();
    }

    const user = await this.findUserByIdOrThrow(userId);

    const isSamePassword = await this.hashService.compare(
      user.hashedPassword,
      newPassword,
    );
    if (isSamePassword) {
      throw new BadRequestException("Same password.");
    }

    const hashedPassword = await this.hashService.hashPassword(newPassword);

    return this.changeUserProperty(userId, "hashedPassword", hashedPassword);
  }
}
