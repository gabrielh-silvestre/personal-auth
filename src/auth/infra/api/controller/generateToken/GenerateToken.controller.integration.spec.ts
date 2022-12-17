import { Test } from '@nestjs/testing';

import { GenerateTokenUseCase } from '@auth/useCase/generateToken/GenerateToken.useCase';
import { GenerateTokenController } from './GenerateToken.controller';

import { TOKEN_GATEWAY } from '@auth/utils/constants';

describe('Integration test for GenerateToken controller', () => {
  let generateTokenController: GenerateTokenController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [GenerateTokenController],
      providers: [
        GenerateTokenUseCase,
        {
          provide: TOKEN_GATEWAY,
          useValue: {
            generateRecoverPasswordToken: jest
              .fn()
              .mockResolvedValue('fake-token'),
          },
        },
      ],
    }).compile();

    generateTokenController = module.get<GenerateTokenController>(
      GenerateTokenController,
    );
  });

  describe('should generate a', () => {
    it('recover token with RMQ message', async () => {
      const response = await generateTokenController.handleRecoverToken({
        userId: '1',
      });

      expect(response).not.toBeNull();
      expect(response).toStrictEqual(expect.any(String));
    });
  });
});
