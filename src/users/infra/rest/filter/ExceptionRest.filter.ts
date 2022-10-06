import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

import { Exception } from '@exceptions/entity/Exception';

@Catch(Exception)
export class ExceptionRestFilter implements ExceptionFilter<Exception> {
  catch(exception: Exception, host: ArgumentsHost) {
    const { message, status } = exception;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
    });
  }
}
