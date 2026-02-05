import { PrismaClient } from "@prisma/client";
import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  logger: Logger = new Logger("PrismaService");

  constructor(configService: ConfigService) {
    const url = configService.get<string>("DATABASE_URL");

    // Прямо перед вызовом super принудительно ставим переменную в окружение
    if (url) {
      process.env.DATABASE_URL = url;
    }

    // Вызываем пустой супер, теперь он УВИДИТ DATABASE_URL в process.env
    console.log("--- DEBUG: DATABASE_URL is:", url);

    super({
      datasourceUrl: url,
    } as any);
  }
  onApplicationShutdown(signal?: string) {
    this.logger.log(`Signal ${signal} received, disconnecting database.`);
    this.$disconnect();
  }

  onModuleInit() {
    this.$connect();
  }
}
