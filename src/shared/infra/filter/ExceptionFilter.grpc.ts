import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

import { Exception } from '@exceptions/entity/Exception';

@Catch(Exception)
export class ExceptionFilterRpc implements RpcExceptionFilter<Exception> {
  catch(exception: Exception): Observable<any> {
    return throwError(() => exception);
  }
}
