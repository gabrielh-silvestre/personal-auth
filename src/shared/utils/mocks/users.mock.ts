import { User } from '@user/domain/entity/User';
import { UserFactory } from '@user/domain/factory/User.factory';

export const USERS_MOCK: User[] = [
  UserFactory.createFromPersistence({
    id: '1',
    email: 'mail1@mail.com',
    password: '123',
  }),
  UserFactory.createFromPersistence({
    id: '2',
    email: 'mail2@mail.com',
    password: '123',
  }),
  UserFactory.createFromPersistence({
    id: '3',
    email: 'mail3@mail.com',
    password: '123',
  }),
];
