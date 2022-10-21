import type { IEvent } from '@shared/domain/event/event.interface';
import type { IUser } from '../entity/user.interface';

export class UserCreatedEvent implements IEvent<IUser> {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _payload: IUser;
  private readonly _createdAt: Date;

  constructor(payload: IUser) {
    this._id = payload.id;
    this._name = 'user.created';
    this._payload = payload;
    this._createdAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get payload(): IUser {
    return this._payload;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
