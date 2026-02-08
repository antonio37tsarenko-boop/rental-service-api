import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { IJwtPayload } from "../../modules/user/interfaces/jwt-payload.interface";

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException();
    }
    return user as IJwtPayload;
  },
);
