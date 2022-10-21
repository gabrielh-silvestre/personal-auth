import type { IEvent } from "./event.interface";

export interface IEventHandler<T> {
  handle(event: IEvent<T>): Promise<void>;
}
