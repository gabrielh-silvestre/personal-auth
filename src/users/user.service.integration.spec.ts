import { v4 as uuid } from 'uuid';
import { Test } from '@nestjs/testing';

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

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      imports: [UserInMemoryRepository],
      controllers: [],
      providers: [
        UserService,
        { provide: 'USER_REPO', useClass: UserInMemoryRepository },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const newUser = await userService.create({
        username: 'Joe',
        email: 'joe@email.com',
        confirmEmail: 'joe@email.com',
        password: 'password',
        confirmPassword: 'password',
      });

      expect(newUser).not.toBeNull();
      expect(newUser.id).toBeDefined();
      expect(newUser.username).toBe('Joe');
    });

    it('should throw an error if the email is not confirmed', async () => {
      await expect(
        userService.create({
          username: 'Joe',
          email: 'joe@email.com',
          confirmEmail: 'joe@otheremail.com',
          password: 'password',
          confirmPassword: 'password',
        }),
      ).rejects.toThrowError();
    });

    it('should throw an error if the password is not confirmed', async () => {
      await expect(
        userService.create({
          username: 'Joe',
          email: 'joe@email.com',
          confirmEmail: 'joe@otheremail.com',
          password: 'password',
          confirmPassword: 'otherpassword',
        }),
      ).rejects.toThrowError();
    });

    it('should throw an error if the email is already taken', async () => {
      await expect(
        userService.create({
          username: 'Joe',
          email: 'doe@email.com',
          confirmEmail: 'doe@email.com',
          password: 'password',
          confirmPassword: 'password',
        }),
      ).rejects.toThrowError();
    });
  });

  describe('findByEmail', () => {
    it('should return the user', async () => {
      const user = await userService.findByEmail('doe@email.com');

      expect(user).not.toBeNull();
    });
  });
});
