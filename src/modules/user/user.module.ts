import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { PrismaModule } from "../prisma/prisma.module";
import { UserController } from "./user.controller";
import { JwtModule } from "@nestjs/jwt";
import { HashModule } from "../hash/hash.module";

@Module({
  providers: [UserService],
  imports: [PrismaModule, HashModule],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
