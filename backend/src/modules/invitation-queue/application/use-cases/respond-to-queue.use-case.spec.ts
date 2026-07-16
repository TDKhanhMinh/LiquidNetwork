import { RespondToQueueUseCase } from './respond-to-queue.use-case';
import { QueueAdvanceService } from '../services/queue-advance.service';
import { QueueStatus } from '../../domain/enums/queue-status.enum';
import { ParticipantStatus } from '../../domain/enums/participant-status.enum';
import { NotYourTurnError } from '../../domain/errors/queue.errors';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';

describe('RespondToQueueUseCase', () => {
  let useCase: RespondToQueueUseCase;
  let queueRepository: any;
  let persistence: any;
  const advanceService = new QueueAdvanceService();

  const activeQueue = {
    _id: 'q1',
    hostId: 'host-1',
    hostName: 'Host',
    status: QueueStatus.ACTIVE,
    timeoutSeconds: 60,
    currentIndex: 0,
    generation: 1,
    participants: [
      {
        userId: 'u1',
        name: 'One',
        order: 0,
        status: ParticipantStatus.ACTIVE,
      },
      {
        userId: 'u2',
        name: 'Two',
        order: 1,
        status: ParticipantStatus.PENDING,
      },
    ],
    expiresAt: new Date(Date.now() + 60_000),
  };

  beforeEach(() => {
    queueRepository = {
      findById: jest.fn().mockResolvedValue({ ...activeQueue }),
      replaceActiveState: jest.fn().mockImplementation(async (_id, _g, next) => ({
        ...activeQueue,
        ...next,
      })),
    };
    persistence = {
      applySideEffectsAfterTransition: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new RespondToQueueUseCase(
      queueRepository,
      advanceService,
      persistence,
    );
  });

  it('accepts and marks matched', async () => {
    const result = await useCase.execute({
      queueId: 'q1',
      actorUserId: 'u1',
      accept: true,
    });

    expect(result.status).toBe(QueueStatus.MATCHED);
    expect(persistence.applySideEffectsAfterTransition).toHaveBeenCalledWith(
      expect.anything(),
      { rethrowOnJobFailure: false },
    );
  });

  it('rejects when not current invitee', async () => {
    await expect(
      useCase.execute({
        queueId: 'q1',
        actorUserId: 'u2',
        accept: true,
      }),
    ).rejects.toBeInstanceOf(NotYourTurnError);
  });

  it('throws conflict when optimistic lock fails', async () => {
    queueRepository.replaceActiveState.mockResolvedValue(null);

    await expect(
      useCase.execute({
        queueId: 'q1',
        actorUserId: 'u1',
        accept: false,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns saved queue even when side effects fail (best-effort)', async () => {
    persistence.applySideEffectsAfterTransition.mockResolvedValue(undefined);

    const result = await useCase.execute({
      queueId: 'q1',
      actorUserId: 'u1',
      accept: true,
    });

    expect(result.status).toBe(QueueStatus.MATCHED);
  });
});
