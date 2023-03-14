import type { IEvent } from './event.interface';

export interface IEventHandler<T = IEvent<unknown>> {
  handle(event: T): void;
}
