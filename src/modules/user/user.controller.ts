import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Patch,
  Query,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Request as ExpressRequest } from "express";
import { IJwtPayload } from "./interfaces/jwt-payload.interface";
import { NO_USER_IN_REQ } from "./user.constants";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteUser(@Query("userId") userId: string, @Req() req: ExpressRequest) {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedException(NO_USER_IN_REQ);
    }
    if (!userId) {
      throw new BadRequestException("userId query parameter is required.");
    }

    return this.userService.deleteUser(userId, currentUser as IJwtPayload);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("password")
  changePassword(@Body() dto: ChangePasswordDto, @Req() req: ExpressRequest) {
    const currentUser: IJwtPayload = req.user as IJwtPayload;
    return this.userService.changePassword(dto, currentUser);
  }
}
