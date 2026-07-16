import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { UsersModule } from '../users/users.module';

import {
  InvitationQueue,
  InvitationQueueSchema,
} from './infrastructure/persistence/schemas/invitation-queue.schema';
import {
  Invitation,
  InvitationSchema,
} from './infrastructure/persistence/schemas/invitation.schema';
import { InvitationQueueMongooseRepository } from './infrastructure/persistence/repositories/invitation-queue.mongoose.repository';
import { InvitationMongooseRepository } from './infrastructure/persistence/repositories/invitation.mongoose.repository';
import { InvitationTimeoutScheduler } from './infrastructure/jobs/invitation-timeout.scheduler';
import { InvitationTimeoutProcessor } from './infrastructure/jobs/invitation-timeout.processor';
import { INVITATION_TIMEOUT_QUEUE } from './infrastructure/jobs/invitation-timeout.constants';
import { NoopInvitationNotifier } from './infrastructure/services/noop-invitation.notifier';

import { QueueAdvanceService } from './application/services/queue-advance.service';
import { QueuePersistenceHelper } from './application/services/queue-persistence.helper';
import { CreateQueueUseCase } from './application/use-cases/create-queue.use-case';
import { GetMyActiveQueueUseCase } from './application/use-cases/get-my-active-queue.use-case';
import { GetQueueByIdUseCase } from './application/use-cases/get-queue-by-id.use-case';
import { RespondToQueueUseCase } from './application/use-cases/respond-to-queue.use-case';
import { CancelQueueUseCase } from './application/use-cases/cancel-queue.use-case';
import { HandleInviteTimeoutUseCase } from './application/use-cases/handle-invite-timeout.use-case';
import { GetQueueHistoryUseCase } from './application/use-cases/get-queue-history.use-case';
import { GetInvitationByIdUseCase } from './application/use-cases/get-invitation-by-id.use-case';
import { SearchCandidatesUseCase } from './application/use-cases/search-candidates.use-case';
import { ListCandidateSuggestionsUseCase } from './application/use-cases/list-candidate-suggestions.use-case';

import { InvitationQueueController } from './presentation/http/invitation-queue.controller';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: InvitationQueue.name, schema: InvitationQueueSchema },
      { name: Invitation.name, schema: InvitationSchema },
    ]),
    BullModule.registerQueue({ name: INVITATION_TIMEOUT_QUEUE }),
  ],
  controllers: [InvitationQueueController],
  providers: [
    {
      provide: 'IInvitationQueueRepository',
      useClass: InvitationQueueMongooseRepository,
    },
    {
      provide: 'IInvitationRepository',
      useClass: InvitationMongooseRepository,
    },
    {
      provide: 'IInvitationTimeoutScheduler',
      useClass: InvitationTimeoutScheduler,
    },
    {
      provide: 'IInvitationNotifier',
      useClass: NoopInvitationNotifier,
    },
    QueueAdvanceService,
    QueuePersistenceHelper,
    CreateQueueUseCase,
    GetMyActiveQueueUseCase,
    GetQueueByIdUseCase,
    RespondToQueueUseCase,
    CancelQueueUseCase,
    HandleInviteTimeoutUseCase,
    GetQueueHistoryUseCase,
    GetInvitationByIdUseCase,
    SearchCandidatesUseCase,
    ListCandidateSuggestionsUseCase,
    InvitationTimeoutProcessor,
  ],
  exports: [
    CreateQueueUseCase,
    GetQueueByIdUseCase,
    HandleInviteTimeoutUseCase,
    'IInvitationQueueRepository',
  ],
})
export class InvitationQueueModule {}
