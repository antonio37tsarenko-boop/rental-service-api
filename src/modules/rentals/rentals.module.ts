import { Module } from "@nestjs/common";
import { RentalsService } from "./rentals.service";
import { RentalsController } from "./rentals.controller";
import { UserModule } from "../user/user.module";
import { PrismaModule } from "../prisma/prisma.module";
import { BalanceModule } from "../balance/balance.module";
import { BikesService } from "../bikes/bikes.service";
import { BikesModule } from "../bikes/bikes.module";

@Module({
  providers: [RentalsService],
  controllers: [RentalsController],
  imports: [UserModule, PrismaModule, BalanceModule, BikesModule],
})
export class RentalsModule {}
