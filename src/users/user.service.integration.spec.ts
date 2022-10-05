import { v4 as uuid } from 'uuid';

import type { IUserRepository } from './domain/repository/user.repository.interface';

import { User } from './domain/entity/User';
import { UserService } from './user.service';
import { UserInMemoryRepository } from './infra/repository/memory/User.repository';

const USERS_MOCK: User[] = [
  new User(uuid(), 'John', 'john@email.com'),
  new User(uuid(), 'Doe', 'doe@email.com'),
  new User(uuid(), 'Jane', 'jane@email.com'),
];

describe('Integration test for User service', () => {
  let userService: UserService;
  let userRepository: IUserRepository;

  beforeEach(() => {
    UserInMemoryRepository.reset(USERS_MOCK);

    userRepository = new UserInMemoryRepository();
    userService = new UserService(userRepository);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const newUser = await userService.create({
        username: 'Joe',
        email: 'joe@email.com',
        confirmEmail: 'joe@email.com',
      });

      expect(newUser).not.toBeNull();
      expect(newUser.id).toBeDefined();
      expect(newUser.username).toBe('Joe');
    });

    it('should throw an error if the email is not confirmed', async () => {
      await expect(
        userService.create({
          username: 'Joe',
          email: 'joe@email',
          confirmEmail: 'joe@otheremail',
        }),
      ).rejects.toThrowError();
    });

    it('should throw an error if the email is already taken', async () => {
      await expect(
        userService.create({
          username: 'Joe',
          email: 'doe@email.com',
          confirmEmail: 'doe@email.com',
        }),
      ).rejects.toThrowError();
    });
  });
});
