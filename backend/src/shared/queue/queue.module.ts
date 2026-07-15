import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppConfig } from '../config/configuration';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<AppConfig>) => {
        const host = configService.get<string>('redis.host', { infer: true }) || 'localhost';
        const port = configService.get<number>('redis.port', { infer: true }) || 6379;
        const password = configService.get<string>('redis.password', { infer: true });

        return {
          connection: {
            host,
            port,
            password,
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
