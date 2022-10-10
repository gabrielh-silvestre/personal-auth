import { Test } from '@nestjs/testing';

import { UserService } from './user.service';
import { UserInMemoryRepository } from './infra/repository/memory/User.repository';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

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

    it('should return null if the user does not exist', async () => {
      const user = await userService.findByEmail('not@emai.com');

      expect(user).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should return the user', async () => {
      const [{ id: userId }] = USERS_MOCK;
      const user = await userService.getUser(userId);

      expect(user).not.toBeNull();
      expect(user).toStrictEqual({
        id: expect.any(String),
        username: expect.any(String),
      });
    });

    it('should return null if the user does not exist', async () => {
      const user = await userService.getUser('non-existing-id');

      expect(user).toBeNull();
    });
  });
});
