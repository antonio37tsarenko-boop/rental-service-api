import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { CreateBikeDto } from "./dto/create-bike.dto";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { getUserOrThrow } from "../../utils/get-user-or-throw.util";
import { Request } from "express";
import { BikesService } from "./bikes.service";
import { IJwtPayload } from "../user/interfaces/jwt-payload.interface";
import { User } from "../../common/decorators/user.decorator";

@Controller("bikes")
export class BikesController {
  constructor(private readonly bikesService: BikesService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  async createBike(
    @Body() dto: CreateBikeDto,
    @Req() req: Request,
    @User() currentUser: IJwtPayload,
  ) {
    return await this.bikesService.createBike(dto, currentUser);
  }
}
