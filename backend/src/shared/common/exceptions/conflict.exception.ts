import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ConflictException extends DomainException {
  constructor(message: string, code: string = 'CONFLICT', details?: any) {
    super(message, code, HttpStatus.CONFLICT, details);
  }
}
