export interface IEvent<T = unknown> {
  get id(): string;
  get name(): string;
  get payload(): T;
}
