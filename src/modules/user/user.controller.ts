import {
  Controller,
  Delete,
  Query,
  Request,
  UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { DeleteUserDto } from "./dto/delete-user.dto";
import { Request as ExpressRequest } from "express";
import { IJwtPayload } from "./interfaces/jwt-payload.interface";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Delete()
  deleteUser(@Query() dto: DeleteUserDto, @Request() req: ExpressRequest) {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedException();
    }
    return this.userService.deleteUser(dto, currentUser as IJwtPayload);
  }
}
