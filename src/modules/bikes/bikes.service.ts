import {
  BadRequestException,
  Body,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  BIKE_DOESNT_EXIST_ERROR,
  BIKE_TYPE_NOT_FOUND_ERROR,
} from "./bikes.constants";
import { Bike, BikeStatuses, BikeTypeNames, UserRoles } from "@prisma/client";
import { CreateBikeDto } from "./dto/create-bike.dto";
import { IJwtPayload } from "../user/interfaces/jwt-payload.interface";
import { ChangeBikeStatusDto } from "./dto/change-bike-status.dto";
import { User } from "../../common/decorators/user.decorator";
import { Transactional } from "@nestjs-cls/transactional";

@Injectable()
export class BikesService {
  constructor(private readonly prisma: PrismaService) {}

  findBikeById(bikeId: string) {
    return this.prisma.bike.findUnique({
      where: {
        id: bikeId,
      },
    });
  }

  async findBikeByIdOrThrow(bikeId: string) {
    const bike = await this.findBikeById(bikeId);
    if (!bike) {
      throw new BadRequestException(BIKE_DOESNT_EXIST_ERROR);
    }
    return bike;
  }

  async createBike(
    { typeId, longitude, latitude, status, batteryCharge }: CreateBikeDto,
    currentUser: IJwtPayload,
  ): Promise<Bike> {
    if (currentUser.role !== UserRoles.ADMIN) {
      throw new ForbiddenException();
    }

    return await this.rawCreateBike(
      typeId,
      longitude,
      latitude,
      status,
      batteryCharge,
    );
  }

  // @Transactional()
  private async rawCreateBike(
    bikeTypeId: number,
    longitude: number,
    latitude: number,
    status: BikeStatuses = BikeStatuses.AVAILABLE,
    batteryCharge: number = 100,
  ) {
    const bikeType = await this.prisma.bikeType.findUnique({
      where: { id: bikeTypeId },
    });
    if (!bikeType) {
      throw new NotFoundException(BIKE_TYPE_NOT_FOUND_ERROR);
    }
    try {
      const bike = await this.prisma.bike.create({
        data: {
          type: {
            connect: { id: bikeTypeId },
          },
          status,
          batteryCharge,
        },
      });
      await this.prisma.$executeRaw`
        UPDATE "Bike"
        SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        WHERE id = ${bike.id}
      `;
      return bike;
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  async changeBikeStatus(
    { bikeId, bikeStatus }: ChangeBikeStatusDto,
    currentUser: IJwtPayload,
  ) {
    if (currentUser.role !== UserRoles.ADMIN) {
      throw new ForbiddenException();
    }

    const { count } = await this.prisma.bike.updateMany({
      where: {
        id: bikeId,
      },
      data: {
        status: bikeStatus,
      },
    });
    if (!count) {
      throw new BadRequestException(BIKE_DOESNT_EXIST_ERROR);
    }
    return {
      status: "done",
      bikeId,
    };
  }
}
