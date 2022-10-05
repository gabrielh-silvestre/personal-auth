import { v4 as uuid } from 'uuid';

import { User } from '../entity/User';
import { Password } from '../value-object/Password';

export class UserFactory {
  public static create(
    username: string,
    email: string,
    confirmEmail: string,
    password: string,
    confirmPassword: string,
  ): User {
    if (email !== confirmEmail) {
      throw new Error('Emails must match');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords must match');
    }

    const newUser = new User(uuid(), username, email);
    newUser.changePassword(new Password(password));

    return newUser;
  }
}
