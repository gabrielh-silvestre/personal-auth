import type { Request } from 'express';
import { Test } from '@nestjs/testing';

import { VerifyTokenController } from './VerifyToken.controller';
import { VerifyTokenUseCase } from '@auth/useCase/verifyToken/VerifyToken.useCase';

import { TOKEN_GATEWAY } from '@auth/utils/constants';

describe('Integration test for VerifyToken controller', () => {
  let verifyTokenController: VerifyTokenController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [VerifyTokenController],
      providers: [
        VerifyTokenUseCase,
        {
          provide: TOKEN_GATEWAY,
          useValue: {
            verifyToken: jest.fn().mockResolvedValue({ userId: '1' }),
          },
        },
      ],
    }).compile();

    verifyTokenController = module.get<VerifyTokenController>(
      VerifyTokenController,
    );
  });

  describe('should verify token', () => {
    it('with RMQ message', async () => {
      const response = await verifyTokenController.handle({
        user: { userId: '1' },
      } as Request);

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({ userId: expect.any(String) });
    });
  });
});
