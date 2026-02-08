import { IsString } from "class-validator";

export class StartBikeRentalDto {
  @IsString()
  bikeId: string;
}
