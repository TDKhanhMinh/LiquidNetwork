import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class DatabaseException extends DomainException {
  constructor(message: string, code: string = 'DATABASE_ERROR', details?: any) {
    super(message, code, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
}
