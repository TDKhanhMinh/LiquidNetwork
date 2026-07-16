import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './infrastructure/persistence/schemas/user.schema';
import {
  PeerReview,
  PeerReviewSchema,
} from './infrastructure/persistence/schemas/peer-review.schema';
import { UserRepository } from './infrastructure/persistence/repositories/user.repository';
import { PeerReviewRepository } from './infrastructure/persistence/repositories/peer-review.repository';

import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateBasicInfoUseCase } from './application/use-cases/update-basic-info.use-case';
import { UpdateDrunkProfileUseCase } from './application/use-cases/update-drunk-profile.use-case';
import { UpdatePrivacySettingsUseCase } from './application/use-cases/update-privacy-settings.use-case';
import { UpdateToleranceLevelUseCase } from './application/use-cases/update-tolerance-level.use-case';
import { CreatePeerReviewUseCase } from './application/use-cases/create-peer-review.use-case';
import { GetReviewsForUserUseCase } from './application/use-cases/get-reviews-for-user.use-case';

import { UsersController } from './presentation/http/users.controller';
import { PeerReviewsController } from './presentation/http/peer-reviews.controller';

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
    CreateUserUseCase,
    FindUserByIdUseCase,
    GetUserProfileUseCase,
    UpdateBasicInfoUseCase,
    UpdateDrunkProfileUseCase,
    UpdatePrivacySettingsUseCase,
    UpdateToleranceLevelUseCase,
    CreatePeerReviewUseCase,
    GetReviewsForUserUseCase,
  ],
  exports: ['IUserRepository', CreateUserUseCase],
})
export class UsersModule {}
