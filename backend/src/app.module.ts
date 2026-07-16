import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AppConfigModule } from './shared/config/app-config.module';
import { MongooseModule } from './shared/database/mongoose/mongoose.module';
import { QueueModule } from './shared/queue/queue.module';
import { RateLimiterModule } from './shared/rate-limiter/throttler.module';
import { ResponseInterceptor } from './shared/common/interceptors/response.interceptor';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { InvitationQueueModule } from './modules/invitation-queue/invitation-queue.module';

@Module({
  imports: [
    // Global Shared Modules
    AppConfigModule,
    MongooseModule,
    QueueModule,
    RateLimiterModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    InvitationQueueModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
