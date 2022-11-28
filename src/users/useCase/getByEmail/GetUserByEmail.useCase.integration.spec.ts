import type { IUserDatabaseGateway } from '@users/infra/gateway/database/UserDatabase.gateway.interface';

import { GetUserByEmailUseCase } from './GetUserByEmail.useCase';

import { UserMemoryGateway } from '@users/infra/gateway/database/memory/UserMemory.gateway';
import { UserRepository } from '@users/infra/repository/User.repository';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

const [{ email }] = USERS_MOCK;

describe('Integration tests for Get User by id use case', () => {
  let userDatabaseGateway: IUserDatabaseGateway;
  let userRepository: UserRepository;

  let getUserByEmailUseCase: GetUserByEmailUseCase;

  beforeEach(() => {
    UserMemoryGateway.reset(USERS_MOCK);

    userDatabaseGateway = new UserMemoryGateway();
    userRepository = new UserRepository(userDatabaseGateway);

    getUserByEmailUseCase = new GetUserByEmailUseCase(userRepository);
  });

  it('should get a user by id with success', async () => {
    const user = await getUserByEmailUseCase.execute(email);

    expect(user).not.toBeNull();
  });

  it('should throw an error if user is not found', async () => {
    await expect(
      getUserByEmailUseCase.execute('invalid-email'),
    ).rejects.toThrow('User not found');
  });
});
