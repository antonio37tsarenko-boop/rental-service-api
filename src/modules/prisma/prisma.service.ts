import { PrismaClient } from "generated/prisma";
import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from "@nestjs/common";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  logger: Logger = new Logger("PrismaService");
  onApplicationShutdown(signal?: string) {
    this.logger.log(`Signal ${signal} received, disconnecting database.`);
    this.$disconnect();
  }

  onModuleInit() {
    this.$connect();
  }
}
