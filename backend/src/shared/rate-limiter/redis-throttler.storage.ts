import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import Redis from 'ioredis';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const redisKey = `throttle:${key}:${throttlerName}`;
    const hits = await this.redis.incr(redisKey);
    
    if (hits === 1) {
      await this.redis.pexpire(redisKey, ttl);
    }

    const timeToExpire = await this.redis.pttl(redisKey);
    const isBlocked = hits > limit;

    return {
      totalHits: hits,
      timeToExpire: Math.ceil(timeToExpire / 1000),
      isBlocked,
      timeToBlockExpire: isBlocked ? Math.ceil(blockDuration / 1000) : 0,
    };
  }
}
