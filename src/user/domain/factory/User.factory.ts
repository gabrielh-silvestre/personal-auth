import type { IUser } from '../entity/user.interface';

import { User } from '../entity/User';

export class UserFactory {
  public static createFromPersistence(dto: IUser): User {
    return new User(dto.id, dto.email, dto.password);
  }
}
