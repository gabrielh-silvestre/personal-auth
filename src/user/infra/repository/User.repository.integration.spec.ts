import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';
import type { IUserRepository } from '@user/domain/repository/user.repository.interface';
import type { OrmUserDto } from '../adapter/orm/orm.interface';

import { UserFactory } from '@user/domain/factory/User.factory';

import { OrmMemoryAdapter } from '../adapter/orm/memory/OrmMemory.adapter';
import { UserRepository } from './User.repository';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

describe('[User] - Infra: Unit test for UserRepository', () => {
  let ormAdapter: IOrmAdapter<OrmUserDto>;
  let userRepository: IUserRepository;

  beforeEach(() => {
    ormAdapter = new OrmMemoryAdapter();
    userRepository = new UserRepository(ormAdapter);
    OrmMemoryAdapter.reset(USERS_MOCK);
  });

  it('should find user by id', async () => {
    const [userToFind] = USERS_MOCK;

    const foundUser = await userRepository.find(userToFind.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser.id).toBe(userToFind.id);
  });

  it('should find user by email', async () => {
    const [userToFind] = USERS_MOCK;

    const foundUser = await userRepository.findByEmail(userToFind.email);

    expect(foundUser).not.toBeNull();
    expect(foundUser.email).toBe(userToFind.email);
  });

  it('should create a user', async () => {
    const newUser = UserFactory.createFromPersistence({
      id: '4',
      email: 'mail4@mail.com',
      password: '123',
    });

    await userRepository.create(newUser);
    const foundUser = await userRepository.find(newUser.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser.id).toBe(newUser.id);
  });

  it('should update a user', async () => {
    const [userToUpdate] = USERS_MOCK;
    const updatedUser = UserFactory.createFromPersistence({
      id: userToUpdate.id,
      email: 'new@mail.com',
      password: userToUpdate.password,
    });

    await userRepository.update(updatedUser);
    const foundUser = await userRepository.find(updatedUser.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser.email).toBe(updatedUser.email);
  });
});
