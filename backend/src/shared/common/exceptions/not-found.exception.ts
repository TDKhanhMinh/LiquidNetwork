import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class NotFoundException extends DomainException {
  constructor(message: string, code: string = 'NOT_FOUND', details?: any) {
    super(message, code, HttpStatus.NOT_FOUND, details);
  }
}
