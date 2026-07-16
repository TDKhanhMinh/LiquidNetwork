import { BadRequestException } from '../../../../shared/common/exceptions/bad-request.exception';
import { ConflictException } from '../../../../shared/common/exceptions/conflict.exception';
import { ForbiddenException } from '../../../../shared/common/exceptions/forbidden.exception';

export class QueueNotActiveError extends ConflictException {
  constructor(message = 'Queue is not active') {
    super(message, 'QUEUE_NOT_ACTIVE');
  }
}

export class NotYourTurnError extends BadRequestException {
  constructor(message = 'You are not the current invitee') {
    super(message, 'NOT_YOUR_TURN');
  }
}

export class ForbiddenQueueAccessError extends ForbiddenException {
  constructor(message = 'You are not allowed to perform this action on the queue') {
    super(message, 'FORBIDDEN_QUEUE_ACCESS');
  }
}
