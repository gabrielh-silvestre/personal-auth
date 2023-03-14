import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';
import type { IUserRepository } from '@user/domain/repository/user.repository.interface';
import type { OrmUserDto } from '@user/infra/adapter/orm/orm.interface';

import { OrmMemoryAdapter } from '@user/infra/adapter/orm/memory/OrmMemory.adapter';
import { UserRepository } from '@user/infra/repository/User.repository';
import { UpdatePasswordUseCase } from './UpdatePassword.useCase';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

describe('[User] - Use Case: Integration test for UpdatePasswordUseCase', () => {
  let ormAdapter: IOrmAdapter<OrmUserDto>;
  let userRepository: IUserRepository;
  let useCase: UpdatePasswordUseCase;

  beforeEach(() => {
    ormAdapter = new OrmMemoryAdapter();
    userRepository = new UserRepository(ormAdapter);
    useCase = new UpdatePasswordUseCase(userRepository);

    OrmMemoryAdapter.reset(USERS_MOCK);
  });

  it('should update a user password', async () => {
    const [user] = USERS_MOCK;

    await useCase.execute({ id: user.id, password: 'newPassword' });
    const foundUser = await userRepository.find(user.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser.password).toBe('newPassword');
  });

  it('should not update a user password with an invalid id', async () => {
    const [user] = USERS_MOCK;

    await useCase.execute({ id: 'invalidId', password: 'newPassword' });
    const foundUser = await userRepository.find(user.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser.password).toBe(user.password);
  });
});
