import type { IEventHandler } from './event.handler.interface';
import type { IEvent } from './event.interface';

export interface IEventDispatcher<T> {
  notify(event: IEvent<T>): void;
  register(eventName: string, handler: IEventHandler<IEvent<T>>): void;
  unregister(eventName: string, handler: IEventHandler<IEvent<T>>): void;
  unregisterAll(eventName: string): void;
}
