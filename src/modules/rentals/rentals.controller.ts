import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { StartBikeRentalDto } from "./dto/start-bike-rental.dto";
import { RentalsService } from "./rentals.service";
import { Request } from "express";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { User } from "../../common/decorators/user.decorator";
import { IJwtPayload } from "../user/interfaces/jwt-payload.interface";

@Controller("rentals")
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async startBikeRental(
    @Body() dto: StartBikeRentalDto,
    @User() currentUser: IJwtPayload,
  ) {
    return await this.rentalsService.startBikeRental(dto, currentUser);
  }
}
