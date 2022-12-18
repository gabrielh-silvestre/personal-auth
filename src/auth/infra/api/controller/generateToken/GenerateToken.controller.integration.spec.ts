import { Test } from '@nestjs/testing';

import { GenerateTokenUseCase } from '@auth/useCase/generateToken/GenerateToken.useCase';
import { GenerateTokenController } from './GenerateToken.controller';

import { DatabaseMemoryAdapter } from '@auth/infra/adapter/database/memory/DatabaseMemory.adapter';
import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway';

import { JwtAccessService } from '@shared/modules/jwt/JwtAccess.service';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { DATABASE_ADAPTER, DATABASE_GATEWAY } from '@auth/utils/constants';

const [{ userId }] = TOKENS_MOCK;

describe('Integration test for GenerateToken controller', () => {
  let generateTokenController: GenerateTokenController;

  beforeEach(async () => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      controllers: [GenerateTokenController],
      providers: [
        GenerateTokenUseCase,
        {
          provide: DATABASE_ADAPTER,
          useClass: DatabaseMemoryAdapter,
        },
        {
          provide: DATABASE_GATEWAY,
          useClass: DatabaseGateway,
        },
        {
          provide: JwtAccessService,
          useValue: {
            sign: jest.fn().mockReturnValue('access'),
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
        userId,
      });

      expect(response).not.toBeNull();
      expect(response).toStrictEqual(expect.any(String));
    });
  });
});
