export interface IEvent<T> {
  get id(): string;
  get name(): string;
  get payload(): T;
  get occurredAt(): Date;
}
