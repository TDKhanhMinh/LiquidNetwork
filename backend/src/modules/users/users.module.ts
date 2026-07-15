import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './infrastructure/schemas/user.schema';
import { PeerReview, PeerReviewSchema } from './infrastructure/schemas/peer-review.schema';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { PeerReviewRepository } from './infrastructure/repositories/peer-review.repository';

import { UsersService } from './application/services/users.service';
import { PeerReviewsService } from './application/services/peer-reviews.service';

import { UsersController } from './presentation/controllers/users.controller';
import { PeerReviewsController } from './presentation/controllers/peer-reviews.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: PeerReview.name, schema: PeerReviewSchema },
    ]),
  ],
  controllers: [UsersController, PeerReviewsController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IPeerReviewRepository',
      useClass: PeerReviewRepository,
    },
    UsersService,
    PeerReviewsService,
  ],
  exports: [
    UsersService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
})
export class UsersModule {}
