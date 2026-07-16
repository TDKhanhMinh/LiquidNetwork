import { CreateQueueUseCase } from './create-queue.use-case';
import { QueueAdvanceService } from '../services/queue-advance.service';
import { QueueException } from '../../../../shared/common/exceptions/queue.exception';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';
import { BadRequestException } from '../../../../shared/common/exceptions/bad-request.exception';

describe('CreateQueueUseCase', () => {
  let useCase: CreateQueueUseCase;
  let queueRepository: any;
  let userRepository: any;
  let persistence: any;
  const advanceService = new QueueAdvanceService();

  const host = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Host',
    avatar: undefined,
    isDeleted: false,
    privacySettings: { hideProfile: false, hideLevel: false },
    drunkProfile: {},
    alcoholToleranceLevel: 'LEVEL_1',
  };

  const invitee = {
    _id: '507f1f77bcf86cd799439012',
    name: 'Invitee',
    isDeleted: false,
    privacySettings: { hideProfile: false, hideLevel: false },
    drunkProfile: { occupation: 'Dev' },
    alcoholToleranceLevel: 'LEVEL_2',
  };

  beforeEach(() => {
    queueRepository = {
      findActiveByHostId: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(async (data) => ({
        ...data,
        _id: '507f1f77bcf86cd799439099',
      })),
      deleteById: jest.fn(),
    };
    userRepository = {
      findById: jest.fn().mockImplementation(async (id: string) => {
        if (String(id) === host._id) return host;
        return null;
      }),
      findByIds: jest.fn().mockImplementation(async (ids: string[]) => {
        return ids
          .map((id) => {
            if (id === invitee._id) return invitee;
            if (id === host._id) return host;
            return null;
          })
          .filter(Boolean);
      }),
    };
    persistence = {
      applyInvitationHints: jest.fn().mockResolvedValue(undefined),
      applyTimeoutJobs: jest.fn().mockResolvedValue(undefined),
      notifyTransition: jest.fn().mockResolvedValue(undefined),
      compensateFailedCreate: jest.fn().mockResolvedValue(undefined),
    };

    useCase = new CreateQueueUseCase(
      queueRepository,
      userRepository,
      advanceService,
      persistence,
    );
  });

  it('creates queue and schedules timeout', async () => {
    const result = await useCase.execute({
      hostId: host._id,
      timeoutSeconds: 60,
      inviteeIds: [invitee._id],
    });

    expect(String(result._id)).toBe('507f1f77bcf86cd799439099');
    expect(userRepository.findByIds).toHaveBeenCalledWith([invitee._id]);
    expect(persistence.applyInvitationHints).toHaveBeenCalled();
    expect(persistence.applyTimeoutJobs).toHaveBeenCalled();
    expect(persistence.notifyTransition).toHaveBeenCalled();
    expect(persistence.compensateFailedCreate).not.toHaveBeenCalled();
  });

  it('compensates and throws QUEUE_CREATE_FAILED when schedule fails', async () => {
    persistence.applyTimeoutJobs.mockRejectedValue(new Error('redis down'));

    await expect(
      useCase.execute({
        hostId: host._id,
        timeoutSeconds: 60,
        inviteeIds: [invitee._id],
      }),
    ).rejects.toBeInstanceOf(QueueException);

    expect(persistence.compensateFailedCreate).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439099',
      1,
    );
  });

  it('compensates when invitation write fails', async () => {
    persistence.applyInvitationHints.mockRejectedValue(new Error('mongo'));

    await expect(
      useCase.execute({
        hostId: host._id,
        timeoutSeconds: 60,
        inviteeIds: [invitee._id],
      }),
    ).rejects.toMatchObject({ code: 'QUEUE_CREATE_FAILED' });

    expect(persistence.applyTimeoutJobs).not.toHaveBeenCalled();
    expect(persistence.compensateFailedCreate).toHaveBeenCalled();
  });

  it('rejects when host already has active queue', async () => {
    queueRepository.findActiveByHostId.mockResolvedValue({ _id: 'existing' });

    await expect(
      useCase.execute({
        hostId: host._id,
        timeoutSeconds: 60,
        inviteeIds: [invitee._id],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects self-invite', async () => {
    await expect(
      useCase.execute({
        hostId: host._id,
        timeoutSeconds: 60,
        inviteeIds: [host._id],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects missing invitee from batch load', async () => {
    userRepository.findByIds.mockResolvedValue([]);

    await expect(
      useCase.execute({
        hostId: host._id,
        timeoutSeconds: 60,
        inviteeIds: [invitee._id],
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INVITEES' });
  });

  it('keeps queue when only notify path is best-effort (no compensate)', async () => {
    const result = await useCase.execute({
      hostId: host._id,
      timeoutSeconds: 60,
      inviteeIds: [invitee._id],
    });

    expect(result._id).toBeDefined();
    expect(persistence.notifyTransition).toHaveBeenCalled();
    expect(persistence.compensateFailedCreate).not.toHaveBeenCalled();
  });
});
