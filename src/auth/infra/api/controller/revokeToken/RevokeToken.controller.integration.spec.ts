import type { AuthenticatedMessageDto } from '@auth/infra/strategy/VerifyTokenMessage.dto';
import type { RmqContext } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { RevokeTokenController } from './RevokeToken.controller';
import { RevokeTokenUseCase } from '@auth/useCase/revokeToken/RevokeToken.useCase';
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

describe('Integration test for RevokeToken controller', () => {
  let revokeTokenController: RevokeTokenController;
  let rmqService: RmqService;

  beforeEach(async () => {
    DatabaseMemoryAdapter.reset(TOKENS_MOCK);

    const module = await Test.createTestingModule({
      controllers: [RevokeTokenController],
      providers: [
        RevokeTokenUseCase,
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

    revokeTokenController = module.get<RevokeTokenController>(
      RevokeTokenController,
    );
    rmqService = module.get<RmqService>(RmqService);
  });

  describe('should revoke token', () => {
    it('with RMQ message', async () => {
      const ackSpy = jest.spyOn(rmqService, 'ack');

      const response = await revokeTokenController.handle(
        { user: { tokenId } } as AuthenticatedMessageDto,
        RMQ_CONTEXT_MOCK,
      );

      expect(response).toStrictEqual({ revoked: true });
      expect(ackSpy).toHaveBeenCalledWith(RMQ_CONTEXT_MOCK);
    });

    it('with gRPC message', async () => {
      const response = await revokeTokenController.handleGrpc({
        user: { tokenId },
      } as AuthenticatedMessageDto);

      expect(response).toStrictEqual({ success: true });
    });
  });

  describe('should nack on failure', () => {
    it('when token is not found', async () => {
      const nackSpy = jest.spyOn(rmqService, 'nack');

      await expect(
        revokeTokenController.handle(
          { user: { tokenId: 'invalid' } } as AuthenticatedMessageDto,
          RMQ_CONTEXT_MOCK,
        ),
      ).rejects.toThrow();

      expect(nackSpy).toHaveBeenCalledWith(RMQ_CONTEXT_MOCK);
    });
  });
});
