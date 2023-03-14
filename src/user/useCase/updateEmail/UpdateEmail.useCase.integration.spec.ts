import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';
import type { IUserRepository } from '@user/domain/repository/user.repository.interface';
import type { OrmUserDto } from '@user/infra/adapter/orm/orm.interface';

import { OrmMemoryAdapter } from '@user/infra/adapter/orm/memory/OrmMemory.adapter';
import { UserRepository } from '@user/infra/repository/User.repository';
import { UpdateEmailUseCase } from './UpdateEmail.useCase';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

describe('[User] - Use Case: Integration test for UpdateEmailUseCase', () => {
  let ormAdapter: IOrmAdapter<OrmUserDto>;
  let userRepository: IUserRepository;
  let useCase: UpdateEmailUseCase;

  beforeEach(() => {
    ormAdapter = new OrmMemoryAdapter();
    userRepository = new UserRepository(ormAdapter);
    useCase = new UpdateEmailUseCase(userRepository);

    OrmMemoryAdapter.reset(USERS_MOCK);
  });

  it('should update a user email', async () => {
    const [user] = USERS_MOCK;

    await useCase.execute({ id: user.id, email: 'newEmail' });
    const foundUser = await userRepository.find(user.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser.email).toBe('newEmail');
  });

  it('should not update a user email with an invalid id', async () => {
    const [user] = USERS_MOCK;

    await useCase.execute({ id: 'invalidId', email: 'newEmail' });
    const foundUser = await userRepository.find(user.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser.email).toBe(user.email);
  });
});
