import type { IEvent } from './event.interface';

export class Event<T> implements IEvent<T> {
  private _id: string;
  private _name: string;
  private _payload: T;

  constructor(id: string, name: string, payload: T) {
    this._id = id;
    this._name = name;
    this._payload = payload;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get payload(): T {
    return this._payload;
  }
}
