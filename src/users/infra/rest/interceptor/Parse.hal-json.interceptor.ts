import { NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common';
import { map, Observable } from 'rxjs';

import type { RestResponseCreateUser } from '@shared/infra/rest/Response.type';

export class ParseHalJsonInterceptor<T>
  implements NestInterceptor<T, RestResponseCreateUser<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ):
    | Observable<RestResponseCreateUser<T>>
    | Promise<Observable<RestResponseCreateUser<T>>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        return {
          _links: {
            self: {
              href: request.url,
            },
          },
          data,
        };
      }),
    );
  }
}
