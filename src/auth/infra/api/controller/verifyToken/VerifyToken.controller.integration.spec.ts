import type { AuthenticatedMessageDto } from '@auth/infra/strategy/VerifyTokenMessage.dto';
import type { RmqContext } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { VerifyTokenController } from './VerifyToken.controller';
import { VerifyTokenUseCase } from '@auth/useCase/verifyToken/VerifyToken.useCase';
import { RmqService } from '@shared/modules/rmq/rmq.service';

import { DatabaseMemoryAdapter } from '@auth/infra/adapter/database/memory/DatabaseMemory.adapter';
import { DatabaseGateway } from '@auth/infra/gateway/database/Database.gateway';

import { TOKENS_MOCK } from '@shared/utils/mocks/tokens.mock';
import { DATABASE_ADAPTER, DATABASE_GATEWAY } from '@auth/utils/constants';

const [{ id: tokenId }] = TOKENS_MOCK;

const RMQ_CONTEXT_MOCK = {
  getChannelRef: () => ({ ack: jest.fn(), nack: jest.fn() }),
  getMessage: () => ({}),
} as unknown as RmqContext;

describe('Integration test for VerifyToken controller', () => {
  let verifyTokenController: VerifyTokenController;
  let rmqService: RmqService;

  beforeEach(async () => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      controllers: [VerifyTokenController],
      providers: [
        VerifyTokenUseCase,
        RmqService,
        {
          provide: ConfigService,
          useValue: {},
        },
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
    rmqService = module.get<RmqService>(RmqService);
  });

  describe('should verify token', () => {
    it('with RMQ message', async () => {
      const ackSpy = jest.spyOn(rmqService, 'ack');

      const response = await verifyTokenController.handle(
        { user: { tokenId } } as AuthenticatedMessageDto,
        RMQ_CONTEXT_MOCK,
      );

      expect(response).not.toBeNull();
      expect(response).toStrictEqual({ userId: expect.any(String) });
      expect(ackSpy).toHaveBeenCalledWith(RMQ_CONTEXT_MOCK);
    });
  });

  describe('should nack on failure', () => {
    it('when token is not found', async () => {
      const nackSpy = jest.spyOn(rmqService, 'nack');

      await expect(
        verifyTokenController.handle(
          { user: { tokenId: 'invalid' } } as AuthenticatedMessageDto,
          RMQ_CONTEXT_MOCK,
        ),
      ).rejects.toThrow();

      expect(nackSpy).toHaveBeenCalledWith(RMQ_CONTEXT_MOCK);
    });
  });
});
