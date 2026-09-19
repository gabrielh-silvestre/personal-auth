import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

import { DomainError } from '@auth/domain/error/DomainError.js';
import { Exception } from '@exceptions/entity/Exception.js';
import { ExceptionFactory } from '@exceptions/factory/Exception.factory.js';

@Catch(Exception, DomainError)
export class ExceptionFilterRpc implements RpcExceptionFilter<
  Exception | DomainError
> {
  catch(exception: Exception | DomainError): Observable<any> {
    const error =
      exception instanceof DomainError
        ? ExceptionFactory.invalidArgument(exception.message)
        : exception;

    return throwError(() => error);
  }
}
