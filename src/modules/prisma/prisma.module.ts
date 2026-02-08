import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { ClsModule } from "nestjs-cls";

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  imports: [ClsModule.forFeature()],
})
export class PrismaModule {}
