import { Test } from '@nestjs/testing';

import { ForgotPasswordUseCase } from './ForgotPassword.useCase';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

const VALID_USER = {
  id: USERS_MOCK[0].id,
  email: USERS_MOCK[0].email,
  username: USERS_MOCK[0].username,
};

describe('Integration tests for Forgot Password use case', () => {
  let forgotPasswordUseCase: ForgotPasswordUseCase;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase,
        {
          provide: 'TOKEN_SERVICE',
          useValue: {
            generateRecoverPasswordToken: jest.fn().mockResolvedValue('token'),
          },
        },
        {
          provide: 'USER_SERVICE',
          useValue: {
            findByEmail: jest.fn().mockResolvedValue(VALID_USER),
          },
        },
        {
          provide: 'MAIL_SERVICE',
          useValue: {
            recoverPasswordMail: jest.fn(),
          },
        },
      ],
    }).compile();

    forgotPasswordUseCase = module.get<ForgotPasswordUseCase>(
      ForgotPasswordUseCase,
    );
  });

  it('should send a recover password email', async () => {
    expect(forgotPasswordUseCase).toBeDefined();

    const { email } = VALID_USER;

    expect(
      async () => await forgotPasswordUseCase.execute({ email }),
    ).not.toThrow();
  });
});
