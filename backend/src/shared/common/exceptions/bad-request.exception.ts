import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class BadRequestException extends DomainException {
  constructor(message: string, code: string = 'BAD_REQUEST', details?: any) {
    super(message, code, HttpStatus.BAD_REQUEST, details);
  }
}
