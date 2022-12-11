import type { IUserDatabaseAdapter } from '../adapter/database/UserDatabase.adapter.interface';
import type { IUserRepository } from '@users/domain/repository/user.repository.interface';

import { UserFactory } from '@users/domain/factory/User.factory';

import { UserDatabaseMemoryAdapter } from '../adapter/database/memory/UserMemory.adapter';
import { UserRepository } from './User.repository';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

describe('Integration test infra UserRepository', () => {
  let userRepository: IUserRepository;
  let userGateway: IUserDatabaseAdapter;

  beforeEach(() => {
    UserDatabaseMemoryAdapter.reset(USERS_MOCK);

    userGateway = new UserDatabaseMemoryAdapter();
    userRepository = new UserRepository(userGateway);
  });

  it('should find a user by id', async () => {
    const [userToFind] = USERS_MOCK;

    const foundUser = await userRepository.find(userToFind.id);

    expect(foundUser).not.toBeNull();
  });

  it('should find a user by email', async () => {
    const [userToFind] = USERS_MOCK;

    const foundUser = await userRepository.findByEmail(userToFind.email);

    expect(foundUser).not.toBeNull();
  });

  it('should return true if user exists by email', async () => {
    const [userToFind] = USERS_MOCK;

    const exists = await userRepository.existsByEmail(userToFind.email);

    expect(exists).toBeTruthy();
  });

  it('should return false if user does not exist by email', async () => {
    const exists = await userRepository.existsByEmail('non-existing-email');

    expect(exists).toBeFalsy();
  });

  it('should create a user', async () => {
    const newUser = UserFactory.create('Joe', 'joe@email.com', 'password');

    await userRepository.create(newUser);

    const foundUser = await userRepository.find(newUser.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser?.id).toBeDefined();
    expect(foundUser?.username).toBe('Joe');
    expect(foundUser?.email).toBe('joe@email.com');
  });

  it('should update a user', async () => {
    const [userToUpdate] = USERS_MOCK;
    userToUpdate.changeUsername('Johnny');

    await userRepository.update(userToUpdate);

    const foundUser = await userRepository.find(userToUpdate.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser?.username).toBe('Johnny');
  });
});
