import { v4 as uuid } from 'uuid';

import { Event } from '../entity/Event';

export class EventFactory {
  public static create<T>(name: string, data: T): Event<T> {
    return new Event(uuid(), name, data);
  }
}
