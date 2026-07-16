import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class TooManyRequestsException extends DomainException {
  constructor(
    message = 'Too many requests, please try again later.',
    code = 'RATE_LIMIT_EXCEEDED',
    details?: any,
  ) {
    super(message, code, HttpStatus.TOO_MANY_REQUESTS, details);
  }
}
