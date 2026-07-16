import { Inject, Injectable } from '@nestjs/common';
import type { IInvitationRepository } from '../../domain/repositories/invitation.repository.interface';
import { IInvitation } from '../../domain/entities/invitation.entity';
import { NotFoundException } from '../../../../shared/common/exceptions/not-found.exception';
import { ForbiddenException } from '../../../../shared/common/exceptions/forbidden.exception';

@Injectable()
export class GetInvitationByIdUseCase {
  constructor(
    @Inject('IInvitationRepository')
    private readonly invitationRepository: IInvitationRepository,
  ) {}

  async execute(
    invitationId: string,
    requesterId: string,
  ): Promise<IInvitation> {
    const invitation = await this.invitationRepository.findById(
      invitationId as any,
    );
    if (!invitation || invitation.isDeleted) {
      throw new NotFoundException(
        'Invitation not found',
        'INVITATION_NOT_FOUND',
      );
    }

    if (
      invitation.fromUserId !== requesterId &&
      invitation.toUserId !== requesterId
    ) {
      throw new ForbiddenException(
        'You cannot view this invitation',
        'FORBIDDEN_QUEUE_ACCESS',
      );
    }

    return invitation;
  }
}
