import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

import type { AuthenticatedMessageDto } from '@auth/infra/strategy/VerifyTokenMessage.dto';
import type { OutputVerifyTokenDto } from '@auth/useCase/verifyToken/VerifyToken.dto';

import { VerifyTokenUseCase } from '@auth/useCase/verifyToken/VerifyToken.useCase';
import { RmqService } from '@shared/modules/rmq/rmq.service';

import { AuthenticateGuard } from '../../guard/Authenticate.guard';
import { ExceptionFilterRpc } from '@shared/infra/filter/ExceptionFilter.grpc';

@Controller()
export class VerifyTokenController {
  constructor(
    private readonly verifyTokenUseCase: VerifyTokenUseCase,
    private readonly rmqService: RmqService,
  ) {}

  @UseGuards(AuthenticateGuard)
  @UseFilters(new ExceptionFilterRpc())
  @MessagePattern('auth.verify_token')
  async handle(
    @Payload() data: AuthenticatedMessageDto,
    @Ctx() context: RmqContext,
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
}
