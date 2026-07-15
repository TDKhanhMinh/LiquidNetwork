import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class ExternalServiceException extends DomainException {
  constructor(message: string, code: string = 'EXTERNAL_SERVICE_ERROR', details?: any) {
    super(message, code, HttpStatus.BAD_GATEWAY, details);
  }
}
