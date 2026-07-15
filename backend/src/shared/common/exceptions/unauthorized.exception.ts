import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class UnauthorizedException extends DomainException {
  constructor(message: string = 'Unauthorized access', code: string = 'UNAUTHORIZED', details?: any) {
    super(message, code, HttpStatus.UNAUTHORIZED, details);
  }
}
