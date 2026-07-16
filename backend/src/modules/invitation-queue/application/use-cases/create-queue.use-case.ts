import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.interface';
import type { IInvitationQueueRepository } from '../../domain/repositories/invitation-queue.repository.interface';
import { CreateQueueCommand } from '../dto/create-queue.command';
import { QueueAdvanceService } from '../services/queue-advance.service';
import { QueuePersistenceHelper } from '../services/queue-persistence.helper';
import { IInvitationQueue } from '../../domain/entities/invitation-queue.entity';
import { BadRequestException } from '../../../../shared/common/exceptions/bad-request.exception';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';
import { QueueException } from '../../../../shared/common/exceptions/queue.exception';
import { IUser } from '../../../users/domain/interfaces/user.interface';
import { MAX_QUEUE_INVITEES } from '../../domain/constants/queue.constants';

@Injectable()
export class CreateQueueUseCase {
  private readonly logger = new Logger(CreateQueueUseCase.name);

  constructor(
    @Inject('IInvitationQueueRepository')
    private readonly queueRepository: IInvitationQueueRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly advanceService: QueueAdvanceService,
    private readonly persistence: QueuePersistenceHelper,
  ) {}

  async execute(command: CreateQueueCommand): Promise<IInvitationQueue> {
    const inviteeIds = [...new Set(command.inviteeIds.map(String))];

    if (inviteeIds.length === 0) {
      throw new BadRequestException(
        'At least one invitee is required',
        'INVALID_INVITEES',
      );
    }

    if (inviteeIds.length > MAX_QUEUE_INVITEES) {
      throw new BadRequestException(
        `At most ${MAX_QUEUE_INVITEES} invitees allowed`,
        'INVALID_INVITEES',
      );
    }

    if (inviteeIds.includes(command.hostId)) {
      throw new BadRequestException(
        'Host cannot invite themselves',
        'INVALID_INVITEES',
      );
    }

    const existing = await this.queueRepository.findActiveByHostId(
      command.hostId,
    );
    if (existing) {
      throw new ConflictException(
        'You already have an active invitation queue',
        'ALREADY_HAS_ACTIVE_QUEUE',
      );
    }

    const host = await this.userRepository.findById(command.hostId as any);
    if (!host || host.isDeleted) {
      throw new NotFoundException('Host user not found', 'USER_NOT_FOUND');
    }

    const found = await this.userRepository.findByIds(inviteeIds);
    const byId = new Map(
      found.map((u) => [String((u as any)._id), u] as const),
    );

    const invitees: IUser[] = [];
    for (const id of inviteeIds) {
      const user = byId.get(id);
      if (!user || user.isDeleted) {
        throw new BadRequestException(
          `Invitee not found: ${id}`,
          'INVALID_INVITEES',
        );
      }
      if (user.privacySettings?.hideProfile) {
        throw new BadRequestException(
          `Invitee not available: ${id}`,
          'INVALID_INVITEES',
        );
      }
      invitees.push(user);
    }

    const transition = this.advanceService.buildInitialQueue({
      hostId: command.hostId,
      hostName: host.name,
      hostAvatar: host.avatar,
      title: command.title,
      message: command.message,
      timeoutSeconds: command.timeoutSeconds,
      participants: invitees.map((u) => ({
        userId: String((u as any)._id),
        name: u.name,
        avatar: u.avatar,
        alcoholToleranceLevel: u.privacySettings?.hideLevel
          ? undefined
          : u.alcoholToleranceLevel,
        occupation: u.drunkProfile?.occupation,
      })),
    });

    let created: IInvitationQueue;
    try {
      created = await this.queueRepository.create(transition.queue);
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException(
          'You already have an active invitation queue',
          'ALREADY_HAS_ACTIVE_QUEUE',
        );
      }
      throw err;
    }

    const withId: IInvitationQueue = {
      ...transition.queue,
      ...created,
      _id: created._id,
    };

    const result = {
      ...transition,
      queue: withId,
    };

    const queueId = String(withId._id);
    const generation = withId.generation;

    try {
      // Critical path: invitations + BullMQ timeout must both succeed
      await this.persistence.applyInvitationHints(
        withId,
        transition.invitationHints,
      );
      await this.persistence.applyTimeoutJobs(result);
    } catch (err) {
      this.logger.error(
        `Create queue post-persist failed queue=${queueId}: ${String(err)}`,
      );
      await this.persistence.compensateFailedCreate(queueId, generation);
      throw new QueueException(
        'Failed to start invitation queue (timeout schedule or invitations). Please retry.',
        'QUEUE_CREATE_FAILED',
        { queueId },
      );
    }

    // Best-effort notify — must not roll back a healthy queue
    await this.persistence.notifyTransition(result);

    return withId;
  }
}
