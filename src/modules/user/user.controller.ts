import {
  Controller,
  Delete,
  Query,
  Req,
  Request,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { DeleteUserDto } from "./dto/delete-user.dto";
import { Request as ExpressRequest } from "express";
import { IJwtPayload } from "./interfaces/jwt-payload.interface";
import { NO_USER_IN_REQ } from "./user.constants";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteUser(@Query() dto: DeleteUserDto, @Req() req: ExpressRequest) {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedException(NO_USER_IN_REQ);
    }
    return this.userService.deleteUser(dto, currentUser as IJwtPayload);
  }
}
