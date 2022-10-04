import { v4 as uuid } from 'uuid';
import { User } from '../entity/User';

export class UserFactory {
  public static create(
    username: string,
    email: string,
    confirmEmail: string,
  ): User {
    if (email !== confirmEmail) {
      throw new Error('Emails must match');
    }

    return new User(uuid(), username, email);
  }
}
