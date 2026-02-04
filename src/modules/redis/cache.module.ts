import { Module } from "@nestjs/common";
import { CacheService } from "./cache.service";
import { RedisModule as IoredisModule } from "@nestjs-modules/ioredis";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    IoredisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "single",
        url: configService.getOrThrow("REDIS_URL"),
      }),
      inject: [ConfigModule],
    }),
    ConfigModule,
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
