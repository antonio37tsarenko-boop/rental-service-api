import { BikeStatuses, BikeType, BikeTypeNames } from "@prisma/client";
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateBikeDto {
  @IsNumber()
  typeId: number;

  @IsOptional()
  @IsString()
  batteryCharge?: number;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsEnum(BikeStatuses)
  status?: BikeStatuses;
}
