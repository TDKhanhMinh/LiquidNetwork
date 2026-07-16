import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserCommand } from '../dto/user.command';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';
import { IUser } from '../../domain/interfaces/user.interface';
import { AlcoholToleranceLevel } from '../../domain/enums/alcohol-tolerance-level.enum';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<IUser> {
    const existingUser = await this.userRepository.findOne({ email: command.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = {
      ...command,
      drunkProfile: {},
      alcoholToleranceLevel: AlcoholToleranceLevel.LEVEL_1,
      privacySettings: {
        hideProfile: false,
        hideLevel: false,
      },
      sessionsJoined: 0,
      invitationAcceptRate: 0,
      averageRating: 0,
      totalReviews: 0,
    };

    return this.userRepository.create(newUser);
  }
}
