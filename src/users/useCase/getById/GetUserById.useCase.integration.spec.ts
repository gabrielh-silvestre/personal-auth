import { Test } from '@nestjs/testing';

import { GetUserByIdUseCase } from './GetUserById.useCase';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

describe('Integration tests for Get User by id use case', () => {
  let getUserByIdUseCase: GetUserByIdUseCase;

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        GetUserByIdUseCase,
        {
          provide: 'USER_REPO',
          useClass: UserInMemoryRepository,
        },
      ],
    }).compile();

    getUserByIdUseCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
  });

  it('should get a user by id with success', async () => {
    const user = await getUserByIdUseCase.execute(USERS_MOCK[0].id);

    expect(user).not.toBeNull();
  });

  it('should throw an error if user is not found', async () => {
    await expect(getUserByIdUseCase.execute('invalid-id')).rejects.toThrow(
      'User not found',
    );
  });
});
