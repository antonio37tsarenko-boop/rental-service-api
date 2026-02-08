import { Body, Controller, Patch, Post, UseGuards } from "@nestjs/common";
import { CreateBikeDto } from "./dto/create-bike.dto";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { BikesService } from "./bikes.service";
import { IJwtPayload } from "../user/interfaces/jwt-payload.interface";
import { User } from "../../common/decorators/user.decorator";
import { ChangeBikeStatusDto } from "./dto/change-bike-status.dto";

@Controller("bikes")
export class BikesController {
  constructor(private readonly bikesService: BikesService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  async createBike(
    @Body() dto: CreateBikeDto,
    @User() currentUser: IJwtPayload,
  ) {
    return await this.bikesService.createBike(dto, currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("status")
  async changeBikeStatus(
    @Body() dto: ChangeBikeStatusDto,
    @User() currentUser: IJwtPayload,
  ) {
    return this.bikesService.changeBikeStatus(dto, currentUser);
  }
}
