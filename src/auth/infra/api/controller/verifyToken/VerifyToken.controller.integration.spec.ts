import type { RmqContext } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { vi } from 'vitest';

import type { AuthenticatedRmqMessage } from '#auth/infra/strategy/AuthenticatedRmqMessage.dto';

import { VerifyTokenController } from '#auth/infra/api/controller/verifyToken/VerifyToken.controller';
import { VerifyTokenUseCase } from '#auth/useCase/verifyToken/VerifyToken.useCase';

import { DatabaseMemoryAdapter } from '#auth/infra/adapter/database/memory/DatabaseMemory.adapter';
import { DatabaseGateway } from '#auth/infra/gateway/database/Database.gateway';

import { RmqService } from '#shared/modules/rmq/rmq.service';
import { TOKENS_MOCK } from '#shared/utils/mocks/tokens.mock';
import {
  DATABASE_ADAPTER,
  DATABASE_GATEWAY,
} from '#auth/utils/constants/index';

const [{ id: tokenId }] = TOKENS_MOCK;
const rmqContext = {} as RmqContext;

describe('Integration test for VerifyToken controller', () => {
  let verifyTokenController: VerifyTokenController;
  let rmqService: RmqService;

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
        {
          provide: RmqService,
          useValue: { ack: vi.fn(), nack: vi.fn() },
        },
      ],
    }).compile();

    verifyTokenController = module.get<VerifyTokenController>(
      VerifyTokenController,
    );
    rmqService = module.get<RmqService>(RmqService);
  });

  describe('should verify token', () => {
    it('with RMQ message', async () => {
      const response = await verifyTokenController.handle(
        {
          token: 'x',
          user: { userId: 'user-1', tokenId },
        } as AuthenticatedRmqMessage,
        rmqContext,
      );

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({ userId: expect.any(String) });
      expect(rmqService.ack).toHaveBeenCalledWith(rmqContext);
    });
  });

  describe('should nack without requeue when the use case fails', () => {
    it('with RMQ message', async () => {
      const invalidTokenId = 'non-existent-token-id';

      await expect(
        verifyTokenController.handle(
          {
            token: 'x',
            user: { userId: 'user-1', tokenId: invalidTokenId },
          } as AuthenticatedRmqMessage,
          rmqContext,
        ),
      ).rejects.toThrow();

      expect(rmqService.nack).toHaveBeenCalledWith(rmqContext);
      expect(rmqService.ack).not.toHaveBeenCalled();
    });
  });
});
