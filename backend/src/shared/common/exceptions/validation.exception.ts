import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ValidationException extends DomainException {
  constructor(message: string, details?: any, code: string = 'VALIDATION_ERROR') {
    super(message, code, HttpStatus.BAD_REQUEST, details);
  }
}
