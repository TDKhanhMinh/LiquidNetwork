import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { validate } from './env.validation';

/**
 * AppConfigModule
 * Module toàn cục (Global) quản lý cấu hình cho toàn ứng dụng.
 * Được thiết lập để validate cấu hình khi ứng dụng khởi động và load các cấu hình mặc định.
 */
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Cho phép ConfigService sử dụng global ở bất kì module nào mà không cần import lại
      load: [configuration], // Load cấu hình từ file configuration.ts
      validate, // Validation function từ class-validator
      // envFilePath: ['.env'], // Mặc định nestjs config sẽ đọc .env file, có thể tuỳ chỉnh ở đây
    }),
  ],
})
export class AppConfigModule {}
