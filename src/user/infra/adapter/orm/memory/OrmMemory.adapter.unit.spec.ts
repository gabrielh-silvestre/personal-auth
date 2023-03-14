import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';
import type { OrmUserDto } from '../orm.interface';

import { OrmMemoryAdapter } from './OrmMemory.adapter';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

describe('[User] - Infra: Unit test for OrmMemoryAdapter', () => {
  let ormAdapter: IOrmAdapter<OrmUserDto>;

  beforeEach(() => {
    ormAdapter = new OrmMemoryAdapter();
    OrmMemoryAdapter.reset(USERS_MOCK);
  });

  it('should find all users', async () => {
    const foundUsers = await ormAdapter.findAll();

    expect(foundUsers).toBeInstanceOf(Array);
    expect(foundUsers).toHaveLength(USERS_MOCK.length);
  });

  it('should find a user by id', async () => {
    const [userToFind] = USERS_MOCK;

    const foundUser = await ormAdapter.findOne({ id: userToFind.id });

    expect(foundUser).not.toBeNull();
    expect(foundUser.id).toBe(userToFind.id);
  });

  it('should find a user by email', async () => {
    const [userToFind] = USERS_MOCK;

    const foundUser = await ormAdapter.findOne({ email: userToFind.email });

    expect(foundUser).not.toBeNull();
    expect(foundUser.email).toBe(userToFind.email);
  });

  it('should create a user', async () => {
    const newUser = {
      id: '4',
      email: 'mail4@mail.com',
      password: '123',
    };

    await ormAdapter.create(newUser);
    const foundUser = await ormAdapter.findOne({ id: newUser.id });

    expect(foundUser).not.toBeNull();
    expect(foundUser.id).toBe(newUser.id);
  });

  it('should update a user', async () => {
    const [userToUpdate] = USERS_MOCK;
    const updatedUser = {
      id: userToUpdate.id,
      email: 'new@mail.com',
      password: userToUpdate.password,
    };

    await ormAdapter.update(userToUpdate.id, updatedUser);
    const foundUser = await ormAdapter.findOne({ id: updatedUser.id });

    expect(foundUser).not.toBeNull();
    expect(foundUser.id).toBe(userToUpdate.id);
    expect(foundUser.email).toBe(updatedUser.email);
  });

  it('should delete a user', async () => {
    const [userToDelete] = USERS_MOCK;

    await ormAdapter.delete(userToDelete.id);
    const foundUser = await ormAdapter.findOne({ id: userToDelete.id });

    expect(foundUser).toBeNull();
  });
});
