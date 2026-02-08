import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { IJwtPayload } from "./interfaces/jwt-payload.interface";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { User } from "../../common/decorators/user.decorator";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteUser(
    @Query("userId") userId: string,
    @User() currentUser: IJwtPayload,
  ) {
    if (!userId) {
      throw new BadRequestException("userId query parameter is required.");
    }

    return this.userService.deleteUser(userId, currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("password")
  changePassword(
    @Body() dto: ChangePasswordDto,
    @User() currentUser: IJwtPayload,
  ) {
    return this.userService.changePassword(dto, currentUser);
  }
}
