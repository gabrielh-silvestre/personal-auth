import type { Response } from 'express';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';

import { Exception } from '@exceptions/entity/Exception';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory';

@Catch(Error)
export class GlobalExceptionRestFilter implements ExceptionFilter<Error> {
  private readonly logger: Logger = new Logger();

  private normalizeError(error: Error) {
    if (error instanceof Exception) {
      return error;
    }

    if (error instanceof HttpException) {
      return new Exception(error.message, 3, error.getStatus());
    }

    this.logger.error(error.message, error.stack);
    return ExceptionFactory.internal(error.message);
  }

  private catchHttp(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const error = this.normalizeError(exception);

    return response.status(error.status).json({
      statusCode: error.status,
      message: error.message,
      path: request.url,
    });
  }

  catch(exception: Error, host: ArgumentsHost) {
    const requestType = host.getType();

    if (requestType === 'http') {
      return this.catchHttp(exception, host);
    }
  }
}
