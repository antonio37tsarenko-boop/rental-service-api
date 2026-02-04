import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

@Injectable()
export class CacheService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async setOtp(email: string, otp: number) {
    await this.redis.set(`otp:${email.trim()}`, otp, "EX", 600);
  }

  async set(key: string, value: number | string | Buffer) {
    await this.redis.set(key, value, "EX", 600);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async getOtp(email: string) {
    return this.redis.get(`otp:${email.trim()}`);
  }
}
