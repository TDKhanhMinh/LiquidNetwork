import { GetReviewsForUserUseCase } from './get-reviews-for-user.use-case';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';

describe('GetReviewsForUserUseCase', () => {
  let useCase: GetReviewsForUserUseCase;
  let peerReviewRepository: any;
  let findUserByIdUseCase: any;

  const publicUser = {
    _id: 'user-a',
    privacySettings: { hideProfile: false, hideLevel: false },
  };

  beforeEach(() => {
    peerReviewRepository = {
      findAll: jest.fn().mockResolvedValue([{ rating: 5 }]),
    };
    findUserByIdUseCase = {
      execute: jest.fn(),
    };
    useCase = new GetReviewsForUserUseCase(
      peerReviewRepository,
      findUserByIdUseCase,
    );
  });

  it('lists reviews for owner even if hideProfile', async () => {
    findUserByIdUseCase.execute.mockResolvedValue({
      ...publicUser,
      privacySettings: { hideProfile: true, hideLevel: false },
    });

    const reviews = await useCase.execute('user-a', 'user-a');

    expect(reviews).toHaveLength(1);
    expect(peerReviewRepository.findAll).toHaveBeenCalledWith({
      revieweeId: 'user-a',
    });
  });

  it('throws when non-owner requests reviews of hidden profile', async () => {
    findUserByIdUseCase.execute.mockResolvedValue({
      ...publicUser,
      privacySettings: { hideProfile: true, hideLevel: false },
    });

    await expect(useCase.execute('user-a', 'user-b')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(peerReviewRepository.findAll).not.toHaveBeenCalled();
  });

  it('lists reviews for public profile non-owner', async () => {
    findUserByIdUseCase.execute.mockResolvedValue(publicUser);

    const reviews = await useCase.execute('user-a', 'user-b');

    expect(reviews).toEqual([{ rating: 5 }]);
  });
});
