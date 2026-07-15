import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class QueueException extends DomainException {
  constructor(message: string, code: string = 'QUEUE_ERROR', details?: any) {
    super(message, code, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
}
