import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

import type { IUserAdapter, OutputUser } from '../User.adapter.interface';

@Injectable()
export class UserRmqAdapter implements IUserAdapter {
  constructor(@Inject('USER') private readonly client: ClientProxy) {}

  send<T>(data: T, pattern: string): Observable<OutputUser> {
    return this.client.send(pattern, data);
  }
}
