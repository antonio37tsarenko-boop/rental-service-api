import { IsEnum, IsString } from "class-validator";
import { BikeStatuses } from "@prisma/client";

export class ChangeBikeStatusDto {
  @IsString()
  bikeId: string;
  @IsEnum(BikeStatuses)
  bikeStatus: BikeStatuses;
}
