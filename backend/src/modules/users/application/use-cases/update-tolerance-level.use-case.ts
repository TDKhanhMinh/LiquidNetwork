import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UpdateToleranceLevelCommand } from '../dto/user.command';
import { IUser } from '../../domain/interfaces/user.interface';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';

@Injectable()
export class UpdateToleranceLevelUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  async execute(
    id: string,
    command: UpdateToleranceLevelCommand,
  ): Promise<IUser> {
    await this.findUserByIdUseCase.execute(id);
    const updated = await this.userRepository.updateById(id, {
      alcoholToleranceLevel: command.level,
    });
    if (!updated) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }
    return updated;
  }
}
