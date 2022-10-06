import { ArgumentsHost, Catch, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

import { ExceptionRpc } from 'src/exceptions/entity/Exceptions-rpc';

@Catch(ExceptionRpc)
export class ExceptionFilterRpc implements RpcExceptionFilter<ExceptionRpc> {
  catch(exception: ExceptionRpc, host: ArgumentsHost): Observable<any> {
    return throwError(() => exception);
  }
}
