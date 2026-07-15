import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';


import { AppConfigModule } from './shared/config/app-config.module';

import { MongooseModule } from './shared/database/mongoose/mongoose.module';

import { QueueModule } from './shared/queue/queue.module';

import { RateLimiterModule } from './shared/rate-limiter/throttler.module';

// Feature modules (sẽ thêm sau)
import { AuthModule } from './modules/auth/auth.module';
// import { DrinkingSessionsModule } from './modules/drinking-sessions/drinking-sessions.module';

@Module({
  imports: [
    // Global Shared Modules
    AppConfigModule,
    MongooseModule,
    QueueModule,
    RateLimiterModule,

    // Feature Modules
    AuthModule,
    // DrinkingSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
