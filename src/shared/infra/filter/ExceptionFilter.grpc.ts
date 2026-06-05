import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

import { Exception } from '@exceptions/entity/Exception';

import { Telemetry } from '@shared/modules/telemetry/telemetry';

@Catch(Exception)
export class ExceptionFilterRpc implements RpcExceptionFilter<Exception> {
  catch(exception: Exception): Observable<any> {
    Telemetry.recordExceptionIfActive(exception);
    return throwError(() => exception);
  }
}
