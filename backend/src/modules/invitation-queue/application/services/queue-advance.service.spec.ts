import { QueueAdvanceService } from './queue-advance.service';
import { QueueStatus } from '../../domain/enums/queue-status.enum';
import { ParticipantStatus } from '../../domain/enums/participant-status.enum';
import { InvitationStatus } from '../../domain/enums/invitation-status.enum';
import { IInvitationQueue } from '../../domain/entities/invitation-queue.entity';
import {
  ForbiddenQueueAccessError,
  NotYourTurnError,
} from '../../domain/errors/queue.errors';

describe('QueueAdvanceService', () => {
  let service: QueueAdvanceService;

  beforeEach(() => {
    service = new QueueAdvanceService();
  });

  function seedQueue(
    overrides: Partial<IInvitationQueue> = {},
  ): IInvitationQueue {
    const initial = service.buildInitialQueue({
      hostId: 'host-1',
      hostName: 'Host',
      timeoutSeconds: 60,
      participants: [
        { userId: 'u1', name: 'One' },
        { userId: 'u2', name: 'Two' },
        { userId: 'u3', name: 'Three' },
      ],
    });
    return {
      ...initial.queue,
      _id: 'q1',
      ...overrides,
    };
  }

  it('clamps timeout seconds', () => {
    expect(service.clampTimeoutSeconds(5)).toBe(15);
    expect(service.clampTimeoutSeconds(9999)).toBe(600);
    expect(service.clampTimeoutSeconds(90)).toBe(90);
  });

  it('builds initial active queue with first invitee active', () => {
    const result = service.buildInitialQueue({
      hostId: 'host-1',
      hostName: 'Host',
      timeoutSeconds: 60,
      participants: [
        { userId: 'u1', name: 'One' },
        { userId: 'u2', name: 'Two' },
      ],
    });

    expect(result.queue.status).toBe(QueueStatus.ACTIVE);
    expect(result.queue.currentIndex).toBe(0);
    expect(result.queue.generation).toBe(1);
    expect(result.queue.participants[0]!.status).toBe(ParticipantStatus.ACTIVE);
    expect(result.queue.participants[1]!.status).toBe(
      ParticipantStatus.PENDING,
    );
    expect(result.schedule?.generation).toBe(1);
    expect(result.invitationHints[0]!.status).toBe(InvitationStatus.PENDING);
  });

  it('accept stops queue as matched', () => {
    const queue = seedQueue();
    const result = service.applyRespond(queue, 'u1', true);

    expect(result.queue.status).toBe(QueueStatus.MATCHED);
    expect(result.queue.participants[0]!.status).toBe(
      ParticipantStatus.ACCEPTED,
    );
    expect(result.queue.participants[1]!.status).toBe(
      ParticipantStatus.PENDING,
    );
    expect(result.terminal).toBe(true);
    expect(result.schedule).toBeUndefined();
    expect(result.cancelGenerations).toContain(1);
  });

  it('reject advances to next invitee', () => {
    const queue = seedQueue();
    const result = service.applyRespond(queue, 'u1', false);

    expect(result.queue.status).toBe(QueueStatus.ACTIVE);
    expect(result.queue.currentIndex).toBe(1);
    expect(result.queue.generation).toBe(2);
    expect(result.queue.participants[0]!.status).toBe(
      ParticipantStatus.REJECTED,
    );
    expect(result.queue.participants[1]!.status).toBe(ParticipantStatus.ACTIVE);
    expect(result.schedule?.generation).toBe(2);
    expect(result.invitationHints.map((h) => h.status)).toEqual([
      InvitationStatus.REJECTED,
      InvitationStatus.PENDING,
    ]);
  });

  it('rejects respond when not your turn', () => {
    const queue = seedQueue();
    expect(() => service.applyRespond(queue, 'u2', true)).toThrow(
      NotYourTurnError,
    );
  });

  it('timeout advances and is idempotent for stale generation', () => {
    const queue = seedQueue();
    const advanced = service.applyTimeout(queue, 1);
    expect(advanced).not.toBeNull();
    expect(advanced!.queue.participants[0]!.status).toBe(
      ParticipantStatus.TIMEOUT,
    );
    expect(advanced!.queue.currentIndex).toBe(1);
    expect(advanced!.queue.generation).toBe(2);

    const stale = service.applyTimeout(queue, 99);
    expect(stale).toBeNull();
  });

  it('completes when last invitee rejects without any accept', () => {
    let queue = seedQueue();
    queue = service.applyRespond(queue, 'u1', false).queue;
    queue = service.applyRespond(queue, 'u2', false).queue;
    const last = service.applyRespond(queue, 'u3', false);

    expect(last.queue.status).toBe(QueueStatus.COMPLETED);
    expect(last.terminal).toBe(true);
  });

  it('cancel skips remaining and sets cancelled', () => {
    const queue = seedQueue();
    const result = service.applyCancel(queue, 'host-1');

    expect(result.queue.status).toBe(QueueStatus.CANCELLED);
    expect(
      result.queue.participants.every(
        (p) =>
          p.status === ParticipantStatus.SKIPPED ||
          p.status === ParticipantStatus.ACCEPTED,
      ),
    ).toBe(true);
    expect(result.terminal).toBe(true);
  });

  it('forbids non-host cancel', () => {
    const queue = seedQueue();
    expect(() => service.applyCancel(queue, 'other')).toThrow(
      ForbiddenQueueAccessError,
    );
  });
});
