import type { Request } from 'express';
import { Test } from '@nestjs/testing';

import { VerifyTokenController } from './VerifyToken.controller.js';
import { VerifyTokenUseCase } from '@auth/useCase/verifyToken/VerifyToken.useCase.js';

import { DatabaseMemoryAdapter } from '@auth/infra/adapter/database/memory/DatabaseMemory.adapter.js';
import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway.js';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock.js';
import {
  DATABASE_ADAPTER,
  DATABASE_GATEWAY,
} from '@auth/utils/constants/index.js';

const [{ id: tokenId }] = TOKENS_MOCK;

describe('Integration test for VerifyToken controller', () => {
  let verifyTokenController: VerifyTokenController;

  beforeEach(async () => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      controllers: [VerifyTokenController],
      providers: [
        VerifyTokenUseCase,
        {
          provide: DATABASE_ADAPTER,
          useClass: DatabaseMemoryAdapter,
        },
        {
          provide: DATABASE_GATEWAY,
          useClass: DatabaseGateway,
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
        user: { tokenId },
      } as Request);

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({ userId: expect.any(String) });
    });
  });
});
