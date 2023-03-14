import type { IUser } from './user.interface';

export class User implements IUser {
  private _id: string;
  private _email: string;
  private _password: string;

  constructor(id: string, email: string, password: string) {
    this._id = id;
    this._email = email;
    this._password = password;
  }

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  set email(email: string) {
    this._email = email;
  }

  get password(): string {
    return this._password;
  }

  set password(password: string) {
    this._password = password;
  }
}
