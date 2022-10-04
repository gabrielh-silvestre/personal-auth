import { v4 as uuid } from 'uuid';
import { User } from '../entity/User';

export class UserFactory {
  public static create(username: string, email: string): User {
    return new User(uuid(), username, email);
  }
}
