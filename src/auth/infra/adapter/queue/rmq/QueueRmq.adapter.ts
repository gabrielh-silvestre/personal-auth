import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, timeout } from 'rxjs';

import type { IQueueAdapter } from '@shared/infra/adapter/queue/Queue.adapter.interface';

@Injectable()
export class QueueRmqAdapter implements IQueueAdapter {
  constructor(@Inject('AUTH_QUEUE') private readonly client: ClientProxy) {}

  send<T>(event: string, data: any): Observable<T> {
    return this.client.send(event, data).pipe(timeout(6000));
  }

  emit(event: string, data: any): void {
    this.client.emit(event, data);
  }
}
