import { UpdateBasicInfoUseCase } from './update-basic-info.use-case';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';

describe('UpdateBasicInfoUseCase', () => {
  let useCase: UpdateBasicInfoUseCase;
  let userRepository: any;
  let findUserByIdUseCase: any;

  beforeEach(() => {
    userRepository = {
      updateById: jest.fn(),
    };
    findUserByIdUseCase = {
      execute: jest.fn().mockResolvedValue({ _id: 'user-a', name: 'Alice' }),
    };
    useCase = new UpdateBasicInfoUseCase(userRepository, findUserByIdUseCase);
  });

  it('updates basic fields', async () => {
    userRepository.updateById.mockResolvedValue({
      _id: 'user-a',
      name: 'Bob',
    });

    const result = await useCase.execute('user-a', { name: 'Bob' });

    expect(result.name).toBe('Bob');
  });

  it('throws when update returns null', async () => {
    userRepository.updateById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-a', { name: 'Bob' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
