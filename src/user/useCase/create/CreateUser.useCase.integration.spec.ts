import type { IOrmAdapter } from '@shared/infra/adapter/orm/Orm.adapter.interface';
import type { IUserRepository } from '@user/domain/repository/user.repository.interface';
import type { OrmUserDto } from '@user/infra/adapter/orm/orm.interface';

import { OrmMemoryAdapter } from '@user/infra/adapter/orm/memory/OrmMemory.adapter';
import { UserRepository } from '@user/infra/repository/User.repository';
import { CreateUserUseCase } from './CreateUser.useCase';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

describe('[User] - Use Case: Integration test for CreateUserUseCase', () => {
  let ormAdapter: IOrmAdapter<OrmUserDto>;
  let userRepository: IUserRepository;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    ormAdapter = new OrmMemoryAdapter();
    userRepository = new UserRepository(ormAdapter);
    useCase = new CreateUserUseCase(userRepository);

    OrmMemoryAdapter.reset(USERS_MOCK);
  });

  it('should create a user', async () => {
    const newUser = {
      id: '4',
      email: 'mail4@mail.com',
      password: '123',
    };

    await useCase.execute(newUser);
    const foundUser = await userRepository.find(newUser.id);

    expect(foundUser).not.toBeNull();
    expect(foundUser.id).toBe(newUser.id);
  });

  it('should not create a user with an existing email', async () => {
    const newUser = {
      id: '4',
      email: USERS_MOCK[0].email,
      password: '123',
    };

    await useCase.execute(newUser);
    const allUsers = await ormAdapter.findAll();

    expect(allUsers).toHaveLength(USERS_MOCK.length);
  });
});
