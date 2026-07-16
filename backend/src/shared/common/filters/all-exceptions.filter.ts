import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions';
import { ExceptionResponse } from './exception-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(@Optional() private readonly configService?: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: any = undefined;

    if (exception instanceof DomainException) {
      status = exception.statusCode;
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'object' && responseBody !== null) {
        code =
          (responseBody as any).error?.replace(/\s+/g, '_').toUpperCase() ||
          'HTTP_EXCEPTION';

        const resMessage = (responseBody as any).message;
        if (Array.isArray(resMessage)) {
          details = { errors: resMessage };
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
        } else {
          message = resMessage || exception.message;
        }
      } else {
        code = 'HTTP_EXCEPTION';
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        code = 'VALIDATION_ERROR';
        message = exception.message;
        details = (exception as any).errors;
      } else if (exception.name === 'CastError') {
        status = HttpStatus.BAD_REQUEST;
        code = 'INVALID_DATA_TYPE';
        message = exception.message;
      } else if (exception.name === 'MongoServerError') {
        if ((exception as any).code === 11000) {
          status = HttpStatus.CONFLICT;
          code = 'DUPLICATE_KEY_ERROR';
          message = 'A record with this data already exists.';
          details = (exception as any).keyValue;
        } else {
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          code = 'DATABASE_ERROR';
          message = exception.message;
        }
      } else if (
        exception.name.toLowerCase().includes('bull') ||
        exception.message.toLowerCase().includes('bullmq') ||
        exception.name === 'WaitingChildrenError'
      ) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        code = 'QUEUE_ERROR';
        message = exception.message;
      } else {
        message = exception.message;
      }
    }

    // Log the error (always keep full detail server-side)
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${message}`,
        exception instanceof Error ? exception.stack : 'Unknown stack',
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} - ${message}`);
    }

    // Never leak internal error details to clients in production
    const env =
      (this.configService?.get('env') as string | undefined) ||
      process.env.NODE_ENV ||
      'development';
    const isProduction = env === 'production';

    if (isProduction && status >= 500) {
      message = 'An unexpected error occurred';
      details = undefined;
      if (code === 'DATABASE_ERROR' || code === 'QUEUE_ERROR') {
        code = 'INTERNAL_SERVER_ERROR';
      }
    }

    const errorResponse: ExceptionResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
