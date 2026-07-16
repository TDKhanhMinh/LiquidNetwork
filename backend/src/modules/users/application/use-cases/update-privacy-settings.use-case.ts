import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UpdatePrivacySettingsCommand } from '../dto/user.command';
import { IUser } from '../../domain/interfaces/user.interface';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';

@Injectable()
export class UpdatePrivacySettingsUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  async execute(
    id: string,
    command: UpdatePrivacySettingsCommand,
  ): Promise<IUser> {
    const user = await this.findUserByIdUseCase.execute(id);
    const updatedPrivacy = {
      ...user.privacySettings,
      ...command.privacySettings,
    };
    const updated = await this.userRepository.updateById(id, {
      privacySettings: updatedPrivacy,
    });
    if (!updated) {
      throw new NotFoundException('User not found', 'USER_NOT_FOUND');
    }
    return updated;
  }
}
