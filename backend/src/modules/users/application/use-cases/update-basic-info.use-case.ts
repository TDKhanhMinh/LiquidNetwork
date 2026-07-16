import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UpdateUserCommand } from '../dto/user.command';
import { IUser } from '../../domain/interfaces/user.interface';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';

@Injectable()
export class UpdateBasicInfoUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  async execute(id: string, command: UpdateUserCommand): Promise<IUser> {
    const user = await this.findUserByIdUseCase.execute(id);
    const updated = await this.userRepository.updateById(id, command);
    return updated!;
  }
}
