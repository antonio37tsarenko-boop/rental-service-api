import { PrismaClient } from "@prisma/client";
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TransactionHost } from "@nestjs-cls/transactional";
import { TransactionalAdapterPrisma } from "@nestjs-cls/transactional-adapter-prisma";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  logger: Logger = new Logger("PrismaService");
  constructor(configService: ConfigService) {
    const url = configService.getOrThrow<string>("DATABASE_URL");

    if (url) {
      process.env.DATABASE_URL = url;
    }

    super({
      datasourceUrl: url,
    } as any);
  }
  onApplicationShutdown(signal?: string) {
    this.logger.log(`Signal ${signal} received, disconnecting database.`);
    this.$disconnect();
  }

  async onModuleInit() {
    await this.$connect();
  }
}
