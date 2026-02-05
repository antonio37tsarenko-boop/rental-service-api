import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async set(key: string, value: number | string | object, ttl: number) {
    const stringifiedValue =
      typeof value == "object" ? JSON.stringify(value) : value;
    await this.redis.set(key, stringifiedValue, "EX", ttl);
    return;
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.redis.get(key);
    if (!result) return null;

    try {
      return result.startsWith("{") || result.startsWith("[")
        ? (JSON.parse(result) as T)
        : (result as T);
    } catch (e) {
      return result as T;
    }
  }

  async delete(key: string | string[]) {
    const keys = Array.isArray(key) ? key : [key];
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
