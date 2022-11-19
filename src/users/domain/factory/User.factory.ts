import { v4 as uuid } from 'uuid';

import { User } from '../entity/User';
import { PasswordFactory } from './Password.factory';

export class UserFactory {
  public static create(
    username: string,
    email: string,
    password: string,
  ): User {
    const newUser = new User(uuid(), username, email, new Date(), new Date());
    newUser.changePassword(PasswordFactory.createNew(password));

    return newUser;
  }

  public static createFromPersistence(
    id: string,
    username: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
    password: string,
  ): User {
    const newUser = new User(id, username, email, createdAt, updatedAt);
    newUser.changePassword(PasswordFactory.createFromHash(password));

    return newUser;
  }
}
