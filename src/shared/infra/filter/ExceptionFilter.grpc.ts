import { Catch, type ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

import { isDomainError } from '#shared/domain/error/domainError';

import { Exception } from '#exceptions/entity/Exception';
import { ExceptionFactory } from '#exceptions/factory/Exception.factory';

@Catch()
export class ExceptionFilterRpc extends BaseRpcExceptionFilter<Error> {
  catch(exception: Error, host: ArgumentsHost): Observable<any> {
    if (isDomainError(exception)) {
      return throwError(() =>
        ExceptionFactory[exception.domainErrorKind](exception.message),
      );
    }

    if (exception instanceof Exception) {
      return throwError(() => exception);
    }

    return super.catch(exception, host);
  }
}
