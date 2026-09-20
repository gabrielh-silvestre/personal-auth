import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import type { AuthenticatedRmqMessage } from '#auth/infra/strategy/AuthenticatedRmqMessage.dto';
import type { OutputRevokeTokenDto } from '#auth/useCase/revokeToken/RevokeToken.dto';

import { RevokeTokenUseCase } from '#auth/useCase/revokeToken/RevokeToken.useCase';

import { AuthenticateGuard } from '#auth/infra/api/guard/Authenticate.guard';
import { ExceptionFilterRpc } from '#shared/infra/filter/ExceptionFilter.grpc';
import { RmqService } from '#shared/modules/rmq/rmq.service';

@Controller()
export class RevokeTokenController {
  constructor(
    private readonly revokeTokenUseCase: RevokeTokenUseCase,
    private readonly rmqService: RmqService,
  ) {}

  @UseGuards(AuthenticateGuard)
  @UseFilters(new ExceptionFilterRpc())
  @MessagePattern('auth.revoke_token')
  async handle(
    @Payload() data: AuthenticatedRmqMessage,
    @Ctx() context: RmqContext,
  ): Promise<OutputRevokeTokenDto | never> {
    try {
      const result = await this.revokeTokenUseCase.execute({
        tokenId: data.user.tokenId,
      });

      this.rmqService.ack(context);

      return result;
    } catch (error) {
      this.rmqService.nack(context);

      throw error;
    }
  }
}
