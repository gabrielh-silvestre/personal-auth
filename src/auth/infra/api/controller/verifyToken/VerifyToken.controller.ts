import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import type {
  InputVerifyTokenDto,
  OutputVerifyTokenDto,
} from '@auth/useCase/verifyToken/VerifyToken.dto';

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
    @Payload() data: InputVerifyTokenDto,
    @Ctx() ctx: RmqContext,
  ): Promise<OutputVerifyTokenDto | never> {
    console.log(data);
    try {
      const { userId } = await this.verifyTokenUseCase.execute(data);

      this.rmqService.ack(ctx);

      return { userId };
    } catch (err) {
      this.rmqService.nack(ctx);

      throw err;
    }
  }
}
