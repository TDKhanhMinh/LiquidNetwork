import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import Redis from 'ioredis';

import { AppConfig } from '../config/configuration';
import { CustomThrottlerGuard } from './custom-throttler.guard';
import { RedisThrottlerStorage } from './redis-throttler.storage';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const redisConfig = configService.get('redis', { infer: true })!;
        
        // Tạo connection Redis riêng cho Rate Limiter
        const redis = new Redis({
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
        });

        const throttlerConfig = configService.get('throttler', { infer: true })!;

        return {
          throttlers: [
            {
              limit: throttlerConfig.limit,
              ttl: throttlerConfig.ttl * 1000, // Chuyển đổi từ giây sang milliseconds (bắt buộc trong v5+)
            },
          ],
          storage: new RedisThrottlerStorage(redis),
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class RateLimiterModule {}
