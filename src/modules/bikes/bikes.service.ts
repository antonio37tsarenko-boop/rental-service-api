import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BIKE_TYPE_NOT_FOUND_ERROR } from "./bikes.constants";
import { Bike, BikeStatuses, BikeTypeNames, UserRoles } from "@prisma/client";
import { CreateBikeDto } from "./dto/create-bike.dto";
import { IJwtPayload } from "../user/interfaces/jwt-payload.interface";

@Injectable()
export class BikesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async rawCreateBike(
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
      return await this.prisma.$transaction(async (prisma) => {
        const bike = await prisma.bike.create({
          data: {
            type: {
              connect: { id: bikeTypeId },
            },
            status,
            batteryCharge,
          },
        });
        await prisma.$executeRaw`
        UPDATE "Bike"
        SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
        WHERE id = ${bike.id}
      `;
        return bike;
      });
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }
}
