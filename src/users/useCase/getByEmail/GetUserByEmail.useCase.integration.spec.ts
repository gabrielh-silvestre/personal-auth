import { Test } from '@nestjs/testing';

import { GetUserByEmailUseCase } from './GetUserByEmail.useCase';
import { UserInMemoryRepository } from '@users/infra/repository/memory/User.repository';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

describe('Integration tests for Get User by id use case', () => {
  let getUserByEmailUseCase: GetUserByEmailUseCase;

  beforeEach(async () => {
    UserInMemoryRepository.reset(USERS_MOCK);

    const module = await Test.createTestingModule({
      providers: [
        GetUserByEmailUseCase,
        {
          provide: 'USER_REPO',
          useClass: UserInMemoryRepository,
        },
      ],
    }).compile();

    getUserByEmailUseCase = module.get<GetUserByEmailUseCase>(
      GetUserByEmailUseCase,
    );
  });

  it('should get a user by id with success', async () => {
    const user = await getUserByEmailUseCase.execute(USERS_MOCK[0].email);

    expect(user).not.toBeNull();
  });

  it('should throw an error if user is not found', async () => {
    await expect(
      getUserByEmailUseCase.execute('invalid-email'),
    ).rejects.toThrow('User not found');
  });
});
