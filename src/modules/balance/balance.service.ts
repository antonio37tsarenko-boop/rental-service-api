import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserService } from "../user/user.service";
import { NOT_ENOUGH_MONEY_ERROR } from "../../common/constants";

@Injectable()
export class BalanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async decreaseBalance(userId: string, decreaseAmount: number) {
    const { balance } = await this.userService.findUserByIdOrThrow(userId);
    if (decreaseAmount > +balance) {
      throw new BadRequestException(NOT_ENOUGH_MONEY_ERROR);
    }

    const { count } = await this.prisma.user.updateMany({
      where: {
        id: userId,
      },
      data: {
        balance: { decrement: decreaseAmount },
      },
    });
    if (!count) {
      throw new ForbiddenException(NOT_ENOUGH_MONEY_ERROR);
    }
  }
}
