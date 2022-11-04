import { Test } from '@nestjs/testing';

import { ForgotPasswordController } from './ForgotPassword.controller';
import { ForgotPasswordUseCase } from '@auth/useCase/forgotPassword/ForgotPassword.useCase';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

const VALID_RECOVERY = {
  email: USERS_MOCK[0].email,
};

const VALID_USER = {
  id: USERS_MOCK[0].id,
  email: USERS_MOCK[0].email,
  username: USERS_MOCK[0].username,
};

describe('Integration tests for Forgot Password controller', () => {
  let forgotPasswordController: ForgotPasswordController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ForgotPasswordController],
      providers: [
        ForgotPasswordUseCase,
        {
          provide: 'ACCESS_TOKEN_SERVICE',
          useValue: {
            signAsync: jest.fn().mockResolvedValue('token'),
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
        {
          provide: 'TOKEN_SERVICE',
          useValue: {
            generateRecoverPasswordToken: jest.fn().mockResolvedValue({
              tokenId: 'token-id',
              userId: 'user-id',
            }),
          },
        },
      ],
    }).compile();

    forgotPasswordController = module.get<ForgotPasswordController>(
      ForgotPasswordController,
    );
  });

  it('should send a recover password email', async () => {
    expect(forgotPasswordController).toBeDefined();

    expect(
      async () => await forgotPasswordController.handleRest(VALID_RECOVERY),
    ).not.toThrow();
  });
});
