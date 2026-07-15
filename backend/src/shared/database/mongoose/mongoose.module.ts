import { Logger, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule as NestMongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppConfig } from '../../config/configuration';

@Global()
@Module({
  imports: [
    NestMongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<AppConfig>) => {
        const logger = new Logger('MongooseModule');
        const uri = configService.get<string>('database.uri', { infer: true });
        const env = configService.get<string>('env', { infer: true });
        const isDevelopment = env === 'development';

        if (!uri) {
          logger.error('MONGODB_URI is not defined in the configuration!');
          throw new Error('MONGODB_URI is missing');
        }

        return {
          uri,
          // Các option tối ưu cho production
          retryWrites: true,
          w: 'majority',
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          
          // Các option chỉ bật trong môi trường dev
          autoCreate: isDevelopment,
          autoIndex: isDevelopment,

          // Xử lý connection events để log trạng thái
          connectionFactory: (connection: Connection) => {
            connection.on('connected', () => {
              logger.log('Thành công kết nối tới MongoDB');
            });

            connection.on('error', (error) => {
              logger.error(`Lỗi kết nối MongoDB: ${error.message}`, error.stack);
            });

            connection.on('disconnected', () => {
              logger.warn('Mất kết nối tới MongoDB');
            });

            // Nếu bạn cần cấu hình thêm plugin toàn cục thì có thể plugin tại đây
            // connection.plugin(require('mongoose-autopopulate'));

            return connection;
          },
        };
      },
    }),
  ],
  exports: [NestMongooseModule], // Export để các module khác có thể import trực tiếp `MongooseModule` cho việc sử dụng `forFeature` (không bắt buộc nhưng giúp code sạch)
})
export class MongooseModule {}
