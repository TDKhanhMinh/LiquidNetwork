import { CreatePeerReviewUseCase } from './create-peer-review.use-case';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';

describe('CreatePeerReviewUseCase', () => {
  let useCase: CreatePeerReviewUseCase;
  let peerReviewRepository: any;
  let userRepository: any;

  beforeEach(() => {
    peerReviewRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
      updateById: jest.fn(),
    };
    useCase = new CreatePeerReviewUseCase(
      peerReviewRepository,
      userRepository,
    );
  });

  it('rejects self-review', async () => {
    await expect(
      useCase.execute('user-a', {
        revieweeId: 'user-a',
        sessionId: 's1',
        rating: 5,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects when reviewee does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-a', {
        revieweeId: 'user-b',
        sessionId: 's1',
        rating: 5,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects duplicate review for same session', async () => {
    userRepository.findById.mockResolvedValue({ _id: 'user-b' });
    peerReviewRepository.findOne.mockResolvedValue({ _id: 'existing' });

    await expect(
      useCase.execute('user-a', {
        revieweeId: 'user-b',
        sessionId: 's1',
        rating: 4,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates review and updates average rating', async () => {
    userRepository.findById.mockResolvedValue({ _id: 'user-b' });
    peerReviewRepository.findOne.mockResolvedValue(null);
    peerReviewRepository.create.mockResolvedValue({
      _id: 'rev-1',
      rating: 5,
    });
    peerReviewRepository.findAll.mockResolvedValue([
      { rating: 5 },
      { rating: 3 },
    ]);
    userRepository.updateById.mockResolvedValue({});

    const result = await useCase.execute('user-a', {
      revieweeId: 'user-b',
      sessionId: 's1',
      rating: 5,
      comment: 'Nice',
    });

    expect(result.rating).toBe(5);
    expect(userRepository.updateById).toHaveBeenCalledWith('user-b', {
      averageRating: 4,
      totalReviews: 2,
    });
  });
});
