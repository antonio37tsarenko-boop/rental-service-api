import { Request } from "express";
import { IJwtPayload } from "../modules/user/interfaces/jwt-payload.interface";
import { UnauthorizedException } from "@nestjs/common";

export function getUserOrThrow(req: Request): IJwtPayload {
  console.log(req.user);
  const user = req.user;

  if (!user) {
    throw new UnauthorizedException();
  }
  console.log("user");
  return user as IJwtPayload;
}
