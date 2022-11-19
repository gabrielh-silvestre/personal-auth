import { User } from '@users/domain/entity/User';
import { UserFactory } from '@users/domain/factory/User.factory';

export const USERS_MOCK: User[] = [
  UserFactory.create('John', 'john@email.com', 'password'),
  UserFactory.create('Doe', 'doe@email.com', 'password'),
  UserFactory.create('Jane', 'jane@email.com', 'password'),
];
