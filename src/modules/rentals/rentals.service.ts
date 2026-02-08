import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { StartBikeRentalDto } from "./dto/start-bike-rental.dto";
import { IJwtPayload } from "../user/interfaces/jwt-payload.interface";
import { UserService } from "../user/user.service";
import { START_RENT_PRICE } from "../../common/constants";
import {
  BIKE_NOT_AVAILABLE,
  NOT_ENOUGH_MONEY_ERROR,
  RENTAL_DOESNT_EXIST_ERROR,
} from "./rentals.constants";
import { PrismaService } from "../prisma/prisma.service";
import { BalanceService } from "../balance/balance.service";
import { ResStatusesEnum } from "../../enums/res-statuses.enum";
import { EndBikeRentalDto } from "./dto/end-bike-rental.dto";
import { BikeStatuses, Prisma, Rental } from "@prisma/client";
import { BikesService } from "../bikes/bikes.service";
import { Transactional } from "@nestjs-cls/transactional";

@Injectable()
export class RentalsService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly balanceService: BalanceService,
    private readonly bikesService: BikesService,
  ) {}

  // @Transactional()
  async startBikeRental(
    { bikeId }: StartBikeRentalDto,
    currentUser: IJwtPayload,
  ) {
    const user = await this.userService.findUserByIdOrThrow(currentUser.id);
    if (+user.balance < START_RENT_PRICE) {
      throw new ForbiddenException(NOT_ENOUGH_MONEY_ERROR);
    }
    const bike = await this.bikesService.findBikeByIdOrThrow(bikeId);
    if (bike.status !== BikeStatuses.AVAILABLE) {
      throw new BadRequestException(BIKE_NOT_AVAILABLE);
    }

    await this.balanceService.decreaseBalance(user.id, START_RENT_PRICE);
    const rental = await this.createRental(user.id, bikeId);
    return {
      status: ResStatusesEnum.DONE,
      rentalId: rental.id,
    };
  }

  async endBikeRental(dto: EndBikeRentalDto) {
    const { userId, ridePrice } = dto;
  }

  private async createRental(userId: string, bikeId: string): Promise<Rental> {
    return this.prisma.rental.create({
      data: {
        user: {
          connect: { id: userId },
        },
        bike: {
          connect: { id: bikeId },
        },
      },
    });
  }

  private async endRental(userId: string, bikeId: string, totalPrice: number) {
    const { count } = await this.prisma.rental.updateMany({
      where: {
        bikeId,
        userId,
      },
      data: {
        endTime: new Date(),
        totalPrice,
      },
    });
    if (!count) {
      throw new BadRequestException(RENTAL_DOESNT_EXIST_ERROR);
    }
  }
}
