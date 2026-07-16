import { Injectable } from '@nestjs/common';
import { IInvitationQueue } from '../../domain/entities/invitation-queue.entity';
import { IQueueParticipant } from '../../domain/entities/queue-participant.entity';
import { QueueStatus } from '../../domain/enums/queue-status.enum';
import { ParticipantStatus } from '../../domain/enums/participant-status.enum';
import { InvitationStatus } from '../../domain/enums/invitation-status.enum';
import {
  ForbiddenQueueAccessError,
  NotYourTurnError,
  QueueNotActiveError,
} from '../../domain/errors/queue.errors';

export interface InvitationUpsertHint {
  toUserId: string;
  toUserName: string;
  toUserAvatar?: string;
  participantOrder: number;
  status: InvitationStatus;
  expiresAt: Date | null;
  respondedAt: Date | null;
}

export interface QueueTransitionResult {
  queue: IInvitationQueue;
  invitationHints: InvitationUpsertHint[];
  /** Cancel timeout jobs for these generations */
  cancelGenerations: number[];
  /** Schedule timeout for new head, if any */
  schedule?: { generation: number; delayMs: number };
  terminal: boolean;
}

function cloneParticipants(
  participants: IQueueParticipant[],
): IQueueParticipant[] {
  return participants.map((p) => ({ ...p }));
}

function now(): Date {
  return new Date();
}

@Injectable()
export class QueueAdvanceService {
  clampTimeoutSeconds(value: number | undefined): number {
    const n = Number.isFinite(value) ? Number(value) : 60;
    return Math.min(600, Math.max(15, Math.round(n) || 60));
  }

  buildInitialQueue(input: {
    hostId: string;
    hostName: string;
    hostAvatar?: string;
    title?: string;
    message?: string;
    timeoutSeconds: number;
    participants: Omit<
      IQueueParticipant,
      'status' | 'order' | 'invitedAt' | 'respondedAt'
    >[];
  }): QueueTransitionResult {
    const timeoutSeconds = this.clampTimeoutSeconds(input.timeoutSeconds);
    const invitedAt = now();
    const expiresAt = new Date(invitedAt.getTime() + timeoutSeconds * 1000);
    const generation = 1;

    const participants: IQueueParticipant[] = input.participants.map(
      (p, order) => ({
        userId: p.userId,
        name: p.name,
        avatar: p.avatar,
        alcoholToleranceLevel: p.alcoholToleranceLevel,
        occupation: p.occupation,
        order,
        status:
          order === 0 ? ParticipantStatus.ACTIVE : ParticipantStatus.PENDING,
        invitedAt: order === 0 ? invitedAt : null,
        respondedAt: null,
      }),
    );

    const first = participants[0]!;
    const queue: IInvitationQueue = {
      hostId: input.hostId,
      hostName: input.hostName,
      hostAvatar: input.hostAvatar,
      title: input.title?.trim() || `Mời nhậu · ${input.hostName}`,
      message: input.message?.trim() || '',
      status: QueueStatus.ACTIVE,
      timeoutSeconds,
      currentIndex: 0,
      participants,
      expiresAt,
      generation,
      sessionId: null,
      completedAt: null,
    };

    return {
      queue,
      invitationHints: [
        {
          toUserId: first.userId,
          toUserName: first.name,
          toUserAvatar: first.avatar,
          participantOrder: 0,
          status: InvitationStatus.PENDING,
          expiresAt,
          respondedAt: null,
        },
      ],
      cancelGenerations: [],
      schedule: { generation, delayMs: timeoutSeconds * 1000 },
      terminal: false,
    };
  }

  applyRespond(
    queue: IInvitationQueue,
    actorUserId: string,
    accept: boolean,
  ): QueueTransitionResult {
    if (queue.status !== QueueStatus.ACTIVE) {
      throw new QueueNotActiveError();
    }

    const current = queue.participants[queue.currentIndex];
    if (
      !current ||
      current.userId !== actorUserId ||
      current.status !== ParticipantStatus.ACTIVE
    ) {
      throw new NotYourTurnError();
    }

    const participants = cloneParticipants(queue.participants);
    const respondedAt = now();
    participants[queue.currentIndex] = {
      ...participants[queue.currentIndex]!,
      status: accept
        ? ParticipantStatus.ACCEPTED
        : ParticipantStatus.REJECTED,
      respondedAt,
    };

    const base: IInvitationQueue = {
      ...queue,
      participants,
      updatedAt: respondedAt,
    };

    const invitationHints: InvitationUpsertHint[] = [
      {
        toUserId: current.userId,
        toUserName: current.name,
        toUserAvatar: current.avatar,
        participantOrder: current.order,
        status: accept
          ? InvitationStatus.ACCEPTED
          : InvitationStatus.REJECTED,
        expiresAt: null,
        respondedAt,
      },
    ];

    if (accept) {
      return {
        queue: {
          ...base,
          status: QueueStatus.MATCHED,
          expiresAt: null,
          completedAt: respondedAt,
        },
        invitationHints,
        cancelGenerations: [queue.generation],
        terminal: true,
      };
    }

    const advanced = this.advanceFrom(base, invitationHints);
    advanced.cancelGenerations = [
      queue.generation,
      ...advanced.cancelGenerations,
    ];
    return advanced;
  }

