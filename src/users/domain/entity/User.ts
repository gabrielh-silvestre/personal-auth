import type { IUser } from './user.interface';
import type { IPassword } from '../value-object/Password/password.interface';

import { UserValidatorFactory } from '../factory/User.validator.factory';

export class User implements IUser {
  private _id: string;
  private _username: string;
  private _email: string;
  private _password: IPassword;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    username: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this._id = id;
    this._username = username;
    this._email = email;
    this._updatedAt = updatedAt;
    this._createdAt = createdAt;

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

  changePassword(password: IPassword): void {
    this._password = password;
    this._updatedAt = new Date();

    this.validate();
  }

  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get password(): IPassword {
    return this._password;
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
