import type { IUser } from './user.interface';

import { UserValidatorFactory } from '../factory/User.validator.factory';

export class User implements IUser {
  private _id: string;
  private _username: string;
  private _email: string;
  private _updatedAt: Date;
  private _createdAt: Date;

  constructor(id: string, username: string, email: string) {
    this._id = id;
    this._username = username;
    this._email = email;
    this._updatedAt = new Date();
    this._createdAt = new Date();

    this.validate();
  }

  private validate(): void {
    UserValidatorFactory.create().validate(this);
  }

  changeUsername(username: string): void {
    this._username = username;
    this._updatedAt = new Date();

    this.validate();
  }

  changeEmail(email: string): void {
    this._email = email;
    this._updatedAt = new Date();

    this.validate();
  }

  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get email(): string {
    return this._email;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