  applyTimeout(
    queue: IInvitationQueue,
    expectedGeneration: number,
  ): QueueTransitionResult | null {
    if (
      queue.status !== QueueStatus.ACTIVE ||
      queue.generation !== expectedGeneration
    ) {
      return null;
    }

    const current = queue.participants[queue.currentIndex];
    if (!current || current.status !== ParticipantStatus.ACTIVE) {
      return null;
    }

    const participants = cloneParticipants(queue.participants);
    const respondedAt = now();
    participants[queue.currentIndex] = {
      ...participants[queue.currentIndex]!,
      status: ParticipantStatus.TIMEOUT,
      respondedAt,
    };

    const base: IInvitationQueue = {
      ...queue,
      participants,
      updatedAt: respondedAt,
    };

    const invitationHints: InvitationUpsertHint[] = [
      {
        toUserId: current.userId,
        toUserName: current.name,
        toUserAvatar: current.avatar,
        participantOrder: current.order,
        status: InvitationStatus.TIMEOUT,
        expiresAt: null,
        respondedAt,
      },
    ];

    const advanced = this.advanceFrom(base, invitationHints);
    advanced.cancelGenerations = [
      queue.generation,
      ...advanced.cancelGenerations,
    ];
    return advanced;
  }

  applyCancel(queue: IInvitationQueue, hostId: string): QueueTransitionResult {
    if (queue.hostId !== hostId) {
      throw new ForbiddenQueueAccessError(
        'Only the host can cancel this queue',
      );
    }
    if (queue.status !== QueueStatus.ACTIVE) {
      throw new QueueNotActiveError();
    }

    const completedAt = now();
    const participants = cloneParticipants(queue.participants).map((p) =>
      p.status === ParticipantStatus.PENDING ||
      p.status === ParticipantStatus.ACTIVE
        ? { ...p, status: ParticipantStatus.SKIPPED, respondedAt: completedAt }
        : p,
    );

    return {
      queue: {
        ...queue,
        status: QueueStatus.CANCELLED,
        participants,
        expiresAt: null,
        completedAt,
        updatedAt: completedAt,
      },
      invitationHints: [],
      cancelGenerations: [queue.generation],
      terminal: true,
    };
  }

  private advanceFrom(
    queue: IInvitationQueue,
    invitationHints: InvitationUpsertHint[],
  ): QueueTransitionResult {
    const nextIndex = queue.participants.findIndex(
      (p, i) =>
        i > queue.currentIndex && p.status === ParticipantStatus.PENDING,
    );

    if (nextIndex === -1) {
      const anyAccepted = queue.participants.some(
        (p) => p.status === ParticipantStatus.ACCEPTED,
      );
      const completedAt = now();
      return {
        queue: {
          ...queue,
          status: anyAccepted ? QueueStatus.MATCHED : QueueStatus.COMPLETED,
          expiresAt: null,
          completedAt,
          updatedAt: completedAt,
        },
        invitationHints,
        cancelGenerations: [],
        terminal: true,
      };
    }

    const invitedAt = now();
    const expiresAt = new Date(
      invitedAt.getTime() + queue.timeoutSeconds * 1000,
    );
    const generation = queue.generation + 1;
    const participants = cloneParticipants(queue.participants);
    participants[nextIndex] = {
      ...participants[nextIndex]!,
      status: ParticipantStatus.ACTIVE,
      invitedAt,
    };

    const active = participants[nextIndex]!;
    invitationHints.push({
      toUserId: active.userId,
      toUserName: active.name,
      toUserAvatar: active.avatar,
      participantOrder: active.order,
      status: InvitationStatus.PENDING,
      expiresAt,
      respondedAt: null,
    });

    return {
      queue: {
        ...queue,
        status: QueueStatus.ACTIVE,
        currentIndex: nextIndex,
        participants,
        expiresAt,
        generation,
        updatedAt: invitedAt,
      },
      invitationHints,
      cancelGenerations: [],
      schedule: {
        generation,
        delayMs: queue.timeoutSeconds * 1000,
      },
      terminal: false,
    };
  }
}
