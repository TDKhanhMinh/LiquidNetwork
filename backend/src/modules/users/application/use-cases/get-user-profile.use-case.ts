import { Injectable } from '@nestjs/common';
import { IUser } from '../../domain/interfaces/user.interface';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';
import {
  assertCanViewProfile,
  ProfileAccessContext,
} from '../services/user-privacy.helper';

export interface GetUserProfileResult extends ProfileAccessContext {
  user: IUser;
}

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly findUserByIdUseCase: FindUserByIdUseCase) {}

  async execute(
    targetUserId: string,
    requesterId: string,
  ): Promise<GetUserProfileResult> {
    const user = await this.findUserByIdUseCase.execute(targetUserId);
    const access = assertCanViewProfile(user, requesterId);
    return { user, ...access };
  }
}
