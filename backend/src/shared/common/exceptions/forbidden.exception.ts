import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ForbiddenException extends DomainException {
  constructor(message: string = 'Access forbidden', code: string = 'FORBIDDEN', details?: any) {
    super(message, code, HttpStatus.FORBIDDEN, details);
  }
}
