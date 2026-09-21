import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import type { AuthenticatedRmqMessage } from '#auth/infra/strategy/AuthenticatedRmqMessage.dto';
import type { OutputVerifyTokenDto } from '#auth/useCase/verifyToken/VerifyToken.dto';

import { VerifyTokenUseCase } from '#auth/useCase/verifyToken/VerifyToken.useCase';

import { AuthenticateGuard } from '#auth/infra/api/guard/Authenticate.guard';
import { ExceptionFilterRpc } from '#shared/infra/filter/ExceptionFilter.grpc';
import { RmqService } from '#shared/modules/rmq/rmq.service';

@Controller()
export class VerifyTokenController {
  constructor(
    private readonly verifyTokenUseCase: VerifyTokenUseCase,
    private readonly rmqService: RmqService,
  ) {}

  private async handle(
    data: AuthenticatedRmqMessage,
    context: RmqContext,
  ): Promise<OutputVerifyTokenDto | never> {
    try {
      const { userId } = await this.verifyTokenUseCase.execute({
        tokenId: data.user.tokenId,
      });

      this.rmqService.ack(context);

      return { userId };
    } catch (error) {
      this.rmqService.nack(context);

      throw error;
    }
  }

  @UseGuards(AuthenticateGuard)
  @UseFilters(new ExceptionFilterRpc())
  @MessagePattern('auth.verify_token')
  async handleRmq(
    @Payload() data: AuthenticatedRmqMessage,
    @Ctx() context: RmqContext,
  ): Promise<OutputVerifyTokenDto | never> {
    return this.handle(data, context);
  }
}
