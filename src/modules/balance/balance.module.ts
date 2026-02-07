import { Module } from "@nestjs/common";
import { BalanceService } from "./balance.service";
import { BalanceController } from "./balance.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { UserModule } from "../user/user.module";

@Module({
  providers: [BalanceService],
  controllers: [BalanceController],
  exports: [BalanceService],
  imports: [PrismaModule, UserModule],
})
export class BalanceModule {}
