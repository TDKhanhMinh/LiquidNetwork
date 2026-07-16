import { HandleInviteTimeoutUseCase } from './handle-invite-timeout.use-case';
import { QueueAdvanceService } from '../services/queue-advance.service';
import { QueueStatus } from '../../domain/enums/queue-status.enum';
import { ParticipantStatus } from '../../domain/enums/participant-status.enum';

describe('HandleInviteTimeoutUseCase', () => {
  let useCase: HandleInviteTimeoutUseCase;
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
    expiresAt: new Date(Date.now() - 1000),
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
    useCase = new HandleInviteTimeoutUseCase(
      queueRepository,
      advanceService,
      persistence,
    );
  });

  it('advances queue on valid timeout generation', async () => {
    const result = await useCase.execute({ queueId: 'q1', generation: 1 });

    expect(result).not.toBeNull();
    expect(result!.currentIndex).toBe(1);
    expect(result!.generation).toBe(2);
    expect(persistence.applySideEffectsAfterTransition).toHaveBeenCalledWith(
      expect.anything(),
      { rethrowOnJobFailure: true },
    );
  });

  it('no-ops on stale generation', async () => {
    const result = await useCase.execute({ queueId: 'q1', generation: 99 });
    expect(result).toBeNull();
    expect(queueRepository.replaceActiveState).not.toHaveBeenCalled();
  });

  it('no-ops when race loses replace', async () => {
    queueRepository.replaceActiveState.mockResolvedValue(null);
    const result = await useCase.execute({ queueId: 'q1', generation: 1 });
    expect(result).toBeNull();
  });

  it('rethrows when job side-effects fail (BullMQ retry)', async () => {
    persistence.applySideEffectsAfterTransition.mockRejectedValue(
      new Error('redis down'),
    );

    await expect(
      useCase.execute({ queueId: 'q1', generation: 1 }),
    ).rejects.toThrow('redis down');
  });
});
