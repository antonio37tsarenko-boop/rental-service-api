import { Module } from "@nestjs/common";
import { BikesService } from "./bikes.service";
import { BikesController } from "./bikes.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  providers: [BikesService],
  controllers: [BikesController],
  exports: [BikesService],
  imports: [PrismaModule],
})
export class BikesModule {}
